import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

const DEFAULT_MESSAGES = [
  'Loading dashboard...',
  'Synchronizing environment...',
  'Preparing workspace...'
];

export const AdminPremiumLoader: React.FC<{
  siteName?: string;
  logoUrl?: string;
  title?: string;
  messages?: string[];
  compact?: boolean;
  showSkeleton?: boolean;
}> = ({
  siteName = 'Tunibots',
  logoUrl,
  title = 'Admin workspace',
  messages = DEFAULT_MESSAGES,
  compact = false,
  showSkeleton = false
}) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [messages]);

  return (
    <div className={`overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm ${compact ? 'p-6' : 'p-8 md:p-10'}`}>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(135deg,#0f172a,#111827_46%,#1e293b)] px-6 py-10 text-white md:px-10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] animate-[admin-shimmer_3.6s_linear_infinite]" />
        <div className="absolute -left-12 top-10 h-32 w-32 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/85">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]" />
              {title}
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{siteName}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
              {messages[messageIndex] || DEFAULT_MESSAGES[0]}
            </p>
          </div>

          <div className="relative mx-auto flex h-28 w-28 items-center justify-center lg:mx-0">
            <div className="absolute inset-0 rounded-full border border-white/10 bg-white/10 backdrop-blur-md" />
            <div className="absolute inset-[-10px] rounded-full border border-indigo-300/35 animate-ping" />
            <div className="absolute inset-[-18px] rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-slate-950/80 shadow-[0_0_30px_rgba(99,102,241,0.35)]">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-12 w-12 object-contain" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl font-black uppercase tracking-[0.18em]">{siteName.slice(0, 2)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSkeleton && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
              <div className="mt-4 h-8 w-20 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="mt-6 h-20 rounded-[1.25rem] bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminErrorState: React.FC<{
  title: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
}> = ({ title, message, onRetry, onBack, backLabel = 'Retour dashboard' }) => (
  <div className="rounded-[2rem] border border-red-200 bg-white p-8 shadow-sm">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-red-700">
          <AlertTriangle size={14} />
          Incident détecté
        </div>
        <h2 className="mt-4 text-3xl font-black text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);
