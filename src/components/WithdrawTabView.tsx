import React from 'react';
import {
  ChevronLeft,
  History,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { DataStore } from '../dataStore';

interface WithdrawTabViewProps {
  userState: User;
  withdrawAmount: string;
  setWithdrawAmount: (val: string) => void;
  withdrawError: string | null;
  withdrawSuccess: string | null;
  isSubmittingWithdrawal: boolean;
  submitWithdrawal: (e: React.FormEvent) => void;
  setIsBankCardModalOpen: (open: boolean) => void;
  getCurrency: () => string;
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum') => void;
  setProfileSubPage?: (page: string | null) => void;
  onNavigate?: (path: string) => void;
  t: (fr: string, en: string) => string;
}

export const WithdrawTabView: React.FC<WithdrawTabViewProps> = ({
  userState,
  withdrawAmount,
  setWithdrawAmount,
  withdrawError,
  withdrawSuccess,
  isSubmittingWithdrawal,
  submitWithdrawal,
  setIsBankCardModalOpen,
  getCurrency,
  setActiveTab,
  setProfileSubPage,
  onNavigate,
  t
}) => {
  const hasLinkedCard = !!(userState.bankCardNumber || (typeof window !== 'undefined' && localStorage.getItem('mdb_saved_number')));
  const wthSched = DataStore.isWithdrawalOpen();
  const isBlocked = DataStore.areWithdrawalsBlocked() || !!userState.withdrawBlocked;
  const isDisabled = isSubmittingWithdrawal || !hasLinkedCard || !wthSched.isOpen || isBlocked;

  let buttonText = t("Envoyer la demande de Retrait", "Send Withdrawal Request");
  if (isSubmittingWithdrawal) buttonText = t("Traitement en cours...", "Processing...");
  else if (!hasLinkedCard) buttonText = t("Lier un compte de retrait d'abord", "Link a withdrawal account first");
  else if (!wthSched.isOpen) buttonText = t("Horaires de retraits fermés", "Withdrawals currently closed");
  else if (isBlocked) buttonText = t("Retraits temporairement restreints", "Withdrawals restricted");

  const parsedAmount = parseInt(withdrawAmount, 10) || 0;
  const feeAmount = Math.round(parsedAmount * 0.12);
  const netAmount = Math.max(0, parsedAmount - feeAmount);

  const handleOpenHistory = () => {
    if (onNavigate) {
      onNavigate('/historique#retrait');
    } else if (setProfileSubPage) {
      setProfileSubPage('withdraw-history');
    }
  };

  return (
    <div className="bg-[#FAF8F2] -mx-2 sm:-mx-6 md:-mx-12 xl:-mx-20 -mt-2 px-3 sm:px-6 md:px-12 xl:px-20 pt-3 pb-24 text-slate-900 min-h-screen text-left animate-fadeIn relative overflow-x-hidden">
      <div className="max-w-xl mx-auto w-full space-y-3.5 relative z-10">

        {/* 1. TOP HEADER NAVIGATION BAR */}
        <div className="flex items-center justify-between gap-3 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="w-10 h-10 rounded-full bg-white border border-[#E8D8B0]/30 flex items-center justify-center text-[#102A43] hover:bg-[#FAF8F2] hover:border-[#D49A22]/50 transition-all cursor-pointer shadow-2xs outline-none shrink-0"
            id="btn-back-withdraw"
            title="Retour à l'accueil"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            {/* Titres : bleu nuit #102A43 */}
            <h1 className="font-sans font-black text-base sm:text-lg text-[#102A43] uppercase tracking-tight truncate">
              {t('Demande de Retrait', 'Withdrawal Request')}
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#607D9A] uppercase tracking-wider block">
              {t('Transfert Vers Compte Enregistré', 'Transfer to Saved Account')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenHistory}
            className="h-10 px-3 rounded-full bg-white border border-[#E8D8B0]/30 hover:border-[#D49A22]/50 flex items-center gap-1.5 text-[#102A43] hover:text-[#D49A22] transition-all cursor-pointer shadow-2xs outline-none shrink-0"
            id="btn-withdraw-history"
            title="Relevé des renseignements"
          >
            {/* Icônes : or #D49A22 */}
            <History className="w-4 h-4 text-[#D49A22] stroke-[2.2] shrink-0" />
            <span className="text-xs font-bold hidden xs:inline">
              {t('Relevé', 'Statement')}
            </span>
          </button>
        </div>

        {/* ALERTE HORAIRES DE RETRAIT FERMÉS */}
        {!wthSched.isOpen && (
          <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-amber-300/30 text-xs sm:text-sm text-amber-950 font-bold flex items-center gap-3 shadow-2xs">
            <Clock className="w-5 h-5 text-[#D49A22] shrink-0 stroke-[2.2]" />
            <div>
              <span className="font-black uppercase tracking-wider block text-[#B8790B]">
                {t('Horaires de Retrait Fermés', 'Withdrawal Hours Closed')}
              </span>
              <span className="text-[11px] text-amber-900 font-medium block mt-0.5">
                {wthSched.reason || t("Les retraits sont actuellement fermés par l'administration.", "Withdrawals are currently closed.")}
              </span>
            </div>
          </div>
        )}

        {/* ALERTE RESTRICTIONS */}
        {isBlocked && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/30 text-xs text-amber-900 font-black text-center uppercase tracking-wide flex flex-col gap-1 shadow-2xs">
            <span>⚠️ {t('RETRAITS SUSPENDUS TEMPORAIREMENT', 'WITHDRAWALS TEMPORARILY SUSPENDED')}</span>
            <span className="text-[11px] font-medium text-amber-800 normal-case">
              {t('Les retraits sont temporairement restreints sur votre compte. Veuillez contacter le support si nécessaire.', 'Withdrawals are temporarily restricted on your account. Please contact support if needed.')}
            </span>
          </div>
        )}

        {/* ALERTS ERREUR / SUCCÈS */}
        {withdrawError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/50 text-xs sm:text-sm text-red-800 font-bold flex items-center gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{withdrawError}</span>
          </div>
        )}

        {withdrawSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-[#2E9B68]/20 text-xs sm:text-sm text-[#2E9B68] font-bold leading-normal space-y-1 shadow-2xs text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 text-[#2E9B68]">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span className="text-sm font-black uppercase tracking-wide">
                {t('Demande de Retrait Soumise', 'Withdrawal Request Submitted')}
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-medium">
              {withdrawSuccess}
            </p>
          </div>
        )}

        {/* 2. SOLDE ACTUEL DISPONIBLE (Cartes blanches, Montants disponibles : bleu nuit #102A43) */}
        <div 
          className="bg-white rounded-3xl p-5 shadow-xs border border-[#E8D8B0]/20 text-center space-y-1 relative overflow-hidden"
          id="withdraw-balance-card"
        >
          <span className="text-[11px] font-bold text-[#607D9A] uppercase tracking-wider block">
            {t('Solde Actuel Disponible', 'Current Available Balance')}
          </span>
          <div className="flex items-baseline justify-center gap-1.5 pt-0.5">
            {/* Montants disponibles : bleu nuit #102A43 */}
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#102A43] tracking-tight">
              {(userState.balance || 0).toLocaleString()}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#102A43]">
              {getCurrency()}
            </span>
          </div>

          {/* Touche de vert #2E9B68 pour la disponibilité / confirmation */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#2E9B68]">
            <span className="w-2 h-2 rounded-full bg-[#2E9B68] animate-pulse" />
            <span>{t('Fonds prêts pour retrait sécurisé', 'Funds ready for secure withdrawal')}</span>
          </div>
        </div>

        {/* 3. COMPTE DE RÉCEPTION LIÉ (Icônes : or #D49A22 + vert #2E9B68) */}
        {hasLinkedCard ? (
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E8D8B0]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Icône carte : or */}
                <div className="w-8 h-8 rounded-xl bg-[#FEF8EC] border border-[#E8D8B0]/25 flex items-center justify-center text-[#D49A22]">
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="font-sans font-black text-xs sm:text-[13px] text-[#102A43] uppercase tracking-wider">
                  {t('Compte de Réception Lié', 'Linked Receiving Account')}
                </h3>
              </div>

              {/* Statut vert #2E9B68 */}
              <div className="flex items-center gap-1.5 bg-[#E8F8F0] border border-[#2E9B68]/20 text-[#2E9B68] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>{t('Actif', 'Active')}</span>
              </div>
            </div>

            <div className="bg-[#FAF8F2] border border-[#E8D8B0]/20 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-[#607D9A]">{t('Titulaire :', 'Holder:')}</span>
                <span className="font-black text-[#102A43] uppercase">{(userState as any).bankCardHolder || userState.bankCardName || userState.name || "Utilisateur"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-[#607D9A]">{t('Opérateur / Banque :', 'Provider / Bank:')}</span>
                <span className="font-black text-[#D49A22]">{(userState as any).bankName || userState.bankCardOperator || "Mobile Money"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-[#E8D8B0]/20">
                <span className="font-semibold text-[#607D9A]">{t('Numéro de réception :', 'Receiving Number:')}</span>
                <span className="font-mono font-black text-sm text-[#102A43] tracking-wider">
                  {userState.bankCardNumber || (typeof window !== 'undefined' ? localStorage.getItem('mdb_saved_number') : '')}
                </span>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsBankCardModalOpen(true)}
                className="text-xs font-bold text-[#D49A22] hover:text-[#B8790B] hover:underline cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
              >
                <span>{t('Modifier le compte de réception', 'Edit receiving account')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF9EE] border border-dashed border-[#E8D8B0]/40 rounded-3xl p-5 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8D8B0]/25 text-[#D49A22] flex items-center justify-center mx-auto shadow-2xs">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans font-black text-[#102A43] text-sm uppercase">
                {t('Aucun compte de retrait lié', 'No withdrawal account linked')}
              </h3>
              <p className="text-xs text-[#607D9A] font-medium max-w-xs mx-auto">
                {t('Vous devez renseigner votre compte Mobile Money avant de pouvoir retirer vos gains.', 'You must provide your Mobile Money account before withdrawing your earnings.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBankCardModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D49A22] to-[#B8790B] text-white text-xs font-black uppercase tracking-wider hover:brightness-105 transition-all shadow-xs cursor-pointer border-none"
            >
              {t('Lier mon compte de retrait', 'Link withdrawal account')}
            </button>
          </div>
        )}

        {/* 4. FORMULAIRE DE RETRAIT */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E8D8B0]/20 space-y-4">
          <form onSubmit={submitWithdrawal} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-black text-[#102A43] uppercase tracking-wider mb-2 font-sans">
                {t('Montant à extraire', 'Amount to withdraw')} ({getCurrency()})
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1000"
                  max="1000000"
                  placeholder={`Min. 1 000 ${getCurrency()}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#FAF8F2] focus:bg-white border border-[#E8D8B0]/30 focus:border-[#D49A22] rounded-2xl py-3 pl-4 pr-16 text-base font-mono font-black text-[#102A43] focus:outline-none transition-all shadow-2xs placeholder:text-[#607D9A]/50 placeholder:font-normal"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-xs font-black text-[#607D9A] font-mono">
                    {getCurrency()}
                  </span>
                </div>
              </div>
            </div>

            {/* DÉCOMPTE AUTOMATIQUE DES FRAIS (Montants retirables / confirmation : vert #2E9B68) */}
            {parsedAmount > 0 && (
              <div className="p-3.5 bg-[#FAF8F2] border border-[#E8D8B0]/20 rounded-2xl space-y-2 text-xs animate-fadeIn">
                <div className="flex justify-between border-b border-[#E8D8B0]/20 pb-1.5">
                  <span className="text-[#607D9A] font-semibold">{t('Montant brut demandé :', 'Gross requested amount:')}</span>
                  <span className="font-mono text-[#102A43] font-bold">
                    {parsedAmount.toLocaleString()} {getCurrency()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E8D8B0]/20 pb-1.5 text-amber-700">
                  <span className="font-semibold">{t('Frais de traitement (12%) :', 'Processing fees (12%):')}</span>
                  <span className="font-mono font-bold">
                    -{feeAmount.toLocaleString()} {getCurrency()}
                  </span>
                </div>
                <div className="pt-0.5 flex justify-between items-center text-sm font-black">
                  <span className="text-[#102A43]">{t('Montant net crédité :', 'Net amount credited:')}</span>
                  {/* Montants retirables / confirmation : vert #2E9B68 */}
                  <span className="font-mono text-base sm:text-lg text-[#2E9B68]">
                    {netAmount.toLocaleString()} {getCurrency()}
                  </span>
                </div>
              </div>
            )}

            {/* BOUTON RETIRER : dégradé #D49A22 → #B8790B */}
            <div className="pt-2">
              <button
                type={hasLinkedCard ? "submit" : "button"}
                onClick={() => {
                  if (!hasLinkedCard) {
                    setIsBankCardModalOpen(true);
                  }
                }}
                disabled={isDisabled && hasLinkedCard}
                className="w-full py-4 text-white font-sans font-black text-sm uppercase tracking-widest rounded-2xl shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#D49A22] via-[#C88A16] to-[#B8790B]"
                id="btn-submit-withdrawal"
              >
                {isSubmittingWithdrawal ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{buttonText}</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white stroke-[2.5]" />
                    <span>{buttonText}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 5. CONDITIONS ET PARAMÈTRES DE RETRAIT */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E8D8B0]/20 text-left space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-xs sm:text-[13px] font-black text-[#102A43] uppercase tracking-wider">
              {t('Conditions et Paramètres de Retrait', 'Withdrawal Rules & Guidelines')}
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs font-medium text-[#607D9A] leading-relaxed">
            <li className="flex items-start gap-2.5">
              {/* Icônes : vert #2E9B68 */}
              <span className="text-[#2E9B68] font-black shrink-0 mt-0.5">•</span>
              <span><strong className="text-[#102A43]">{t('Compte de retrait obligatoire :', 'Linked account required:')}</strong> {t("Un retrait est strictement impossible si votre compte de retrait (Carte bancaire ou Mobile Money) n'est pas encore lié.", "A withdrawal is only possible if your receiving account is properly linked.")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#2E9B68] font-black shrink-0 mt-0.5">•</span>
              <span><strong className="text-[#102A43]">{t('Horaires et créneaux autorisés :', 'Authorized hours:')}</strong> {t("Les retraits respectent automatiquement les heures d'ouverture et de fermeture définies par l'administration.", "Withdrawals strictly follow official admin schedules.")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#2E9B68] font-black shrink-0 mt-0.5">•</span>
              <span><strong className="text-[#102A43]">{t('Montant minimum autorisé :', 'Minimum withdrawal:')}</strong> {t('Le seuil minimal par transaction est fixé à', 'The minimum amount per transaction is')} <strong className="text-[#102A43]">1 000 {getCurrency()}</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#2E9B68] font-black shrink-0 mt-0.5">•</span>
              <span><strong className="text-[#102A43]">{t('Montant maximum autorisé :', 'Maximum withdrawal:')}</strong> {t('Le plafond maximal par transaction est de', 'The maximum amount per transaction is')} <strong className="text-[#102A43]">1 000 000 {getCurrency()}</strong>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#2E9B68] font-black shrink-0 mt-0.5">•</span>
              <span><strong className="text-[#102A43]">{t('Frais de traitement administratifs :', 'Processing fees:')}</strong> {t('Une retenue automatique de', 'A fee of')} <strong className="text-[#102A43]">12%</strong> {t('est appliquée sur chaque montant brut.', 'is deducted from the gross amount.')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#2E9B68] font-black shrink-0 mt-0.5">•</span>
              <span><strong className="text-[#102A43]">{t('Délai de traitement :', 'Processing time:')}</strong> {t('Vos fonds seront crédités sous un délai allant de', 'Your funds will be credited within')} <strong className="text-[#2E9B68]">10 minutes à 24 heures maximum</strong>.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
