import React from 'react';
import {
  Wallet,
  ArrowUp,
  Users,
  Calendar,
  Gift,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface HomeTabViewProps {
  userState: User;
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum') => void;
  setProfileSubPage: (page: string | null) => void;
  t: (fr: string, en: string) => string;
}

export const HomeTabView: React.FC<HomeTabViewProps> = ({
  userState,
  setActiveTab,
  setProfileSubPage,
  t
}) => {
  return (
    <div className="bg-[#fcfaf7] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-2 pb-24 text-slate-900 min-h-screen text-left animate-fadeIn relative overflow-x-hidden">
      <div className="max-w-xl mx-auto w-full space-y-3 sm:space-y-3.5 relative z-10">

        {/* 1. HERO BANNER: GOLD AVENUE LINGOT D'OR PUR (Exact Match to Mockup) */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-xs border border-amber-200/20 bg-gradient-to-r from-[#fff9ee] via-[#f7ecd3] to-[#eed7a4] p-4 sm:p-5 min-h-[160px] sm:min-h-[185px] flex flex-col justify-between select-none"
          id="hero-banner-gold-avenue"
        >
          {/* Subtle Ambient Light Reflections */}
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-amber-300/30 via-transparent to-transparent pointer-events-none" />

          {/* Top Header Row of Banner: MEMBRE VIP (Left) & SÉCURISÉ 100% (Right) */}
          <div className="flex items-center justify-between z-10 relative">
            {/* MEMBRE VIP Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#c88214] to-[#e5a024] text-white font-sans font-black text-[10px] sm:text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-200" />
              <span>{t('MEMBRE VIP', 'VIP MEMBER')}</span>
            </div>

            {/* SÉCURISÉ 100% Badge */}
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs text-[#b45309] font-sans font-black text-[10px] sm:text-[11px] px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200/20 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b45309] stroke-[2.5]" />
              <span>{t('SÉCURISÉ 100%', '100% SECURE')}</span>
            </div>
          </div>

          {/* Middle & Bottom: Typography (Left) & Gold Bullion Bars (Right) */}
          <div className="flex items-end justify-between gap-2 pt-2 relative z-10">
            {/* Left: Text Information */}
            <div className="space-y-0.5 max-w-[62%] sm:max-w-[65%]">
              <h2 className="font-serif font-black text-[#b47a1c] text-base sm:text-xl tracking-wider uppercase leading-none">
                GOLD AVENUE
              </h2>
              <h1 className="font-serif font-black text-[#0f2444] text-lg sm:text-2xl leading-tight mt-1 drop-shadow-xs">
                LINGOT D'OR PUR 💎
              </h1>
              <p className="text-[9.5px] sm:text-[11px] font-bold text-[#486581] uppercase tracking-wider mt-1 line-clamp-1">
                {t('BÉNÉFICIEZ DE LA SÉCURITÉ...', 'ENJOY COMPLETE SECURITY...')}
              </p>
            </div>

            {/* Right: Authentic Stacked Pure Gold Bullion Bars Graphic */}
            <div className="relative shrink-0 w-28 sm:w-36 h-20 sm:h-24">
              <img 
                src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800" 
                alt="Lingot d'or pur"
                className="w-full h-full object-cover rounded-2xl shadow-xs border border-amber-200/20"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 2. QUICK ACTIONS: RECHARGER, RETIRER, MON ÉQUIPE, POINTAGE (Exact Match to Mockup) */}
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100/40 grid grid-cols-4 gap-2 sm:gap-3 text-center"
          id="quick-actions-row"
        >
          {/* Action 1: Recharger */}
          <button
            onClick={() => setActiveTab('deposit')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-recharger"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fdf8ee] text-[#d97706] flex items-center justify-center shadow-xs border border-amber-100/30 transition-transform group-hover:scale-105 group-active:scale-95">
              <Wallet className="w-6 h-6 stroke-[2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0f2444] mt-2 block leading-none">
              {t('Recharger', 'Deposit')}
            </span>
          </button>

          {/* Action 2: Retirer */}
          <button
            onClick={() => setActiveTab('withdraw')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-retirer"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fdf8ee] text-[#d97706] flex items-center justify-center shadow-xs border border-amber-100/30 transition-transform group-hover:scale-105 group-active:scale-95">
              <ArrowUp className="w-6 h-6 stroke-[2.2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0f2444] mt-2 block leading-none">
              {t('Retirer', 'Withdraw')}
            </span>
          </button>

          {/* Action 3: Mon Équipe */}
          <button
            onClick={() => setActiveTab('team')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-team"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fdf8ee] text-[#d97706] flex items-center justify-center shadow-xs border border-amber-100/30 transition-transform group-hover:scale-105 group-active:scale-95">
              <Users className="w-6 h-6 stroke-[2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0f2444] mt-2 block leading-none">
              {t('Mon Équipe', 'My Team')}
            </span>
          </button>

          {/* Action 4: Pointage */}
          <button
            onClick={() => setProfileSubPage('pointage')}
            className="flex flex-col items-center justify-center text-center group cursor-pointer border-none bg-transparent outline-none select-none"
            id="btn-quick-pointage"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#fdf8ee] text-[#d97706] flex items-center justify-center shadow-xs border border-amber-100/30 transition-transform group-hover:scale-105 group-active:scale-95">
              <Calendar className="w-6 h-6 stroke-[2] text-[#d97706]" />
            </div>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#0f2444] mt-2 block leading-none">
              {t('Pointage', 'Check-in')}
            </span>
          </button>
        </div>

        {/* 3. CARD: RÉCOMPENSES D'INVITATION (Exact Match to Mockup) */}
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100/40 space-y-3 relative text-left"
          id="invitation-rewards-card"
        >
          {/* Header row with Gift Badge */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-serif font-black text-sm sm:text-base text-[#0f2444] tracking-wide uppercase">
                {t("RÉCOMPENSES D'INVITATION", "INVITATION REWARDS")}
              </h2>
              <p className="text-xs text-[#52667a] font-medium leading-none">
                {t("Investissez ensemble, enrichissez-vous ensemble", "Invest together, grow rich together")}
              </p>
            </div>

            {/* Circular Gift Icon */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#fdf8ee] text-[#d97706] border border-amber-100/30 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 stroke-[2] text-[#d97706]" />
            </div>
          </div>

          {/* Inner Card Row: Icon + Title + ALLEZ Button */}
          <div className="bg-[#fcfaf7] rounded-2xl p-3 sm:p-3.5 border border-amber-100/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#fdf8ee] border border-amber-200/30 text-[#d97706] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2] text-[#d97706]" />
              </div>
              <div className="min-w-0">
                <span className="font-sans font-black text-xs sm:text-sm text-[#0f2444] uppercase tracking-wide block leading-tight">
                  {t("INVITER DES AMIS", "INVITE FRIENDS")}
                </span>
                <span className="text-[11px] text-[#64748b] block mt-0.5 leading-tight truncate">
                  {t("Obtenez votre lien et vos commissions d'invitation", "Get your invitation link and referral commissions")}
                </span>
              </div>
            </div>

            {/* ALLEZ Button */}
            <button
              onClick={() => setActiveTab('team')}
              className="bg-gradient-to-r from-[#d9962a] via-[#e5a836] to-[#c88214] hover:brightness-105 active:scale-95 text-white font-black text-xs sm:text-[13px] px-6 py-2 rounded-full uppercase tracking-wider shadow-xs transition-all cursor-pointer border-none outline-none shrink-0"
              id="btn-inviter-allez"
            >
              {t('ALLEZ', 'GO')}
            </button>
          </div>
        </div>

        {/* 4. CARD: TÂCHES & RÉCOMPENSES / RÉCOMPENSES DES TÂCHES (Exact Match to Mockup) */}
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100/40 space-y-3 text-left"
          id="task-rewards-card"
        >
          {/* Header */}
          <div>
            <span className="text-[10px] sm:text-[11px] font-black text-amber-600 uppercase tracking-widest block leading-none">
              {t("TÂCHES & RÉCOMPENSES", "TASKS & REWARDS")}
            </span>
            <h2 className="font-serif font-black text-sm sm:text-base text-[#0f2444] tracking-wide uppercase mt-1 leading-tight">
              {t("RÉCOMPENSES DES TÂCHES", "TASK REWARDS")}
            </h2>
          </div>

          {/* Inner Card: Tâches Info + Full Width TÂCHES Button */}
          <div className="bg-[#fcfaf7] rounded-2xl p-3.5 sm:p-4 border border-amber-100/30 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#fdf8ee] border border-amber-200/30 text-[#d97706] flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 stroke-[2] text-[#d97706]" />
              </div>
              <div>
                <h4 className="font-sans font-black text-xs sm:text-sm text-[#0f2444] leading-snug">
                  {t("Tâches", "Tasks")}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#52667a] mt-0.5 leading-tight">
                  {t("Activez vos amis et recevez jusqu'à 20 000 FCFA", "Activate friends and receive up to 20,000 FCFA")}
                </p>
              </div>
            </div>

            {/* TÂCHES Button */}
            <button
              onClick={() => setProfileSubPage('tasks')}
              className="w-full bg-gradient-to-r from-[#d9962a] via-[#e5a836] to-[#c88214] hover:brightness-105 active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider py-2.5 sm:py-3 rounded-full shadow-xs transition-all cursor-pointer border-none outline-none text-center block"
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
