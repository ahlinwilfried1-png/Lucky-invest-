import React, { useState, useEffect } from 'react';
import { User, Deposit, Withdrawal, Investment, SystemNotification, Commission } from '../types';
import { DataStore, syncWithBackend } from '../dataStore';
import { 
  ArrowLeft, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle,
  ArrowUpCircle,
  ShoppingBag, 
  RefreshCw, 
  Calendar, 
  Search, 
  SlidersHorizontal,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Database,
  Bell,
  Gift,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';

interface HistoriquePageProps {
  user: User;
  onNavigate: (path: string) => void;
}

const maskPhoneNumber = (num: string) => {
  if (!num) return 'Aucun';
  const clean = num.replace(/\s/g, '');
  if (clean.length <= 6) return clean;
  return clean.slice(0, 3) + '••••' + clean.slice(-3);
};

export default function HistoriquePage({ user, onNavigate }: HistoriquePageProps) {
  const [lang] = useState<'FR' | 'EN'>(() => {
    return (localStorage.getItem('gi_lang') as 'FR' | 'EN') || 'FR';
  });

  const t = (fr: string, en: string) => (lang === 'EN' ? en : fr);

  const [activeTab, setActiveTab] = useState<'recharge' | 'retrait' | 'achat' | 'commission' | 'revenu'>('recharge');
  
  // Data lists corresponding to the types
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed'>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Notifications state
  const [notifs, setNotifs] = useState<SystemNotification[]>([]);
  const [hashActive, setHashActive] = useState(window.location.hash);

  const fetchTransactions = () => {
    // 1. Recharges (deposits of type: recharge)
    const allDeps = DataStore.getDeposits().filter(d => d.userId === user.id);
    setDeposits(allDeps);

    // 2. Retraits (withdrawals of type: retrait)
    const allWths = DataStore.getWithdrawals()
      .filter(w => w.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setWithdrawals(allWths);

    // 3. Achats (investments of type: achat)
    const allInvs = DataStore.getInvestments().filter(i => i.userId === user.id);
    setInvestments(allInvs);

    // 4. Commissions
    const allComms = DataStore.getCommissions().filter(c => c.userId === user.id);
    setCommissions(allComms);

    // 5. Notifications
    const allNotifs = DataStore.getNotifications().filter(n => n.userId === undefined || n.userId === user.id);
    setNotifs(allNotifs);
  };

  const getRevenuItems = () => {
    const list: any[] = [];
    investments.forEach(inv => {
      const createdTime = new Date(inv.createdAt).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      for (let d = 1; d <= inv.daysPassed; d++) {
        const claimTime = createdTime + d * oneDayMs;
        list.push({
          id: `rev-${inv.id}-${d}`,
          investmentId: inv.id,
          productName: inv.productName,
          amount: inv.dailyReturn,
          createdAt: new Date(claimTime).toISOString(),
          dayNumber: d
        });
      }
    });
    // Trier par date décroissante
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  useEffect(() => {
    fetchTransactions();
    
    // Listen for background updates
    const handleStoreUpdated = () => {
      fetchTransactions();
    };
    window.addEventListener('gi_store_updated', handleStoreUpdated);
    return () => {
      window.removeEventListener('gi_store_updated', handleStoreUpdated);
    };
  }, [user.id]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setHashActive(hash);
      if (hash === '#retrait') {
        setActiveTab('retrait');
        setHasAutoSelected(false);
        setSelectedWithdrawal(null);
      } else if (hash === '#recharge') {
        setActiveTab('recharge');
      } else if (hash === '#achat') {
        setActiveTab('achat');
      } else if (hash === '#commission') {
        setActiveTab('commission');
      } else if (hash === '#revenu') {
        setActiveTab('revenu');
      }
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash.substring(1));
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    // Initial trigger
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (hashActive === '#retrait' && !hasAutoSelected && withdrawals.length > 0) {
      setSelectedWithdrawal(withdrawals[0]);
      setHasAutoSelected(true);
    }
  }, [hashActive, withdrawals, hasAutoSelected]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await syncWithBackend();
      fetchTransactions();
    } catch (err) {
      console.error('Failed to sync history from backend:', err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getCurrency = () => {
    return 'XOF';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter based on currently active tab and search/status parameters
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase().trim();
    
    if (activeTab === 'recharge') {
      return deposits.filter(item => {
        // Enforce the data schema/database type = recharge
        const matchesType = true; // Implicitly deposits are recharges
        const matchesSearch = item.operator.toLowerCase().includes(term) || 
                             item.reference.toLowerCase().includes(term) ||
                             item.amount.toString().includes(term);
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesType && matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'retrait') {
      return withdrawals.filter(item => {
        // Enforce the database type = retrait
        const matchesType = true; // Implicitly withdrawals are retraits
        const matchesSearch = item.operator.toLowerCase().includes(term) || 
                             item.number.toLowerCase().includes(term) ||
                             item.amount.toString().includes(term);
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesType && matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'achat') {
      return investments.filter(item => {
        // Enforce the database type = achat
        const matchesType = true; // Implicitly investments are achats
        const matchesSearch = item.productName.toLowerCase().includes(term) || 
                             item.price.toString().includes(term);
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'approved' && item.status === 'active') || 
                             (statusFilter === 'completed' && item.status === 'completed');
        return matchesType && matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'commission') {
      return commissions.filter(item => {
        const matchesSearch = item.fromUserName.toLowerCase().includes(term) || 
                             item.amount.toString().includes(term) ||
                             `niveau ${item.level}`.includes(term);
        return matchesSearch;
      });
    } else {
      return getRevenuItems().filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(term) || 
                             item.amount.toString().includes(term);
        return matchesSearch;
      });
    }
  };

  const filteredItems = getFilteredData();

  const formatInitiationTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    } catch (e) {
      return dateStr;
    }
  };

  const isRetraitMode = activeTab === 'retrait' || hashActive === '#retrait';

  if (selectedWithdrawal || (isRetraitMode && withdrawals.length > 0)) {
    const wth = selectedWithdrawal || withdrawals[0];
    const feeVal = wth.fee !== undefined ? wth.fee : Math.round(wth.amount * 0.12);
    const netVal = wth.netAmount !== undefined ? wth.netAmount : (wth.amount - feeVal);

    return (
      <div className="min-h-screen bg-transparent pb-12 text-white animate-fadeIn font-sans">
        {/* Header Section */}
        <div className="bg-[#0c1629] text-white pt-6 pb-20 px-4 rounded-b-[2rem] relative shadow-lg border-b border-[#192a4a]">
          <div className="max-w-md mx-auto flex items-center space-x-3">
            <button 
              onClick={() => {
                if (hashActive === '#retrait') {
                  onNavigate('/');
                } else {
                  setSelectedWithdrawal(null);
                  setActiveTab('recharge');
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-amber-400 hover:bg-[#13223f] transition-all cursor-pointer border-none outline-none"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="font-sans font-extrabold text-base sm:text-lg tracking-wide text-amber-400">
              {t('Relevé des enregistrements', 'Record statement')}
            </h1>
          </div>
        </div>

        {/* Content overlapping the header */}
        <div className="max-w-md mx-auto px-4 -mt-10 space-y-4 relative z-10">
          {/* Account Balance */}
          <div className="bg-[#0c1629] p-5 rounded-3xl border border-[#192a4a] shadow-md text-left">
            <div className="font-sans font-black text-3xl text-amber-300 leading-tight">
              FCFA{user.balance.toFixed(2)}
            </div>
            <div className="text-[12px] font-extrabold text-amber-300/80 mt-1 uppercase tracking-wide">
              {t('Solde du Compte', 'Account Balance')}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="p-5 space-y-3 text-left text-slate-200 bg-[#0c1629] border border-[#192a4a] rounded-3xl shadow-md">
            <div className="flex justify-between items-center py-2 border-b border-[#192a4a]">
              <span className="text-slate-400 font-bold text-[13px]">{t('Statut du Retrait', 'Withdrawal Status')}</span>
              <span className={`font-sans font-black text-[14px] ${
                wth.status === 'approved' ? 'text-emerald-400' : 
                wth.status === 'pending' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {wth.status === 'approved' ? t('Réussi', 'Successful') : 
                 wth.status === 'pending' ? t('En attente', 'Pending') : t('Refusé', 'Rejected')}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#192a4a]">
              <span className="text-slate-400 font-bold text-[13px]">{t('Montant du Retrait', 'Withdrawal Amount')}</span>
              <span className="font-mono font-black text-amber-300 text-[14px]">
                FCFA{wth.amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#192a4a]">
              <span className="text-slate-400 font-bold text-[13px]">{t('Montant Reçu', 'Amount Received')}</span>
              <span className="font-mono font-black text-white text-[14px]">
                FCFA{netVal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#192a4a]">
              <span className="text-slate-400 font-bold text-[13px]">{t('Montant de Taxe', 'Tax Amount')}</span>
              <span className="font-mono font-black text-slate-400 text-[14px]">
                FCFA{feeVal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400 font-bold text-[13px]">{t("Heure d'Initiation", 'Initiation Time')}</span>
              <span className="font-mono font-black text-slate-300 text-[13px]">
                {formatInitiationTime(wth.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRetraitMode && withdrawals.length === 0) {
    return (
      <div className="min-h-screen bg-transparent pb-12 text-white animate-fadeIn font-sans">
        {/* Header Section */}
        <div className="bg-[#0c1629] text-white pt-6 pb-20 px-4 rounded-b-[2rem] relative shadow-lg border-b border-[#192a4a]">
          <div className="max-w-md mx-auto flex items-center space-x-3">
            <button 
              onClick={() => {
                if (hashActive === '#retrait') {
                  onNavigate('/');
                } else {
                  setActiveTab('recharge');
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-amber-400 hover:bg-[#13223f] transition-all cursor-pointer border-none outline-none"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h1 className="font-sans font-extrabold text-base sm:text-lg tracking-wide text-amber-400">
              {t('Relevé des enregistrements', 'Record statement')}
            </h1>
          </div>
        </div>

        {/* Content overlapping header */}
        <div className="max-w-md mx-auto px-4 -mt-10 space-y-4 relative z-10">
          {/* First Card: Account Balance */}
          <div className="bg-[#0c1629] rounded-3xl p-6 shadow-md border border-[#192a4a] text-left">
            <div className="font-sans font-black text-2xl text-amber-300 leading-tight">
              FCFA{user.balance.toFixed(2)}
            </div>
            <div className="text-[12px] font-extrabold text-amber-300/80 mt-1.5 uppercase tracking-wide">
              {t('Solde du Compte', 'Account Balance')}
            </div>
          </div>

          {/* Second Card: Empty State Details */}
          <div className="bg-[#0c1629] rounded-3xl p-8 shadow-md border border-[#192a4a] text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-[#13223f] text-amber-400 rounded-full flex items-center justify-center mx-auto border border-[#192a4a]">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sans font-black text-base text-white uppercase tracking-wide">
                {t('Aucun Retrait', 'No Withdrawals')}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                {t("Vous n'avez pas encore effectué de demande de retrait pour le moment.", "You have not made any withdrawal requests yet.")}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/')}
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer inline-block"
            >
              {t("Faire un Retrait", "Make a Withdrawal")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 text-white bg-transparent">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 py-3 bg-[#070e1b]/95 backdrop-blur-md border-b border-[#192a4a]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>{t('Tableau de bord', 'Dashboard')}</span>
          </button>
          
          <h1 className="font-sans font-black text-base sm:text-lg text-amber-400 uppercase tracking-wider">
            {hashActive === '#retrait' ? t('Historique des Retraits', 'Withdrawals History') : t('Historique de Compte', 'Account History')}
          </h1>

          <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 text-amber-400 hover:text-amber-300 transition-all cursor-pointer ${loading ? 'animate-spin' : ''}`}
            title={t('Synchroniser', 'Synchronize')}
          >
            <RefreshCw className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        
        {/* TABS SEPARATOR CATEGORIES */}
        {hashActive !== '#retrait' && (
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none gap-2 py-1 md:grid md:grid-cols-4">
            <button
              onClick={() => {
                setActiveTab('recharge');
                setStatusFilter('all');
              }}
              className={`flex-1 md:flex-initial py-2.5 px-4 rounded-full font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'recharge' 
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white bg-[#0c1629] border border-[#192a4a]'
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{t('1. Recharges', '1. Deposits')}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('retrait');
                setStatusFilter('all');
              }}
              className={`flex-1 md:flex-initial py-2.5 px-4 rounded-full font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'retrait' 
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white bg-[#0c1629] border border-[#192a4a]'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 shrink-0" />
              <span>{t('2. Retraits', '2. Withdrawals')}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('achat');
                setStatusFilter('all');
              }}
              className={`flex-1 md:flex-initial py-2.5 px-4 rounded-full font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'achat' 
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white bg-[#0c1629] border border-[#192a4a]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>{t('3. Achats', '3. Purchases')}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('revenu');
                setStatusFilter('all');
              }}
              className={`flex-1 md:flex-initial py-2.5 px-4 rounded-full font-sans font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all flex flex-row items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'revenu' 
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white bg-[#0c1629] border border-[#192a4a]'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>{t('4. Revenus', '4. Earnings')}</span>
            </button>
          </div>
        )}

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'recharge' ? t("Rechercher par opérateur, référence...", "Search by operator, reference...") :
                activeTab === 'retrait' ? t("Rechercher par numéro, opérateur...", "Search by number, operator...") :
                activeTab === 'achat' ? t("Rechercher par formule...", "Search by formula...") :
                activeTab === 'commission' ? t("Rechercher par parrainage, filleul...", "Search by referral, user...") :
                t("Rechercher par formule...", "Search by formula...")
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0c1629] border border-[#192a4a] rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 bg-[#0c1629] border border-[#192a4a] px-3 py-2 rounded-xl">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-bold font-sans text-slate-200 focus:outline-none pr-3 cursor-pointer"
              disabled={activeTab === 'commission' || activeTab === 'revenu'}
            >
              <option value="all" className="bg-[#0c1629] text-white">{t("Statut: Tous", "Status: All")}</option>
              {activeTab === 'recharge' || activeTab === 'retrait' ? (
                <>
                  <option value="pending" className="bg-[#0c1629] text-white">{t("En attente ⏳", "Pending ⏳")}</option>
                  <option value="approved" className="bg-[#0c1629] text-white">{t("Validé ✅", "Approved ✅")}</option>
                  <option value="rejected" className="bg-[#0c1629] text-white">{t("Refusé ❌", "Rejected ❌")}</option>
                </>
              ) : activeTab === 'achat' ? (
                <>
                  <option value="approved" className="bg-[#0c1629] text-white">{t("Actif 🟢", "Active 🟢")}</option>
                  <option value="completed" className="bg-[#0c1629] text-white">{t("Terminé ✔️", "Completed ✔️")}</option>
                </>
              ) : (
                <option value="all" className="bg-[#0c1629] text-white">{t("Non applicable", "Not applicable")}</option>
              )}
            </select>
          </div>
        </div>

        {/* RESULT CONTAINER */}
        <div className="overflow-hidden min-h-[250px] bg-[#0c1629] border border-[#192a4a] rounded-2xl shadow-sm">
          
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
              <div className="w-14 h-14 text-slate-500 flex items-center justify-center">
                <Clock className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-black text-sm text-white">{t("Aucune opération trouvée", "No transactions found")}</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {t("Il n’y a aucun historique correspondant à vos critères ou de type", "There is no history matching your criteria or of type")}{' '}
                  <span className="font-bold text-amber-400">
                    {activeTab}
                  </span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="font-sans font-black text-[11px] text-amber-300/90 uppercase tracking-widest select-none bg-[#08101e] border-b border-[#192a4a]">
                    <th className="py-3 px-4">{t("Date & ID", "Date & ID")}</th>
                    {activeTab !== 'retrait' && activeTab !== 'recharge' && <th className="py-3 px-4">{t("Détails de l’opération", "Transaction Details")}</th>}
                    <th className="py-3 px-4 text-right">{t("Montant", "Amount")} ({getCurrency()})</th>
                    <th className="py-3 px-4 text-right">{t("Statut / Type", "Status / Type")}</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-[#15223a]">
                  
                  {/* RECHARGE TAB ROWS */}
                  {activeTab === 'recharge' && (filteredItems as Deposit[]).map((dep) => (
                    <tr key={dep.id} className="hover:bg-[#101e38] transition-colors">
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(dep.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-500">ID: {dep.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-emerald-400 text-[13px]">
                          +{dep.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {dep.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px] uppercase bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Validé
                          </span>
                        )}
                        {dep.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-amber-300 font-bold text-[11px] uppercase bg-amber-400/15 px-2.5 py-1 rounded-full border border-amber-400/30">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            En attente
                          </span>
                        )}
                        {dep.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px] uppercase bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Refusé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* RETRAIT TAB ROWS */}
                  {activeTab === 'retrait' && (filteredItems as Withdrawal[]).map((wth) => (
                    <tr 
                      key={wth.id} 
                      onClick={() => setSelectedWithdrawal(wth)}
                      className="hover:bg-[#101e38] transition-colors cursor-pointer group"
                      title={t("Cliquez pour voir le reçu", "Click to view receipt")}
                    >
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(wth.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-500">ID: {wth.id}</div>
                        <div className="text-[10px] text-slate-400 font-bold group-hover:text-amber-300 transition-colors">
                          Vers: {wth.operator} ({maskPhoneNumber(wth.number)})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-rose-400 text-[13px] inline-block">
                          -{wth.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {wth.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px] uppercase bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('Réussi', 'Successful')}
                          </span>
                        )}
                        {wth.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-amber-300 font-bold text-[11px] uppercase bg-amber-400/15 px-2.5 py-1 rounded-full border border-amber-400/30">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            En attente
                          </span>
                        )}
                        {wth.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-[11px] uppercase bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Refusé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* ACHAT TAB ROWS */}
                  {activeTab === 'achat' && (filteredItems as Investment[]).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#101e38] transition-colors">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(inv.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-500">ID: {inv.id}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-sans font-bold text-white flex items-center gap-1.5">
                          <span className="bg-[#13223f] text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#1e3357]">
                            type = achat
                          </span>
                          <span>Formule {inv.productName}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-medium leading-relaxed">
                          Revenu: <span className="font-bold text-amber-300">+{inv.dailyReturn.toLocaleString()} F / jour</span><br />
                          Durée: <span className="text-slate-200 font-semibold">{inv.durationDays} jours</span> (Plan actuel: Jour {inv.daysPassed}/{inv.durationDays})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-amber-300 text-[13px]">
                          {inv.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status === 'active' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            Actif
                          </span>
                        )}
                        {inv.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 bg-amber-400/15 text-amber-300 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border border-amber-400/30">
                            <CheckCircle className="w-3 h-3 text-amber-300" />
                            Terminé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* COMMISSION TAB ROWS */}
                  {activeTab === 'commission' && (filteredItems as Commission[]).map((comm) => (
                    <tr key={comm.id} className="hover:bg-[#101e38] transition-colors">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(comm.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-500">ID: {comm.id}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-sans font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span className="bg-[#13223f] text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#1e3357]">
                            type = commission
                          </span>
                          <span>Parrainage de {comm.fromUserName}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-bold">
                          Filleul direct de <span className="text-amber-400 font-extrabold">Niveau {comm.level}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-amber-300 text-[13px]">
                          +{comm.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Crédité
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* REVENU TAB ROWS */}
                  {activeTab === 'revenu' && (filteredItems as any[]).map((rev) => (
                    <tr key={rev.id} className="hover:bg-[#101e38] transition-colors">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                          <span className="font-mono font-medium text-[11px]">{formatDate(rev.createdAt)}</span>
                        </div>
                        <div className="font-mono text-[9px] text-slate-500">ID: {rev.id}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-sans font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span className="bg-[#13223f] text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-[#1e3357]">
                            type = revenu
                          </span>
                          <span>Formule {rev.productName}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-bold">
                          Versement journalier : <span className="text-amber-300">Jour {rev.dayNumber}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-black text-amber-300 text-[13px]">
                          +{rev.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Récolté
                        </span>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
