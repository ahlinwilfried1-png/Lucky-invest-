import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { Clock, CheckCircle, Flame, TrendingUp, Sparkles } from 'lucide-react';
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
  const isCompleted = investment.status === 'completed' || investment.daysPassed >= investment.durationDays;

  // Calculation of progress percentage
  const duration = investment.durationDays || 1;
  const daysPassed = Math.min(duration, investment.daysPassed || 0);
  const totalProgressPercent = isCompleted 
    ? 100 
    : Math.min(100, Math.max(0, Math.round((daysPassed / duration) * 100)));

  // Financial return calculation
  const expectedProfit = (investment.dailyReturn || 0) * duration;
  const totalExpectedPayout = investment.totalReturn || ((investment.price || 0) + expectedProfit);

  // Category badge metadata
  const categoryLabel = isWellbeing
    ? t('Bien-être', 'Well-being')
    : isActivity
    ? t('Activité', 'Activity')
    : t('Stabilité VIP', 'Stability VIP');

  return (
    <div
      id={`investment-card-${investment.id}`}
      className="bg-[#0c1629] rounded-2xl p-3.5 sm:p-4 border border-[#192a4a] shadow-sm text-left space-y-3 my-2 transition-all hover:border-amber-400/40"
    >
      {/* 1. Header: Nom du produit & Statut */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#192a4a]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-[#13223f] border border-[#1e3357] flex items-center justify-center text-amber-400 shrink-0">
            {isActivity ? (
              <Flame className="w-4 h-4 text-amber-400" />
            ) : isWellbeing ? (
              <Sparkles className="w-4 h-4 text-yellow-300" />
            ) : (
              <TrendingUp className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="font-sans font-black text-white text-sm sm:text-base uppercase tracking-tight">
              {investment.productName}
            </h4>
            <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wide">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Statut Badge */}
        <div className="shrink-0">
          {isCompleted ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('Terminé', 'Completed')}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t('En cours', 'In progress')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Progression */}
      <div className="space-y-1.5 bg-[#070e1b] rounded-xl p-2.5 border border-[#15223a]">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
          <span className="text-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {t('Progression', 'Progression')}
          </span>
          <span className="text-amber-400 font-mono font-black">
            {totalProgressPercent}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#111e33] h-2 rounded-full overflow-hidden p-0.5 border border-[#192a4a]">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
            }`}
            style={{ width: `${totalProgressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Revenu Disponible / Prévu */}
      <div className="bg-gradient-to-r from-[#070e1c] via-[#0e1d3a] to-[#070e1c] rounded-xl p-2.5 sm:p-3 text-white border border-[#1a2d50] shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider block">
            {isCompleted ? t('Revenu Versé', 'Paid Return') : t('Revenu Prévu', 'Expected Return')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
            {totalExpectedPayout.toLocaleString()} F CFA
          </span>
        </div>
      </div>
    </div>
  );
};

