import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { Clock, CheckCircle, Flame, TrendingUp, Sparkles, Calendar, ArrowUpRight, DollarSign, ShieldCheck } from 'lucide-react';
import { safeLocalStorage } from '../dataStore';

interface InvestmentItemProps {
  investment: Investment;
  onClaim?: (id: string) => Promise<void>;
}

export const InvestmentItem: React.FC<InvestmentItemProps> = ({ investment }) => {
  const [lang, setLang] = useState<'FR' | 'EN'>(() => {
    return (safeLocalStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR';
  });

  useEffect(() => {
    const handleLangChange = () => {
      setLang((safeLocalStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR');
    };
    window.addEventListener('gi_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('gi_lang_changed', handleLangChange);
    };
  }, []);

  const t = (fr: string, en: string) => (lang === 'EN' ? en : fr);

  const isActivity = investment.category === 'activity';
  const isWellbeing = investment.category === 'wellbeing';
  const isPendingActivation = investment.status === 'pending_activation';
  const isCompleted = investment.status === 'completed' || investment.daysPassed >= investment.durationDays;
  const isActive = investment.status === 'active' && !isCompleted;

  // Progression calculations
  const duration = Math.max(1, investment.durationDays || 1);
  const daysPassed = isPendingActivation ? 0 : Math.min(duration, Math.max(0, investment.daysPassed || 0));
  const daysRemaining = Math.max(0, duration - daysPassed);
  const totalProgressPercent = isPendingActivation 
    ? 0 
    : isCompleted 
    ? 100 
    : Math.min(100, Math.max(0, Math.round((daysPassed / duration) * 100)));

  // Financial return calculations
  const expectedProfit = (investment.dailyReturn || 0) * duration;
  const totalExpectedPayout = investment.totalReturn || ((investment.price || 0) + expectedProfit);
  const earnedSoFar = isPendingActivation ? 0 : (investment.dailyReturn || 0) * daysPassed;

  // Category badge metadata
  const categoryLabel = isWellbeing
    ? t('Bien-être', 'Well-being')
    : isActivity
    ? t('Activité Flash', 'Flash Activity')
    : t('Stabilité VIP', 'Stability VIP');

  // Format activation date safely
  const formattedActivationDate = (() => {
    try {
      const d = new Date(investment.createdAt || Date.now());
      if (isNaN(d.getTime())) return t('Actif récemment', 'Active recently');
      return d.toLocaleDateString(lang === 'EN' ? 'en-US' : 'fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return t('Actif récemment', 'Active recently');
    }
  })();

  return (
    <div
      id={`investment-card-${investment.id}`}
      className="bg-[#0b1324] rounded-2xl p-4 sm:p-5 border border-[#1a2d52] shadow-md text-left space-y-3.5 my-2.5 transition-all hover:border-amber-400/50 relative overflow-hidden"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* 1. Header: Nom du produit, Catégorie & Statut */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#18294a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#142343] border border-[#1e3663] flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            {isActivity ? (
              <Flame className="w-4.5 h-4.5 text-amber-400" />
            ) : isWellbeing ? (
              <Sparkles className="w-4.5 h-4.5 text-yellow-300" />
            ) : (
              <TrendingUp className="w-4.5 h-4.5 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="font-sans font-black text-white text-sm sm:text-base uppercase tracking-tight">
              {investment.productName}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-amber-300/90 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                {categoryLabel}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3 text-slate-500" />
                {formattedActivationDate}
              </span>
            </div>
          </div>
        </div>

        {/* Statut Badge */}
        <div className="shrink-0">
          {isPendingActivation ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t("En attente d'activation", "Pending Activation")}</span>
            </div>
          ) : isCompleted ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('Terminé', 'Completed')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('Actif ⚡', 'Active ⚡')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Suivi Détaillé de l'Évolution / Progression du Produit */}
      <div className="space-y-2 bg-[#060c18] rounded-xl p-3 border border-[#15233c]">
        {/* Progression Header with Percentage and Days Count */}
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPendingActivation ? t("Vérification des conditions", "Checking conditions") : t('Progression du plan', 'Plan progression')}</span>
          </span>
          <div className="flex items-center gap-2 font-mono">
            {isPendingActivation ? (
              <span className="text-amber-300 font-bold text-[11px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
                {t("Conditions en attente", "Conditions pending")}
              </span>
            ) : (
              <>
                <span className="text-slate-400 font-semibold text-[11px]">
                  {daysPassed} / {duration} {t('jours', 'days')}
                </span>
                <span className="text-amber-300 font-black text-sm bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
                  {totalProgressPercent}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Visual Multi-step Progress Bar */}
        <div className="w-full bg-[#101b30] h-3 rounded-full overflow-hidden p-0.5 border border-[#192b4d] relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isPendingActivation
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 w-full opacity-60'
                : isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
            }`}
            style={{ width: isPendingActivation ? '100%' : `${totalProgressPercent}%` }}
          />
        </div>

        {/* Status note below progress bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>
            {isPendingActivation ? (
              <span className="text-amber-300/90 font-medium">
                ⏳ {t("Produit payé : l'activation aura lieu lorsque les conditions prévues par le système seront remplies.", "Product paid: activation occurs when system conditions are met.")}
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {t('Cycle de rendement atteint à 100%', 'Yield cycle 100% reached')}
              </span>
            ) : (
              <span className="text-amber-300/80 font-medium">
                ⏳ {daysRemaining} {t('jour(s) restant(s) pour achever le cycle', 'day(s) remaining to complete cycle')}
              </span>
            )}
          </span>
          <span className="text-slate-400 font-medium">
            {isPendingActivation ? t('Activation sous peu', 'Activation soon') : isCompleted ? t('Versement complet', 'Full payout') : t('Gain versé quotidiennement', 'Gain paid daily')}
          </span>
        </div>
      </div>

      {/* 3. Grille d'Évolution Financière (Investi, Déjà généré, Total prévu) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
        {/* Prix Investi */}
        <div className="bg-[#070e1c] rounded-xl p-2.5 border border-[#172744]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            {t('Montant Payé', 'Amount Paid')}
          </span>
          <span className="text-xs sm:text-sm font-black text-white font-mono mt-0.5 block">
            {(investment.price || 0).toLocaleString()} F
          </span>
        </div>

        {/* Revenu déjà généré */}
        <div className="bg-[#070e1c] rounded-xl p-2.5 border border-[#172744]">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            {t('Déjà Généré', 'Generated So Far')}
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono mt-0.5 block">
            +{earnedSoFar.toLocaleString()} F
          </span>
        </div>

        {/* Revenu Quotidien / Total Prévu */}
        <div className="bg-gradient-to-r from-[#0a162c] to-[#0e1d3a] rounded-xl p-2.5 border border-[#1e345b] col-span-2 sm:col-span-1">
          <span className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider block">
            {isCompleted ? t('Total Versé', 'Total Paid') : t('Total Prévu', 'Expected Total')}
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono mt-0.5 block">
            {totalExpectedPayout.toLocaleString()} F CFA
          </span>
        </div>
      </div>
    </div>
  );
};
