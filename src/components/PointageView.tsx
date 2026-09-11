import React, { useState } from 'react';
import {
  ChevronLeft,
  HelpCircle,
  Award,
  Info,
  CheckCircle2,
  Clock,
  Check,
  CalendarCheck,
  Sparkles,
  X
} from 'lucide-react';
import { User, Investment, Product } from '../types';
import { DataStore } from '../dataStore';

interface PointageViewProps {
  userState: User;
  setUserState: React.Dispatch<React.SetStateAction<User>>;
  activeInvestments: Investment[];
  products: Product[];
  onRefreshUser?: (user: User) => void;
  triggerToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  t: (fr: string, en: string) => string;
  setProfileSubPage: (page: string | null) => void;
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum') => void;
}

export const PointageView: React.FC<PointageViewProps> = ({
  userState,
  setUserState,
  activeInvestments,
  products,
  onRefreshUser,
  triggerToast,
  t,
  setProfileSubPage,
  setActiveTab
}) => {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedInToday = userState.lastCheckInDate === todayStr;

  // Calculate user's real VIP level from active investments & product catalogue
  const userActiveInvs = activeInvestments.filter(i => i.status === 'active');
  let userVipLevel = 0;
  let userVipName = 'Aucun VIP Actif';

  for (const inv of userActiveInvs) {
    const prod = products.find(p => p.id === inv.productId || p.name === inv.productName);
    let v = prod?.vipLevel || 0;
    if (!v && inv.productId?.startsWith('stab-')) {
      v = parseInt(inv.productId.replace('stab-', ''), 10) || 0;
    }
    if (v > userVipLevel) {
      userVipLevel = v;
      userVipName = prod?.tag || prod?.name || `VIP ${v}`;
    }
  }

  if (userVipLevel === 0 && userActiveInvs.length > 0) {
    const maxPrice = Math.max(...userActiveInvs.map(i => i.price || 0));
    if (maxPrice >= 50000) userVipLevel = 5;
    else if (maxPrice >= 25000) userVipLevel = 4;
    else if (maxPrice >= 10000) userVipLevel = 3;
    else if (maxPrice >= 5000) userVipLevel = 2;
    else if (maxPrice >= 2000) userVipLevel = 1;
    if (userVipLevel > 0) {
      userVipName = `VIP ${userVipLevel}`;
    }
  }

  // Automatic VIP point reward calculation
  const getVipPointAmount = (vip: number): number => {
    if (vip >= 5) return 300;
    if (vip === 4) return 50;
    if (vip === 3) return 50;
    if (vip === 2) return 20;
    if (vip === 1) return 10;
    return 0; // VIP 0
  };

  const currentVipReward = getVipPointAmount(userVipLevel);
  const totalPointsGenerated = userState.totalCheckInEarnings || 0;

  const handleDailyCheckIn = () => {
    if (isCheckedInToday) {
      triggerToast(t("Vous avez déjà effectué votre pointage aujourd'hui ! Revenez demain.", "You have already checked in today! Come back tomorrow."), "info");
      return;
    }

    if (userVipLevel === 0) {
      triggerToast(t("Aucun pack VIP actif. Activez au moins un pack VIP 1 (2 000 FCFA) pour débloquer votre pointage quotidien !", "No active VIP pack. Activate at least VIP 1 (2,000 FCFA) to unlock daily check-in!"), "error");
      return;
    }

    const reward = currentVipReward;
    const newBalance = (userState.balance || 0) + reward;
    const newTotalCheckInEarnings = totalPointsGenerated + reward;

    // Calculate streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = (userState.lastCheckInDate === yesterday)
      ? (userState.checkInStreak || 0) + 1
      : 1;

    const updatedUser: User = {
      ...userState,
      balance: newBalance,
      lastCheckInDate: todayStr,
      checkInStreak: newStreak,
      totalCheckInEarnings: newTotalCheckInEarnings
    };

    DataStore.saveCurrentUser(updatedUser);
    const allUsers = DataStore.getUsers();
    const idx = allUsers.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      allUsers[idx] = updatedUser;
      DataStore.saveUsers(allUsers);
    }

    setUserState(updatedUser);
    if (onRefreshUser) {
      onRefreshUser(updatedUser);
    }

    DataStore.addNotification({
      id: 'vip-point-' + Date.now(),
      userId: updatedUser.id,
      title: `Pointage validé ! 🌟`,
      message: `Félicitations ! Vous avez reçu ${reward} FCFA pour votre pointage quotidien correspondant à votre statut VIP ${userVipLevel}.`,
      createdAt: new Date().toISOString(),
      isRead: false
    });

    triggerToast(`Pointage validé ! +${reward} FCFA ajoutés à votre solde 🎉`, "success");
  };

  return (
    <div className="bg-[#FAF8F2] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-3 pb-24 text-slate-900 min-h-screen text-left animate-fadeIn relative overflow-x-hidden">
      <div className="max-w-xl mx-auto w-full space-y-3.5 relative z-10">

        {/* 1. TOP HEADER NAVIGATION BAR */}
        <div className="flex items-center justify-between gap-3 pb-1">
          <button
            type="button"
            onClick={() => setProfileSubPage(null)}
            className="w-10 h-10 rounded-full bg-white border border-[#E8D8B0] flex items-center justify-center text-[#102A43] hover:bg-[#FAF8F2] hover:border-[#D49A22] transition-all cursor-pointer shadow-2xs outline-none shrink-0"
            id="btn-back-point"
            title="Retour"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            {/* Titres : bleu nuit #102A43 */}
            <h1 className="font-sans font-black text-base sm:text-lg text-[#102A43] uppercase tracking-tight truncate">
              {t('Pointage Quotidien', 'Daily Check-in')}
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#607D9A] uppercase tracking-wider block">
              {t('Récompense VIP Tous les Jours', 'Daily VIP Reward')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsRulesModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white border border-[#E8D8B0] hover:border-[#D49A22] flex items-center justify-center text-[#D49A22] transition-all cursor-pointer shadow-2xs outline-none shrink-0"
            id="btn-point-rules"
            title="Règles du pointage"
          >
            <HelpCircle className="w-5 h-5 stroke-[2.2] text-[#D49A22]" />
          </button>
        </div>

        {/* 2. STATS SUMMARY BANNER (Cartes blanches, Or #D49A22, Vert succès #2E9B68) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gains de Pointage */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#E8D8B0] text-left">
            <span className="text-[10px] sm:text-[11px] font-black text-[#607D9A] uppercase tracking-wider block">
              {t('Gains de Pointage Générés', 'Generated Check-in Gains')}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              {/* Vert succès : #2E9B68 */}
              <span className="text-2xl sm:text-3xl font-black font-sans text-[#2E9B68]">
                {totalPointsGenerated.toLocaleString()}
              </span>
              <span className="text-xs font-black text-[#607D9A]">
                FCFA
              </span>
            </div>
          </div>

          {/* Niveau VIP Actuel */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#E8D8B0] text-left">
            <span className="text-[10px] sm:text-[11px] font-black text-[#607D9A] uppercase tracking-wider block">
              {t('Niveau VIP Actuel', 'Current VIP Level')}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {/* Icône or #D49A22 */}
              <div className="w-8 h-8 rounded-xl bg-[#FEF8EC] border border-[#E8D8B0] flex items-center justify-center text-[#D49A22]">
                <Award className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-base sm:text-lg font-black font-sans text-[#102A43]">
                {userVipLevel > 0 ? `VIP ${userVipLevel}` : 'VIP 0'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. EXPLICATION DU SYSTÈME DE POINTAGE */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E8D8B0] text-slate-800 space-y-2 text-left">
          <div className="flex items-center gap-2 text-[#102A43] font-sans font-black text-xs sm:text-sm uppercase tracking-tight">
            <Info className="w-4 h-4 text-[#D49A22] stroke-[2.5]" />
            <span>{t('Fonctionnement du Pointage', 'How Check-in Works')}</span>
          </div>
          <p className="text-xs sm:text-[13px] text-[#607D9A] font-medium leading-relaxed">
            {t(
              'Le pointage permet de recevoir un gain quotidien selon votre niveau VIP stable. Plus votre niveau VIP est élevé, plus le montant attribué au pointage peut être important. Le gain est ajouté directement à votre solde chaque jour.',
              'Check-in allows you to receive daily rewards based on your active VIP level. The higher your VIP status, the higher the daily bonus added directly to your balance.'
            )}
          </p>
        </div>

        {/* 4. ACTION CARD : POINTAGE DU JOUR */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E8D8B0] space-y-5 text-slate-800">
          
          {/* Header Status */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8D8B0]/60">
            <div>
              <h3 className="text-sm sm:text-base font-sans font-black text-[#102A43] uppercase tracking-tight">
                {t('Pointage du jour', 'Today’s Check-in')}
              </h3>
              <p className="text-xs text-[#607D9A] font-semibold mt-0.5">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            
            {/* Badge POINTAGE EFFECTUÉ : vert clair */}
            {isCheckedInToday ? (
              <div className="bg-[#E8F8F0] border border-[#2E9B68]/30 text-[#2E9B68] px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{t('POINTAGE EFFECTUÉ', 'CHECKED IN')}</span>
              </div>
            ) : (
              <div className="bg-[#FEF8EC] border border-[#E8D8B0] text-[#D49A22] px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-2xs">
                <Clock className="w-4 h-4 stroke-[2.5]" />
                <span>{t('EN ATTENTE', 'PENDING')}</span>
              </div>
            )}
          </div>

          {/* Main Action Box */}
          <div className="text-center py-2 space-y-4">
            {/* Calendrier : icône or #D49A22 */}
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-xs border-2 ${
              isCheckedInToday
                ? 'bg-[#E8F8F0] border-[#2E9B68] text-[#2E9B68]'
                : 'bg-gradient-to-br from-[#F3C75F] to-[#D49A22] border-[#D49A22] text-white'
            }`}>
              {isCheckedInToday ? (
                <Check className="w-8 h-8 stroke-[3]" />
              ) : (
                <CalendarCheck className="w-8 h-8 stroke-[2.2] animate-bounce" />
              )}
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-sans font-black text-[#102A43]">
                {isCheckedInToday 
                  ? t("Pointage du jour déjà validé !", "Today's check-in already validated!") 
                  : userVipLevel > 0 
                    ? t("Validez votre pointage du jour", "Validate your daily check-in")
                    : t("Activez un Pack VIP pour pointer", "Activate a VIP Pack to check in")}
              </h4>
              <p className="text-xs text-[#607D9A] font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                {isCheckedInToday 
                  ? t("Votre pointage a été enregistré avec succès pour aujourd'hui. Revenez demain pour le prochain pointage !", "Your check-in has been successfully recorded for today. Return tomorrow for the next one!") 
                  : userVipLevel > 0
                    ? t(`Votre statut VIP ${userVipLevel} vous accorde ${currentVipReward} FCFA crédités instantanément.`, `Your VIP ${userVipLevel} status gives you ${currentVipReward} FCFA credited immediately.`)
                    : t("Vous n'avez pas encore de pack VIP actif. Activez au moins un pack VIP 1 (2 000 FCFA) pour débloquer votre pointage quotidien.", "No active VIP pack. Activate at least VIP 1 (2,000 FCFA) to unlock daily check-in.")}
              </p>
            </div>

            {/* BOUTON POINTER : doré */}
            {userVipLevel === 0 ? (
              <button
                type="button"
                onClick={() => {
                  setProfileSubPage(null);
                  setActiveTab('products');
                }}
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-sans font-black uppercase tracking-wider bg-gradient-to-r from-[#D49A22] via-[#C88A16] to-[#B8790B] hover:brightness-105 active:scale-[0.98] text-white shadow-xs border-none flex items-center justify-center gap-2 cursor-pointer transition-all"
                id="btn-buy-vip-point"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5] text-amber-200" />
                <span>{t('DÉBLOQUER MON STATUT VIP', 'UNLOCK VIP STATUS')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDailyCheckIn}
                disabled={isCheckedInToday}
                className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-sans font-black uppercase tracking-wider transition-all duration-200 border-none flex items-center justify-center gap-2 select-none ${
                  isCheckedInToday
                    ? 'bg-[#E8F8F0] text-[#2E9B68] border border-[#2E9B68]/30 cursor-default shadow-none'
                    : 'bg-gradient-to-r from-[#F3C75F] via-[#D49A22] to-[#C88A16] hover:brightness-105 active:scale-[0.98] text-white shadow-xs cursor-pointer'
                }`}
                id="btn-submit-point"
              >
                {isCheckedInToday ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    <span>{t('POINTAGE EFFECTUÉ ✓', 'CHECKED IN ✓')}</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5 stroke-[2.5]" />
                    <span>{t('POINTER MAINTENANT (+', 'CHECK IN NOW (+')}{currentVipReward} FCFA)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 7 DAYS STREAK VISUAL (Jours validés : vert #2E9B68, Jours non effectués : gris clair) */}
          <div className="pt-3 border-t border-[#E8D8B0]/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-[#102A43] uppercase tracking-tight">
                {t('Série de pointage consécutive', 'Consecutive Check-in Streak')}
              </span>
              <span className="text-[11px] font-black text-[#2E9B68] bg-[#E8F8F0] border border-[#2E9B68]/30 px-2.5 py-1 rounded-full">
                {userState.checkInStreak || 0} {t('Jour(s) d’affilée', 'Day(s) in a row')}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const currentStreak = userState.checkInStreak || 0;
                const isCompletedDay = dayNum <= (currentStreak % 7 === 0 && currentStreak > 0 ? 7 : currentStreak % 7);

                return (
                  <div 
                    key={dayNum}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                      isCompletedDay 
                        ? 'bg-[#E8F8F0] border-2 border-[#2E9B68] text-[#2E9B68] shadow-2xs' 
                        : 'bg-[#FAF8F2] border border-[#E2E8F0] text-[#94A3B8]'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tight block">
                      J{dayNum}
                    </span>
                    <div className="mt-1">
                      {isCompletedDay ? (
                        <Check className="w-3.5 h-3.5 text-[#2E9B68] stroke-[3] mx-auto" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#CBD5E1] mx-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RULES MODAL OVERLAY */}
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#E8D8B0] relative text-left text-slate-800">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8D8B0]/60">
                <h3 className="font-sans font-black text-[#102A43] text-base uppercase tracking-tight flex items-center gap-2">
                  <span>📋 {t('Règles du Pointage VIP', 'VIP Check-in Rules')}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF8F2] hover:bg-[#F5EEDC] flex items-center justify-center text-[#102A43] transition-all border border-[#E8D8B0] outline-none cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              <div className="text-xs text-[#607D9A] font-medium leading-relaxed space-y-3">
                <p>
                  1. <strong className="text-[#102A43]">{t('Principe :', 'Principle:')}</strong> {t('Le pointage permet de recevoir un gain quotidien selon votre niveau VIP stable. Plus votre niveau VIP est élevé, plus le montant attribué au pointage est important.', 'Check-in grants daily rewards according to your VIP level.')}
                </p>
                <p>
                  2. <strong className="text-[#102A43]">{t('Fréquence :', 'Frequency:')}</strong> {t("Le pointage s'effectue une seule fois par jour calendaire (réinitialisation à minuit).", 'Check-in is once per calendar day (resets at midnight).')}
                </p>
                <p>
                  3. <strong className="text-[#102A43]">{t('Attribution :', 'Credit:')}</strong> {t('Le gain est ajouté directement à votre solde de manière instantanée.', 'Earnings are added directly and instantly to your balance.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="w-full bg-gradient-to-r from-[#D49A22] to-[#B8790B] text-white py-3.5 rounded-2xl text-xs font-sans font-black uppercase tracking-wider hover:brightness-105 transition-all border-none outline-none cursor-pointer shadow-xs"
              >
                {t("J'ai compris", 'Understood')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
