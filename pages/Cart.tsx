import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, Lock, ShoppingBag, Smartphone, Trash2, Wallet, X } from 'lucide-react';
import { api } from '../services/api';
import { CartItem, Listing, Order, OrderStatus, SiteConfig, User } from '../types';
import { clearGuestCart, getGuestCartCount, getGuestCartItems, removeGuestCartLine } from '../utils/guestCart';
import { getListingFinalPrice } from '../utils/pricing';
import PriceDisplay from '../components/store-client/PriceDisplay';
import { ListingImage } from '../components/store-client/ListingImage';

interface CartProps {
  navigateTo: (page: string) => void;
  onCartUpdate: (count: number) => void;
  siteConfig: SiteConfig;
  listings: Listing[];
  user: User;
  orders: Order[];
  onOrderCreated: (order: Order) => void;
}

type GuestFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type CheckoutSuccessState = {
  orderNumber: string;
  invoiceNumber?: string;
  emailStatus?: string;
  status?: string;
  trackingToken?: string | null;
};

type PaymentProofState = {
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
} | null;

const PAYMENT_INSTRUCTIONS: Record<string, string> = {
  whatsapp: 'Envoyez votre paiement ou capture au support WhatsApp avec le numero de commande. Un agent validera manuellement.',
  edinar: 'Payez via EDINAR, puis ajoutez la reference de transaction et une capture si disponible.',
  flouci: 'Payez via Flouci, puis ajoutez la reference Flouci et une capture si disponible.',
  bank_transfer: 'Effectuez le virement puis ajoutez la reference bancaire et le recu.',
  cash: 'Choisissez cette option si un agent doit confirmer un paiement cash.'
};

const fileToProofPayload = (file: File) => new Promise<PaymentProofState>((resolve, reject) => {
  if (file.size > 5 * 1024 * 1024) {
    reject(new Error('La preuve de paiement ne doit pas depasser 5 Mo.'));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => resolve({
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    dataUrl: String(reader.result || '')
  });
  reader.onerror = () => reject(new Error('Impossible de lire le fichier de preuve.'));
  reader.readAsDataURL(file);
});

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAYMENT_UNDER_REVIEW,
  OrderStatus.PAYMENT_APPROVED,
  OrderStatus.IN_DELIVERY,
  OrderStatus.IN_PROGRESS,
  OrderStatus.PAYMENT_RECEIVED
];

const Cart: React.FC<CartProps> = ({ navigateTo, onCartUpdate, siteConfig, listings, user, orders, onOrderCreated }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<PaymentProofState>(null);
  const [formError, setFormError] = useState('');
  const [guestForm, setGuestForm] = useState<GuestFormState>({
    firstName: user.fullName?.split(' ')[0] || '',
    lastName: user.fullName?.split(' ').slice(1).join(' ') || '',
    email: user.email && user.id !== 'guest' ? user.email : '',
    phone: user.phone || ''
  });
  const [checkoutSuccess, setCheckoutSuccess] = useState<CheckoutSuccessState | null>(null);

  const isGuest = user.id === 'guest';
  const latestActiveOrder = !isGuest
    ? [...orders]
        .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  const loadGuestCart = () => {
    const guestItems = getGuestCartItems(listings);
    setItems(guestItems);
    onCartUpdate(getGuestCartCount());
  };

  useEffect(() => {
    if (siteConfig.click2payEnabled) {
      setPaymentMethod('click2pay');
    }
  }, [siteConfig.click2payEnabled]);

  useEffect(() => {
    if (isGuest) {
      loadGuestCart();
      return;
    }

    api.getCart()
      .then((data) => {
        setItems(data);
        onCartUpdate(data.reduce((acc, item) => acc + item.quantity, 0));
      })
      .catch(console.error);
  }, [isGuest, listings]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + ((item.variant?.price ?? getListingFinalPrice(item.listing)) * item.quantity), 0),
    [items]
  );

  const handleRemove = async (item: CartItem) => {
    if (isGuest) {
      const nextItems = removeGuestCartLine(item.listingId, item.variantId);
      setItems(getGuestCartItems(listings));
      onCartUpdate(nextItems.reduce((acc, entry) => acc + entry.quantity, 0));
      return;
    }

    const newItems = items.filter((currentItem) => currentItem.id !== item.id);
    setItems(newItems);
    onCartUpdate(newItems.reduce((acc, currentItem) => acc + currentItem.quantity, 0));

    try {
      await api.removeFromCart(item.id);
    } catch {
      // UI-first behavior retained.
    }
  };

  const handleGuestFieldChange = (field: keyof GuestFormState, value: string) => {
    setGuestForm((current) => ({ ...current, [field]: value }));
    if (formError) setFormError('');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setFormError('Votre panier est vide.');
      return;
    }

    setIsCheckingOut(true);
    setFormError('');

    try {
      const idempotencyKey = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const order = await api.confirmCheckout(
        isGuest
          ? {
            ...guestForm,
            paymentMethod,
            customerReference: paymentReference,
            paymentProof,
            items: items.map((item) => ({
              listingId: item.listingId,
              variantId: item.variantId,
              quantity: item.quantity
            }))
          }
          : {
            paymentMethod,
            phone: guestForm.phone || user.phone || '',
            customerReference: paymentReference,
            paymentProof
          },
        idempotencyKey
      );

      if (isGuest) {
        clearGuestCart();
      }

      setItems([]);
      onCartUpdate(0);
      onOrderCreated(order);
      setCheckoutSuccess({
        orderNumber: order.orderNumber,
        invoiceNumber: order.invoice?.invoiceNumber,
        emailStatus: order.emailStatus,
        status: order.status,
        trackingToken: order.trackingToken
      });
      setShowPaymentForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Impossible d’enregistrer votre commande.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 px-8 py-10 text-white">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 mb-5">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-3xl font-black">Votre commande a bien été enregistrée</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Votre commande est en cours. Notre service support vous guidera dans les prochaines étapes.
            </p>
          </div>

          <div className="grid gap-6 p-8 md:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Commande</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{checkoutSuccess.orderNumber}</div>
                {checkoutSuccess.invoiceNumber && (
                  <div className="mt-2 text-sm text-slate-500">Facture / proforma: {checkoutSuccess.invoiceNumber}</div>
                )}
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                <p>Votre paiement est maintenant en revue manuelle.</p>
                <p className="mt-2">Le produit digital restera verrouillé jusqu'à validation du paiement et livraison explicite par un agent.</p>
                <p className="mt-2">Conservez votre numéro de commande pour le suivi.</p>
                {isGuest && <p className="mt-2">Un email de suivi vous sera envoyé. Pas besoin de copier un long token.</p>}
                {checkoutSuccess.emailStatus === 'FAILED' && (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                    L’email n’a pas pu être envoyé automatiquement, mais votre commande est bien enregistrée.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">{isGuest ? 'Optionnel' : 'Suivi'}</div>
                <h2 className="mt-3 text-xl font-black text-slate-900">{isGuest ? 'Suivi invite disponible' : 'Votre compte est à jour'}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isGuest
                  ? 'Un lien/token de suivi est envoyé par email. Vous pouvez aussi créer un compte pour retrouver vos commandes plus facilement.'
                  : 'Vous pouvez suivre cette commande depuis votre espace client et consulter votre historique à tout moment.'}
              </p>
              {isGuest && (
                <button
                  type="button"
                  onClick={() => navigateTo('register')}
                  className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Créer un compte
                </button>
              )}
              {!isGuest && (
                <button
                  type="button"
                  onClick={() => navigateTo('user-dashboard')}
                  className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Voir mes commandes
                </button>
              )}
              <button
                type="button"
                onClick={() => navigateTo('home')}
                className="mt-3 w-full rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-400 hover:bg-white"
              >
                Retour à la boutique
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && latestActiveOrder) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl">
          <div className="bg-slate-950 px-8 py-8 text-white">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Commande en cours</div>
            <h1 className="mt-2 text-3xl font-black">Votre commande est suivie ici</h1>
            <p className="mt-3 text-sm text-slate-300">Le panier est vide parce que votre commande a bien été créée.</p>
          </div>
          <div className="p-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Commande</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{latestActiveOrder.orderNumber}</div>
              <div className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-700">
                {latestActiveOrder.status === OrderStatus.PAYMENT_UNDER_REVIEW ? 'Paiement en cours de traitement' : latestActiveOrder.status}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {latestActiveOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3 text-sm">
                  <span className="font-bold text-slate-900">{item.titleSnapshot}</span>
                  <span className="text-slate-500">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button onClick={() => navigateTo('user-dashboard')} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">
                Voir historique des commandes
              </button>
              <button onClick={() => navigateTo('home')} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <div className="bg-slate-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-300">
          <ShoppingBag size={64} className="text-slate-300" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Votre panier est vide</h2>
        <button onClick={() => navigateTo('home')} className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1">
          Parcourir la Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {showPaymentForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Paiement</div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Choisir votre méthode de paiement</h2>
                <p className="mt-1 text-sm text-slate-500">Après validation, une facture TuniBots sera envoyée par email.</p>
              </div>
              <button type="button" onClick={() => setShowPaymentForm(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['whatsapp', 'edinar', 'flouci', 'bank_transfer', 'cash', ...(siteConfig.click2payEnabled ? ['click2pay'] : [])].map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`min-h-[88px] rounded-2xl border p-3 flex flex-col items-center justify-center transition-all ${paymentMethod === pm ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300 text-slate-500'}`}
                  >
                    {pm === 'whatsapp' && <Lock size={22} className="mb-2" />}
                    {pm === 'edinar' && <CreditCard size={22} className="mb-2" />}
                    {pm === 'flouci' && <Smartphone size={22} className="mb-2" />}
                    {pm === 'click2pay' && <CreditCard size={22} className="mb-2 text-amber-500" />}
                    <span className="text-[11px] font-black uppercase">{pm}</span>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
                <div className="font-black">Instructions de paiement</div>
                <p className="mt-1">{PAYMENT_INSTRUCTIONS[paymentMethod] || PAYMENT_INSTRUCTIONS.whatsapp}</p>
              </div>

              {isGuest && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Prénom</label>
                    <input type="text" value={guestForm.firstName} onChange={(e) => handleGuestFieldChange('firstName', e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Nom</label>
                    <input type="text" value={guestForm.lastName} onChange={(e) => handleGuestFieldChange('lastName', e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                    <input type="email" value={guestForm.email} onChange={(e) => handleGuestFieldChange('email', e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Numéro de téléphone</label>
                    <input type="tel" value={guestForm.phone} onChange={(e) => handleGuestFieldChange('phone', e.target.value)} placeholder="+216 xx xxx xxx" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
                  </div>
                </div>
              )}

              {!isGuest && !user.phone && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Numéro de téléphone</label>
                  <input type="tel" value={guestForm.phone} onChange={(e) => handleGuestFieldChange('phone', e.target.value)} placeholder="+216 xx xxx xxx" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Reference paiement (optionnel)</label>
                  <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="ID transaction / note agent" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Preuve paiement (optionnel)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setPaymentProof(null);
                        return;
                      }
                      try {
                        setPaymentProof(await fileToProofPayload(file));
                        setFormError('');
                      } catch (error) {
                        setPaymentProof(null);
                        setFormError(error instanceof Error ? error.message : 'Fichier invalide.');
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                  {paymentProof && <div className="mt-2 text-xs font-semibold text-emerald-700">{paymentProof.fileName} pret a envoyer</div>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm text-slate-600"><span>Total à payer</span><span className="font-bold">{total.toFixed(2)} TND</span></div>
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-4 font-bold text-white shadow-lg transition hover:bg-black disabled:opacity-70"
              >
                {isCheckingOut ? (
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>Confirmer la soumission paiement <ArrowRight size={20} className="ml-2" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-black mb-8 flex items-center text-slate-900">
        <ShoppingBag className="mr-3" />
        Mon Panier
        <span className="ml-3 text-lg font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{items.length} articles</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center transition-all hover:shadow-md">
              <div className="mb-4 h-24 w-24 overflow-hidden rounded-xl shadow-sm sm:mr-6 sm:mb-0">
                <ListingImage listing={item.listing} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs font-bold text-indigo-600 uppercase mb-1">{item.listing.game}</div>
                <h3 className="font-bold text-slate-900 text-xl mb-1">{item.listing.title}</h3>
                {item.variant && (
                  <div className="mb-1 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {item.listing.variantLabel ? `${item.listing.variantLabel}: ` : ''}{item.variant.name}
                  </div>
                )}
              </div>
              <div className="text-right mx-6 mt-4 sm:mt-0">
                {item.variant ? (
                  <div className="font-black text-xl text-slate-900">{item.variant.price.toFixed(2)} <span className="text-xs font-normal text-slate-500">TND</span></div>
                ) : (
                  <PriceDisplay listing={item.listing} priceClassName="font-black text-xl text-slate-900" />
                )}
                <div className="text-xs font-medium text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded mt-1">Qté: {item.quantity}</div>
              </div>
              <button onClick={() => handleRemove(item)} className="text-slate-300 hover:text-indigo-500 p-3 hover:bg-indigo-50 rounded-xl transition-all mt-4 sm:mt-0">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 sticky top-24">
            <h3 className="font-bold text-xl mb-6 flex items-center">
              <Wallet size={20} className="mr-2" />
              Validation de commande
            </h3>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-6">
              Cliquez sur confirmer le paiement pour choisir votre méthode. Une facture TuniBots sera envoyée par email, puis notre support vous guidera.
            </div>

            {!isGuest && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 mb-8 text-sm text-slate-600">
                <div className="font-bold text-slate-900">{user.fullName || user.username}</div>
                <div>{user.email}</div>
                <div>{guestForm.phone || user.phone || 'Numéro WhatsApp à confirmer par l’agent.'}</div>
              </div>
            )}

            <div className="space-y-4 mb-8 text-sm text-slate-600">
              <div className="flex justify-between"><span>Sous-total</span> <span className="font-medium">{total.toFixed(2)} TND</span></div>
              <div className="border-t border-dashed pt-4 flex justify-between text-2xl font-black text-slate-900">
                <span>Total</span>
                <span>{total.toFixed(2)} <span className="text-sm text-slate-400 font-normal">TND</span></span>
              </div>
            </div>

            {formError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <button
              onClick={() => setShowPaymentForm(true)}
              disabled={isCheckingOut}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center disabled:opacity-70 shadow-lg"
            >
              Confirmer le paiement <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
