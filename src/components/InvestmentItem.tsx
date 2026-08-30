import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { Clock, CheckCircle, AlertCircle, Coins, Flame } from 'lucide-react';
import { DataStore, safeLocalStorage } from '../dataStore';

interface InvestmentItemProps {
  investment: Investment;
  onClaim: (id: string) => Promise<void>;
}

export const InvestmentItem: React.FC<InvestmentItemProps> = ({ investment, onClaim }) => {
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

  const [now, setNow] = useState<number>(Date.now());
  const [claiming, setClaiming] = useState<boolean>(false);
  const [autoRenew, setAutoRenew] = useState<boolean>(investment.autoRenew || false);
  const [renewing, setRenewing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setAutoRenew(investment.autoRenew || false);
  }, [investment.autoRenew]);

  const handleToggleAutoRenew = async () => {
    const nextVal = !autoRenew;
    setAutoRenew(nextVal);
    try {
      const res = await DataStore.toggleAutoRenew(investment.userId, investment.id, nextVal);
      if (res.success) {
        setMessage(t('Auto-renouvellement mis à jour !', 'Auto-renewal updated!'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setAutoRenew(!nextVal); // Revert
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      setAutoRenew(!nextVal); // Revert
    }
  };

  const handleManualRenew = async () => {
    if (renewing) return;
    const confirmMsg = t(
      `Voulez-vous renouveler ce plan pour un nouveau cycle de ${investment.durationDays} jours pour ${investment.price.toLocaleString()} XOF ?`,
      `Do you want to renew this plan for a new cycle of ${investment.durationDays} days for ${investment.price.toLocaleString()} XOF?`
    );
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setRenewing(true);
    try {
      const res = await DataStore.renewInvestment(investment.userId, investment.id);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || t('Erreur lors du renouvellement.', 'Error during renewal.'));
    } finally {
      setRenewing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isActivityOriginal = investment.category === 'activity' || (investment as any).isCyclic;
  const isStability = investment.category === 'stability';
  const isWellbeing = investment.category === 'wellbeing';
  const isAutomatic = isActivityOriginal || isStability || isWellbeing;
  const isCompleted = investment.status === 'completed' || investment.daysPassed >= investment.durationDays;

  // Calculate times
  const createdTime = new Date(investment.createdAt).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  let nextClaimTime = 0;
  if (isAutomatic) {
    nextClaimTime = createdTime + investment.durationDays * oneDayMs;
  } else {
    nextClaimTime = createdTime + (investment.daysPassed + 1) * oneDayMs;
  }

  const isReady = !isCompleted && !isAutomatic && now >= nextClaimTime;
  const diff = nextClaimTime - now;

  let timeLeftStr = '';
  let cyclePercent = 0;

  if (isCompleted) {
    timeLeftStr = t('Complété', 'Completed');
    cyclePercent = 100;
  } else if (isAutomatic) {
    if (diff <= 0) {
      timeLeftStr = t('Cycle terminé - En cours de versement', 'Cycle completed - Payment in progress');
      cyclePercent = 100;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      timeLeftStr = `${hours}h ${minutes}m ${seconds}s`;
      
      const totalDurationMs = investment.durationDays * oneDayMs;
      const elapsedMs = now - createdTime;
      cyclePercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
    }
  } else {
    if (diff <= 0) {
      timeLeftStr = t('Revenu disponible', 'Revenue available');
      cyclePercent = 100;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      timeLeftStr = `${hours}h ${minutes}m ${seconds}s`;

      const lastClaimTime = nextClaimTime - oneDayMs;
      const elapsedInCycleMs = now - lastClaimTime;
      cyclePercent = Math.min(100, Math.max(0, Math.round((elapsedInCycleMs / oneDayMs) * 100)));
    }
  }

  // Format the exact time the revenue will drop in 24h (or target date)
  const nextClaimDateObj = new Date(nextClaimTime);
  const currentLocale = lang === 'EN' ? 'en-US' : 'fr-FR';
  const formattedDate = nextClaimDateObj.toLocaleDateString(currentLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = nextClaimDateObj.toLocaleTimeString(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClaimClick = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      await onClaim(investment.id);
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const totalInvestmentPercent = Math.min(100, Math.round((investment.daysPassed / investment.durationDays) * 100));

  return (
    <div id={`investment-card-${investment.id}`} className="bg-rose-950/70 rounded-2xl p-4 sm:p-5 border border-rose-700/60 shadow-md text-left space-y-3.5 transition-all my-3">
      {/* Product Title and Invested Badge */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h5 className="font-sans font-black text-white text-sm sm:text-base uppercase tracking-tight flex items-center gap-1.5">
            {isActivityOriginal && <Flame className="w-4.5 h-4.5 text-orange-400 shrink-0" />}
            {investment.productName}
          </h5>
          <span className="text-xs sm:text-sm text-rose-200 font-bold block">
            {t('Plan', 'Plan')} {isActivityOriginal ? t('Cycle Court', 'Short Cycle') : isWellbeing ? t('Bien-être', 'Well-being') : t('Stabilité', 'Stability')} • {t('Jour', 'Day')} {investment.daysPassed} {t('sur', 'of')} {investment.durationDays}
          </span>
        </div>
        <div className="text-right">
          <span className="text-rose-300 text-[11px] sm:text-xs block uppercase font-black tracking-wider">{t('Investi', 'Invested')}</span>
          <span className="text-amber-300 font-black text-sm sm:text-base font-mono">
            {investment.price.toLocaleString()} F CFA
          </span>
        </div>
      </div>

      {/* Main duration progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-rose-200 font-bold uppercase tracking-wider">
          <span>{t('Progression globale', 'Global Progress')}</span>
          <span className="text-white font-black font-mono">{totalInvestmentPercent}%</span>
        </div>
        <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden border border-rose-900/50">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all" style={{ width: `${totalInvestmentPercent}%` }} />
        </div>
      </div>

      {/* Next Revenue Drop Tracker */}
      <div className="py-2 space-y-2 border-t border-rose-800/40 pt-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-200 flex items-center gap-1.5">
            <Clock className={`w-4 h-4 ${isReady ? 'text-teal-300 animate-pulse' : 'text-rose-300'}`} />
            {isAutomatic ? t('Cycle finalisé le', 'Cycle finalized on') : t('Prochain gain quotidien', 'Next daily gain')}
          </span>
          <span className="font-sans font-black text-xs uppercase tracking-wider text-rose-100 font-mono">
            {formattedDate} {t('à', 'at')} {formattedTime}
          </span>
        </div>

        {/* 24-Hour Cycle Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden border border-rose-900/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isCompleted 
                  ? 'bg-teal-400' 
                  : isReady 
                    ? 'bg-teal-400' 
                    : 'bg-gradient-to-r from-orange-400 to-amber-300'
              }`}
              style={{ width: `${cyclePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-rose-200 uppercase">
            <span>
              {isCompleted ? t('Contrat terminé', 'Contract completed') : isReady ? t('Disponible', 'Available') : t('Minage / Exploitation', 'Mining / In operation')}
            </span>
            <span className="font-mono text-white font-bold">
              {isCompleted ? '100%' : isReady ? t('Prêt', 'Ready') : timeLeftStr}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Information & Harvest Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-rose-800/40">
        <div className="text-left">
          <span className="text-[11px] sm:text-xs text-rose-300 block uppercase font-bold tracking-wider leading-none">{t('Rendement quotidien', 'Daily return')}</span>
          <span className="text-emerald-300 font-black text-sm sm:text-base font-mono mt-0.5 block">
            +{investment.dailyReturn.toLocaleString()} F {t('/ jour', '/ day')}
          </span>
        </div>

        <div className="text-right">
          {isCompleted ? (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-teal-300 font-black uppercase text-xs">
                <CheckCircle className="w-4 h-4 text-teal-300" />
                {t('Terminé', 'Completed')}
              </span>
            </div>
          ) : isAutomatic ? (
            <span className="inline-flex flex-col items-end">
              <span className={`inline-flex items-center gap-1 font-black uppercase text-xs ${
                isStability 
                  ? 'text-sky-300' 
                  : isWellbeing
                  ? 'text-purple-300'
                  : 'text-orange-300 animate-pulse'
              }`}>
                {isStability ? (
                  <Clock className="w-3.5 h-3.5 text-sky-300" />
                ) : isWellbeing ? (
                  <CheckCircle className="w-3.5 h-3.5 text-purple-300" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-orange-300" />
                )}
                {isStability || isWellbeing ? t('Fin de cycle', 'End of cycle') : t('Automatique', 'Automatic')}
              </span>
              <span className="text-xs text-rose-100 font-extrabold mt-0.5 uppercase block leading-none">
                {t('Cumulé:', 'Accumulated:')} {((investment.dailyReturn * investment.daysPassed)).toLocaleString()} F
              </span>
            </span>
          ) : isReady ? (
            <button
              type="button"
              disabled={claiming}
              onClick={handleClaimClick}
              className="bg-gradient-to-r from-[#ff7c00] to-[#7c3aed] text-white hover:brightness-110 active:scale-95 text-xs font-black uppercase px-4 py-2 rounded-full cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Coins className="w-4 h-4" />
              {claiming ? t('Récolte...', 'Harvesting...') : t('Récolter', 'Harvest')}
            </button>
          ) : (
            <div className="flex flex-col text-right">
              <span className="text-[11px] sm:text-xs text-rose-300 uppercase font-bold tracking-wider">{t('Cumulé', 'Accumulated')}</span>
              <span className="font-extrabold text-white text-sm sm:text-base font-mono">
                {(investment.dailyReturn * investment.daysPassed).toLocaleString()} F CFA
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Informational badge for Wellbeing and Activity active investments */}
      {!isCompleted && (
        <div className="flex items-center justify-between pt-2 text-left border-t border-rose-800/30">
          <div className="flex flex-col">
            <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
              {t('⏳ Cycle d\'investissement en cours', '⏳ Investment cycle in progress')}
            </span>
            <span className="text-[11px] sm:text-xs text-rose-200 font-medium">
              {t('Le capital et les bénéfices prévus sont versés à la fin du cycle.', 'The capital and expected profits are paid at the end of the cycle.')}
            </span>
          </div>
          <span className="text-xs text-amber-300 font-black uppercase tracking-wider shrink-0 ml-2">
            {t('Cyclique', 'Cyclic')}
          </span>
        </div>
      )}
    </div>
  );
};
