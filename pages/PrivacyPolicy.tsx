import React from 'react';
import { Cookie, Database, FileText, LockKeyhole, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { SiteConfig } from '../types';

interface PrivacyPolicyProps {
  siteConfig: SiteConfig;
}

const sections = [
  {
    icon: UserCheck,
    title: 'Données de compte et commande',
    text: 'Nous utilisons les informations nécessaires à la création du compte, au traitement des commandes, à la facturation et au suivi client: nom, email, téléphone, adresse si fournie, historique de commandes et produits achetés.'
  },
  {
    icon: Database,
    title: 'Données de navigation',
    text: 'La plateforme peut mesurer les visites, les catégories consultées et les produits vus afin d’améliorer le catalogue, le SEO, les campagnes marketing et la qualité de l’expérience.'
  },
  {
    icon: LockKeyhole,
    title: 'Sécurité',
    text: 'Les accès administrateur, les commandes et les contenus de livraison sont protégés par les mécanismes de sécurité de la plateforme et par des droits d’accès limités.'
  },
  {
    icon: Cookie,
    title: 'Cookies et technologies similaires',
    text: 'Des cookies ou identifiants locaux peuvent être utilisés pour garder la session, le panier, les préférences d’affichage et les statistiques de visite.'
  }
];

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ siteConfig }) => {
  const brandName = siteConfig.siteName || 'TuniBots';
  const supportEmail = siteConfig.footerEmail || 'support@tunibots.tn';

  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=85"
          alt="Protection des données digitales"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white/85 backdrop-blur">
              <ShieldCheck size={14} />
              Confidentialité
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">Privacy Policy</h1>
            <p className="mt-6 text-base leading-8 text-slate-200 sm:text-lg">
              Cette politique explique comment {brandName} collecte, utilise et protège les informations nécessaires au fonctionnement de sa marketplace digitale en Tunisie.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] theme-text-accent">Utilisation des données</div>
          <h2 className="text-3xl font-black text-slate-950">Nous collectons uniquement les données utiles au service.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Les données permettent de gérer le panier, confirmer les paiements, envoyer les factures, livrer les produits digitaux, notifier l’équipe admin et accompagner le client après commande.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl theme-bg-soft theme-text-accent">
                <section.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-950">{section.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            { title: 'Partage limité', text: 'Les informations ne sont utilisées que pour le service TuniBots et les outils nécessaires au traitement des commandes.' },
            { title: 'Conservation raisonnable', text: 'Les commandes, factures et historiques peuvent être conservés pour le support, la comptabilité et la preuve de livraison.' },
            { title: 'Demande client', text: 'Vous pouvez nous contacter pour toute demande liée à vos données personnelles ou à votre compte.' }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                <FileText size={14} />
                Contact confidentialité
              </div>
              <h2 className="text-2xl font-black">Une question sur vos données?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Contactez le support TuniBots avec l’email utilisé lors de votre commande pour faciliter la vérification.</p>
            </div>
            <a href={`mailto:${supportEmail}`} className="theme-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black">
              <Mail size={18} />
              {supportEmail}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
