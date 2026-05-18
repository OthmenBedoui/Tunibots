import React, { useState } from 'react';
import { CheckCircle2, Lock, PackageCheck, Search } from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';

const steps = [
  { status: OrderStatus.PAYMENT_UNDER_REVIEW, label: 'Order received' },
  { status: OrderStatus.PAYMENT_APPROVED, label: 'Payment approved' },
  { status: OrderStatus.IN_DELIVERY, label: 'In delivery' },
  { status: OrderStatus.DELIVERED, label: 'Delivered' }
];

const stepIndex = (status?: OrderStatus) => {
  if (!status) return -1;
  if ([OrderStatus.PENDING_PAYMENT, OrderStatus.IN_PROGRESS, OrderStatus.PAYMENT_UNDER_REVIEW].includes(status)) return 0;
  if ([OrderStatus.PAYMENT_RECEIVED, OrderStatus.PAYMENT_APPROVED].includes(status)) return 1;
  if (status === OrderStatus.IN_DELIVERY) return 2;
  if ([OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(status)) return 3;
  return -1;
};

const OrderTracking: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [emailOrToken, setEmailOrToken] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Array<{ id: string; deliveryContent: string; deliveryType: string; activationGuide?: string; restrictions?: string; region?: string }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);
    setError('');
    setDelivery([]);
    try {
      const isToken = /^[a-f0-9]{40,}$/i.test(emailOrToken.trim());
      const tracked = await api.trackOrder(orderNumber.trim(), isToken ? { token: emailOrToken.trim() } : { email: emailOrToken.trim() });
      setOrder(tracked);
      if (tracked.status === OrderStatus.DELIVERED) {
        try {
          const delivered = await api.getOrderDelivery(tracked.orderNumber, isToken ? emailOrToken.trim() : undefined);
          setDelivery(delivered.deliveries);
        } catch {
          // Delivery can still be locked for email-only tracking.
        }
      }
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Commande introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = stepIndex(order?.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Suivi commande</div>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Track your Tunibots order</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="CMD-2026-000001" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" />
          <input value={emailOrToken} onChange={(e) => setEmailOrToken(e.target.value)} placeholder="Email ou token de suivi" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" />
          <button onClick={handleTrack} disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            <Search size={16} className="mr-2" /> Suivre
          </button>
        </div>
        {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      </div>

      {order && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-500">Commande</div>
              <div className="text-2xl font-black text-slate-950">{order.orderNumber}</div>
            </div>
            <div className="rounded-full bg-amber-50 px-4 py-2 text-xs font-black uppercase text-amber-700">{order.status}</div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.status} className={`rounded-2xl border p-4 ${currentIndex >= index ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                {currentIndex >= index ? <CheckCircle2 size={20} className="text-emerald-600" /> : <Lock size={20} className="text-slate-400" />}
                <div className="mt-2 text-sm font-black text-slate-900">{step.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 p-4 text-sm">
                <span className="font-bold text-slate-900">{item.titleSnapshot}</span>
                <span className="text-slate-500">x{item.quantity}</span>
              </div>
            ))}
          </div>

          {delivery.length > 0 ? (
            <div className="mt-6 space-y-3">
              {delivery.map((item) => (
                <div key={item.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="mb-2 flex items-center text-sm font-black text-emerald-800"><PackageCheck size={18} className="mr-2" /> {item.deliveryType}</div>
                  <pre className="whitespace-pre-wrap rounded-xl bg-white p-3 font-mono text-sm text-slate-900">{item.deliveryContent}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
              Delivery page locked until payment is approved and an agent sends the product.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
