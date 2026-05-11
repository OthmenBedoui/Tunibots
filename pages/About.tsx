import React from 'react';
import { ArrowRight, BadgeCheck, Clock, CreditCard, Gift, Headphones, KeyRound, MapPin, PackageCheck, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { SiteConfig } from '../types';

interface AboutProps {
  siteConfig: SiteConfig;
  navigateTo: (page: string, slug?: string) => void;
}

const pillars = [
  {
    icon: Gift,
    title: 'Cartes cadeaux et crédits digitaux',
    text: 'Des formats pensés pour les gift cards, recharges, coupons et offres digitales prêtes à utiliser.'
  },
  {
    icon: KeyRound,
    title: 'Licences, clés et abonnements',
    text: 'Une sélection claire de logiciels, services cloud, streaming, outils IA et accès numériques.'
  },
  {
    icon: PackageCheck,
    title: 'Packs intelligents',
    text: 'Des bundles premium qui regroupent plusieurs produits complémentaires pour gagner du temps.'
  },
  {
    icon: Headphones,
    title: 'Support local',
    text: 'Un accompagnement humain pour la validation, l’activation et le suivi après commande.'
  }
];

const flow = [
  'Sélection des produits digitaux les plus utiles pour le marché tunisien.',
  'Paiement et confirmation avec facture envoyée au client.',
  'Notification immédiate de l’équipe admin pour traiter la commande.',
  'Support jusqu’à la livraison, l’activation ou la finalisation du service.'
];

const About: React.FC<AboutProps> = ({ siteConfig, navigateTo }) => {
  const brandName = siteConfig.siteName || 'TuniBots';

  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=85"
          alt="Infrastructure digitale moderne"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white/85 backdrop-blur">
              <Sparkles size={14} />
              Marketplace digitale tunisienne
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
              {brandName} transforme l’achat digital en expérience simple, rapide et premium.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Nous centralisons cartes cadeaux, abonnements, licences, comptes, outils IA et services numériques dans une plateforme pensée pour la Tunisie: claire, sécurisée, suivie et prête pour les usages modernes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigateTo('home')} className="theme-btn inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black shadow-xl">
                Explorer la boutique
                <ArrowRight size={18} />
              </button>
              <button onClick={() => navigateTo('contact')} className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur hover:bg-white/15">
                Contacter l’équipe
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Livraison', value: 'Rapide', icon: Zap },
              { label: 'Factures', value: 'Par email', icon: CreditCard },
              { label: 'Support', value: 'Local', icon: MapPin },
              { label: 'Sécurité', value: 'Suivie', icon: ShieldCheck }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur-md">
                <item.icon className="mb-5 text-white" size={26} />
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">{item.label}</div>
                <div className="mt-2 text-2xl font-black text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] theme-text-accent">Notre mission</div>
          <h2 className="text-3xl font-black text-slate-950 sm:text-4xl">Créer le réflexe digital fiable pour acheter, activer et recevoir sans friction.</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            {brandName} n’est pas seulement une vitrine de produits. C’est un flux complet: catalogue organisé, panier clair, facture, notification admin, suivi client et support d’activation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl theme-bg-soft theme-text-accent">
                <pillar.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-950">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] theme-text-accent">Méthode TuniBots</div>
            <h2 className="text-3xl font-black text-slate-950">Un parcours pensé pour les produits digitaux.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              La plateforme est construite autour des vrais besoins d’un store digital: visibilité produit, templates de cartes modernes, gestion des packs, notifications admin et expérience client propre jusqu’à la facture.
            </p>
          </div>
          <div className="grid gap-4">
            {flow.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </div>
                <div className="pt-1 text-sm font-bold leading-7 text-slate-700">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.85fr] lg:p-12">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-200">
                <BadgeCheck size={14} />
                Engagement
              </div>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">Une boutique plus lisible, plus humaine, plus performante.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300">
                Notre objectif est de rendre les produits digitaux faciles à comprendre avant l’achat et simples à recevoir après commande, avec une présence support quand le client en a besoin.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {['Catalogue organisé', 'Templates premium', 'Facturation email', 'Suivi admin'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-black text-white">
                  <Clock size={18} className="theme-text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
