import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Share
} from 'lucide-react';
import { User, Commission } from '../types';

interface TeamTabViewProps {
  userState: User;
  referralURL: string;
  copiedCode: boolean;
  copiedLink: boolean;
  handleCopyCode: () => void;
  handleCopyLink: () => void;
  showTeamDetailsPage: boolean;
  setShowTeamDetailsPage: (show: boolean) => void;
  referralListTab: 'level1' | 'level2' | 'level3';
  setReferralListTab: (tab: 'level1' | 'level2' | 'level3') => void;
  level1Users: any[];
  level2Users: any[];
  level3Users: any[];
  getUserInvestedAmount: (userId: string) => number;
  getLevelInvestedAmount: (users: any[]) => number;
  maskPhoneNumber: (val: string) => string;
  mlmRates: { level1?: number; level2?: number; level3?: number };
  commissions: Commission[];
  totalReferrals: number;
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum') => void;
  t: (fr: string, en: string) => string;
}

export const TeamTabView: React.FC<TeamTabViewProps> = ({
  userState,
  referralURL,
  copiedCode,
  copiedLink,
  handleCopyCode,
  handleCopyLink,
  showTeamDetailsPage,
  setShowTeamDetailsPage,
  referralListTab,
  setReferralListTab,
  level1Users,
  level2Users,
  level3Users,
  getUserInvestedAmount,
  getLevelInvestedAmount,
  maskPhoneNumber,
  mlmRates,
  commissions,
  totalReferrals,
  setActiveTab,
  t
}) => {
  const getActiveUsersCount = (list: any[]) => {
    return list.filter(u => getUserInvestedAmount(u.id) > 0).length;
  };

  /* ========================================================================= */
  /* SUB-VIEW : DÉTAILS DE L'ÉQUIPE (LISTE COMPLÈTE DES FILLEULS PAR NIVEAU)   */
  /* ========================================================================= */
  if (showTeamDetailsPage) {
    const currentList =
      referralListTab === 'level1'
        ? level1Users
        : referralListTab === 'level2'
          ? level2Users
          : level3Users;

    return (
      <div 
        className="bg-[#FAF8F2] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-2 pb-24 text-slate-900 text-left animate-fadeIn relative overflow-x-hidden min-h-screen"
        id="team-details-page-view"
      >
        <div className="max-w-xl mx-auto w-full space-y-4 sm:space-y-5">
          
          {/* Top Bar with Return Button to Overview */}
          <div className="flex items-center space-x-3.5 mb-1 pt-1">
            <button 
              onClick={() => setShowTeamDetailsPage(false)}
              className="w-10 h-10 rounded-2xl bg-white border border-[#E8D8B0]/30 flex items-center justify-center text-[#D49A22] hover:bg-[#FFF5D9]/50 transition-all cursor-pointer shadow-xs active:scale-95"
              id="btn-back-to-team-overview"
              title="Retour"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <span className="text-[10px] text-[#B8790B] font-sans font-black uppercase tracking-widest block leading-none mb-1">
                {t('RÉSEAU GOLD AVENUE', 'GOLD AVENUE NETWORK')}
              </span>
              <h2 className="font-serif font-black text-[#102A43] text-base sm:text-lg uppercase tracking-tight leading-none">
                {t("Détails de l'équipe", "Team Details")}
              </h2>
            </div>
          </div>

          {/* Level Tabs Selector (🥇 Niv 1 | 🥈 Niv 2 | 🥉 Niv 3) */}
          <div 
            className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border border-[#E8D8B0]/20 shadow-xs"
            id="team-level-tabs-container"
          >
            <button
              onClick={() => setReferralListTab('level1')}
              className={`py-2.5 text-center rounded-xl text-xs font-black transition-all cursor-pointer border-none outline-none ${
                referralListTab === 'level1'
                  ? 'bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] text-white shadow-xs font-black'
                  : 'text-[#607D9A] hover:text-[#102A43] bg-transparent'
              }`}
              id="tab-level-1"
            >
              🥇 {t('Niv 1', 'Lvl 1')} ({level1Users.length})
            </button>
            <button
              onClick={() => setReferralListTab('level2')}
              className={`py-2.5 text-center rounded-xl text-xs font-black transition-all cursor-pointer border-none outline-none ${
                referralListTab === 'level2'
                  ? 'bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] text-white shadow-xs font-black'
                  : 'text-[#607D9A] hover:text-[#102A43] bg-transparent'
              }`}
              id="tab-level-2"
            >
              🥈 {t('Niv 2', 'Lvl 2')} ({level2Users.length})
            </button>
            <button
              onClick={() => setReferralListTab('level3')}
              className={`py-2.5 text-center rounded-xl text-xs font-black transition-all cursor-pointer border-none outline-none ${
                referralListTab === 'level3'
                  ? 'bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] text-white shadow-xs font-black'
                  : 'text-[#607D9A] hover:text-[#102A43] bg-transparent'
              }`}
              id="tab-level-3"
            >
              🥉 {t('Niv 3', 'Lvl 3')} ({level3Users.length})
            </button>
          </div>

          {/* Key Stats for the Selected Level (Membres Actifs & Total Investi) */}
          <div className="grid grid-cols-2 gap-3" id="team-stats-summary-grid">
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#E8D8B0]/20 shadow-xs text-left">
              <span className="text-[9px] text-[#B8790B] font-black uppercase tracking-wider block">
                {t('Membres Actifs', 'Active Members')}
              </span>
              <span className="text-lg sm:text-xl font-mono font-black text-[#102A43] block mt-1">
                {referralListTab === 'level1' 
                  ? getActiveUsersCount(level1Users) 
                  : referralListTab === 'level2' 
                    ? getActiveUsersCount(level2Users) 
                    : getActiveUsersCount(level3Users)}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-[#E8D8B0]/20 shadow-xs text-left">
              <span className="text-[9px] text-[#B8790B] font-black uppercase tracking-wider block">
                {t('Total Investi', 'Total Invested')}
              </span>
              <span className="text-lg sm:text-xl font-mono font-black text-[#D49A22] block mt-1">
                {referralListTab === 'level1' 
                  ? getLevelInvestedAmount(level1Users).toLocaleString() 
                  : referralListTab === 'level2' 
                    ? getLevelInvestedAmount(level2Users).toLocaleString() 
                    : getLevelInvestedAmount(level3Users).toLocaleString()} XOF
              </span>
            </div>
          </div>

          {/* Detailed List of Members Card */}
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E8D8B0]/20 shadow-xs space-y-4 text-slate-900"
            id="members-list-card"
          >
            <div className="flex items-center justify-between border-b border-[#E8D8B0]/20 pb-3">
              <span className="text-[11px] text-[#B8790B] font-black uppercase tracking-wider block pl-0.5">
                {t('LISTE DES FILLEULS', 'REFERRAL LIST')} : {referralListTab === 'level1' ? t('Niveau 1', 'Level 1') : referralListTab === 'level2' ? t('Niveau 2', 'Level 2') : t('Niveau 3', 'Level 3')}
              </span>
              <span className="text-[9px] bg-[#FFF5D9] text-[#B8790B] font-bold font-mono px-2.5 py-1 rounded-full border border-[#E8D8B0]/25 uppercase tracking-wide">
                {currentList.length} {t('membres', 'members')}
              </span>
            </div>

            {/* Member Items */}
            <div className="space-y-2.5 pt-1">
              {currentList.length === 0 ? (
                <div className="text-center py-8 bg-[#FAF8F2] rounded-2xl border border-[#E8D8B0]/20 p-4">
                  <p className="text-xs text-[#607D9A] font-semibold max-w-xs mx-auto leading-relaxed">
                    {referralListTab === 'level1'
                      ? t("Vous n'avez pas encore de filleuls inscrits directement (Niveau 1) dans votre équipe.", "You don't have any direct referrals (Level 1) registered in your team yet.")
                      : referralListTab === 'level2'
                        ? t("Aucun membre de Niveau 2 enregistré dans votre réseau.", "No Level 2 members registered in your network.")
                        : t("Aucun membre de Niveau 3 enregistré dans votre réseau.", "No Level 3 members registered in your network.")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentList.map(u => (
                    <div 
                      key={u.id} 
                      className="p-3.5 bg-[#FAF8F2] border border-[#E8D8B0]/20 rounded-xl sm:rounded-2xl flex items-center justify-between hover:border-[#D49A22]/50 transition-colors text-slate-900"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] text-[#B8790B] font-extrabold uppercase tracking-wider">
                          {t('Membre parrainé', 'Referred Member')}
                        </span>
                        <span className="text-xs sm:text-sm font-sans font-black text-[#102A43] mt-0.5">
                          {u.name || t("Membre anonyme", "Anonymous Member")}
                        </span>
                        <span className="text-[10px] text-[#607D9A] font-mono font-medium">
                          {maskPhoneNumber(u.whatsapp || u.id)}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-[#B8790B] font-extrabold uppercase tracking-wider">
                          {t('Montant investi', 'Invested Amount')}
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-black text-[#D49A22] mt-0.5">
                          {getUserInvestedAmount(u.id).toLocaleString()} XOF
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* MAIN VIEW : MON ÉQUIPE GOLD AVENUE (INVITATION, NIVEAUX, COMMISSIONS)     */
  /* ========================================================================= */
  return (
    <div 
      className="bg-[#FAF8F2] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-2 pb-24 text-slate-900 text-left animate-fadeIn relative overflow-x-hidden min-h-screen"
      id="team-main-page-view"
    >
      <div className="max-w-xl mx-auto w-full space-y-4 sm:space-y-4.5">
        
        {/* Top Header Bar with Back Button to Dashboard */}
        <div className="flex items-center space-x-3 mb-1 pt-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="w-10 h-10 rounded-2xl bg-white border border-[#E8D8B0]/30 flex items-center justify-center text-[#D49A22] hover:bg-[#FFF5D9]/50 transition-all cursor-pointer shadow-xs active:scale-95"
            id="btn-back-to-home"
            title="Retour à l'accueil"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] text-[#B8790B] font-sans font-black uppercase tracking-widest block leading-none mb-1">
              {t('MON ÉQUIPE GOLD AVENUE', 'MY GOLD AVENUE TEAM')}
            </span>
            <h2 className="font-serif font-black text-[#102A43] text-base sm:text-lg uppercase tracking-tight leading-none">
              {t("Programme de Parrainage", "Referral Program")}
            </h2>
          </div>
        </div>

        {/* 1. INVITATION REWARDS SECTION */}
        <div className="space-y-3 sm:space-y-3.5" id="invitation-rewards-section">
          {/* Header with Golden Star */}
          <div className="flex items-center justify-between pl-1">
            <div className="space-y-0.5">
              <h2 className="text-lg sm:text-2xl font-serif font-black tracking-tight text-[#102A43]">
                {t("Récompenses d'invitation", "Invitation Rewards")}
              </h2>
              <p className="text-xs text-[#607D9A] font-semibold">
                {t("Investissez ensemble, enrichissez-vous ensemble", "Invest together, grow rich together")}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#FFF5D9] rounded-2xl flex items-center justify-center text-[#D49A22] border border-[#E8D8B0]/25 text-xl sm:text-2xl shadow-xs">
              🌟
            </div>
          </div>

          {/* Invitation Action Cards */}
          <div className="space-y-2.5 sm:space-y-3">
            
            {/* Card 1: Invitation Code */}
            <div 
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-center justify-between border border-[#E8D8B0]/20 shadow-xs transition-transform hover:scale-[1.01] text-slate-900"
              id="card-referral-code"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#FFF5D9] border border-[#E8D8B0]/25 flex items-center justify-center text-[#D49A22] shrink-0">
                  <Copy className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] text-[#B8790B] font-black uppercase tracking-wider block">
                    {t("Code d'invitation", "Invitation Code")}
                  </span>
                  <span className="text-sm sm:text-lg font-mono font-black text-[#102A43] block mt-0.5 select-all">
                    {userState.referralCode}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] text-white text-[10px] sm:text-[11px] font-black rounded-xl shadow-xs hover:brightness-105 active:scale-95 duration-150 uppercase tracking-widest cursor-pointer border-none outline-none"
                id="btn-copy-referral-code"
              >
                {copiedCode ? t("Copié !", "Copied!") : t("Copier", "Copy")}
              </button>
            </div>

            {/* Card 2: Invitation Link */}
            <div 
              className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-center justify-between border border-[#E8D8B0]/20 shadow-xs transition-transform hover:scale-[1.01] text-slate-900"
              id="card-referral-link"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 overflow-hidden mr-2">
                <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#FFF5D9] border border-[#E8D8B0]/25 flex items-center justify-center text-[#D49A22] shrink-0">
                  <Share className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] sm:text-[11px] text-[#B8790B] font-black uppercase tracking-wider block">
                    {t("Lien d'invitation", "Invitation Link")}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#607D9A] block mt-0.5 truncate select-all">
                    {referralURL}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[#B8790B] via-[#D49A22] to-[#F3C75F] text-white text-[10px] sm:text-[11px] font-black rounded-xl shadow-xs hover:brightness-105 active:scale-95 duration-150 uppercase tracking-widest cursor-pointer border-none outline-none shrink-0"
                id="btn-copy-referral-link"
              >
                {copiedLink ? t("Copié !", "Copied!") : t("Copier", "Copy")}
              </button>
            </div>

          </div>
        </div>

        {/* 2. TEAM LEVELS SECTION */}
        <div className="space-y-3 pt-1" id="team-levels-section">
          <div className="flex items-center justify-between pl-1">
            <h3 className="font-serif font-black text-[#102A43] text-sm sm:text-base uppercase tracking-tight">
              {t("Niveau d'équipe", "Team Level")}
            </h3>
            <button
              onClick={() => {
                setShowTeamDetailsPage(true);
              }}
              className="text-[#D49A22] hover:text-[#B8790B] text-xs font-extrabold flex items-center space-x-1 uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
              id="btn-open-team-details"
            >
              <span>{t("Détails de l'équipe", "Team Details")}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Level Cards List */}
          <div className="space-y-2.5">
            
            {/* Level 1 (N1) - Golden Card */}
            <div 
              onClick={() => {
                setReferralListTab('level1');
                setShowTeamDetailsPage(true);
              }}
              className={`bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-center justify-between border transition-all duration-200 cursor-pointer shadow-xs ${
                referralListTab === 'level1' 
                  ? 'border-[#D49A22] ring-2 ring-[#D49A22]/30 scale-[1.01]' 
                  : 'border-[#E8D8B0]/20 hover:border-[#D49A22]/50'
              }`}
              id="team-level-card-1"
            >
              <div className="flex items-center space-x-3 sm:space-x-5 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FFF5D9] border border-[#E8D8B0]/25 flex items-center justify-center text-2xl filter drop-shadow-xs shrink-0">
                  🥇
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 text-left">
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#D49A22] block leading-tight">
                      {mlmRates.level1 !== undefined ? mlmRates.level1 : 30}%
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Taux Niv 1', 'Lvl 1 Rate')}
                    </span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#102A43] block leading-tight">
                      {level1Users.length}
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Total invité', 'Total Invited')}
                    </span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#2E9B68] block leading-tight">
                      {getActiveUsersCount(level1Users)}
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Activé', 'Active')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[#D49A22] pl-1.5">
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Level 2 (N2) - Silver Card */}
            <div 
              onClick={() => {
                setReferralListTab('level2');
                setShowTeamDetailsPage(true);
              }}
              className={`bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-center justify-between border transition-all duration-200 cursor-pointer shadow-xs ${
                referralListTab === 'level2' 
                  ? 'border-[#D49A22] ring-2 ring-[#D49A22]/30 scale-[1.01]' 
                  : 'border-[#E8D8B0]/20 hover:border-[#D49A22]/50'
              }`}
              id="team-level-card-2"
            >
              <div className="flex items-center space-x-3 sm:space-x-5 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FAF8F2] border border-[#E8D8B0]/25 flex items-center justify-center text-2xl filter drop-shadow-xs shrink-0">
                  🥈
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 text-left">
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#D49A22] block leading-tight">
                      {mlmRates.level2 !== undefined ? mlmRates.level2 : 2}%
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Taux Niv 2', 'Lvl 2 Rate')}
                    </span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#102A43] block leading-tight">
                      {level2Users.length}
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Total invité', 'Total Invited')}
                    </span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#2E9B68] block leading-tight">
                      {getActiveUsersCount(level2Users)}
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Activé', 'Active')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[#D49A22] pl-1.5">
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Level 3 (N3) - Bronze Card */}
            <div 
              onClick={() => {
                setReferralListTab('level3');
                setShowTeamDetailsPage(true);
              }}
              className={`bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-center justify-between border transition-all duration-200 cursor-pointer shadow-xs ${
                referralListTab === 'level3' 
                  ? 'border-[#D49A22] ring-2 ring-[#D49A22]/30 scale-[1.01]' 
                  : 'border-[#E8D8B0]/20 hover:border-[#D49A22]/50'
              }`}
              id="team-level-card-3"
            >
              <div className="flex items-center space-x-3 sm:space-x-5 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FFF5D9] border border-[#E8D8B0]/25 flex items-center justify-center text-2xl filter drop-shadow-xs shrink-0">
                  🥉
                </div>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 text-left">
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#D49A22] block leading-tight">
                      {mlmRates.level3 !== undefined ? mlmRates.level3 : 1}%
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Taux Niv 3', 'Lvl 3 Rate')}
                    </span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#102A43] block leading-tight">
                      {level3Users.length}
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Total invité', 'Total Invited')}
                    </span>
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-mono font-black text-[#2E9B68] block leading-tight">
                      {getActiveUsersCount(level3Users)}
                    </span>
                    <span className="text-[8.5px] sm:text-[10px] text-[#607D9A] font-black uppercase tracking-tight block mt-0.5">
                      {t('Activé', 'Active')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[#D49A22] pl-1.5">
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

          </div>
        </div>

        {/* 3. COMMISSIONS SUMMARY CARD */}
        <div 
          className="bg-white border border-[#E8D8B0]/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs text-slate-900"
          id="card-commissions-summary"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFF5D9] text-[#D49A22] flex items-center justify-center font-bold text-base sm:text-lg border border-[#E8D8B0]/25">
              💰
            </div>
            <div>
              <span className="text-[8.5px] sm:text-[9px] text-[#B8790B] font-black uppercase tracking-wider block">
                {t('SOLDE DE COMMISSIONS', 'COMMISSION BALANCE')}
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-[#D49A22] block mt-0.5">
                {commissions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} XOF
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8.5px] sm:text-[9px] text-[#B8790B] font-black uppercase tracking-wider block">
              {t('TOTAL INVITÉS', 'TOTAL INVITED')}
            </span>
            <span className="text-xs sm:text-sm font-sans font-black text-[#102A43] block mt-0.5">
              {totalReferrals} {t('membres', 'members')}
            </span>
          </div>
        </div>

        {/* 4. 5-LINE EXPLANATION OF REFERRAL & COMMISSIONS */}
        <div 
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E8D8B0]/20 shadow-xs space-y-3 text-slate-800"
          id="card-referral-explanation"
        >
          <div className="flex items-center gap-2.5 border-b border-[#E8D8B0]/20 pb-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF5D9] text-[#D49A22] flex items-center justify-center text-sm sm:text-base shrink-0 border border-[#E8D8B0]/25">
              ℹ️
            </div>
            <div>
              <h3 className="font-serif font-black text-[#102A43] text-xs sm:text-sm uppercase tracking-tight">
                {t('Fonctionnement du Parrainage & Commissions', 'How Referral & Commissions Work')}
              </h3>
              <span className="text-[9.5px] sm:text-[10.5px] text-[#607D9A] font-medium block">
                {t('Guide et règles de redistribution', 'Guide and redistribution rules')}
              </span>
            </div>
          </div>

          {/* 5-Line Clear Explanation */}
          <div className="space-y-2 text-left">
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#102A43] leading-relaxed font-medium">
              <span className="text-[#D49A22] font-black shrink-0">1.</span>
              <p className="text-[#607D9A]">
                {t(
                  "Partagez votre code ou votre lien d'invitation personnel copiable directement auprès de vos contacts ou sur vos réseaux sociaux.",
                  "Share your personal copyable invitation code or link directly with your contacts or on social media."
                )}
              </p>
            </div>
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#102A43] leading-relaxed font-medium">
              <span className="text-[#D49A22] font-black shrink-0">2.</span>
              <p className="text-[#607D9A]">
                {t(
                  "Dès qu'un nouveau membre s'inscrit via votre lien, il est automatiquement intégré à votre réseau de filleuls.",
                  "As soon as a new member signs up via your link, they are automatically added to your referral network."
                )}
              </p>
            </div>
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#102A43] leading-relaxed font-medium">
              <span className="text-[#D49A22] font-black shrink-0">3.</span>
              <p className="text-[#607D9A]">
                {t(
                  "À chaque souscription d'un plan d'investissement par un membre de votre réseau, une commission proportionnelle est créditée sur votre solde.",
                  "Whenever an investment plan is purchased by a member of your network, a proportional commission is credited to your balance."
                )}
              </p>
            </div>
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#102A43] leading-relaxed font-medium">
              <span className="text-[#D49A22] font-black shrink-0">4.</span>
              <p className="text-[#607D9A]">
                {t(
                  "Les taux de commission s'appliquent sur 3 niveaux : ",
                  "Commission rates apply across 3 levels: "
                )}
                <strong className="text-[#B8790B] font-bold">
                  {t('Niveau 1', 'Level 1')} ({mlmRates.level1 !== undefined ? mlmRates.level1 : 30}%)
                </strong>,{' '}
                <strong className="text-[#B8790B] font-bold">
                  {t('Niveau 2', 'Level 2')} ({mlmRates.level2 !== undefined ? mlmRates.level2 : 2}%)
                </strong>{' '}
                {t('et', 'and')}{' '}
                <strong className="text-[#B8790B] font-bold">
                  {t('Niveau 3', 'Level 3')} ({mlmRates.level3 !== undefined ? mlmRates.level3 : 1}%)
                </strong>.
              </p>
            </div>
            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-[#607D9A] leading-relaxed font-medium">
              <span className="text-[#D49A22] font-black shrink-0">5.</span>
              <p className="text-[10px] sm:text-[11px] text-[#607D9A]">
                {t(
                  "Les commissions sont conditionnées par l'activité réelle et les investissements validés de vos filleuls ; aucun gain n'est garanti sans souscription active.",
                  "Commissions are dependent on actual activity and validated investments of your referrals; no earnings are guaranteed without active subscriptions."
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
