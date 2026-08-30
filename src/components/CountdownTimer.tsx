import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { safeLocalStorage } from '../dataStore';

interface CountdownTimerProps {
  createdAt: string;
  daysPassed: number;
  durationDays: number;
}

export default function CountdownTimer({ createdAt, daysPassed, durationDays }: CountdownTimerProps) {
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

  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const createdTime = new Date(createdAt).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // For any active investment, the next payout is scheduled at:
      // purchase completion + (daysPassed + 1) * 24 hours
      const nextPayoutTime = createdTime + (daysPassed + 1) * oneDayMs;
      const diff = nextPayoutTime - now;

      if (diff <= 0) {
        setTimeLeft(t("Prêt ⚡", "Ready ⚡"));
        setPercent(100);
      } else {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);

        const hStr = hours.toString().padStart(2, '0');
        const mStr = minutes.toString().padStart(2, '0');
        const sStr = seconds.toString().padStart(2, '0');

        setTimeLeft(`${hStr}:${mStr}:${sStr}`);
        
        // Calculate progress percentage of the current 24-hour cycle
        const elapsed = oneDayMs - diff;
        const currentPhasePercent = Math.max(0, Math.min(100, (elapsed / oneDayMs) * 100));
        setPercent(currentPhasePercent);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt, daysPassed, lang]);

  return (
    <div id={`countdown-${createdAt}-${daysPassed}`} className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-3 flex flex-col space-y-2 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-orange-500 animate-pulse stroke-[2.5]" />
          {t('PROCHAIN GAIN DANS', 'NEXT GAIN IN')}
        </span>
        <span className="font-mono text-xs font-black text-orange-600 bg-orange-100/60 px-2.5 py-1 rounded-xl">
          {timeLeft}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-orange-400 to-amber-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
