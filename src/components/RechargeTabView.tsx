import React from 'react';
import {
  Wallet,
  ChevronLeft,
  History,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { User } from '../types';

export interface DepositCountry {
  name: string;
  code: string;
  flag: string;
}

interface RechargeTabViewProps {
  userState: User;
  depositAmount: string;
  setDepositAmount: (val: string) => void;
  depositCountry: string;
  setDepositCountry: (val: string) => void;
  depositCountryCode: string;
  setDepositCountryCode: (val: string) => void;
  depositPhone: string;
  setDepositPhone: (val: string) => void;
  depositError: string | null;
  depositSuccess: string | null;
  isSubmittingDeposit: boolean;
  submitDeposit: (e: React.FormEvent) => void;
  getCurrency: () => string;
  depositCountries: DepositCountry[];
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'team' | 'profile' | 'deposit' | 'withdraw' | 'proofs' | 'forum') => void;
  setProfileSubPage?: (page: string | null) => void;
  onNavigate?: (path: string) => void;
  t: (fr: string, en: string) => string;
}

export const RechargeTabView: React.FC<RechargeTabViewProps> = ({
  userState,
  depositAmount,
  setDepositAmount,
  depositCountry,
  setDepositCountry,
  depositCountryCode,
  setDepositCountryCode,
  depositPhone,
  setDepositPhone,
  depositError,
  depositSuccess,
  isSubmittingDeposit,
  submitDeposit,
  getCurrency,
  depositCountries,
  setActiveTab,
  setProfileSubPage,
  onNavigate,
  t
}) => {
  const PRESET_AMOUNTS = [2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000];

  const handleOpenHistory = () => {
    if (onNavigate) {
      onNavigate('/historique#recharge');
    } else if (setProfileSubPage) {
      setProfileSubPage('recharge-history');
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
            id="btn-back-deposit"
            title="Retour à l'accueil"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <h1 className="font-sans font-black text-base sm:text-lg text-[#102A43] uppercase tracking-tight truncate">
              {t('Recharger mon compte', 'Deposit Funds')}
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#607D9A] uppercase tracking-wider block">
              {t('Paiement Mobile Money Sécurisé', 'Secure Mobile Money Payment')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenHistory}
            className="h-10 px-3 rounded-full bg-white border border-[#E8D8B0]/30 hover:border-[#D49A22]/50 flex items-center gap-1.5 text-[#102A43] hover:text-[#D49A22] transition-all cursor-pointer shadow-2xs outline-none shrink-0"
            id="btn-deposit-history"
            title="Historique des recharges"
          >
            <History className="w-4 h-4 text-[#D49A22] stroke-[2.2] shrink-0" />
            <span className="text-xs font-bold hidden xs:inline">
              {t('Historique', 'History')}
            </span>
          </button>
        </div>

        {/* 2. SOLDE ACTUEL & CARTE PORTEFEUILLE (Lumineux, Rassurant et Premium) */}
        <div 
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E8D8B0]/20 flex items-center justify-between gap-3 relative overflow-hidden"
          id="recharge-wallet-card"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Icône portefeuille : or */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FEF8EC] border border-[#E8D8B0]/25 flex items-center justify-center text-[#D49A22] shadow-2xs shrink-0">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] text-[#D49A22]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10.5px] sm:text-xs font-bold text-[#607D9A] uppercase tracking-wider block leading-tight">
                {t('Solde Actuel Disponible', 'Current Available Balance')}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                {/* Montants : or #B8790B */}
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#B8790B] tracking-tight">
                  {(userState.balance || 0).toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#B8790B]">
                  {getCurrency()}
                </span>
              </div>
            </div>
          </div>

          {/* Badge Sécurisé 100% */}
          <div className="flex items-center gap-1.5 bg-[#FEF8EC] border border-[#E8D8B0]/25 text-[#B8790B] text-[10px] sm:text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D49A22] stroke-[2.5]" />
            <span className="hidden sm:inline">{t('100% Sécurisé', '100% Secure')}</span>
            <span className="sm:hidden">100%</span>
          </div>
        </div>

        {/* ALERTS (Erreur / Succès) */}
        {depositError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/50 text-xs text-red-800 font-bold flex items-center gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{depositError}</span>
          </div>
        )}

        {depositSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/50 text-xs text-emerald-900 font-bold leading-normal space-y-1 shadow-2xs text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span className="text-sm font-black uppercase tracking-wide">
                {t('Demande enregistrée avec succès', 'Deposit Recorded Successfully')}
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              {depositSuccess}
            </p>
          </div>
        )}

        {/* 3. FORMULAIRE DE RECHARGE PRINCIPAL */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#E8D8B0]/20 space-y-5">
          <form onSubmit={submitDeposit} className="space-y-5 text-left">

            {/* ÉTAPE 1 : MONTANTS RAPIDES */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-black text-[#102A43] uppercase tracking-wider font-sans flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FEF8EC] text-[#D49A22] border border-[#E8D8B0]/25 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>{t('Montants rapides recommandés', 'Quick Recommended Amounts')}</span>
                </label>
                <span className="text-[11px] font-bold text-[#607D9A]">
                  FCFA
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = parseInt(depositAmount, 10) === amt;
                  return (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDepositAmount(amt.toString())}
                      className={`py-2.5 px-1.5 text-center rounded-2xl border text-xs sm:text-[13px] font-mono transition-all duration-200 cursor-pointer select-none outline-none ${
                        isSelected
                          ? 'bg-[#FEF8EC] border border-[#D49A22] text-[#B8790B] font-black shadow-xs scale-[1.02]'
                          : 'bg-[#FAF8F2] hover:bg-[#F5EEDC] hover:border-[#D49A22]/30 text-[#102A43] border-[#E8D8B0]/20 font-bold'
                      }`}
                    >
                      {amt >= 1000 ? `${(amt / 1000).toLocaleString()}k` : amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ÉTAPE 2 : MONTANT LIBRE */}
            <div>
              <label className="block text-xs font-black text-[#102A43] uppercase tracking-wider mb-2 font-sans flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#FEF8EC] text-[#D49A22] border border-[#E8D8B0]/25 flex items-center justify-center text-[10px] font-black">2</span>
                <span>{t('Ou saisissez votre propre montant', 'Or Enter Your Own Amount')} ({getCurrency()})</span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  required
                  placeholder={`Ex : 25 000 ${getCurrency()}`}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-[#FAF8F2] focus:bg-white border border-[#E8D8B0]/30 focus:border-[#D49A22] rounded-2xl py-3.5 pl-4 pr-16 text-base sm:text-lg text-[#B8790B] font-mono font-black focus:outline-none transition-all shadow-2xs placeholder:text-[#607D9A]/50 placeholder:font-normal"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-xs font-black text-[#607D9A] font-mono">
                    {getCurrency()}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#607D9A] font-medium mt-1.5 flex items-center gap-1">
                <span className="text-[#D49A22] font-black">•</span>
                <span>{t('Montant minimum autorisé : 2 500', 'Minimum authorized deposit: 2,500')} {getCurrency()}</span>
              </p>
            </div>

            {/* ÉTAPE 3 : PAYS & TÉLÉPHONE DE PAIEMENT */}
            <div className="p-4 bg-[#FAF8F2] border border-[#E8D8B0]/20 rounded-2xl space-y-3.5">
              <div>
                <label className="block text-[11px] font-black text-[#102A43] uppercase tracking-wider mb-1.5 font-sans flex items-center gap-1">
                  <span>🌍 {t('Pays de paiement', 'Payment Country')}</span>
                  <span className="text-[#D49A22]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={depositCountry}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDepositCountry(val);
                      const matched = depositCountries.find(c => c.name === val);
                      if (matched) {
                        setDepositCountryCode(matched.code);
                      }
                    }}
                    className="w-full bg-white border border-[#E8D8B0]/30 focus:border-[#D49A22] rounded-xl py-2.5 pl-3 pr-8 text-xs font-bold text-[#102A43] focus:outline-none shadow-2xs appearance-none cursor-pointer"
                  >
                    {depositCountries.map((c) => (
                      <option key={c.name} value={c.name} className="text-slate-900 bg-white">
                        {c.flag} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#607D9A]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#102A43] uppercase tracking-wider mb-1.5 font-sans flex items-center gap-1">
                  <span>📞 {t('Numéro Mobile Money', 'Mobile Money Number')}</span>
                  <span className="text-[#D49A22]">*</span>
                </label>
                <div className="flex items-center">
                  <div className="bg-white border border-r-0 border-[#E8D8B0]/30 rounded-l-xl py-2.5 px-3 text-xs font-mono font-black text-[#B8790B] shrink-0 select-none shadow-2xs">
                    {depositCountryCode}
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Ex : 699999999"
                    value={depositPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setDepositPhone(val);
                    }}
                    className="w-full bg-white border border-l-0 border-[#E8D8B0]/30 focus:border-[#D49A22] rounded-r-xl py-2.5 px-3 text-xs text-[#102A43] font-bold font-mono focus:outline-none shadow-2xs placeholder:text-[#607D9A]/50"
                  />
                </div>
              </div>
            </div>

            {/* BOUTON RECHARGER : dégradé #F3C75F → #C88A16 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingDeposit}
                className="w-full py-4 text-white font-sans font-black text-sm uppercase tracking-widest rounded-2xl shadow-xs hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-none disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-[#F3C75F] via-[#D49A22] to-[#C88A16]"
                id="btn-submit-deposit"
              >
                {isSubmittingDeposit ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('Traitement en cours...', 'Processing...')}</span>
                  </div>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white stroke-[2.5]" />
                    <span>{t('RECHARGER MAINTENANT', 'DEPOSIT NOW')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 4. INFORMATIONS DE SÉCURITÉ & OPÉRATEURS */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#E8D8B0]/20 space-y-3 text-left">
          <div className="flex items-center gap-2 text-[#102A43]">
            <Lock className="w-4 h-4 text-[#D49A22] stroke-[2.5]" />
            <h3 className="font-sans font-black text-xs uppercase tracking-wider">
              {t('Paiement 100% Vérifié & Sécurisé', '100% Verified & Secure Payment')}
            </h3>
          </div>
          <p className="text-xs text-[#607D9A] font-medium leading-relaxed">
            {t(
              'Vos recharges sont créditées automatiquement après validation par votre opérateur Mobile Money (MTN, Moov, Orange, Wave). En cas de besoin, le support client est disponible 24/7.',
              'Your deposits are credited automatically once confirmed by your Mobile Money carrier (MTN, Moov, Orange, Wave). 24/7 customer support is available.'
            )}
          </p>
        </div>

      </div>
    </div>
  );
};
