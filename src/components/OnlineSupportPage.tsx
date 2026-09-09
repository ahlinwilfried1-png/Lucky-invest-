import React from 'react';
import { 
  ArrowLeft, 
  Headphones, 
  Wallet, 
  MessageCircle, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface OnlineSupportPageProps {
  onBack: () => void;
  onOpenAdvisorChat: (initialMessage?: string) => void;
  whatsAppChannelUrl: string;
  userName?: string;
}

export const OnlineSupportPage: React.FC<OnlineSupportPageProps> = ({
  onBack,
  onOpenAdvisorChat,
  whatsAppChannelUrl,
  userName
}) => {
  const handleRechargeNotReceived = () => {
    onOpenAdvisorChat(
      "Bonjour, je vous contacte car j'ai effectué une recharge qui n'a pas encore été créditée sur mon compte. Pouvez-vous vérifier mon statut de paiement s'il vous plaît ?"
    );
  };

  const handleSpeakWithAdvisor = () => {
    onOpenAdvisorChat();
  };

  const handleJoinWhatsAppChannel = () => {
    if (whatsAppChannelUrl) {
      window.open(whatsAppChannelUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[105] overflow-y-auto bg-gradient-to-b from-[#070b14] via-[#0b1220] to-[#0f172a] text-white flex flex-col animate-fade-in select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0a0f1d]/90 backdrop-blur-xl border-b border-yellow-500/20 px-4 py-3.5 sm:px-6 shadow-lg shadow-black/40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            id="btn-support-back"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300 transition-all cursor-pointer font-sans font-bold text-xs active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Retour</span>
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-lg font-sans font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500">
              Support en ligne
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                Conseillers disponibles 24/7
              </span>
            </div>
          </div>

          <div className="w-16 flex justify-end">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* Welcome VIP Banner */}
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#18233a] via-[#111a2e] to-[#0a101d] border border-yellow-500/30 shadow-xl shadow-black/50">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 stroke-[2.25]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-sans font-black text-white tracking-tight">
                Bonjour {userName ? `${userName}` : 'Cher Membre VIP'} 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Bienvenue sur l'espace d'assistance officielle de <span className="text-yellow-400 font-bold">Gold Avenue</span>. Choisissez ci-dessous l'option correspondant à votre demande pour une prise en charge immédiate.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Main Options */}
        <div className="space-y-3.5 pt-1">
          {/* OPTION 1: Recharge non reçue */}
          <button
            onClick={handleRechargeNotReceived}
            id="btn-option-recharge-non-recue"
            className="w-full group text-left relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#0f172a]/90 hover:bg-[#15203b] border border-amber-500/40 hover:border-amber-400/80 transition-all duration-200 shadow-lg shadow-amber-950/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-amber-500/25 transition-all shadow-md shadow-amber-500/10">
                  <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.25]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black text-sm sm:text-base text-white tracking-tight group-hover:text-yellow-300 transition-colors">
                      Recharge non reçue
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase border border-amber-500/40">
                      Priorité ⚡
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug">
                    Un dépôt tarde à être crédité ? Cliquez pour ouvrir le chat avec nos agents pour vérification urgente.
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:translate-x-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </button>

          {/* OPTION 2: Rejoignez Canal WhatsApp */}
          <button
            onClick={handleJoinWhatsAppChannel}
            id="btn-option-rejoindre-canal-whatsapp"
            className="w-full group text-left relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#0f172a]/90 hover:bg-[#122329] border border-emerald-500/40 hover:border-emerald-400/80 transition-all duration-200 shadow-lg shadow-emerald-950/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-500/25 transition-all shadow-md shadow-emerald-500/10">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.25]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black text-sm sm:text-base text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      Rejoignez Canal WhatsApp
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/40">
                      Officiel 📢
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug">
                    Canal officiel : recevez les preuves de paiement, annonces VIP, nouveaux produits et alertes en direct.
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:translate-x-1 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </button>

          {/* OPTION 3: Parler avec le conseiller */}
          <button
            onClick={handleSpeakWithAdvisor}
            id="btn-option-parler-conseiller"
            className="w-full group text-left relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-[#1b1c2b] via-[#161a29] to-[#0f1422] hover:from-[#232438] hover:to-[#141b2e] border border-yellow-500/40 hover:border-yellow-400/90 transition-all duration-200 shadow-xl shadow-yellow-950/20 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-md shadow-amber-500/25">
                  <Headphones className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.25]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black text-sm sm:text-base text-yellow-300 tracking-tight group-hover:text-yellow-200 transition-colors">
                      Parler avec le conseiller
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-mono font-bold uppercase border border-yellow-500/40">
                      En direct 🟢
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug">
                    Assistance personnalisée 24/7 : posez vos questions sur vos retraits, investissements ou parrainages.
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0 group-hover:translate-x-1 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-all">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </button>
        </div>

        {/* Security & Response Info Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl p-3.5 bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.25]" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Temps de réponse moyen</span>
              <span className="text-[11px] text-slate-400">Moins de 3 minutes</span>
            </div>
          </div>

          <div className="rounded-2xl p-3.5 bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.25]" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Sécurité garantie</span>
              <span className="text-[11px] text-slate-400">Ne donnez jamais votre mot de passe</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
