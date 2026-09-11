import React from 'react';
import {
  Crown,
  Bell,
  User as UserIcon,
  Wallet,
  ChevronRight,
  ArrowRight,
  CreditCard,
  ClipboardList,
  Layers,
  Coins,
  Gift,
  History,
  Headphones,
  Send,
  Globe,
  ShieldCheck,
  Smartphone,
  LogOut,
  Lock
} from 'lucide-react';

interface ProfileTabViewProps {
  userState: {
    name?: string;
    phone?: string;
    balance: number;
    role?: string;
    referralCode?: string;
  };
  setActiveTab: (tab: any) => void;
  setProfileSubPage: (page: any) => void;
  setIsSupportPageOpen: (open: boolean) => void;
  unreadSupportCount: number;
  currentLanguage: 'fr' | 'en';
  setCurrentLanguage: (lang: 'fr' | 'en') => void;
  setIsAdminMode: (admin: boolean) => void;
  onLogout: () => void;
  triggerToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfileTabView: React.FC<ProfileTabViewProps> = ({
  userState,
  setActiveTab,
  setProfileSubPage,
  setIsSupportPageOpen,
  unreadSupportCount,
  currentLanguage,
  setCurrentLanguage,
  setIsAdminMode,
  onLogout,
  triggerToast,
}) => {
  return (
    <div className="bg-[#f8f9fa] -mx-3 sm:-mx-5 md:-mx-8 xl:-mx-16 -mt-3.5 px-3 sm:px-4 md:px-6 xl:px-12 pt-1.5 pb-16 text-slate-900 min-h-screen text-left animate-fadeIn">
      <div className="max-w-md mx-auto w-full space-y-2">
        
        {/* TOP HEADER: BRAND + NOTIFICATIONS & USER */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center font-black shadow-xs border border-amber-200 shrink-0">
                <Crown className="w-4 h-4 stroke-[2.25]" />
              </div>
              <div>
                <h1 className="font-serif font-black text-sm sm:text-base tracking-wider text-amber-800 uppercase leading-none">
                  GOLD AVENUE
                </h1>
                <p className="text-[9.5px] text-slate-500 font-medium mt-0.5 leading-none">
                  Investir aujourd'hui, construire demain.
                </p>
              </div>
            </div>

            {/* Right: Notification Bell & Profile Avatar */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsSupportPageOpen(true)}
                className="w-7.5 h-7.5 rounded-full bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center shadow-xs border border-slate-200/80 transition-all cursor-pointer relative"
                title="Assistance & Notifications"
                id="btn-profile-notif"
              >
                <Bell className="w-4 h-4 stroke-[2]" />
                {unreadSupportCount > 0 ? (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-1.5 ring-white animate-pulse"></span>
                ) : (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 ring-1.5 ring-white"></span>
                )}
              </button>

              <div 
                className="w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-black text-xs shadow-xs"
                title={userState.name || 'Profil'}
              >
                <UserIcon className="w-4 h-4 stroke-[2.2] text-amber-800" />
              </div>
            </div>
          </div>

          {/* MON SOLDE CARD - Golden Gradient Compact Pill */}
          <div 
            onClick={() => setProfileSubPage('balance')}
            className="w-full bg-gradient-to-r from-[#d9962a] via-[#e5a836] to-[#f2bb45] rounded-xl p-2 px-3 shadow-xs text-white flex items-center justify-between cursor-pointer hover:shadow-sm active:scale-[0.99] transition-all"
            id="card-mon-solde-gold"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-xs">
                <Wallet className="w-4 h-4 stroke-[2.25]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-amber-100 font-medium block leading-none">Mon solde</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight leading-none truncate">
                    {userState.balance.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-black text-amber-100 uppercase">XOF</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 text-amber-100">
              <span className="text-[10px] font-bold">Détails</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* GOLD AVENUE HERO BANNER - Compact Version */}
        <div className="bg-gradient-to-r from-[#fff9eb] via-[#fef3cd] to-[#fdebb8] rounded-2xl p-3 sm:p-3.5 border border-amber-200/70 shadow-xs relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-300/25 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 max-w-[68%]">
            <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">
              GOLD AVENUE
            </span>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 leading-tight mt-0.5">
              Votre avenir financier commence <span className="text-amber-600">ici</span>
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-snug font-medium line-clamp-1">
              Investissez aujourd'hui, profitez des opportunités.
            </p>
            <button
              onClick={() => setActiveTab('products')}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#b37a1f] to-[#996312] hover:from-[#996312] hover:to-[#80500d] text-white text-[10.5px] font-bold shadow-xs transition-all cursor-pointer"
              id="btn-hero-en-savoir-plus"
            >
              <span>En savoir plus</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* 3D Gold Bars Graphic Representation - Scaled Compact */}
          <div className="absolute right-2.5 bottom-2 top-2 w-24 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-18 h-11 rounded-lg bg-gradient-to-br from-[#ffd978] via-[#e6a827] to-[#b87311] shadow-md transform rotate-[-6deg] border border-amber-200 flex flex-col items-center justify-center p-0.5 text-center">
                <Crown className="w-3 h-3 text-amber-950 mb-0.2" />
                <span className="text-[5.5px] tracking-widest text-amber-950 font-black uppercase">FINE GOLD</span>
                <span className="text-[9px] font-serif font-black text-amber-950 leading-none">999.9</span>
              </div>
              <div className="absolute -bottom-1 -left-1 w-14 h-8 rounded-lg bg-gradient-to-br from-[#ffe29a] via-[#eeb53a] to-[#9e620c] shadow-xs transform rotate-[8deg] border border-amber-100 flex flex-col items-center justify-center p-0.5 opacity-95">
                <span className="text-[5px] tracking-widest text-amber-950 font-black">GOLD</span>
                <span className="text-[7.5px] font-black text-amber-950 leading-none">999.9</span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-1.5 right-3 flex items-center gap-1 z-10">
            <span className="w-2.5 h-1 rounded-full bg-amber-700" />
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
          </div>
        </div>

        {/* TOP 4 QUICK ACTIONS CARD - Compact Heights */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-100">
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {/* 1. Recharger */}
            <button
              onClick={() => setActiveTab('deposit')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="profile-action-recharge"
            >
              <div className="w-10 h-10 rounded-xl bg-[#fef4e5] text-[#e08e1a] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block tracking-tight leading-none">Recharger</span>
            </button>

            {/* 2. Retrait */}
            <button
              onClick={() => setActiveTab('withdraw')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="profile-action-retrait"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e6f7f0] text-[#12a16d] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block tracking-tight leading-none">Retrait</span>
            </button>

            {/* 3. Mes commandes */}
            <button
              onClick={() => setProfileSubPage('orders')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="profile-action-orders"
            >
              <div className="w-10 h-10 rounded-xl bg-[#eaf3ff] text-[#2c7cf6] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block tracking-tight leading-none">Commandes</span>
            </button>

            {/* 4. Portefeuille */}
            <button
              onClick={() => setProfileSubPage('balance')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="profile-action-wallet"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f3edff] text-[#8452ec] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block tracking-tight leading-none">Portefeuille</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: MON ACTIVITÉ (No Équipe as ordered) - Compact */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight leading-none">
              Mon activité
            </h3>
            <button 
              onClick={() => setProfileSubPage('balance')}
              className="text-[10.5px] text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-0.5 cursor-pointer leading-none"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3 h-3 stroke-[2.2]" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Solde */}
            <button
              onClick={() => setProfileSubPage('balance')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="act-solde"
            >
              <div className="w-9.5 h-9.5 rounded-full bg-[#fef8e7] border border-amber-200/60 text-[#d48817] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Coins className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block leading-none">Solde</span>
            </button>

            {/* Récompenses */}
            <button
              onClick={() => setProfileSubPage('revenue-history')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="act-recompenses"
            >
              <div className="w-9.5 h-9.5 rounded-full bg-[#fff0f4] border border-pink-200/60 text-[#e93f77] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Gift className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block leading-none">Récompenses</span>
            </button>

            {/* Relevé */}
            <button
              onClick={() => setProfileSubPage('withdraw-history')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none py-0.5"
              id="act-releve"
            >
              <div className="w-9.5 h-9.5 rounded-full bg-[#f3f0ff] border border-purple-200/60 text-[#7c4dff] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <History className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1 block leading-none">Relevé</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: PLUS DE SERVICES - Compact Grid */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xs border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight leading-none">
              Plus de services
            </h3>
            <button 
              onClick={() => setProfileSubPage('about')}
              className="text-[10.5px] text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-0.5 cursor-pointer leading-none"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3 h-3 stroke-[2.2]" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-y-2 gap-x-1 text-center">
            {/* 1. Aide */}
            <button
              onClick={() => setIsSupportPageOpen(true)}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-aide"
            >
              <div className="w-9 h-9 rounded-full bg-[#ecf9f2] text-[#1aa369] border border-emerald-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform relative">
                <Headphones className="w-4 h-4 stroke-[2.2]" />
                {unreadSupportCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {unreadSupportCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-none">Aide</span>
            </button>

            {/* 2. Centre de missions */}
            <button
              onClick={() => setProfileSubPage('wheel')}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-missions"
            >
              <div className="w-9 h-9 rounded-full bg-[#fef8e7] text-[#e08e1a] border border-amber-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Crown className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-tight">Missions</span>
            </button>

            {/* 3. Telegram */}
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none no-underline"
              id="service-telegram"
            >
              <div className="w-9 h-9 rounded-full bg-[#eaf5ff] text-[#2997ff] border border-sky-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-none">Telegram</span>
            </a>

            {/* 4. Changer de langue */}
            <button
              onClick={() => {
                const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
                setCurrentLanguage(newLang);
                localStorage.setItem('gold_avenue_lang', newLang);
                triggerToast(newLang === 'fr' ? 'Langue changée en Français' : 'Language switched to English', 'success');
              }}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-langue"
            >
              <div className="w-9 h-9 rounded-full bg-[#f4edff] text-[#8644e2] border border-purple-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Globe className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-tight">Langue</span>
            </button>

            {/* 5. Sécurité */}
            <button
              onClick={() => {
                setProfileSubPage('password');
              }}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-securite"
            >
              <div className="w-9 h-9 rounded-full bg-[#fff0f4] text-[#e83d73] border border-rose-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-none">Sécurité</span>
            </button>

            {/* 6. Carte bancaire */}
            <button
              onClick={() => {
                setProfileSubPage('bank');
              }}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-carte"
            >
              <div className="w-9 h-9 rounded-full bg-[#eaf3ff] text-[#2b72ee] border border-blue-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-tight">Carte banq.</span>
            </button>

            {/* 7. Installer l'application */}
            <button
              onClick={() => {
                triggerToast("Pour installer l'application : ouvrez le menu de votre navigateur puis 'Ajouter à l'écran d'accueil'.", "info");
              }}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-installer"
            >
              <div className="w-9 h-9 rounded-full bg-[#e6f8f8] text-[#0ea5a8] border border-teal-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-tight">Installer</span>
            </button>

            {/* 8. Déconnexion */}
            <button
              onClick={onLogout}
              className="flex flex-col items-center group cursor-pointer border-none bg-transparent outline-none"
              id="service-deconnexion"
            >
              <div className="w-9 h-9 rounded-full bg-[#f6edff] text-[#9354e8] border border-purple-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <LogOut className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[10.5px] font-medium text-slate-700 mt-1 block leading-none">Quitter</span>
            </button>

            {/* 9. (If Admin) Panneau Admin */}
            {userState.role === 'admin' && (
              <button
                onClick={() => {
                  setIsAdminMode(true);
                  triggerToast("🔑 Mode Administrateur Activé", "success");
                }}
                className="flex items-center justify-center gap-1.5 col-span-4 mt-1 p-2 rounded-xl bg-slate-900 text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
                id="service-admin-panel"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-white">Panneau Administrateur</span>
              </button>
            )}
          </div>
        </div>

        {/* BOTTOM PROMOTIONAL BANNER - Compact */}
        <div className="bg-gradient-to-r from-[#fef3cd] via-[#fce69a] to-[#f9d76c] rounded-xl p-2.5 px-3 border border-amber-300/60 shadow-xs flex items-center justify-between gap-2 relative overflow-hidden">
          <div className="relative z-10 min-w-0">
            <span className="text-[8.5px] font-black text-amber-800 uppercase tracking-widest block leading-none">
              GOLD AVENUE
            </span>
            <h4 className="text-xs font-black text-slate-900 leading-tight mt-0.5 truncate">
              Ensemble vers la réussite
            </h4>
            <p className="text-[9.5px] text-slate-700 leading-tight truncate">
              Plus qu'un investissement, une opportunité.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#b37a1f] to-[#996312] hover:from-[#996312] hover:to-[#80500d] text-white text-[10px] font-bold shadow-xs whitespace-nowrap cursor-pointer shrink-0"
          >
            En savoir plus →
          </button>
        </div>

      </div>
    </div>
  );
};
