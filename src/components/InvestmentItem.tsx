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

  const isWellbeing = investment.category === 'wellbeing';
  const isActivity = investment.category === 'activity';
  const isCompleted = investment.status === 'completed' || investment.daysPassed >= investment.durationDays;
  const isActive = investment.status === 'active' && !isCompleted;
  const isPendingActivation = !isActive && !isCompleted;

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
    ? t('Activités', 'Activities')
    : t('Stabilité', 'Stability');

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
      className="bg-[#0c1629] rounded-2xl p-4 sm:p-5 border border-white/[0.06] shadow-xs text-left space-y-3.5 my-2 transition-all hover:shadow-sm relative overflow-hidden"
    >
      {/* Glow highlight subtle */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* 1. Header: Nom du produit, Catégorie & Statut */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center text-amber-400 shrink-0">
            {isWellbeing ? (
              <Sparkles className="w-4.5 h-4.5 text-amber-300" />
            ) : isActivity ? (
              <Flame className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <TrendingUp className="w-4.5 h-4.5 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="font-sans font-black text-white text-sm sm:text-base uppercase tracking-tight">
              {investment.productName}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isWellbeing 
                  ? 'bg-amber-400/10 text-amber-300' 
                  : isActivity 
                  ? 'bg-purple-400/10 text-purple-300' 
                  : 'bg-blue-400/10 text-blue-300'
              }`}>
                {categoryLabel}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3 text-slate-500" />
                {formattedActivationDate}
              </span>
            </div>
          </div>
        </div>

        {/* Durée du cycle */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-slate-800/60 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{duration} {t('jours', 'days')}</span>
          </div>
        </div>
      </div>

      {/* 2. Suivi Détaillé de l'Évolution / Progression du Produit */}
      <div className="space-y-2 bg-[#08101e] rounded-xl p-3 border border-white/[0.03]">
        {/* Progression Header with Percentage and Days Count */}
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('Progression du cycle', 'Cycle progression')}</span>
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400 font-semibold text-[11px]">
              {daysPassed} / {duration} {t('jours', 'days')}
            </span>
            <span className="text-amber-300 font-black text-xs bg-amber-400/10 px-2 py-0.5 rounded">
              {totalProgressPercent}%
            </span>
          </div>
        </div>

        {/* Visual Multi-step Progress Bar */}
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
            }`}
            style={{ width: `${totalProgressPercent}%` }}
          />
        </div>

        {/* Status note below progress bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>
            {isCompleted ? (
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
            {isCompleted 
              ? t('Revenu total versé', 'Total return paid') 
              : (isWellbeing || isActivity)
              ? t('Revenu total versé uniquement à la fin du cycle', 'Total return paid only at end of cycle')
              : t('Gain versé quotidiennement', 'Gain paid daily')}
          </span>
        </div>

        {/* Notice explicative sur les règles du cycle Bien-être / Activité */}
        {(isWellbeing || isActivity) && (
          <div className="rounded-xl bg-[#0a1426] p-2.5 border border-amber-400/20 text-[11px] text-slate-300 flex items-start gap-2">
            <span className="text-amber-400 shrink-0 text-xs mt-0.5">ℹ️</span>
            {isCompleted ? (
              <p className="leading-relaxed">
                <strong className="text-emerald-400">{t('Cycle terminé avec succès :', 'Cycle successfully completed:')}</strong>{' '}
                {t(
                  'Le revenu total a été versé sur votre solde. Pour démarrer un nouveau cycle, vous devez effectuer un nouvel investissement/achat.',
                  'Total return has been credited to your balance. To start a new cycle, you must make a new investment/purchase.'
                )}
              </p>
            ) : (
              <p className="leading-relaxed">
                <strong className="text-amber-300">{t('Règle du cycle :', 'Cycle rule:')}</strong>{' '}
                {t(
                  'Le revenu total est versé uniquement à la fin du cycle. Même si ce produit est fermé aux nouveaux achats, votre cycle continue normalement et le montant total vous sera versé à la fin.',
                  'Total earnings are paid only at the end of the cycle. Even if this product is closed to new purchases, your cycle continues normally and the full amount will be paid at the end.'
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Grille d'Évolution Financière (Investi, Gain Quotidien, Déjà généré, Total prévu) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
        {/* Prix Investi */}
        <div className="bg-[#08101e] rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            {t('Montant Payé', 'Amount Paid')}
          </span>
          <span className="text-xs sm:text-sm font-black text-white font-mono mt-0.5 block">
            {(investment.price || 0).toLocaleString()} F
          </span>
        </div>

        {/* Gain quotidien */}
        <div className="bg-[#08101e] rounded-xl p-2.5">
          <span className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider block">
            {t('Gain Quotidien', 'Daily Gain')}
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono mt-0.5 block">
            +{(investment.dailyReturn || 0).toLocaleString()} F/j
          </span>
        </div>

        {/* Revenu déjà généré */}
        <div className="bg-[#08101e] rounded-xl p-2.5">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
            {(isWellbeing || isActivity)
              ? (isCompleted ? t('Revenu Versé', 'Paid Return') : t('En cours', 'In progress'))
              : t('Déjà Généré', 'Generated So Far')}
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono mt-0.5 block">
            {(isWellbeing || isActivity)
              ? (isCompleted 
                ? `+${totalExpectedPayout.toLocaleString()} F` 
                : `+${earnedSoFar.toLocaleString()} F (${t('à terme', 'at end')})`)
              : `+${earnedSoFar.toLocaleString()} F`}
          </span>
        </div>

        {/* Total Prévu */}
        <div className="bg-[#08101e] rounded-xl p-2.5">
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
            {isCompleted ? t('Total Versé', 'Total Paid') : t('Total à Terme', 'Total at End')}
          </span>
          <span className="text-xs sm:text-sm font-black text-white font-mono mt-0.5 block">
            {totalExpectedPayout.toLocaleString()} F
          </span>
        </div>
      </div>
    </div>
  );
};
