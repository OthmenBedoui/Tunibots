import React from 'react';
import { AlertTriangle, BadgeCheck, CreditCard, FileCheck2, Handshake, PackageCheck, RefreshCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { SiteConfig } from '../types';

interface TermsProps {
  siteConfig: SiteConfig;
}

const terms = [
  {
    icon: PackageCheck,
    title: 'Produits digitaux',
    text: 'TuniBots propose des produits numériques tels que cartes cadeaux, abonnements, licences, accès, packs, outils IA et services digitaux. Les détails affichés sur chaque fiche produit font partie des conditions d’achat.'
  },
  {
    icon: CreditCard,
    title: 'Commande et paiement',
    text: 'Une commande est considérée comme lancée après validation du panier et confirmation du paiement selon le flux disponible sur la plateforme.'
  },
  {
    icon: FileCheck2,
    title: 'Facturation',
    text: 'Une facture ou confirmation de commande peut être envoyée par email. Le client doit fournir des informations exactes pour recevoir les documents et le suivi.'
  },
  {
    icon: RefreshCcw,
    title: 'Livraison et activation',
    text: 'Les délais varient selon le type de produit. Certains produits sont instantanés, d’autres nécessitent une validation ou un accompagnement support.'
  },
  {
    icon: Trash2,
    title: 'Suppression de compte',
    text: 'L’utilisateur peut demander la suppression de son compte depuis son profil en confirmant l’action. Le profil et le panier sont supprimés, tandis que les anciennes commandes peuvent être conservées sans lien actif au compte pour la facturation, le suivi administratif et le support.'
  }
];

const Terms: React.FC<TermsProps> = ({ siteConfig }) => {
  const brandName = siteConfig.siteName || 'TuniBots';
  const supportEmail = siteConfig.footerEmail || 'support@tunibots.tn';

  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=85"
          alt="Contrats et conditions de service"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white/85 backdrop-blur">
              <BadgeCheck size={14} />
              Conditions de service
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">Terms</h1>
            <p className="mt-6 text-base leading-8 text-slate-200 sm:text-lg">
              Ces conditions encadrent l’utilisation de {brandName}, l’achat de produits digitaux et le suivi des commandes sur la plateforme.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] theme-text-accent">Cadre général</div>
          <h2 className="text-3xl font-black text-slate-950">Une expérience claire pour acheter des produits digitaux.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            En utilisant {brandName}, le client accepte de fournir des informations exactes, de respecter les règles d’utilisation des produits achetés et de suivre les instructions d’activation communiquées par la plateforme ou le support.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {terms.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl theme-bg-soft theme-text-accent">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <ShieldCheck className="mb-4 theme-text-accent" size={24} />
              <h3 className="text-lg font-black text-slate-950">Responsabilité client</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Le client doit vérifier la compatibilité, la région, les restrictions et les prérequis avant achat quand ces informations sont indiquées.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <Handshake className="mb-4 theme-text-accent" size={24} />
              <h3 className="text-lg font-black text-slate-950">Support et litiges</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">En cas de problème, le support TuniBots accompagne le client avec les informations de commande, de paiement et de livraison disponibles.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <AlertTriangle className="mb-4 theme-text-accent" size={24} />
              <h3 className="text-lg font-black text-slate-950">Produits consommés</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Certains produits digitaux peuvent devenir non remboursables après livraison, activation, révélation de clé ou utilisation du service.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl lg:p-10">
          <h2 className="text-2xl font-black">Besoin d’une clarification?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Pour toute question liée aux conditions d’achat, à une commande ou à une facture, contactez l’équipe TuniBots à l’adresse suivante.
          </p>
          <a href={`mailto:${supportEmail}`} className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">
            {supportEmail}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Terms;
