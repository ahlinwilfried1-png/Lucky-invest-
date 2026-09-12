import React from 'react';
import {
  Wallet,
  ArrowUp,
  Users,
  Calendar,
  Gift,
  ShieldCheck,
  Crown,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface HomeTabViewProps {
  userState: User;
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum') => void;
  setProfileSubPage: (page: string | null) => void;
  t: (fr: string, en: string) => string;
}

export const HomeTabView: React.FC<HomeTabViewProps> = ({
  userState: _userState,
  setActiveTab,
  setProfileSubPage,
  t
}) => {
  return (
    <div className="bg-[#f7f6f2] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-2 pb-24 text-slate-900 min-h-screen text-left animate-fadeIn relative overflow-x-hidden">
      <div className="max-w-md mx-auto w-full space-y-3.5 relative z-10">

        {/* 1. HERO BANNER: GOLD AVENUE LINGOT D'OR PUR (Exact Match to Mockup) */}
        <div 
          className="relative rounded-[26px] overflow-hidden shadow-[0_4px_20px_rgba(217,119,6,0.1)] border border-[#e5a024]/30 bg-gradient-to-r from-[#fff9eb] via-[#faeed1] to-[#eed7a4] p-4 sm:p-5 min-h-[170px] sm:min-h-[190px] flex flex-col justify-between select-none"
          id="hero-banner-gold-avenue"
        >
          {/* Subtle Ambient Light & Bokeh Reflections */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-2 right-1/3 w-28 h-28 bg-yellow-300/30 rounded-full blur-xl pointer-events-none" />

          {/* Authentic Stacked Pure Gold Bullion Bars Graphic */}
          <div className="absolute right-0 top-0 bottom-0 w-[56%] sm:w-[52%] pointer-events-none overflow-hidden rounded-r-[26px]">
            <img 
              src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800" 
              alt="Lingot d'or pur"
              className="w-full h-full object-cover object-center transform scale-110 translate-x-1"
              referrerPolicy="no-referrer"
            />
            {/* Seamless gradient fade from left champagne/cream into the image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fff9eb] via-[#faeed1]/75 via-25% to-transparent" />
          </div>

          {/* Top Header Row of Banner: MEMBRE VIP (Left) & SÉCURISÉ 100% (Right) */}
          <div className="flex items-center justify-between z-10 relative">
            {/* MEMBRE VIP Badge */}
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#b9741a] to-[#d98218] text-white font-sans font-black text-[10px] sm:text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs select-none">
              <Crown className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span>{t('MEMBRE VIP', 'VIP MEMBER')}</span>
            </div>

            {/* SÉCURISÉ 100% Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-xs text-[#b45309] font-sans font-black text-[10px] sm:text-[11px] px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200/60 shadow-xs select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b45309] stroke-[2.5] shrink-0" />
              <span>{t('SÉCURISÉ 100%', '100% SECURE')}</span>
            </div>
          </div>

          {/* Middle & Bottom: Typography (Left) */}
          <div className="pt-2 relative z-10 max-w-[62%] sm:max-w-[65%] select-none">
            <h2 className="font-serif font-black text-[#b87a1a] text-base sm:text-xl tracking-wider uppercase leading-none">
              GOLD AVENUE
            </h2>
            <h1 className="font-serif font-black text-[#0c2340] text-xl sm:text-2xl leading-tight mt-1">
              LINGOT D'OR
            </h1>
            <h1 className="font-serif font-black text-[#0c2340] text-xl sm:text-2xl leading-tight mt-0.5 flex items-center gap-1.5">
              <span>PUR</span>
              <span className="text-base sm:text-lg">💎</span>
            </h1>
            <p className="text-[9.5px] sm:text-[10.5px] font-bold text-[#3a6082] uppercase tracking-wider mt-1.5 line-clamp-1">
              {t('BÉNÉFICIEZ DE LA SÉCURITÉ...', 'ENJOY COMPLETE SECURITY...')}
            </p>
          </div>
        </div>

        {/* 2. QUICK ACTIONS: RECHARGER, RETIRER, MON ÉQUIPE, POINTAGE (Exact Match to Mockup) */}
        <div 
          className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border border-slate-100/90 grid grid-cols-4 gap-2 text-center"
          id="quick-actions-row"
        >
          {/* Action 1: Recharger */}
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-recharger"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 group-active:scale-95">
              <Wallet className="w-6 h-6 stroke-[2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0c2340] mt-2 block leading-none">
              {t('Recharger', 'Deposit')}
            </span>
          </button>

          {/* Action 2: Retirer (Golden circle with upward arrow) */}
          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-retirer"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 group-active:scale-95">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d97706] flex items-center justify-center shadow-2xs">
                <ArrowUp className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.75] text-white" />
              </div>
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0c2340] mt-2 block leading-none">
              {t('Retirer', 'Withdraw')}
            </span>
          </button>

          {/* Action 3: Mon Équipe */}
          <button
            onClick={() => setActiveTab('team')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-team"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 group-active:scale-95">
              <Users className="w-6 h-6 stroke-[2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0c2340] mt-2 block leading-none">
              {t('Mon Équipe', 'My Team')}
            </span>
          </button>

          {/* Action 4: Pointage */}
          <button
            onClick={() => setProfileSubPage('pointage')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-pointage"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 group-active:scale-95">
              <Calendar className="w-6 h-6 stroke-[2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0c2340] mt-2 block leading-none">
              {t('Pointage', 'Check-in')}
            </span>
          </button>
        </div>

        {/* 3. CARD: RÉCOMPENSES D'INVITATION (Exact Match to Mockup) */}
        <div 
          className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-3 relative text-left"
          id="invitation-rewards-card"
        >
          {/* Header row with Gift Badge */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-serif font-black text-sm sm:text-base text-[#0c2340] tracking-wide uppercase leading-tight">
                {t("RÉCOMPENSES D'INVITATION", "INVITATION REWARDS")}
              </h2>
              <p className="text-[11.5px] sm:text-xs text-[#48627d] font-normal leading-tight mt-1">
                {t("Investissez ensemble, enrichissez-vous ensemble", "Invest together, grow rich together")}
              </p>
            </div>

            {/* Circular Gift Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2] text-[#d97706]" />
            </div>
          </div>

          {/* Inner Card Row: Icon + Title + ALLEZ Button */}
          <div className="bg-[#faf8f5] rounded-2xl p-3 sm:p-3.5 border border-slate-100/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2] text-[#d97706]" />
              </div>
              <div className="min-w-0">
                <span className="font-sans font-black text-xs sm:text-sm text-[#0c2340] uppercase tracking-wide block leading-tight">
                  {t("INVITER DES AMIS", "INVITE FRIENDS")}
                </span>
                <span className="text-[11px] text-[#64748b] block mt-0.5 leading-tight truncate max-w-[150px] sm:max-w-[210px]">
                  {t("Obtenez votre lien et vos commissi...", "Get your invitation link and referral commissions")}
                </span>
              </div>
            </div>

            {/* ALLEZ Button */}
            <button
              onClick={() => setActiveTab('team')}
              className="bg-gradient-to-r from-[#e5a024] via-[#dba032] to-[#c78216] hover:brightness-105 active:scale-95 text-white font-sans font-black text-xs sm:text-[13px] px-6 sm:px-7 py-2.5 rounded-full uppercase tracking-wider shadow-[0_2px_8px_rgba(217,119,6,0.25)] transition-all cursor-pointer border-none outline-none shrink-0"
              id="btn-inviter-allez"
            >
              {t('ALLEZ', 'GO')}
            </button>
          </div>
        </div>

        {/* 4. CARD: TÂCHES & RÉCOMPENSES / RÉCOMPENSES DES TÂCHES (Exact Match to Mockup) */}
        <div 
          className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-3 text-left"
          id="task-rewards-card"
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setProfileSubPage('tasks')}
          >
            <div>
              <span className="text-[10px] sm:text-[11px] font-sans font-black text-[#c87a14] uppercase tracking-wider block leading-none">
                {t("TÂCHES & RÉCOMPENSES", "TASKS & REWARDS")}
              </span>
              <h2 className="font-serif font-black text-sm sm:text-base text-[#0c2340] tracking-wide uppercase mt-1 leading-tight">
                {t("RÉCOMPENSES DES TÂCHES", "TASK REWARDS")}
              </h2>
            </div>
            <ChevronRight className="w-5 h-5 text-[#c87a14] stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Inner Card: Tâches Info + Full Width TÂCHES Button */}
          <div className="bg-[#faf8f5] rounded-2xl p-3.5 sm:p-4 border border-slate-100/80 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#fef7eb] border border-amber-100/60 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 stroke-[2] text-[#d97706]" />
              </div>
              <div>
                <h4 className="font-sans font-black text-xs sm:text-sm text-[#0c2340] leading-snug">
                  {t("Tâches", "Tasks")}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#64748b] mt-0.5 leading-tight">
                  {t("Activez vos amis et recevez jusqu'à 20 000 FCFA", "Activate friends and receive up to 20,000 FCFA")}
                </p>
              </div>
            </div>

            {/* TÂCHES Button */}
            <button
              onClick={() => setProfileSubPage('tasks')}
              className="w-full bg-gradient-to-r from-[#e5a024] via-[#dba032] to-[#c78216] hover:brightness-105 active:scale-98 text-white font-sans font-black text-xs sm:text-sm uppercase tracking-wider py-2.5 sm:py-3 rounded-full shadow-[0_3px_10px_rgba(217,119,6,0.25)] transition-all cursor-pointer border-none outline-none text-center block"
              id="btn-tasks-action"
            >
              {t("TÂCHES", "TASKS")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
