import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  TrendingUp, 
  Check, 
  X, 
  Edit, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Award, 
  Eye, 
  FileText, 
  CreditCard, 
  Megaphone, 
  Gift, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Search,
  RefreshCw,
  Zap,
  Clock,
  Flame,
  Calendar,
  Power,
  CheckCircle,
  AlertCircle,
  Save,
  Database
} from 'lucide-react';
import { User, Deposit, Withdrawal, Product, BonusCode, SystemNotification, Investment, SupportMessage, WithdrawalProof, CategorySchedule, CategorySchedules } from '../types';
import { DataStore, DEFAULT_PRODUCTS, DEFAULT_CATEGORY_SCHEDULES, syncWithBackend, getApiUrl, apiFetch, safeLocalStorage, setToStore } from '../dataStore';
import { SUPABASE_URL, SUPABASE_ANON_KEY, subscribeToSupabaseRealtime } from '../supabase';

const maskUserPhone = (str: string): string => {
  if (!str) return str;
  return str.replace(/(?:\+?\d[\s.-]?){7,15}\d/g, (match) => {
    const cleanDigits = match.replace(/[^\d]/g, '');
    if (cleanDigits.length < 8) return match;
    
    const isPlus = match.startsWith('+');
    const startLen = Math.min(3, Math.floor(cleanDigits.length / 3));
    const endLen = Math.min(2, Math.floor(cleanDigits.length / 4));
    const maskLen = cleanDigits.length - startLen - endLen;
    
    const startPart = cleanDigits.slice(0, startLen);
    const endPart = cleanDigits.slice(-endLen);
    const maskedPart = '•'.repeat(maskLen);
    
    return (isPlus ? '+' : '') + startPart + maskedPart + endPart;
  });
};

interface AdminPanelProps {
  currentUser: User;
  onRefreshData: () => void;
  onCloseAdmin: () => void;
}

export default function AdminPanel({ 
  currentUser, 
  onRefreshData, 
  onCloseAdmin 
}: AdminPanelProps) {
  // Lists from local storage
  const [users, setUsers] = useState<User[]>(() => DataStore.getUsers());
  const [deposits, setDeposits] = useState<Deposit[]>(() => DataStore.getDeposits());
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => DataStore.getWithdrawals());
  const [products, setProducts] = useState<Product[]>(() => DataStore.getProducts());
  const [bonusCodes, setBonusCodes] = useState<BonusCode[]>(() => DataStore.getBonusCodes());
  const [investments, setInvestments] = useState<Investment[]>(() => DataStore.getInvestments());
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => DataStore.getSupportMessages());
  const [withdrawalProofs, setWithdrawalProofs] = useState<WithdrawalProof[]>(() => DataStore.getWithdrawalProofs());
  
  // States for Admin Announcements Form (Avis)
  const [adminAuthorName, setAdminAuthorName] = useState('Dreampod Officiel');
  const [adminAuthorBadge, setAdminAuthorBadge] = useState('Officiel');
  const [adminAmount, setAdminAmount] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminImage, setAdminImage] = useState('');
  const [isPublishingAvis, setIsPublishingAvis] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [adminReplyInput, setAdminReplyInput] = useState('');
  const [isSendingAdminReply, setIsSendingAdminReply] = useState(false);

  // Confirmation and Notification overlay states for sandboxed iframe safety
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Manual synchronizing state feedback 
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'checking'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [supabaseSyncLoading, setSupabaseSyncLoading] = useState(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<string | null>(null);
  const [serverDiag, setServerDiag] = useState<{
    totalUsersInMem: number;
    totalUsersInFile: number;
    timestamp: number;
    dbPath: string;
    dbExists: boolean;
    supabaseStatus?: string;
    supabaseUrl?: string;
    storeTableAccessible?: boolean;
    storeTableError?: string | null;
    databaseType?: string;
  } | null>(null);

  // Supabase PostgreSQL State
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<any>(null);

  // Navigation tab
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'deposits' | 'withdrawals' | 'products' | 'platform' | 'transactions' | 'support' | 'proofs' | 'investments'>('deposits');
  const activeAdminTabRef = React.useRef(activeAdminTab);
  React.useEffect(() => {
    activeAdminTabRef.current = activeAdminTab;
  }, [activeAdminTab]);
  const [commissions, setCommissions] = useState<any[]>(() => DataStore.getCommissions());

  // Forum sub-tab state
  const [proofsSubTab, setProofsSubTab] = useState<'avis' | 'forum'>('avis');
  const [forumPosts, setForumPosts] = useState<any[]>(() => DataStore.getForumPosts());

  React.useEffect(() => {
    setForumPosts(DataStore.getForumPosts());
  }, [proofsSubTab]);

  // Category & Operations Schedules Management (Bien-être & Retraits)
  const [categorySchedules, setCategorySchedules] = useState<CategorySchedules>(() => DataStore.getCategorySchedules());
  const [currentSystemTime, setCurrentSystemTime] = useState<Date>(new Date());
  const [isSavingSchedule, setIsSavingSchedule] = useState<'wellbeing' | 'withdrawals' | null>(null);
  const lastSaveScheduleTimeRef = useRef<number>(0);
  const editingCategoryRef = useRef<'wellbeing' | 'withdrawals' | null>(null);
  const [timeInputs, setTimeInputs] = useState({
    wellbeing: {
      openTime: categorySchedules.wellbeing?.openTime || '08:00',
      closeTime: categorySchedules.wellbeing?.closeTime || '20:00',
      enabled: categorySchedules.wellbeing?.enabled ?? true
    },
    withdrawals: {
      openTime: categorySchedules.withdrawals?.openTime || '09:00',
      closeTime: categorySchedules.withdrawals?.closeTime || '17:00',
      enabled: categorySchedules.withdrawals?.enabled ?? true
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSystemTime(new Date());
    }, 1000);

    const handleSchedulesUpdate = (e?: any) => {
      // Guard against periodic sync overriding recently saved times or active edits
      if (Date.now() - lastSaveScheduleTimeRef.current < 8000) {
        return;
      }
      const fresh = (e && (e as any).detail) ? (e as any).detail : DataStore.getCategorySchedules();
      setCategorySchedules(fresh);
      setTimeInputs(prev => ({
        wellbeing: editingCategoryRef.current === 'wellbeing' ? prev.wellbeing : {
          openTime: fresh.wellbeing?.openTime || prev.wellbeing.openTime,
          closeTime: fresh.wellbeing?.closeTime || prev.wellbeing.closeTime,
          enabled: fresh.wellbeing?.enabled ?? prev.wellbeing.enabled
        },
        withdrawals: editingCategoryRef.current === 'withdrawals' ? prev.withdrawals : {
          openTime: fresh.withdrawals?.openTime || prev.withdrawals.openTime,
          closeTime: fresh.withdrawals?.closeTime || prev.withdrawals.closeTime,
          enabled: fresh.withdrawals?.enabled ?? prev.withdrawals.enabled
        }
      }));
    };

    window.addEventListener('gi_category_schedules_updated', handleSchedulesUpdate);
    window.addEventListener('gi_store_updated', handleSchedulesUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('gi_schedules_sync');
        bc.onmessage = (ev) => {
          if (ev.data && ev.data.type === 'SCHEDULES_UPDATED') {
            handleSchedulesUpdate({ detail: ev.data.schedules });
          }
        };
      }
    } catch (e) {}

    return () => {
      clearInterval(timer);
      window.removeEventListener('gi_category_schedules_updated', handleSchedulesUpdate);
      window.removeEventListener('gi_store_updated', handleSchedulesUpdate);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, []);

  const handleUpdateCategorySchedule = async (
    category: 'wellbeing' | 'withdrawals',
    updates: Partial<CategorySchedule>
  ) => {
    setIsSavingSchedule(category);
    lastSaveScheduleTimeRef.current = Date.now();
    try {
      const current = { ...categorySchedules };
      const updatedCat: CategorySchedule = {
        ...current[category],
        ...updates,
        lastModified: Date.now()
      };
      const newSchedules: CategorySchedules = {
        ...current,
        [category]: updatedCat
      };

      setCategorySchedules(newSchedules);
      setTimeInputs(prev => ({
        ...prev,
        [category]: {
          openTime: updatedCat.openTime,
          closeTime: updatedCat.closeTime,
          enabled: updatedCat.enabled
        }
      }));

      // Await saving to client storage, server and Supabase
      await DataStore.saveCategorySchedules(newSchedules, true);

      const catLabel = category === 'wellbeing' ? 'Bien-être' : 'Retraits';
      let actionLabel = 'mis à jour';
      if (updates.mode === 'open') actionLabel = 'ouverts immédiatement';
      else if (updates.mode === 'closed') actionLabel = 'fermés immédiatement';
      else if (updates.mode === 'auto') actionLabel = `programmés en mode automatique (${updatedCat.openTime} - ${updatedCat.closeTime})`;

      setNotification({
        type: 'success',
        message: `✨ Opérations ${catLabel} ${actionLabel}. Enregistré définitivement et synchronisé.`
      });
      onRefreshData();
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Erreur lors de l'enregistrement : ${e?.message || 'Erreur réseau'}`
      });
    } finally {
      setIsSavingSchedule(null);
    }
  };

  const handleDeleteInvestment = (investmentId: string, targetUserId?: string, targetProductId?: string) => {
    if (!investmentId && (!targetUserId || !targetProductId)) return;
    const invIdStr = investmentId ? String(investmentId).trim() : '';
    const inv = investments.find(i => 
      (invIdStr && i && String(i.id).trim() === invIdStr) ||
      (targetUserId && targetProductId && i && String(i.userId).trim() === String(targetUserId).trim() && String(i.productId).trim() === String(targetProductId).trim())
    );
    const userId = targetUserId || inv?.userId;
    const productId = targetProductId || inv?.productId;
    const effectiveInvId = inv ? String(inv.id).trim() : invIdStr;

    const productName = inv?.productName || "ce produit payé";
    const priceStr = inv && inv.price ? ` (${inv.price.toLocaleString()} F)` : '';

    setConfirmConfig({
      title: "🔴 SUPPRIMER UN PRODUIT PAYÉ",
      message: `Voulez-vous vraiment annuler et supprimer définitivement cet achat ${productName}${priceStr} ? Ce produit sera immédiatement supprimé sur le compte de l'utilisateur et ses revenus journaliers seront recalculés.`,
      onConfirm: async () => {
        try {
          const success = await DataStore.deleteInvestment(effectiveInvId, userId, productId);
          if (success) {
            // Update local states
            setInvestments(prev => prev.filter(i => {
              if (!i) return false;
              if (effectiveInvId && String(i.id).trim() === effectiveInvId) return false;
              if (userId && productId && String(i.userId).trim() === String(userId).trim() && String(i.productId).trim() === String(productId).trim()) return false;
              return true;
            }));
            try {
              await syncWithBackend();
            } catch (e) {}
            onRefreshData();
            setUsers(DataStore.getUsers());

            setNotification({
              message: "🗑️ Produit souscrit supprimé avec succès !",
              type: "success"
            });
          } else {
            setNotification({
              message: "Erreur lors de la suppression du produit payé.",
              type: "error"
            });
          }
        } catch (err: any) {
          console.error("Error deleting investment:", err);
          setNotification({
            message: "Erreur: " + err.message,
            type: "error"
          });
        }
      }
    });
  };

  const handleDeleteAllInvestments = () => {
    if (investments.length === 0) {
      setNotification({
        message: "Il n'y a aucun produit payé à supprimer.",
        type: "info"
      });
      return;
    }

    setConfirmConfig({
      title: "Supprimer TOUS les produits payés ?",
      message: `⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement TOUS les ${investments.length} produits payés de tous les utilisateurs ?\n\nTous les forfaits actifs seront immédiatement supprimés des comptes des utilisateurs et leurs gains journaliers seront réinitialisés à 0 XOF. Cette action est irréversible.`,
      onConfirm: async () => {
        try {
          await DataStore.deleteAllInvestments();
          setInvestments([]);
          setUsers(DataStore.getUsers());
          onRefreshData();
          setNotification({
            message: "🗑️ Tous les produits payés ont été supprimés avec succès !",
            type: "success"
          });
        } catch (err: any) {
          console.error("Error deleting all investments:", err);
          setNotification({
            message: "Erreur lors de la suppression: " + err.message,
            type: "error"
          });
        }
      }
    });
  };

  const handleActivateInvestment = async (investmentId: string) => {
    const inv = investments.find(i => i.id === investmentId);
    if (!inv) return;

    try {
      const res = await DataStore.activateInvestment(investmentId);
      if (res.success) {
        setInvestments(prev => prev.map(i => i.id === investmentId ? { ...i, status: 'active', activationConditionsMet: true, activatedAt: new Date().toISOString() } : i));
        onRefreshData();
        setUsers(DataStore.getUsers());
        setNotification({
          message: `⚡ Le produit "${inv.productName}" a été activé avec succès et synchronisé avec Supabase !`,
          type: "success"
        });
      } else {
        setNotification({
          message: res.message || "Erreur lors de l'activation du produit.",
          type: "error"
        });
      }
    } catch (err: any) {
      setNotification({
        message: "Erreur: " + err.message,
        type: "error"
      });
    }
  };

  const handleDeleteProof = (proofId: string) => {
    setConfirmConfig({
      title: "🔴 SUPPRIMER LA PREUVE DE RETRAIT",
      message: "Voulez-vous vraiment supprimer définitivement cette preuve de retrait ? Elle ne sera plus affichée dans la liste des preuves pour tous les utilisateurs.",
      onConfirm: async () => {
        try {
          const success = await DataStore.deleteWithdrawalProof(proofId);
          if (success) {
            // Filter out from local state
            setWithdrawalProofs(prev => prev.filter(p => p.id !== proofId));
            setNotification({
              message: "🗑️ Preuve de retrait supprimée avec succès !",
              type: "success"
            });
            onRefreshData();
          } else {
            setNotification({
              message: "Erreur lors de la suppression de la preuve.",
              type: "error"
            });
          }
        } catch (err: any) {
          console.error("Error deleting proof:", err);
          setNotification({
            message: "Erreur: " + err.message,
            type: "error"
          });
        }
      }
    });
  };

  const handleDeleteForumPost = (postId: string) => {
    setConfirmConfig({
      title: "🗑️ SUPPRIMER LA PUBLICATION DU FORUM",
      message: "Voulez-vous vraiment supprimer définitivement cette publication du Forum ? Elle sera retirée pour tous les utilisateurs.",
      onConfirm: async () => {
        try {
          await DataStore.deleteForumPost(postId);
          const updated = DataStore.getForumPosts();
          setForumPosts(updated);
          setNotification({
            message: "🗑️ Publication du Forum supprimée avec succès !",
            type: "success"
          });
          onRefreshData();
        } catch (err: any) {
          console.error("Error deleting forum post:", err);
          setNotification({
            message: "Erreur: " + err.message,
            type: "error"
          });
        }
      }
    });
  };

  const handleClearAllForumPosts = () => {
    setConfirmConfig({
      title: "🗑️ PURGER LE FORUM",
      message: "Voulez-vous vraiment supprimer TOUTES les publications du Forum ? Cette action est irréversible et effacera l'ensemble du forum pour tous les membres.",
      onConfirm: async () => {
        try {
          await DataStore.clearAllForumPosts();
          setForumPosts([]);
          setNotification({
            message: "🧹 Toutes les publications du Forum ont été supprimées avec succès !",
            type: "success"
          });
          onRefreshData();
        } catch (err: any) {
          console.error("Error clearing forum posts:", err);
          setNotification({
            message: "Erreur: " + err.message,
            type: "error"
          });
        }
      }
    });
  };

  const handleUpdateProofStatus = async (proofId: string, status: 'approved' | 'rejected') => {
    try {
      const success = await DataStore.updateWithdrawalProofStatus(proofId, status);
      if (success) {
        // Update local state
        setWithdrawalProofs(prev => prev.map(p => p.id === proofId ? { ...p, status } : p));
        setNotification({
          message: `✨ Statut de la preuve mis à jour avec succès : ${status === 'approved' ? 'APPROUVÉE' : 'REJETÉE'} !`,
          type: "success"
        });
        onRefreshData();
      } else {
        setNotification({
          message: "Erreur lors de la mise à jour du statut.",
          type: "error"
        });
      }
    } catch (err: any) {
      console.error("Error updating proof status:", err);
      setNotification({
        message: "Erreur: " + err.message,
        type: "error"
      });
    }
  };

  const handleAvisImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBanner1FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfficialBanner1(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBanner2FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfficialBanner2(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishAdminAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessage.trim()) {
      setNotification({
        message: "⚠️ Veuillez saisir le message du communiqué ou de l'avis.",
        type: "error"
      });
      return;
    }

    setIsPublishingAvis(true);
    try {
      const amt = adminAmount ? parseInt(adminAmount, 10) : 0;
      const res = await DataStore.publishWithdrawalProof(
        'admin',
        adminAuthorName || 'Dreampod Officiel',
        adminAuthorBadge || 'Officiel',
        amt,
        adminMessage,
        adminImage || undefined,
        'approved'
      );

      if (res.success) {
        setNotification({
          message: "🎉 Avis/Communiqué publié avec succès !",
          type: "success"
        });
        setAdminMessage('');
        setAdminAmount('');
        setAdminImage('');
        // Sync local list
        setWithdrawalProofs(DataStore.getWithdrawalProofs());
        onRefreshData();
      } else {
        setNotification({
          message: "Erreur lors de la publication de l'avis.",
          type: "error"
        });
      }
    } catch (err: any) {
      console.error("Error publishing admin avis:", err);
      setNotification({
        message: "Erreur: " + err.message,
        type: "error"
      });
    } finally {
      setIsPublishingAvis(false);
    }
  };

  // Search filter query for users tab
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [investSearchQuery, setInvestSearchQuery] = useState('');
  const [investStatusFilter, setInvestStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Custom backend input state for Vercel CORS synchronization
  const [customBackendInput, setCustomBackendInput] = useState(() => {
    try {
      return localStorage.getItem('gi_custom_backend_url') || '';
    } catch (e) {
      return '';
    }
  });

  // Consolidated transactions filters
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'Dépôt' | 'Retrait' | 'Commission' | 'Achat VIP'>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const isSyncingRef = React.useRef(false);

  // Real-time synchronization directly with the central Express database server.
  // Bypasses any client integration bottlenecks, ensures 100% of registrations on standard,
  // mobile, and tablet devices appear instantly without exclusion, pagination boundaries, or filter caching.
  const executeDirectCentralSync = async (forceFresh = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      setSyncStatus('checking');
      const url = forceFresh 
        ? '/api/get-store?fresh=true&t=' + Date.now() 
        : '/api/get-store?t=' + Date.now();
      const resp = await apiFetch(getApiUrl(url));
      if (resp.ok) {
        const data = await resp.json();
        if (data && typeof data === 'object') {
          // 1. Force real-time updates directly to local React states for 100% server authority (Run this first to ensure UI works)
          if (Array.isArray(data['gi_users'])) setUsers(data['gi_users']);
          if (Array.isArray(data['gi_deposits'])) setDeposits(data['gi_deposits']);
          if (Array.isArray(data['gi_withdrawals'])) setWithdrawals(data['gi_withdrawals']);
          if (Array.isArray(data['gi_products'])) setProducts(data['gi_products']);
          if (Array.isArray(data['gi_bonus_codes'])) setBonusCodes(data['gi_bonus_codes']);
          if (Array.isArray(data['gi_commissions'])) setCommissions(data['gi_commissions']);
          if (Array.isArray(data['gi_investments'])) setInvestments(data['gi_investments']);
          if (Array.isArray(data['gi_support_messages'])) setSupportMessages(data['gi_support_messages']);
          if (Array.isArray(data['gi_withdrawal_proofs'])) setWithdrawalProofs(data['gi_withdrawal_proofs']);
          if (Array.isArray(data['gi_forum_posts'])) setForumPosts(data['gi_forum_posts']);
          if (data['gi_manual_deposit_numbers'] && typeof data['gi_manual_deposit_numbers'] === 'object') {
            setManualDepositNumbers(data['gi_manual_deposit_numbers']);
          }
          
          // 2. Keep local store and local storage safe
          try {
            for (const key of Object.keys(data)) {
              if (data[key] !== undefined && data[key] !== null) {
                setToStore(key, data[key]);
              }
            }
          } catch (storageErr) {
            console.warn("[ADMIN SYNC] Local storage write rejected in this browser sandbox:", storageErr);
          }
          
          onRefreshData();
          setSyncStatus('success');
          setSyncError(null);
        }
      } else {
        setSyncError(`Server responded with key status ${resp.status}`);
      }

      // Fetch diagnostics only when on platform tab or explicitly forced
      if (activeAdminTabRef.current === 'platform' || forceFresh) {
        const diagResp = await apiFetch(getApiUrl('/api/admin-diagnostics?t=' + Date.now()));
        if (diagResp.ok) {
          const diagData = await diagResp.json();
          if (diagData.success) {
            setServerDiag(diagData);
          }
        }
      }
    } catch (err) {
      console.error("[ADMIN SYNC] Failed direct central DB refresh:", err);
      setSyncError(err instanceof Error ? err.message : String(err));
    } finally {
      isSyncingRef.current = false;
    }
  };

  const handleSupabaseForceSync = async (overwrite: boolean) => {
    try {
      setSupabaseSyncLoading(true);
      setSupabaseSyncResult(null);
      const resp = await apiFetch(getApiUrl('/api/admin/force-sync-supabase'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ overwrite })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setSupabaseSyncResult(`✅ ${data.message} (${data.synchronizedKeys} clés synchronisées, ${data.usersCount} utilisateurs, ${data.depositsCount} dépôts, ${data.withdrawalsCount} retraits, ${data.investmentsCount} plans)`);
        await executeDirectCentralSync();
      } else {
        setSupabaseSyncResult(`❌ Échec : ${data.message || 'Erreur inconnue'}`);
      }
    } catch (err: any) {
      setSupabaseSyncResult(`❌ Erreur de requête : ${err.message}`);
    } finally {
      setSupabaseSyncLoading(false);
    }
  };

  const handleSupabasePushToCloud = async () => {
    try {
      setSupabaseSyncLoading(true);
      setSupabaseSyncResult(null);
      const resp = await apiFetch(getApiUrl('/api/admin/push-to-supabase'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setSupabaseSyncResult(`${data.message}`);
        await executeDirectCentralSync();
      } else {
        setSupabaseSyncResult(`❌ Échec : ${data.message || 'Erreur inconnue'}`);
      }
    } catch (err: any) {
      setSupabaseSyncResult(`❌ Erreur de transfert : ${err.message}`);
    } finally {
      setSupabaseSyncLoading(false);
    }
  };

  const handleTestSupabase = async () => {
    try {
      setSupabaseTesting(true);
      setSupabaseTestResult(null);
      const resp = await apiFetch(getApiUrl('/api/supabase/test'));
      const data = await resp.json();
      setSupabaseTestResult(data);
    } catch (e: any) {
      setSupabaseTestResult({ ok: false, message: e.message });
    } finally {
      setSupabaseTesting(false);
    }
  };

  const handlePushToSupabase = async () => {
    try {
      setSupabaseSyncLoading(true);
      setSupabaseSyncResult(null);
      const resp = await apiFetch(getApiUrl('/api/supabase/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'push' })
      });
      const data = await resp.json();
      if (data.success) {
        setSupabaseSyncResult(`✅ ${data.message}`);
        executeDirectCentralSync();
      } else {
        setSupabaseSyncResult(`❌ ${data.message}`);
      }
    } catch (e: any) {
      setSupabaseSyncResult(`❌ Erreur: ${e.message}`);
    } finally {
      setSupabaseSyncLoading(false);
    }
  };

  const handleLivePullSupabase = async () => {
    try {
      setSupabaseSyncLoading(true);
      setSupabaseSyncResult(null);
      const resp = await apiFetch(getApiUrl('/api/supabase/live-sync'));
      const data = await resp.json();
      if (data.success) {
        setSupabaseSyncResult(`✅ ${data.message} (${data.usersCount} utilisateurs, ${data.depositsCount} dépôts, ${data.withdrawalsCount} retraits, ${data.productsCount} produits)`);
        await executeDirectCentralSync();
      } else {
        setSupabaseSyncResult(`❌ ${data.message}`);
      }
    } catch (e: any) {
      setSupabaseSyncResult(`❌ Erreur: ${e.message}`);
    } finally {
      setSupabaseSyncLoading(false);
    }
  };

  React.useEffect(() => {
    // Fast initial database load on mounts
    executeDirectCentralSync();

    // Active Supabase Realtime listener for instant live updates across terminals
    const unsubSupabase = subscribeToSupabaseRealtime((table) => {
      console.log(`[SUPABASE REALTIME] Detected update on table ${table}`);
      executeDirectCentralSync();
      onRefreshData();
    });

    // Constant real-time active synchronization (poll every 3.5 seconds for guaranteed freshness without lag)
    const interval = setInterval(() => executeDirectCentralSync(false), 3500);
    
    const handleStoreUpdated = () => {
      executeDirectCentralSync(false);
    };
    window.addEventListener('gi_store_updated', handleStoreUpdated);

    return () => {
      unsubSupabase();
      clearInterval(interval);
      window.removeEventListener('gi_store_updated', handleStoreUpdated);
    };
  }, []);

  // Force direct sync on admin tab switch too
  React.useEffect(() => {
    executeDirectCentralSync(false);
  }, [activeAdminTab]);

  // Auto-dismiss custom notifications after 4 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Force clean non-admin user accounts
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const handleForceCleanupUsers = async () => {
    if (!window.confirm("🔴 ATTENTION CRITIQUE : Voulez-vous vraiment supprimer DÉFINITIVEMENT tous les comptes d'investisseurs inscrits, ainsi que l'INTEGRALITÉ des dépôts et des retraits ? Cette action est irréversible et écrasera toutes les données correspondantes dans la base de données cloud (Supabase) et locale (db.json).")) {
      return;
    }
    
    try {
      setIsCleaning(true);
      setCleanupMessage("Nettoyage de la base de données en cours...");
      
      const resp = await apiFetch(getApiUrl('/api/admin/force-cleanup-non-admins?t=' + Date.now()));
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          // Instantly immunize the current admin tab from resurrecting old local data
          try {
            safeLocalStorage.setItem('gi_cleanup_timestamp', String(Date.now()));
            const keysToClear = [
              'gi_users',
              'gi_deposits',
              'gi_withdrawals',
              'gi_investments',
              'gi_commissions',
              'gi_notifications',
              'gi_support_messages',
              'gi_withdrawal_proofs',
              'gi_deleted_investments',
              'gi_deleted_users'
            ];
            for (const k of keysToClear) {
              safeLocalStorage.removeItem(k);
            }
          } catch (e) {}

          setCleanupMessage(data.message);
          setNotification({
            message: "✅ Suppression totale terminée ! Rechargement en cours...",
            type: "success"
          });
          // Wait a short delay and refresh data
          setTimeout(() => {
            window.location.reload();
          }, 1800);
        } else {
          setCleanupMessage(`Erreur : ${data.error || 'Impossible de faire le nettoyage'}`);
          setNotification({
            message: `⚠️ Erreur : ${data.error || 'Impossible de nettoyer'}`,
            type: "error"
          });
        }
      } else {
        setCleanupMessage(`Erreur de communication : ${resp.status}`);
        setNotification({
          message: `⚠️ Erreur de communication serveur (Code : ${resp.status})`,
          type: "error"
        });
      }
    } catch (err: any) {
      setCleanupMessage(`Exception : ${err.message || err}`);
      setNotification({
        message: `⚠️ Exception : ${err.message || err}`,
        type: "error"
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const [isResettingTransactions, setIsResettingTransactions] = useState(false);

  const handleResetAllDepositsWithdrawals = async () => {
    if (!window.confirm("🔴 ATTENTION CRITIQUE : Voulez-vous vraiment supprimer et réinitialiser l'INTEGRALITÉ absolue de tous les dépôts, retraits et preuves de paiement enregistrés sur la plateforme ? Cette action est irréversible.")) {
      return;
    }
    try {
      setIsResettingTransactions(true);
      setCleanupMessage("Réinitialisation de tous les dépôts et retraits en cours...");
      const resp = await apiFetch(getApiUrl('/api/admin/reset-all-deposits-withdrawals?t=' + Date.now()));
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          try {
            safeLocalStorage.removeItem('gi_deposits');
            safeLocalStorage.removeItem('gi_withdrawals');
            safeLocalStorage.removeItem('gi_withdrawal_proofs');
          } catch (e) {}

          setCleanupMessage(data.message);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setCleanupMessage(`Erreur : ${data.error || 'Impossible de réinitialiser'}`);
        }
      } else {
        setCleanupMessage(`Erreur de communication : ${resp.status}`);
      }
    } catch (err: any) {
      setCleanupMessage(`Exception : ${err.message || err}`);
    } finally {
      setIsResettingTransactions(false);
    }
  };

  const handleDeleteRefusedDeposits = async () => {
    if (!window.confirm("🔴 Voulez-vous vraiment supprimer définitivement tous les dépôts refusés de la plateforme ? Cette action est irréversible.")) {
      return;
    }
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/delete-refused-deposits?t=' + Date.now()));
      if (resp.ok) {
        const data = await resp.json();
        alert(data.message || "Dépôts refusés supprimés avec succès !");
        executeDirectCentralSync();
      } else {
        alert("Erreur de communication avec le serveur.");
      }
    } catch (err: any) {
      alert("Erreur : " + (err.message || err));
    }
  };

  const handleDeletePendingDeposits = async () => {
    if (!window.confirm("🔴 Voulez-vous vraiment supprimer définitivement tous les dépôts en attente de la plateforme ? Cette action est irréversible.")) {
      return;
    }
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/delete-pending-deposits?t=' + Date.now()));
      if (resp.ok) {
        const data = await resp.json();
        alert(data.message || "Dépôts en attente supprimés avec succès !");
        executeDirectCentralSync();
      } else {
        alert("Erreur de communication avec le serveur.");
      }
    } catch (err: any) {
      alert("Erreur : " + (err.message || err));
    }
  };

  const handleDeleteValidatedWithdrawals = async () => {
    if (!window.confirm("🔴 Voulez-vous vraiment supprimer définitivement tous les retraits validés et expédiés de la plateforme ? Cette action est irréversible.")) {
      return;
    }
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/delete-validated-withdrawals?t=' + Date.now()));
      if (resp.ok) {
        const data = await resp.json();
        alert(data.message || "Retraits validés supprimés avec succès !");
        executeDirectCentralSync();
      } else {
        alert("Erreur de communication avec le serveur.");
      }
    } catch (err: any) {
      alert("Erreur : " + (err.message || err));
    }
  };

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editBonus, setEditBonus] = useState<number>(0);
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editReferredBy, setEditReferredBy] = useState<string>('');
  const [editWithdrawBlocked, setEditWithdrawBlocked] = useState<boolean>(false);
  const [globalWithdrawBlocked, setGlobalWithdrawBlocked] = useState<boolean>(() => DataStore.areWithdrawalsBlocked());

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editProductVipLevel, setEditProductVipLevel] = useState<number>(1);
  const [editProductName, setEditProductName] = useState<string>('');
  const [editProductPrice, setEditProductPrice] = useState<number>(5000);
  const [editProductDailyReturn, setEditProductDailyReturn] = useState<number>(1000);
  const [editProductDuration, setEditProductDuration] = useState<number>(10);
  const [editProductTag, setEditProductTag] = useState<string>('');
  const [editProductImageUrl, setEditProductImageUrl] = useState<string>('');
  const [editVipIsCyclic, setEditVipIsCyclic] = useState<boolean>(false);
  const [editVipGeneratedProductIds, setEditVipGeneratedProductIds] = useState<string[]>([]);
  const [editVipCategory, setEditVipCategory] = useState<'stability' | 'wellbeing'>('stability');

  // New product form state
  const [newVipLevel, setNewVipLevel] = useState(1);
  const [newVipName, setNewVipName] = useState('');
  const [newVipPrice, setNewVipPrice] = useState(5000);
  const [newVipDaily, setNewVipDaily] = useState(1000);
  const [newVipDuration, setNewVipDuration] = useState(10);
  const [newVipTag, setNewVipTag] = useState('');
  const [newVipImageUrl, setNewVipImageUrl] = useState('');
  const [newVipIsCyclic, setNewVipIsCyclic] = useState<boolean>(false);
  const [newVipGeneratedProductIds, setNewVipGeneratedProductIds] = useState<string[]>([]);
  const [newVipCategory, setNewVipCategory] = useState<'stability' | 'wellbeing'>('stability');

  // Global notify state
  const [globalNotifTitle, setGlobalNotifTitle] = useState('');
  const [globalNotifMessage, setGlobalNotifMessage] = useState('');

  // New promo code state
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeAmount, setNewCodeAmount] = useState(500);
  const [newCodeMax, setNewCodeMax] = useState(100);

  // MLM Rates state
  const [mlmRate1, setMlmRate1] = useState<number>(() => DataStore.getMLMRates().level1);
  const [mlmRate2, setMlmRate2] = useState<number>(() => DataStore.getMLMRates().level2);
  const [mlmRate3, setMlmRate3] = useState<number>(() => DataStore.getMLMRates().level3);
  const [referralDomain, setReferralDomain] = useState<string>(() => DataStore.getReferralDomain());
  const [whatsappGroup, setWhatsappGroup] = useState<string>(() => DataStore.getWhatsAppGroup());
  const [whatsappChannel, setWhatsappChannel] = useState<string>(() => DataStore.getWhatsAppChannel());
  const [whatsappSupportNumber, setWhatsappSupportNumber] = useState<string>(() => DataStore.getWhatsAppSupportNumber());
  const [onlinePaymentLink, setOnlinePaymentLink] = useState<string>(() => DataStore.getOnlinePaymentLink());
  const [manualDepositNumbers, setManualDepositNumbers] = useState<Record<string, string>>(() => DataStore.getManualDepositNumbers());
  const [canalsSuccess, setCanalsSuccess] = useState<string | null>(null);

  const [officialBanner1, setOfficialBanner1] = useState<string>(() => DataStore.getOfficialBanners().image1);
  const [officialBanner2, setOfficialBanner2] = useState<string>(() => DataStore.getOfficialBanners().image2);

  const handleSaveMlmRates = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.saveMLMRates({
      level1: mlmRate1,
      level2: mlmRate2,
      level3: mlmRate3
    });
    DataStore.saveReferralDomain(referralDomain);
    DataStore.saveWhatsAppGroup(whatsappGroup);
    DataStore.saveWhatsAppChannel(whatsappChannel);
    DataStore.saveWhatsAppSupportNumber(whatsappSupportNumber);
    DataStore.saveOnlinePaymentLink(onlinePaymentLink);
    DataStore.saveManualDepositNumbers(manualDepositNumbers);
    DataStore.saveOfficialBanners({
      image1: officialBanner1,
      image2: officialBanner2
    });
    alert('Réglages système (MLM, domaine, WhatsApp, Support, Lien SoccoPay, Numéros Dépôt, Images) enregistrés avec succès !');
  };

  const handleSaveManualDepositNumbers = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DataStore.saveManualDepositNumbers(manualDepositNumbers);
      setCanalsSuccess('✅ Tous les canaux de dépôt (Togo, Côte d’Ivoire, etc.) ont été enregistrés et synchronisés avec succès !');
      setTimeout(() => setCanalsSuccess(null), 6000);
      
      // Force direct synchronization with central Express server
      if (typeof executeDirectCentralSync === 'function') {
        await executeDirectCentralSync();
      }
    } catch (err: any) {
      console.error("Error saving manual deposit numbers:", err);
      setCanalsSuccess(`❌ Erreur lors de l'enregistrement : ${err.message || err}`);
    }
  };

  // Picture receipt lightbox state
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Product blocking states
  const [schedulingBlockProductId, setSchedulingBlockProductId] = useState<string | null>(null);
  const [blockReopenTime, setBlockReopenTime] = useState<string>('');

  const handleToggleBlockProduct = async (id: string, currentlyBlocked: boolean) => {
    if (currentlyBlocked) {
      try {
        const resp = await apiFetch(getApiUrl('/api/admin/product/toggle-block'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id, isBlocked: false })
        });
        if (resp.ok) {
          await executeDirectCentralSync();
        } else {
          DataStore.toggleBlockProduct(id, false);
          syncLocalStates();
        }
      } catch (e) {
        console.error("Failed server unblock, fallback local:", e);
        DataStore.toggleBlockProduct(id, false);
        syncLocalStates();
      }
    } else {
      setSchedulingBlockProductId(id);
      const date = new Date();
      date.setHours(date.getHours() + 1);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setBlockReopenTime(localISOTime);
    }
  };

  const handleConfirmProductBlock = async (id: string, useSchedule: boolean) => {
    const reopenISO = useSchedule && blockReopenTime ? new Date(blockReopenTime).toISOString() : undefined;
    
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/product/toggle-block'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, isBlocked: true, reopenDateTime: reopenISO })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      } else {
        DataStore.toggleBlockProduct(id, true, reopenISO);
        syncLocalStates();
      }
    } catch (e) {
      console.error("Failed server block, fallback local:", e);
      DataStore.toggleBlockProduct(id, true, reopenISO);
      syncLocalStates();
    }
    
    setSchedulingBlockProductId(null);
  };

  // Refresh lists
  const syncLocalStates = () => {
    setUsers(DataStore.getUsers());
    setDeposits(DataStore.getDeposits());
    setWithdrawals(DataStore.getWithdrawals());
    setProducts(DataStore.getProducts());
    setBonusCodes(DataStore.getBonusCodes());
    setCommissions(DataStore.getCommissions());
    setInvestments(DataStore.getInvestments());
    setWithdrawalProofs(DataStore.getWithdrawalProofs());
    setForumPosts(DataStore.getForumPosts());
    onRefreshData();
  };

  // Manual Trigger to fully retrieve all consolidated platform data of the backend
  const handleGlobalSync = async () => {
    setIsSyncing(true);
    setSyncStatus('checking');
    try {
      await executeDirectCentralSync();
      setSyncStatus('success');
    } catch (error) {
      console.error("Error manual sync from console:", error);
      setSyncStatus('idle');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // User events
  const handleBlockToggle = async (userId: string, currentBlocked: boolean) => {
    DataStore.setBlockUser(userId, !currentBlocked);
    syncLocalStates();

    try {
      const resp = await apiFetch(getApiUrl('/api/admin/block-user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentBlocked })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server block user toggle:", e);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      alert("Erreur : Vous ne pouvez pas supprimer votre propre compte Administrateur !");
      return;
    }
    if (window.confirm(`⚠️ ATTENTION CRITIQUE : Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userName} ? Toutes ses données associées seront retirées. Cette opération est totalement irréversible.`)) {
      await DataStore.deleteUser(userId);
      syncLocalStates();
      if (typeof executeDirectCentralSync === 'function') {
        executeDirectCentralSync();
      }
    }
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setEditBalance(user.balance);
    setEditBonus(user.bonus);
    setEditRole(user.role);
    setEditPassword(user.password || (user.role === 'admin' ? 'admin' : 'user123'));
    setEditReferredBy(user.referredBy || '');
    setEditWithdrawBlocked(user.withdrawBlocked === true);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      DataStore.updateUserBalance(editingUser.id, {
        balance: editBalance,
        bonus: editBonus,
        role: editRole,
        password: editPassword,
        referredBy: editReferredBy === '' ? null : editReferredBy,
        withdrawBlocked: editWithdrawBlocked
      });
      const targetUserId = editingUser.id;
      setEditingUser(null);
      syncLocalStates();

      try {
        const resp = await apiFetch(getApiUrl('/api/admin/update-user'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: targetUserId,
            balance: editBalance,
            bonus: editBonus,
            role: editRole,
            password: editPassword,
            referredBy: editReferredBy === '' ? null : editReferredBy,
            withdrawBlocked: editWithdrawBlocked
          })
        });
        if (resp.ok) {
          await executeDirectCentralSync();
        }
      } catch (e) {
        console.error("Failed server update of user:", e);
      }
    }
  };

  const handleDeleteSponsor = async (filleulId: string) => {
    const filleul = users.find(u => u.id === filleulId);
    if (filleul) {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le parrain de ${filleul.name} ?`)) {
        DataStore.updateUserBalance(filleul.id, {
          balance: filleul.balance,
          bonus: filleul.bonus,
          role: filleul.role,
          password: filleul.password,
          referredBy: null
        });
        syncLocalStates();

        try {
          const resp = await apiFetch(getApiUrl('/api/admin/update-user'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: filleul.id,
              balance: filleul.balance,
              bonus: filleul.bonus,
              role: filleul.role,
              password: filleul.password,
              referredBy: null
            })
          });
          if (resp.ok) {
            await executeDirectCentralSync();
          }
        } catch (e) {
          console.error("Failed server update of sponsor removal:", e);
        }
      }
    }
  };

  // Finance events
  const handleApproveDeposit = async (id: string) => {
    DataStore.approveDeposit(id);
    syncLocalStates();
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/deposit-action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, action: 'approve' })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server approval of deposit:", e);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    DataStore.rejectDeposit(id);
    syncLocalStates();
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/deposit-action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, action: 'reject' })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server rejection of deposit:", e);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    DataStore.approveWithdrawal(id);
    syncLocalStates();
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/withdrawal-action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id, action: 'approve' })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server approval of withdrawal:", e);
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    DataStore.rejectWithdrawal(id);
    syncLocalStates();
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/withdrawal-action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id, action: 'reject' })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server rejection of withdrawal:", e);
    }
  };

  const handleSendavaPayPayout = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment lancer le paiement automatique par SendavaPay Payout pour cette demande de retrait ? Le compte de l'utilisateur sera crédité directement.")) {
      return;
    }
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/sendavapay/payout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        alert("Succès : " + data.message);
        await executeDirectCentralSync();
      } else {
        alert("Erreur : " + (data.error || "La transaction a échoué. Veuillez vérifier la configuration de votre jeton SendavaPay."));
      }
    } catch (e: any) {
      console.error("Payout failed:", e);
      alert("Erreur de connexion : " + (e.message || e));
    }
  };

  // Product actions
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVipName.trim()) {
      alert("⚠️ Veuillez saisir un nom pour l'offre d'investissement.");
      return;
    }

    const payload = {
      vipLevel: newVipLevel,
      name: newVipName.trim(),
      price: newVipPrice,
      dailyReturn: newVipDaily,
      durationDays: newVipDuration,
      tag: newVipTag.trim() || undefined,
      isCyclic: newVipIsCyclic,
      generatedProductIds: newVipGeneratedProductIds,
      category: newVipCategory,
      totalReturn: newVipDaily * newVipDuration,
      imageUrl: newVipImageUrl.trim() || undefined
    };

    // 1. Immediately update local DataStore and React state for instant responsiveness
    DataStore.addNewProduct(payload);
    syncLocalStates();

    // 2. Persist to central server / database
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/product/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server product creation, fallback is local:", e);
    }

    setNewVipName('');
    setNewVipTag('');
    setNewVipImageUrl('');
    setNewVipIsCyclic(false);
    setNewVipGeneratedProductIds([]);
    setNewVipCategory('stability');
    alert("✅ Produit d'investissement créé et enregistré avec succès !");
  };

  const handleDeleteProduct = async (id: string, skipConfirm = false) => {
    if (!skipConfirm && !confirm("Voulez-vous vraiment supprimer ce produit d'investissement et toutes les souscriptions associées sur les comptes utilisateurs ?")) return;

    DataStore.deleteProduct(id);
    syncLocalStates();

    try {
      const resp = await apiFetch(getApiUrl('/api/admin/product/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.investments)) {
          setInvestments(data.investments);
        }
        if (data && Array.isArray(data.users)) {
          setUsers(data.users);
        }
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server product deletion, fallback local:", e);
    }
    alert("✅ Produit et souscriptions associées supprimés avec succès !");
  };

  const handleDeleteAllProducts = async () => {
    if (confirm('⚠️ Voulez-vous vraiment supprimer définitivement TOUS les produits d\'investissement et leurs souscriptions ? Cette action est irréversible.')) {
      DataStore.saveProducts([]);
      DataStore.saveInvestments([]);
      syncLocalStates();

      try {
        const resp = await apiFetch(getApiUrl('/api/admin/product/delete-all'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (resp.ok) {
          await executeDirectCentralSync();
        }
      } catch (e) {
        console.error("Failed server products clear:", e);
      }
      alert("✅ Tous les produits et souscriptions ont été supprimés avec succès !");
    }
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setEditProductVipLevel(product.vipLevel);
    setEditProductName(product.name);
    setEditProductPrice(product.price);
    setEditProductDailyReturn(product.dailyReturn);
    setEditProductDuration(product.durationDays);
    setEditProductTag(product.tag || '');
    setEditProductImageUrl(product.imageUrl || '');
    setEditVipIsCyclic(product.isCyclic || false);
    setEditVipGeneratedProductIds(product.generatedProductIds || []);
    setEditVipCategory(product.category || 'stability');
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    if (!editProductName.trim()) {
      alert("⚠️ Le nom du produit ne peut pas être vide.");
      return;
    }

    const payload = {
      vipLevel: editProductVipLevel,
      name: editProductName.trim(),
      price: editProductPrice,
      dailyReturn: editProductDailyReturn,
      durationDays: editProductDuration,
      tag: editProductTag.trim() || undefined,
      isCyclic: editVipIsCyclic,
      generatedProductIds: editVipGeneratedProductIds,
      category: editVipCategory,
      totalReturn: editProductDailyReturn * editProductDuration,
      imageUrl: editProductImageUrl.trim() || undefined
    };

    // 1. Immediately update local DataStore and React state for instant responsiveness
    DataStore.updateProduct(editingProduct.id, payload);
    syncLocalStates();

    // 2. Persist to central server / database
    try {
      const resp = await apiFetch(getApiUrl('/api/admin/product/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: editingProduct.id, updatedP: payload })
      });
      if (resp.ok) {
        await executeDirectCentralSync();
      }
    } catch (e) {
      console.error("Failed server product update, fallback local:", e);
    }

    setEditingProduct(null);
    alert("✅ Produit mis à jour et enregistré avec succès !");
  };

  const handleCreateBonusCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName) return;

    DataStore.createBonusCode(newCodeName, newCodeAmount, newCodeMax);
    setNewCodeName('');
    syncLocalStates();
    alert(`Code bonus ${newCodeName.toUpperCase()} créé avec succès !`);
  };

  const handleSendGlobalAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalNotifTitle || !globalNotifMessage) return;

    DataStore.sendGlobalNotification(globalNotifTitle, globalNotifMessage);
    setGlobalNotifTitle('');
    setGlobalNotifMessage('');
    syncLocalStates();
    alert('Notification globale diffusée avec succès à tous les investisseurs !');
  };

  const handleExportUsersToGoogle = () => {
    let csvContent = "\uFEFF";
    csvContent += "ID;Nom Complet;Numero WhatsApp;Pays;Solde Principal (XOF);Bonus (XOF);Total Gains (XOF);Code Parrainage;Sponsor Direct;Role;Date d'Enregistrement\n";
    
    users.forEach((u) => {
      const row = [
        u.id,
        u.name,
        u.whatsapp,
        u.country,
        u.balance,
        u.bonus,
        u.totalEarnings,
        u.referralCode,
        u.referredBy || 'Aucun',
        u.role === 'admin' ? 'Administrateur' : 'Utilisateur VIP',
        new Date(u.createdAt).toLocaleString()
      ].map(val => {
        let s = String(val).replace(/"/g, '""');
        if (s.includes(';') || s.includes('\n') || s.includes('"')) {
          s = `"${s}"`;
        }
        return s;
      }).join(';');
      
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `agroprofit_coordonnees_membres_google.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWithdrawalsToGoogle = () => {
    let csvContent = "\uFEFF";
    csvContent += "ID Demande;Nom Utilisateur;Numero Mobile Money;Montant Brut (XOF);Frais (12%);Montant Net a Envoyer (XOF);Operateur;Statut;Date de Reception\n";
    
    withdrawals.forEach((w) => {
      const fee = w.fee ?? Math.round(w.amount * 0.12);
      const net = w.netAmount ?? (w.amount - fee);
      const statusLabel = w.status === 'approved' ? 'AUTORISE & EXPEDIE' : w.status === 'rejected' ? 'REJETE / LIQUIDE' : 'EN ATTENTE';
      
      const row = [
        w.id,
        w.userName,
        w.number,
        w.amount,
        fee,
        net,
        w.operator,
        statusLabel,
        new Date(w.createdAt).toLocaleString()
      ].map(val => {
        let s = String(val).replace(/"/g, '""');
        if (s.includes(';') || s.includes('\n') || s.includes('"')) {
          s = `"${s}"`;
        }
        return s;
      }).join(';');
      
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `agroprofit_retraits_coordonnees_google.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper summaries
  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;
  const pendingDepositsSum = deposits.filter(d => d.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

  const pendingWithdrawCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingWithdrawGross = withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingWithdrawNetToPay = withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => {
    const fee = curr.fee ?? Math.round(curr.amount * 0.12);
    return acc + (curr.amount - fee);
  }, 0);

  const totalVolumeApproved = deposits.filter(d => d.status === 'approved' || d.status === 'completed' || d.status === 'success').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayoutApproved = withdrawals.filter(w => w.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);

  // Active VIP Plan metrics
  const activeInvestments = investments.filter(i => i.status === 'active');
  const activeInvestmentsCount = activeInvestments.length;
  const activeInvestmentsVolume = activeInvestments.reduce((sum, inv) => sum + inv.price, 0);
  const totalReturnsClaimedSum = investments.reduce((sum, inv) => sum + inv.totalReturnClaimed, 0);

  // Users balance assets
  const totalUserBalances = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalUserBonuses = users.reduce((sum, u) => sum + (u.bonus || 0), 0);
  const totalUserAssets = totalUserBalances + totalUserBonuses;

  return (
    <div className="w-full relative pb-16">
      {/* Lightbox for visual invoice receipt proof */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
          <button 
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 bg-yellow-500 text-slate-950 p-2 rounded-full font-bold hover:scale-110 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-xl w-full bg-slate-900 border border-yellow-500/20 rounded-2xl p-3 overflow-hidden">
            <h4 className="text-xs text-yellow-500 uppercase tracking-widest text-center font-mono py-2">Preuve de Transfert Mobile Money</h4>
            <img 
              src={lightboxImg} 
              alt="Receipt screenshot proof" 
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2.5 uppercase tracking-wide">Capture d'écran soumise par l'affilié</p>
            <div className="flex justify-center mt-3 mb-1">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = lightboxImg;
                  link.download = `preuve-depot-retrait-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-sans font-black text-xs rounded-xl shadow-md duration-150 flex items-center space-x-1.5 uppercase tracking-wider cursor-pointer"
              >
                <span>📥 Enregistrer l'image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing user modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-3xl p-6 md:p-8 relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg text-white mb-4 shrink-0">Modifier l'Investisseur</h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 scrollbar-thin scrollbar-thumb-slate-800">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-semibold text-[10px]">Nom de l'utilisateur</span>
                <span className="text-sm font-semibold text-white mt-1 block">{editingUser.name} ({editingUser.whatsapp})</span>
                {(() => {
                  const approvedDeps = deposits
                    .filter(d => d.userId === editingUser.id && (d.status === 'approved' || d.status === 'completed' || d.status === 'success'))
                    .reduce((sum, d) => sum + d.amount, 0);

                  const pendingDeps = deposits
                    .filter(d => d.userId === editingUser.id && d.status === 'pending')
                    .reduce((sum, d) => sum + d.amount, 0);

                  const approvedWiths = withdrawals
                    .filter(w => w.userId === editingUser.id && (w.status === 'approved' || w.status === 'completed' || w.status === 'success'))
                    .reduce((sum, w) => sum + w.amount, 0);

                  const pendingWiths = withdrawals
                    .filter(w => w.userId === editingUser.id && w.status === 'pending')
                    .reduce((sum, w) => sum + w.amount, 0);

                  const commSum = commissions
                    .filter(c => c.userId === editingUser.id)
                    .reduce((sum, c) => sum + (c.amount || 0), 0);
                  
                  const dailyRev = editingUser.dailyEarnings || 0;

                  return (
                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                      <span className="text-[10px] text-yellow-500 uppercase tracking-wider font-bold block border-b border-slate-800/80 pb-1.5">
                        📊 Aperçu Financier de l'Investisseur
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-900/80 border border-slate-800/40 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-medium block">⚡ Gain Quotidien</span>
                          <span className="text-emerald-400 font-mono font-bold block mt-0.5">+{dailyRev.toLocaleString()} F / j</span>
                        </div>

                        <div className="p-2 bg-slate-900/80 border border-slate-800/40 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-medium block">🎁 Commissions</span>
                          <span className="text-emerald-400 font-mono font-bold block mt-0.5">+{commSum.toLocaleString()} F</span>
                        </div>

                        <div className="p-2 bg-slate-900/80 border border-slate-800/40 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-medium block flex items-center gap-1">📥 Dépôts <span className="text-green-400">(App.)</span></span>
                          <span className="text-green-400 font-mono font-bold block mt-0.5">+{approvedDeps.toLocaleString()} F</span>
                          {pendingDeps > 0 && (
                            <span className="text-[8px] text-yellow-500 font-mono block mt-0.5" title="En attente de validation">⏳ Attente: +{pendingDeps.toLocaleString()} F</span>
                          )}
                        </div>

                        <div className="p-2 bg-slate-900/80 border border-slate-800/40 rounded-xl">
                          <span className="text-[9px] text-slate-400 uppercase font-medium block flex items-center gap-1">📤 Retraits <span className="text-red-400">(App.)</span></span>
                          <span className="text-red-400 font-mono font-bold block mt-0.5">-{approvedWiths.toLocaleString()} F</span>
                          {pendingWiths > 0 && (
                            <span className="text-[8px] text-yellow-500 font-mono block mt-0.5" title="En attente de validation">⏳ Attente: -{pendingWiths.toLocaleString()} F</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Solde Principal (XOF)</label>
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-yellow-300 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gains Bonus (XOF)</label>
                <input
                  type="number"
                  value={editBonus}
                  onChange={(e) => setEditBonus(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-yellow-300 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rôle du Compte</label>
                {(() => {
                  const isPrincipalAdmin = currentUser.id === 'u-admin' || 
                    currentUser.whatsapp === '+237600000000' || 
                    currentUser.whatsapp?.replace(/\D/g, '') === '237600000000';
                  
                  if (isPrincipalAdmin) {
                    return (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-500"
                      >
                        <option value="user">Utilisateur Client</option>
                        <option value="admin">Administrateur Système</option>
                      </select>
                    );
                  } else {
                    return (
                      <div className="space-y-1.5">
                        <select
                          disabled
                          value={editRole}
                          className="w-full bg-slate-950/70 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                        >
                          <option value="user">Utilisateur Client</option>
                          <option value="admin">Administrateur Système</option>
                        </select>
                        <p className="text-[10px] text-red-400/80">⚠️ Seul l'administrateur principal (+237600000000) a le droit de nommer ou révoquer des administrateurs.</p>
                      </div>
                    );
                  }
                })()}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Parrain / Sponsor Direct</label>
                <select
                  value={editReferredBy}
                  onChange={(e) => setEditReferredBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-xs md:text-sm text-white focus:outline-none focus:border-yellow-500/40"
                >
                  <option value="">Aucun Sponsor (Inscrit en Direct)</option>
                  {users.filter(u => u.id !== editingUser.id).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.whatsapp}) - Code: {u.referralCode}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Vous pouvez associer l'investisseur à un parrain ou choisir "Aucun" pour supprimer son affiliation.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Autorisation des retraits</label>
                <select
                  value={editWithdrawBlocked ? 'true' : 'false'}
                  onChange={(e) => setEditWithdrawBlocked(e.target.value === 'true')}
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-500/40"
                >
                  <option value="false">✔️ Autorisé (Peut effectuer des retraits)</option>
                  <option value="true">❌ Bloqué (Interdit de retirer)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mot de passe d'accès</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Modifier le mot de passe"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded-xl py-3 px-4 text-sm text-white font-mono focus:outline-none focus:border-yellow-500/40"
                />
              </div>

              {/* Plans et Produits payés par l'utilisateur */}
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Plans payés / Produits souscrits ({investments.filter(i => i.userId === editingUser.id).length})
                </label>
                {investments.filter(i => i.userId === editingUser.id).length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-medium italic">Aucun plan d'investissement souscrit.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {investments.filter(i => i.userId === editingUser.id).map(inv => (
                      <div key={inv.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-amber-500 uppercase tracking-wide truncate">{inv.productName}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-0.5">
                            <span>{inv.price.toLocaleString()} F</span>
                            <span>•</span>
                            <span>{inv.daysPassed}/{inv.durationDays} J</span>
                            <span>•</span>
                            <span className={inv.status === 'active' ? "text-emerald-400 font-bold" : "text-slate-500"}>
                              {inv.status === 'active' ? 'ACTIF ⚡' : 'ÉCHU 🏁'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(null);
                            handleDeleteInvestment(inv.id);
                          }}
                          className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-transparent rounded-lg font-bold duration-150 text-[10px] shrink-0"
                          title="Supprimer définitivement ce produit payé"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-800 shrink-0 mt-2">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 py-3 text-xs font-bold border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 py-3 text-xs font-bold rounded-xl gold-bg-gradient text-slate-950 shadow-md shadow-yellow-500/10"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete product confirmation modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-3xl p-6 md:p-8 relative flex flex-col shadow-2xl animate-fade-in">
            <button 
              onClick={() => setProductToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Supprimer le Produit</h3>
              <p className="text-slate-350 text-sm mb-6">
                Voulez-vous vraiment supprimer définitivement le package d'investissement <span className="font-bold text-red-400">{productToDelete.name}</span> ? Cette action est irréversible.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 text-xs font-bold border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const id = productToDelete.id;
                  setProductToDelete(null);
                  await handleDeleteProduct(id, true);
                }}
                className="flex-1 py-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/10"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing product modal overlay */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 md:p-8 relative max-h-[90vh] flex flex-col shadow-2xl shadow-black/60">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display font-bold text-lg text-white mb-4 shrink-0">⚙️ Modifier le Produit</h3>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 scrollbar-thin scrollbar-thumb-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau VIP (Indice)</label>
                <input
                  type="number"
                  value={editProductVipLevel}
                  onChange={(e) => setEditProductVipLevel(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-white font-mono focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom du Plan d'investissement</label>
                <input
                  type="text"
                  value={editProductName}
                  onChange={(e) => setEditProductName(e.target.value)}
                  placeholder="Ex: VIP Platine 5"
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prix d'acquisition (XOF)</label>
                <input
                  type="number"
                  value={editProductPrice}
                  onChange={(e) => setEditProductPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-yellow-300 font-mono focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Rendement Journalier (XOF)
                </label>
                <input
                  type="number"
                  value={editProductDailyReturn}
                  onChange={(e) => setEditProductDailyReturn(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-green-400 font-mono focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Durée de l'effet (Jours)
                </label>
                <input
                  type="number"
                  value={editProductDuration}
                  onChange={(e) => setEditProductDuration(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-white font-mono focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slogan / Tag visuel</label>
                <input
                  type="text"
                  value={editProductTag}
                  onChange={(e) => setEditProductTag(e.target.value)}
                  placeholder="Ex: Populaire, Offre Spéciale"
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">URL de l'image du produit (Optionnel)</label>
                <input
                  type="text"
                  value={editProductImageUrl}
                  onChange={(e) => setEditProductImageUrl(e.target.value)}
                  placeholder="Saisissez l'URL de l'image de votre choix pour ce produit"
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Catégorie du Produit</label>
                <select
                  value={editVipCategory}
                  onChange={(e) => setEditVipCategory(e.target.value as 'stability' | 'wellbeing')}
                  className="w-full bg-slate-950/80 rounded-xl py-3 px-4 text-sm text-white focus:outline-none shadow-inner"
                >
                  <option value="stability">Stabilité (Plans standard)</option>
                  <option value="wellbeing">Bien-être (Plans bien-être)</option>
                </select>
              </div>

             </div>
 
             <div className="pt-4 flex gap-3 border-t border-white/[0.04] shrink-0 mt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-3 text-xs font-bold rounded-xl text-slate-400 bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 py-3 text-xs font-bold rounded-xl gold-bg-gradient text-slate-950 shadow-md shadow-amber-950/20 cursor-pointer"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR - COMPACT & RESPONSIVE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3.5 px-3.5 sm:px-5 bg-slate-900/60 border border-slate-800 rounded-xl mb-4 gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5 font-mono">
            <Lock className="w-3 h-3" />
            <span>ESPACE SÉCURISÉ ADMIN</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Console d'Administration</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase Cloud : sjvyhnxklgsgprgkihrr (Connecté)</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Temps Réel ⚡ (Anon + Service Role)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Données 100% synchronisées cloud
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleTestSupabase}
            disabled={supabaseTesting}
            title="Tester la connexion à la base Supabase"
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono tracking-wide transition-all border flex items-center space-x-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>{supabaseTesting ? 'Test Supabase...' : 'Tester Supabase'}</span>
          </button>

          <button
            onClick={handleLivePullSupabase}
            disabled={supabaseSyncLoading}
            title="Forcer la synchronisation directe depuis la base Supabase"
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono tracking-wide transition-all border flex items-center space-x-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${supabaseSyncLoading ? 'animate-spin' : ''}`} />
            <span>{supabaseSyncLoading ? 'Synchro Supabase...' : 'Actualiser Supabase'}</span>
          </button>

          <button
            onClick={handleGlobalSync}
            disabled={isSyncing}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono tracking-wide transition-all border flex items-center space-x-1.5 ${
              isSyncing
                ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                : syncStatus === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing 
                ? 'Synchro...' 
                : syncStatus === 'success' 
                ? 'Synchronisé !' 
                : 'Synchroniser'
              }
            </span>
          </button>
          
          <button
            onClick={onCloseAdmin}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-amber-500/20 text-amber-400 hover:text-amber-300 text-[11px] font-bold rounded-lg transition-all"
          >
            ← Tableau de Bord
          </button>
        </div>
      </div>

      {/* STRATEGIC ADMIN STATS - COMPACT & HIGH-DENSITY */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>SOLDES & BILAN FINANCIER GLOBAL</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-slate-400 uppercase font-semibold block leading-tight">Dépôts Validés</span>
              <div className="text-sm sm:text-base font-bold text-green-400 mt-0.5">{totalVolumeApproved.toLocaleString()} XOF</div>
              <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5 truncate">Rechargements effectifs</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-slate-400 uppercase font-semibold block leading-tight">Retraits Validés</span>
              <div className="text-sm sm:text-base font-bold text-red-400 mt-0.5">{totalPayoutApproved.toLocaleString()} XOF</div>
              <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5 truncate">Cashout total liquidé</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-slate-400 uppercase font-semibold block leading-tight">Marge Plateforme</span>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">{(totalVolumeApproved - totalPayoutApproved).toLocaleString()} XOF</div>
              <span className="text-[8.5px] text-green-400 font-mono block mt-0.5 truncate">Excédent net</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-indigo-400 uppercase font-bold block leading-tight">Masse Monétaire</span>
              <div className="text-sm sm:text-base font-bold text-indigo-300 mt-0.5">{totalUserAssets.toLocaleString()} XOF</div>
              <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5 truncate">Solde + Bonus total</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>OPÉRATIONS & ENGAGEMENTS</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-slate-400 uppercase font-semibold block leading-tight">Inscriptions</span>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">{users.length} Investisseurs</div>
              <span className="text-[8.5px] text-emerald-400 font-mono block mt-0.5 truncate">★ Total enregistrés</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-slate-400 uppercase font-semibold block leading-tight">Plans Actifs</span>
              <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">{activeInvestmentsCount} Forfaits</div>
              <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5 truncate">Cap: {activeInvestmentsVolume.toLocaleString()} F</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-slate-400 uppercase font-semibold block leading-tight">Gains VIP Versés</span>
              <div className="text-sm sm:text-base font-bold text-green-400 mt-0.5">{totalReturnsClaimedSum.toLocaleString()} XOF</div>
              <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5 truncate">Rentes réclamées</span>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 p-2.5 sm:p-3 rounded-lg relative">
              <span className="text-[9.5px] text-amber-400 uppercase font-bold block leading-tight">Flux en Attente</span>
              <div className="text-xs font-bold text-white mt-0.5 flex flex-col gap-0.5">
                <span>📥 Dépôts: <span className="text-green-400">{pendingDepositsCount}</span> ({pendingDepositsSum.toLocaleString()} F)</span>
                <span>📤 Retraits: <span className="text-amber-400">{pendingWithdrawCount}</span> ({pendingWithdrawNetToPay.toLocaleString()} F)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR - COMPACT HORIZONTAL BAR */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-1.5 mb-4 scrollbar-none pb-1">
        <button
          onClick={() => setActiveAdminTab('deposits')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${activeAdminTab === 'deposits' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Dépôts</span>
          {pendingDepositsCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-mono px-1 py-0.2 rounded-full animate-pulse">{pendingDepositsCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('withdrawals')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${activeAdminTab === 'withdrawals' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Retraits</span>
          {pendingWithdrawCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-mono px-1 py-0.2 rounded-full animate-pulse">{pendingWithdrawCount}</span>
          )}
        </button>
         <button
          onClick={() => setActiveAdminTab('users')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors ${activeAdminTab === 'users' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Utilisateurs ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('products')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors ${activeAdminTab === 'products' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Produits</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('investments')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1 ${activeAdminTab === 'investments' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>🛡️ Payés ({investments.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('platform')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors ${activeAdminTab === 'platform' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Système</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('transactions')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors ${activeAdminTab === 'transactions' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Transactions</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('support')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 ${activeAdminTab === 'support' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Support</span>
          {supportMessages.filter(m => m.sender === 'user' && m.status === 'unread').length > 0 && (
            <span className="bg-emerald-500 text-white text-[9px] font-mono px-1 py-0.2 rounded-full animate-bounce">
              {supportMessages.filter(m => m.sender === 'user' && m.status === 'unread').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('proofs')}
          className={`py-1.5 px-3 text-[11px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1 ${activeAdminTab === 'proofs' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
        >
          <span>Annonces</span>
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. DEPOSITS QUEUE */}
      {activeAdminTab === 'deposits' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Demandes de Dépôts reçues</h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">Total : {deposits.length} entrées</span>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                id="btn-delete-refused-deposits"
                type="button"
                onClick={handleDeleteRefusedDeposits}
                className="flex-1 md:flex-initial px-3 py-1.5 bg-red-650 hover:bg-red-600 hover:text-white text-red-100 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer Refusés</span>
              </button>
              <button
                id="btn-delete-pending-deposits"
                type="button"
                onClick={handleDeletePendingDeposits}
                className="flex-1 md:flex-initial px-3 py-1.5 bg-amber-650/40 hover:bg-amber-600 hover:text-white text-amber-200 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer En Attente</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Montant</th>
                  <th className="p-3">Opérateur & Référence</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Reçu</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">Aucun dépôt enregistré.</td>
                  </tr>
                ) : (
                  deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-white">{dep.userName}</td>
                      <td className="p-3 text-yellow-400 font-bold font-mono">+{dep.amount.toLocaleString()} XOF</td>
                      <td className="p-3">
                        <span className="block text-slate-300">{dep.operator}</span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{dep.reference}</span>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px]">{new Date(dep.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        {dep.receiptImage ? (
                          <button
                            onClick={() => setLightboxImg(dep.receiptImage)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-yellow-500/20 text-yellow-500 text-[10px] font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Aucun</span>
                        )}
                      </td>
                      <td className="p-3">
                        {(dep.status === 'approved' || dep.status === 'completed' || dep.status === 'success') && (
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-[9px] font-bold font-mono">RÉUSSI</span>
                        )}
                        {(dep.status === 'rejected' || dep.status === 'failed' || dep.status === 'cancelled') && (
                          <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-[9px] font-bold font-mono">REFUSÉ / ÉCHOUÉ</span>
                        )}
                        {dep.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded text-[9px] font-bold font-mono animate-pulse">EN ATTENTE</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {dep.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="w-7 h-7 bg-green-500 text-slate-950 flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                              title="Valider le dépôt"
                            >
                              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(dep.id)}
                              className="w-7 h-7 bg-red-500 text-white flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                              title="Refuser le dépôt"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">Vérifié</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. WITHDRAWALS QUEUE */}
      {activeAdminTab === 'withdrawals' && (
        <div className="space-y-6">
          {/* Global Toggle Settings Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-left">
            <h4 className="font-display font-bold text-xs text-yellow-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span>⚙️</span>
              <span>Contrôle Système Global des Retraits</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ce commutateur permet de suspendre instantanément toutes les demandes de retrait sur la plateforme (par ex. pendant une période de maintenance). Lorsque les retraits sont bloqués, les membres reçoivent un avis poli s'ils tentent de retirer leurs fonds.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs uppercase font-extrabold text-white block">Statut des retraits</span>
                <span className="text-[10px] text-slate-500 font-mono block">État de l'interrupteur global de décaissement</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    DataStore.setWithdrawalsBlocked(false);
                    setGlobalWithdrawBlocked(false);
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    !globalWithdrawBlocked 
                      ? 'bg-green-500 text-slate-950 shadow-md' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Retraits Ouverts / Autorisés
                </button>
                <button
                  onClick={() => {
                    DataStore.setWithdrawalsBlocked(true);
                    setGlobalWithdrawBlocked(true);
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    globalWithdrawBlocked 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400'
                  }`}
                >
                  🔴 Bloquer Tous les Retraits (Global)
                </button>
              </div>
            </div>
          </div>

          {/* HORAIRES PROGRAMMÉS DES DEMANDES DE RETRAIT */}
          {(() => {
            const sched = categorySchedules.withdrawals || DEFAULT_CATEGORY_SCHEDULES.withdrawals;
            const status = DataStore.isCategoryOpen('withdrawals', currentSystemTime);
            const isSaving = isSavingSchedule === 'withdrawals';

            return (
              <div className="bg-slate-900/60 rounded-2xl p-5 space-y-4 shadow-lg shadow-black/25 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Horaires des Demandes de Retrait</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                          status.isOpen
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {status.isOpen ? '🟢 OUVERT' : '🔒 FERMÉ'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Définissez la plage horaire quotidienne durant laquelle les utilisateurs sont autorisés à soumettre des demandes de retrait.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 text-xs text-slate-300 shrink-0 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-400">Heure actuelle :</span>
                    <span className="font-mono font-bold text-amber-300">
                      {currentSystemTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Mode Buttons */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Mode de fonctionnement
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateCategorySchedule('withdrawals', { mode: 'auto' })}
                        className={`py-2 px-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer shadow-xs ${
                          sched.mode === 'auto'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCategorySchedule('withdrawals', { mode: 'open' })}
                        className={`py-2 px-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer shadow-xs ${
                          sched.mode === 'open'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        Ouvrir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCategorySchedule('withdrawals', { mode: 'closed' })}
                        className={`py-2 px-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer shadow-xs ${
                          sched.mode === 'closed'
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-950/30'
                            : 'bg-slate-950/70 text-slate-400 hover:text-white'
                        }`}
                      >
                        Fermer
                      </button>
                    </div>
                  </div>

                  {/* Hours Inputs */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Heure d'ouverture des retraits
                        </label>
                        <input
                          type="time"
                          value={timeInputs.withdrawals.openTime}
                          onFocus={() => { editingCategoryRef.current = 'withdrawals'; }}
                          onBlur={() => { editingCategoryRef.current = null; }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTimeInputs(prev => ({
                              ...prev,
                              withdrawals: { ...prev.withdrawals, openTime: val }
                            }));
                          }}
                          className="w-full bg-slate-950/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono shadow-inner focus:outline-none focus:bg-slate-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Heure de fermeture des retraits
                        </label>
                        <input
                          type="time"
                          value={timeInputs.withdrawals.closeTime}
                          onFocus={() => { editingCategoryRef.current = 'withdrawals'; }}
                          onBlur={() => { editingCategoryRef.current = null; }}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTimeInputs(prev => ({
                              ...prev,
                              withdrawals: { ...prev.withdrawals, closeTime: val }
                            }));
                          }}
                          className="w-full bg-slate-950/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono shadow-inner focus:outline-none focus:bg-slate-950"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={timeInputs.withdrawals.enabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setTimeInputs(prev => ({
                              ...prev,
                              withdrawals: { ...prev.withdrawals, enabled: val }
                            }));
                          }}
                          className="rounded bg-slate-900 border-0 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-300 font-medium">Activer la règle horaire sur les retraits</span>
                      </label>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                          handleUpdateCategorySchedule('withdrawals', {
                            openTime: timeInputs.withdrawals.openTime,
                            closeTime: timeInputs.withdrawals.closeTime,
                            enabled: timeInputs.withdrawals.enabled
                          });
                        }}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/20 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Enregistrement...' : 'Enregistrer Horaires Retraits'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Demandes de retraits passées</h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">Total : {withdrawals.length} demandes</span>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  id="btn-delete-validated-withdrawals"
                  type="button"
                  onClick={handleDeleteValidatedWithdrawals}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-650 hover:bg-red-600 hover:text-white text-red-100 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer Validés</span>
                </button>
                <button
                  onClick={handleExportWithdrawalsToGoogle}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <span>📊 Exporter Coordonnées Google Sheets</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                    <th className="p-3">Destinataire</th>
                    <th className="p-3">Numéro Sollicité</th>
                    <th className="p-3 font-mono text-yellow-400">Brut demandé</th>
                    <th className="p-3 font-mono text-red-400">Frais (12%)</th>
                    <th className="p-3 font-mono text-emerald-450">À envoyer (Net)</th>
                    <th className="p-3">Opérateur</th>
                    <th className="p-3">Date de Réception</th>
                    <th className="p-3">Justificatif</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-slate-500">Aucun retrait en attente.</td>
                    </tr>
                  ) : (
                    withdrawals.map((wth) => {
                      const fee = wth.fee ?? Math.round(wth.amount * 0.12);
                      const net = wth.netAmount ?? (wth.amount - fee);
                      const userForWth = users.find(u => u.id === wth.userId);
                      return (
                        <tr key={wth.id} className="hover:bg-slate-900/30">
                          <td className="p-3">
                            <div className="font-semibold text-white">{wth.userName}</div>
                            {userForWth?.bankCardNumber && (
                              <div className="text-[9px] text-blue-400 font-extrabold uppercase mt-0.5 tracking-wider leading-none" title={`Titulaire: ${userForWth.bankCardName}`}>
                                💳 {userForWth.bankCardOperator} lié
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-450">{wth.number}</td>
                          <td className="p-3 text-slate-400 font-mono">-{wth.amount.toLocaleString()} F</td>
                          <td className="p-3 text-red-400 font-mono">-{fee.toLocaleString()} F</td>
                          <td className="p-3 text-emerald-400 font-bold font-mono bg-emerald-950/20">{net.toLocaleString()} F</td>
                          <td className="p-3">{wth.operator}</td>
                          <td className="p-3 text-[10px] text-slate-400">{new Date(wth.createdAt).toLocaleString()}</td>
                          <td className="p-3">
                            {wth.proof_file_url ? (
                              wth.proof_file_url.startsWith("data:application/pdf") ? (
                                <a 
                                  href={wth.proof_file_url} 
                                  download={`justificatif-retrait-${wth.id}.pdf`}
                                  className="px-2 py-1 bg-red-500/20 border border-red-500/40 hover:bg-red-500/40 text-red-300 rounded text-[9px] font-black font-mono transition-all inline-flex items-center gap-1 cursor-pointer"
                                  title="Télécharger justificatif PDF"
                                >
                                  📄 PDF
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImg(wth.proof_file_url!)}
                                  className="px-2 py-1 bg-[#1b64d9]/20 border border-[#1b64d9]/40 hover:bg-[#1b64d9]/40 text-[#5da0ff] rounded text-[9px] font-black font-mono transition-all inline-flex items-center gap-1 cursor-pointer"
                                  title="Voir l'image justificatif"
                                >
                                  🖼️ Image
                                </button>
                              )
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono italic">Aucun</span>
                            )}
                          </td>
                          <td className="p-3">
                            {wth.status === 'approved' && (
                              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-[9px] font-bold font-mono">EXPÉDIÉ (2H)</span>
                            )}
                            {wth.status === 'rejected' && (
                              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-[9px] font-bold font-mono">REJETÉ</span>
                            )}
                            {wth.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded text-[9px] font-bold font-mono animate-pulse">ATTENTE</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {wth.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSendavaPayPayout(wth.id)}
                                  className="w-7 h-7 bg-blue-600 text-white flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                                  title="Payer automatiquement via SendavaPay Payout (Mobile Money)"
                                >
                                  <Zap className="w-3.5 h-3.5 stroke-[3] fill-white" />
                                </button>
                                <button
                                  onClick={() => handleApproveWithdrawal(wth.id)}
                                  className="w-7 h-7 bg-green-500 text-slate-950 flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                                  title="Valider manuellement"
                                >
                                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(wth.id)}
                                  className="w-7 h-7 bg-red-500 text-white flex items-center justify-center rounded-lg hover:scale-115 transition-transform"
                                  title="Rejeter et recréditer"
                                >
                                  <X className="w-4 h-4 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px] font-mono">Résolu</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. USERS CONFIGURATION TABLE */}
      {activeAdminTab === 'users' && (() => {
        const filteredUsers = users.filter((u) => {
          const query = userSearchQuery.trim().toLowerCase();
          if (!query) return true;
          
          const uDigits = (u.whatsapp || '').replace(/\D/g, '');
          const qDigits = query.replace(/\D/g, '');
          const isPhoneMatch = qDigits.length >= 4 && uDigits.length >= 4 && (uDigits.includes(qDigits) || qDigits.includes(uDigits));

          return (
            (u.name || '').toLowerCase().includes(query) ||
            (u.whatsapp || '').toLowerCase().includes(query) ||
            (u.country || '').toLowerCase().includes(query) ||
            isPhoneMatch
          );
        }).sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.id.startsWith('u-') ? parseInt(a.id.substring(2)) || 0 : 0);
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.id.startsWith('u-') ? parseInt(b.id.substring(2)) || 0 : 0);
          return timeB - timeA;
        });

        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
            {/* INSTRUCTION BANNER FOR DESIGNATING ADMINS / REMOVING SPONSORS */}
            <div className="bg-[#0b132a]/80 border border-yellow-500/10 rounded-xl p-3.5 mb-5 space-y-1 text-xs">
              <span className="font-bold text-yellow-400 block">💡 Administration des Rôles & Affiliations :</span>
              <p className="text-slate-400 leading-relaxed">
                Pour <strong>nommer d'autres comptes administrateurs</strong>, recherchez l'utilisateur concerné et cliquez sur le bouton de modification <span className="text-slate-200">⚙️</span>, puis changez son rôle en <em>"Administrateur Système"</em>. De la même façon, vous pouvez directement modifier ou <strong>supprimer son parrain / sponsor direct</strong>.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider font-semibold">Portefeuille des Affiliés</h3>
                <span className="text-[10px] text-slate-400">Total : {users.length} comptes enregistrés</span>
              </div>

              {/* Search user, Export and Supprimer buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleExportUsersToGoogle}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <span>📊 Exporter Contacts</span>
                </button>

                <button
                  onClick={handleForceCleanupUsers}
                  disabled={isCleaning}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>🗑️ Supprimer les comptes (Sauf Admin)</span>
                </button>

                <div className="relative w-full md:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur (nom, WhatsApp...)"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                    <th className="p-3">Utilisateur / Inscription</th>
                    <th className="p-3 font-mono">WhatsApp & Pays</th>
                    <th className="p-3">Parrain / Sponsor</th>
                    <th className="p-3 text-center">Filleuls Directs</th>
                    <th className="p-3 text-right">Mouvements Financiers (XOF)</th>
                    <th className="p-3 text-center">VIP Actifs</th>
                    <th className="p-3 text-center">Rôle & Statut</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                        Aucun utilisateur trouvé correspondant à votre recherche
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const cleanReferredBy = (user.referredBy || '').trim().toUpperCase();
                      const sponsor = users.find(u => 
                        (u.id && u.id.trim().toUpperCase() === cleanReferredBy) || 
                        (u.referralCode && u.referralCode.trim().toUpperCase() === cleanReferredBy)
                      );
                      
                      const directRefs = users.filter(u => {
                        const uReferredBy = (u.referredBy || '').trim().toUpperCase();
                        if (!uReferredBy) return false;
                        const myId = (user.id || '').trim().toUpperCase();
                        const myCode = (user.referralCode || '').trim().toUpperCase();
                        return uReferredBy === myId || (myCode && uReferredBy === myCode);
                      });

                      // Compute deposit and withdrawal aggregates
                      const userApprovedDepositsNum = deposits
                        .filter(d => d.userId === user.id && (d.status === 'approved' || d.status === 'completed' || d.status === 'success'))
                        .reduce((sum, d) => sum + d.amount, 0);

                      const userApprovedWithdrawalsNum = withdrawals
                        .filter(w => w.userId === user.id && (w.status === 'approved' || w.status === 'completed' || w.status === 'success'))
                        .reduce((sum, w) => sum + w.amount, 0);

                      const userPendingDepositsNum = deposits
                        .filter(d => d.userId === user.id && d.status === 'pending')
                        .reduce((sum, d) => sum + d.amount, 0);

                      const userPendingWithdrawalsNum = withdrawals
                        .filter(w => w.userId === user.id && w.status === 'pending')
                        .reduce((sum, w) => sum + w.amount, 0);

                      // Get active VIP investment details
                      const activeUserPlans = investments.filter(i => i.userId === user.id && i.status === 'active');
                      const activeUserPlansValue = activeUserPlans.reduce((sum, i) => sum + i.price, 0);

                      const userTotalCommission = commissions
                        .filter(c => c.userId === user.id)
                        .reduce((sum, c) => sum + (c.amount || 0), 0);

                      return (
                        <tr key={user.id} className={`hover:bg-slate-900/20 ${user.isBlocked ? 'bg-red-500/5' : ''}`}>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-white text-[13px]">{user.name}</span>
                              {user.withdrawBlocked && (
                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase font-mono leading-none">🚫 Retrait Bloqué</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 mt-1 text-[10px] text-slate-400">
                              <span className="font-mono">Inscrit le : {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-extrabold uppercase rounded font-mono leading-none tracking-wider" title="Appareil d'inscription">
                                  📱 {user.device || 'Ordinateur'}
                                </span>
                                <span className="text-slate-500 text-[8px] font-mono select-all">ID: {user.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            {user.whatsapp ? (
                              <div className="space-y-1">
                                <a 
                                  href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-slate-300 hover:text-green-400 font-bold flex items-center gap-1 transition-colors text-[11px]"
                                >
                                  <span>📱</span>
                                  <span>{user.whatsapp}</span>
                                </a>
                                <span className="text-[10px] text-slate-400 font-sans block">🚩 {user.country || 'N/A'}</span>
                                {user.bankCardNumber && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/25 rounded text-[8.5px] font-black text-blue-400 uppercase mt-1.5 tracking-wider leading-none" title={`Compte lié: ${user.bankCardOperator} - ${user.bankCardNumber} (${user.bankCardName})`}>
                                    💳 Compte lié
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">N/A</span>
                            )}
                          </td>
                          <td className="p-3">
                            {sponsor ? (
                              <div className="space-y-0.5">
                                <span className="font-medium text-slate-200 block text-[11px]">{sponsor.name}</span>
                                <span className="text-[9px] text-yellow-500 font-mono block">Code: {sponsor.referralCode}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Aucun (Direct)</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {directRefs.length > 0 ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold rounded-full">
                                  {directRefs.length} filleul(s)
                                </span>
                                <span className="text-[8px] text-slate-500 block mt-0.5 max-w-[120px] truncate">
                                  ({directRefs.map(r => r.name.split(' ')[0]).join(', ')})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px] italic">0 filleul</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-y-1 bg-slate-950/40 rounded-xl">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-semibold uppercase">Solde :</span>
                              <span className="font-bold font-mono text-yellow-400 text-xs">{user.balance.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-[9px] font-mono mt-1 pt-1 border-t border-slate-800/60">
                              <span className="text-emerald-400 font-bold" title="Total Dépôts Approuvés">
                                📥 Dépôts : +{userApprovedDepositsNum.toLocaleString()} F
                              </span>
                              <span className="text-red-400 font-bold" title="Total Retraits Approuvés">
                                📤 Retraits : -{userApprovedWithdrawalsNum.toLocaleString()} F
                              </span>
                              {userPendingDepositsNum > 0 && (
                                <span className="text-amber-400 font-bold text-[8.5px]" title="Dépôt en attente de validation">
                                  ⏳ Attente Dépôt : +{userPendingDepositsNum.toLocaleString()} F
                                </span>
                              )}
                              {userPendingWithdrawalsNum > 0 && (
                                <span className="text-amber-400 font-bold text-[8.5px]" title="Retrait en attente de validation">
                                  ⏳ Attente Retrait : -{userPendingWithdrawalsNum.toLocaleString()} F
                                </span>
                              )}
                              {userTotalCommission > 0 && (
                                <span className="text-blue-400 font-bold text-[8.5px]" title="Total commissions">
                                  🎁 Commissions : +{userTotalCommission.toLocaleString()} F
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {activeUserPlans.length > 0 ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-1.5 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/25 text-[10px] font-extrabold rounded-md">
                                  {activeUserPlans.length} VIP
                                </span>
                                <span className="text-[9px] text-slate-450 font-mono mt-0.5 block">
                                  {activeUserPlansValue.toLocaleString()} F
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px] italic font-mono">Aucun</span>
                            )}
                          </td>
                          <td className="p-3 text-center space-y-1">
                            <div>
                              <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                {user.role === 'admin' ? 'SYS ADMIN 👑' : 'INVESTISSEUR 💼'}
                              </span>
                            </div>
                            <div>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${user.isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {user.isBlocked ? 'Bloqué 🚫' : 'Actif ✅'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditUserModal(user)}
                                className="w-7 h-7 bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center rounded duration-150"
                                title="Modifier les montants/droits"
                              >
                                <Edit className="w-3.5 h-3.5 text-slate-300" />
                              </button>
                              <button
                                onClick={() => handleBlockToggle(user.id, user.isBlocked)}
                                className={`w-7 h-7 flex items-center justify-center rounded duration-150 ${user.isBlocked ? 'bg-red-500 text-slate-950' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-red-400'}`}
                                title={user.isBlocked ? "Débloquer le compte" : "Bloquer l'investisseur"}
                              >
                                {user.isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.name || user.id)}
                                className="w-7 h-7 bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-900 flex items-center justify-center rounded duration-150 group"
                                title="Supprimer définitivement le compte"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* LIVE SPONSORSHIP RELATIONS & NETWORKS */}
            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <div className="mb-4">
                <h4 className="font-display font-bold text-xs text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>📈</span>
                  <span>Suivi en Temps Réel des Liens de Parrainage (MLM)</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ci-dessous s'affiche la liste de tous les filleuls qui se sont inscrits en utilisant un lien de parrainage de nos membres.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter(u => u.referredBy).length === 0 ? (
                  <div className="col-span-2 p-6 rounded-2xl bg-slate-950/20 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                    Aucun filleul actif ne s'est inscrit via un lien pour le moment.
                  </div>
                ) : (
                  users.filter(u => u.referredBy).map((filleul) => {
                    const cleanRef = (filleul.referredBy || '').trim().toUpperCase();
                    const refDigits = cleanRef.replace(/\D/g, '');
                    const parrain = users.find(u => {
                      const uIdUpper = u.id ? u.id.trim().toUpperCase() : '';
                      const uCodeUpper = u.referralCode ? u.referralCode.trim().toUpperCase() : '';
                      const uPhoneDigits = u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '';
                      
                      if (uIdUpper === cleanRef) return true;
                      if (uCodeUpper && uCodeUpper === cleanRef) return true;
                      if (uPhoneDigits && refDigits && (uPhoneDigits.endsWith(refDigits) || refDigits.endsWith(uPhoneDigits))) {
                        return true;
                      }
                      return false;
                    });
                    return (
                      <div 
                        key={filleul.id} 
                        className="p-3 rounded-xl bg-slate-950/60 border border-yellow-500/5 hover:border-yellow-500/20 flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white block">{filleul.name}</span>
                            <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-1 py-0.2 rounded font-mono uppercase">Filleul</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            WhatsApp: <span className="font-mono text-slate-200">{filleul.whatsapp}</span> | Pays: <span className="text-slate-300">{filleul.country}</span>
                          </p>
                          <span className="text-[9px] text-slate-500 block">
                            Inscrit le : {new Date(filleul.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-right border-l border-slate-800 pl-4 space-y-1.5 flex flex-col items-end justify-center">
                          <div>
                            <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Parrain / Sponsor</span>
                            <span className="text-xs font-bold text-yellow-500 block">
                              {parrain ? parrain.name : "Code inconnu"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              WA: {parrain ? parrain.whatsapp : "N/A"}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSponsor(filleul.id)}
                            className="text-[9px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 rounded px-2 py-0.5 duration-100 flex items-center gap-1 cursor-pointer"
                            title="Supprimer ce lien d'affiliation"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. PRODUCTS MANAGEMENT */}
      {activeAdminTab === 'products' && (
        <div className="space-y-6">
          {/* CONTRÔLE DE DISPONIBILITÉ DES PRODUITS BIEN-ÊTRE (OUVERT / FERMÉ) */}
          {(() => {
            const sched = categorySchedules.wellbeing || DEFAULT_CATEGORY_SCHEDULES.wellbeing;
            const isOpen = sched.mode !== 'closed';
            const isSaving = isSavingSchedule === 'wellbeing';

            return (
              <div className="bg-slate-900/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg shadow-black/25">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Produits Bien-être</span>
                        <span className={`text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full ${
                          isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {isOpen ? 'Disponible' : 'Indisponible'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Définir la disponibilité des produits Bien-être à l'achat pour les utilisateurs.
                      </p>
                    </div>
                  </div>

                  {isSaving && (
                    <span className="text-xs text-amber-300 font-mono animate-pulse">
                      Synchronisation Supabase...
                    </span>
                  )}
                </div>

                {/* Main Action Buttons: Ouvert / Fermé */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleUpdateCategorySchedule('wellbeing', { mode: 'open' })}
                    className={`py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer outline-none border-none ${
                      isOpen
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/40'
                        : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 hover:bg-slate-950/90'
                    }`}
                    id="admin-btn-wellbeing-ouvert"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Ouvert</span>
                    {isOpen && <CheckCircle className="w-4 h-4 ml-1 text-white" />}
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleUpdateCategorySchedule('wellbeing', { mode: 'closed' })}
                    className={`py-3 px-4 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer outline-none border-none ${
                      !isOpen
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950/40 ring-2 ring-red-400/40'
                        : 'bg-slate-950/60 text-slate-400 hover:text-red-300 hover:bg-slate-950/90'
                    }`}
                    id="admin-btn-wellbeing-ferme"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Fermé</span>
                    {!isOpen && <CheckCircle className="w-4 h-4 ml-1 text-white" />}
                  </button>
                </div>

                {/* Status Explanation Card */}
                <div className={`p-3.5 rounded-xl flex items-center gap-3 text-xs shadow-xs ${
                  isOpen ? 'bg-emerald-950/25 text-emerald-200' : 'bg-red-950/25 text-red-200'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isOpen ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      {isOpen ? 'Les produits Bien-être sont disponibles à l’achat.' : 'Les produits Bien-être sont indisponibles à l’achat.'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {isOpen 
                        ? 'Les utilisateurs peuvent voir et souscrire aux forfaits Bien-être.'
                        : 'L’accès aux nouveaux achats de forfaits Bien-être est suspendu.'}
                    </span>
                  </div>
                </div>

                {/* Information Card confirming investments guarantee */}
                <div className="bg-slate-950/35 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-400 shadow-xs">
                  <span className="text-amber-400 text-sm leading-none mt-0.5">ℹ️</span>
                  <p className="text-[11.5px] leading-relaxed">
                    <strong className="text-slate-200">Continuité garantie :</strong> Les produits déjà achetés restent actifs jusqu’à la fin de leur cycle, même si l’administrateur met les nouveaux achats sur Fermé. À la fin du cycle, les revenus prévus sont versés automatiquement au solde de l’utilisateur. Le statut est synchronisé avec Supabase et la page Produit.
                  </p>
                </div>
              </div>
            );
          })()}

          {/* New VIP creator Form */}
          <div className="bg-slate-900/40 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
                <Plus className="w-4 h-4 text-yellow-500" />
                <span>Créer une nouvelle Offre VIP</span>
              </h3>
              <button
                type="button"
                onClick={handleDeleteAllProducts}
                className="px-3.5 py-1.5 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer tous les produits d'un coup</span>
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau VIP (Indice)</label>
                <input
                  type="number"
                  required
                  value={newVipLevel}
                  onChange={(e) => setNewVipLevel(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nom du Plan d'investissement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VIP Gold Rubis 5"
                  value={newVipName}
                  onChange={(e) => setNewVipName(e.target.value)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prix d'acquisition (XOF)</label>
                <input
                  type="number"
                  required
                  value={newVipPrice}
                  onChange={(e) => setNewVipPrice(parseInt(e.target.value) || 3000)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-yellow-400 font-mono focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Rendement Journalier (XOF)
                </label>
                <input
                  type="number"
                  required
                  value={newVipDaily}
                  onChange={(e) => setNewVipDaily(parseInt(e.target.value) || 600)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-green-400 font-mono focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Durée de l'effet (Jours)
                </label>
                <input
                  type="number"
                  required
                  value={newVipDuration}
                  onChange={(e) => setNewVipDuration(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slogan / Tag visuel</label>
                <input
                  type="text"
                  placeholder="Ex: Populaire, Offre Spéciale"
                  value={newVipTag}
                  onChange={(e) => setNewVipTag(e.target.value)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">URL de l'image du produit (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Saisissez l'URL de l'image de votre choix pour ce produit"
                  value={newVipImageUrl}
                  onChange={(e) => setNewVipImageUrl(e.target.value)}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Catégorie du Produit</label>
                <select
                  value={newVipCategory}
                  onChange={(e) => setNewVipCategory(e.target.value as 'stability' | 'wellbeing')}
                  className="w-full bg-slate-950/80 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none shadow-inner"
                >
                  <option value="stability">Stabilité (Plans standard)</option>
                  <option value="wellbeing">Bien-être (Plans bien-être)</option>
                </select>
              </div>



              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl gold-bg-gradient text-slate-950 font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 flex items-center space-x-1 shadow-md shadow-amber-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enregistrer et Publier le Produit</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of custom VIP packages */}
          <div className="space-y-6">
            {/* 1. Plans Stabilité VIP */}
            <div>
              <h4 className="text-sm font-display font-bold text-yellow-500 uppercase tracking-widest mb-4">
                📦 Catalogue de tous les Produits (Stabilité & Bien-être)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => {
                  const isCurrentlyBlocked = p.isBlocked === true;
                  const formattedReopenTime = p.reopenDateTime 
                    ? new Date(p.reopenDateTime).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null;

                  return (
                    <div key={p.id} className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${isCurrentlyBlocked ? 'bg-red-950/25' : 'bg-slate-950/60'}`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                              <span className="text-[10px] text-yellow-500 font-mono uppercase font-bold">Niveau {p.vipLevel}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-wider ${
                                p.category === 'wellbeing'
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : 'bg-blue-500/15 text-blue-300'
                              }`}>
                                {p.category === 'wellbeing' ? '🌸 Bien-être' : '💎 Stabilité'}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full ${isCurrentlyBlocked ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                            </div>
                            <h4 className="font-display font-medium text-white text-sm block mt-1.5">{p.name}</h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="text-slate-350 hover:text-yellow-400 p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg duration-150 shadow-xs"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="text-red-400 hover:text-red-500 p-1.5 bg-red-500/10 rounded-lg duration-150 shadow-xs"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 mt-4 text-xs font-mono">
                          <div className="flex justify-between text-slate-400">
                            <span>Prix d'achat :</span>
                            <span className="text-white font-bold">{p.price.toLocaleString()} XOF</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Dividendes :</span>
                            <span className="text-green-400">+{p.dailyReturn.toLocaleString()} F / Jour</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Durée :</span>
                            <span className="text-yellow-400">{p.durationDays} Jours</span>
                          </div>
                          <div className="flex justify-between text-slate-400 font-bold pt-1.5 mt-1.5 font-mono">
                            <span>Retour brut :</span>
                            <span className="text-white">{(p.dailyReturn * p.durationDays).toLocaleString()} XOF</span>
                          </div>

                          {isCurrentlyBlocked && (
                            <div className="bg-red-950/35 rounded-xl p-2.5 mt-3 font-sans shadow-xs">
                              <p className="text-[10px] text-red-400 font-bold flex items-center gap-1.5">
                                <Lock className="w-3 h-3" />
                                <span>INVESTISSEMENT BLOQUÉ</span>
                              </p>
                              {formattedReopenTime && (
                                <p className="text-[9px] text-slate-300 mt-0.5 font-mono">
                                  Réouverture le : {formattedReopenTime}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-3">
                        {schedulingBlockProductId === p.id ? (
                          <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl shadow-xs">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">HEURE DE RÉOUVERTURE (OPTIONNELLE)</label>
                              <input
                                type="datetime-local"
                                value={blockReopenTime}
                                onChange={(e) => setBlockReopenTime(e.target.value)}
                                className="w-full bg-slate-950/80 text-xs text-yellow-400 p-2 rounded-lg focus:outline-none shadow-inner"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirmProductBlock(p.id, false)}
                                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-xs"
                              >
                                Bloquer à vie
                              </button>
                              <button
                                onClick={() => handleConfirmProductBlock(p.id, true)}
                                className="flex-1 py-1.5 gold-bg-gradient text-slate-950 rounded-lg text-[10px] font-bold uppercase transition-all shadow-xs"
                                disabled={!blockReopenTime}
                              >
                                Planifier Heure
                              </button>
                            </div>
                            <button
                              onClick={() => setSchedulingBlockProductId(null)}
                              className="w-full py-1 text-slate-500 hover:text-slate-400 text-[10px] uppercase font-bold text-center"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleBlockProduct(p.id, isCurrentlyBlocked)}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs ${isCurrentlyBlocked ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'}`}
                          >
                            {isCurrentlyBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Débloquer immédiatement</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Bloquer / Planifier Heure</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>



          </div>
        </div>
      )}

      {/* 5. PLATFORM UTILITIES (PROMO CODES & GLOBAL NOTIFICATIONS TOOL) */}
      {activeAdminTab === 'platform' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Broadcast */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-yellow-500" />
              <span>Diffuser une Notification Globale</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ce formulaire enverra une alerte financière instantanée visible en temps réel sur le fil de notifications de tous les membres enregistrés sur Dreampod.
            </p>

            <form onSubmit={handleSendGlobalAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Titre de l'Alerte</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 🎁 Maintenance des serveurs de paiement ou Bonus du Week-end !"
                  value={globalNotifTitle}
                  onChange={(e) => setGlobalNotifTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description détaillée</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Saisissez le contenu du message public officiel ici..."
                  value={globalNotifMessage}
                  onChange={(e) => setGlobalNotifMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none placeholder-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all"
              >
                Envoyer le message d'alerte global
              </button>
            </form>
          </div>

          {/* Promo code creator */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Gift className="w-4 h-4 text-yellow-500" />
              <span>Générer un Code Bonus Cadeau</span>
            </h3>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Créez des invitations promotionnelles gratuites. Les investisseurs peuvent saisir ce code sous leur panel "Bonus" pour approvisionner leur solde principal.
            </p>

            <form onSubmit={handleCreateBonusCode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Code Promotionnel</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: WEEKEND100"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-yellow-400 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Valeur Créditée (XOF)</label>
                  <input
                    type="number"
                    required
                    value={newCodeAmount}
                    onChange={(e) => setNewCodeAmount(parseInt(e.target.value) || 500)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-green-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nombre total d'utilisations</label>
                <input
                  type="number"
                  required
                  value={newCodeMax}
                  onChange={(e) => setNewCodeMax(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white border border-yellow-500/30 text-xs font-display font-bold uppercase tracking-wider transition-all"
              >
                Générer et publier le Code promotionnel
              </button>
            </form>

            {/* List of active codes */}
            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">Codes actifs répertoriés</span>
              <div className="space-y-2">
                {bonusCodes.map((bc, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-yellow-400 text-sm">{bc.code}</span>
                      <span className="text-slate-500 text-[10px] block mt-0.5">Crédit immédiat : <strong className="text-white">{bc.amount.toLocaleString()} XOF</strong></span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {bc.usedCount} / {bc.maxUses} Utilisés
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MLM Rate Configuration Section */}
          <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 col-span-1 lg:col-span-2 shadow-xl">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-yellow-500">🎯</span>
              <span>Régler les Commissions MLM (Niveaux Parrainage)</span>
            </h3>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Définissez les pourcentages de bonus de commission à distribuer automatiquement aux parrains lors de l'achat de forfaits VIP.
            </p>

            <form onSubmit={handleSaveMlmRates} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau 1 (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={mlmRate1}
                    onChange={(e) => setMlmRate1(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/60 focus:border-yellow-500/40 rounded-xl py-2 px-3 text-sm text-green-400 font-mono focus:outline-none font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block text-center">Filleuls directs</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau 2 (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={mlmRate2}
                    onChange={(e) => setMlmRate2(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/60 focus:border-yellow-500/40 rounded-xl py-2 px-3 text-sm text-yellow-500 font-mono focus:outline-none font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block text-center">Niveau direct + 1</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Niveau 3 (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={mlmRate3}
                    onChange={(e) => setMlmRate3(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700/60 focus:border-yellow-500/40 rounded-xl py-2 px-3 text-sm text-blue-400 font-mono focus:outline-none font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block text-center">Niveau direct + 2</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="text-yellow-500">🌐</span>
                  <span>Domaine de Parrainage Officiel (Optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: gold_avenue-dreampod.vercel.app ou https://mes-investissements.com"
                  value={referralDomain}
                  onChange={(e) => setReferralDomain(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-yellow-400 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                  Si défini, tous les liens de parrainage générés pour les utilisateurs utiliseront ce domaine principal (ex : <code>https://votre-domaine.com/?ref=CODE</code>). Laissez vide pour utiliser l'adresse courante du navigateur.
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="text-green-500">💬</span>
                  <span>Lien du Groupe WhatsApp</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://chat.whatsapp.com/..."
                  value={whatsappGroup}
                  onChange={(e) => setWhatsappGroup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-green-400 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                  Le lien officiel que les membres utiliseront pour rejoindre votre groupe de discussion WhatsApp.
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="text-emerald-500">📢</span>
                  <span>Lien du Canal WhatsApp</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://whatsapp.com/channel/..."
                  value={whatsappChannel}
                  onChange={(e) => setWhatsappChannel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-emerald-400 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                  Le lien officiel pour s'abonner et recevoir les actualités & informations exclusives sur votre canal de diffusion WhatsApp.
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="text-blue-500">📞</span>
                  <span>Numéro de Support WhatsApp (Direct)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: +22670903319"
                  value={whatsappSupportNumber}
                  onChange={(e) => setWhatsappSupportNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-blue-400 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                  Le numéro de téléphone WhatsApp direct auquel les clients seront redirigés pour une assistance personnalisée (lien d'ouverture de chat wa.me).
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="text-amber-400">💳</span>
                  <span>Lien de Paiement en Ligne Officiel (SoccoPay)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://soccopay.com/pay_link.php?id=..."
                  value={onlinePaymentLink}
                  onChange={(e) => setOnlinePaymentLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-2.5 px-4 text-sm text-amber-300 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                  Lien de paiement SoccoPay officiel utilisé pour toutes les recharges en ligne des membres (actuel : <code>https://soccopay.com/pay_link.php?id=1e60369611cde7bfcdd182951ca88fd1</code>).
                </span>
              </div>

              {/* SECTION: LES DEUX IMAGES OFFICIELLES PUBLIÉES COLLÉES */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[11px] font-black text-yellow-500 uppercase tracking-widest block text-left">🛡️ Deux Images Officielles de Confiance (Bannières / Certificats)</span>
                  <span className="text-[10px] text-slate-400 mt-1 block text-left">
                    Gérez ici les deux images officielles (certificats de légalité, enregistrements, etc.) publiées côte à côte ("collées") sur l'écran d'inscription pour rassurer les membres.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image 1 Settings */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 text-left">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Image de Confiance 1</span>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Importer un fichier image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBanner1FileChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-yellow-500 file:text-slate-950 hover:file:bg-yellow-400 file:cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ou coller l'URL de l'image 1</label>
                      <input
                        type="text"
                        value={officialBanner1}
                        onChange={(e) => setOfficialBanner1(e.target.value)}
                        placeholder="Ex: https://images.unsplash.com/photo-..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 font-mono"
                      />
                    </div>

                    {officialBanner1 ? (
                      <div className="relative w-full h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex justify-center items-center">
                        <img src={officialBanner1} className="max-w-full max-h-full object-contain" alt="Image 1" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setOfficialBanner1('')}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-md text-[9px] font-black transition-all cursor-pointer shadow-md"
                          title="Supprimer cette image"
                        >
                          ❌ Supprimer
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-slate-950 rounded-lg border border-dashed border-slate-800 flex flex-col justify-center items-center text-slate-500 text-[10px]">
                        <span>Aucune image définie</span>
                      </div>
                    )}
                  </div>

                  {/* Image 2 Settings */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 text-left">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Image de Confiance 2</span>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Importer un fichier image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBanner2FileChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-yellow-500 file:text-slate-950 hover:file:bg-yellow-400 file:cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ou coller l'URL de l'image 2</label>
                      <input
                        type="text"
                        value={officialBanner2}
                        onChange={(e) => setOfficialBanner2(e.target.value)}
                        placeholder="Ex: https://images.unsplash.com/photo-..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 font-mono"
                      />
                    </div>

                    {officialBanner2 ? (
                      <div className="relative w-full h-28 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex justify-center items-center">
                        <img src={officialBanner2} className="max-w-full max-h-full object-contain" alt="Image 2" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setOfficialBanner2('')}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-md text-[9px] font-black transition-all cursor-pointer shadow-md"
                          title="Supprimer cette image"
                        >
                          ❌ Supprimer
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-slate-950 rounded-lg border border-dashed border-slate-800 flex flex-col justify-center items-center text-slate-500 text-[10px]">
                        <span>Aucune image définie</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* VISUAL COLLAGE PREVIEW */}
                {(officialBanner1 || officialBanner2) && (
                  <div className="pt-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2 text-center">Aperçu collé tel que vu par les utilisateurs :</span>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex justify-center">
                      <div className="grid grid-cols-2 gap-2 max-w-xs w-full bg-white p-2 rounded-2xl border border-slate-150 shadow-sm">
                        {officialBanner1 ? (
                          <div className="rounded-xl overflow-hidden border border-slate-100 aspect-[4/3] bg-slate-50 flex justify-center items-center">
                            <img src={officialBanner1} className="w-full h-full object-cover" alt="Banner 1" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 aspect-[4/3] bg-slate-50 flex justify-center items-center text-[8px] text-slate-400 font-bold text-center p-1">Sans Image 1</div>
                        )}
                        {officialBanner2 ? (
                          <div className="rounded-xl overflow-hidden border border-slate-100 aspect-[4/3] bg-slate-50 flex justify-center items-center">
                            <img src={officialBanner2} className="w-full h-full object-cover" alt="Banner 2" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200 aspect-[4/3] bg-slate-50 flex justify-center items-center text-[8px] text-slate-400 font-bold text-center p-1">Sans Image 2</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                💾 Enregistrer les réglages système
              </button>
            </form>
          </div>

          {/* SUPABASE CLOUD DATABASE MANAGEMENT */}
          <div id="supabase-db-section" className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 col-span-1 lg:col-span-2 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Base de Données Cloud (Supabase PostgreSQL)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                      sjvyhnxklgsgprgkihrr
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Synchronisation temps réel complète entre le site, les comptes utilisateurs et l'administration.
                  </p>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Supabase Connecté
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={supabaseTesting || supabaseSyncLoading}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {supabaseTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Test en cours...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-200" />
                    <span>Tester Connexion Supabase</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePushToSupabase}
                disabled={supabaseTesting || supabaseSyncLoading}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 text-slate-200 hover:text-white font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Save className="w-4 h-4 text-yellow-400" />
                <span>Pousser Données vers Supabase</span>
              </button>

              <button
                type="button"
                onClick={handleLivePullSupabase}
                disabled={supabaseTesting || supabaseSyncLoading}
                className="py-2.5 px-3.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 hover:text-cyan-200 font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-cyan-400 ${supabaseSyncLoading ? 'animate-spin' : ''}`} />
                <span>Récupérer Réel de Supabase</span>
              </button>
            </div>

            {/* Test result display */}
            {supabaseTestResult && (
              <div className={`p-3.5 rounded-xl border text-xs mb-3 font-mono leading-relaxed ${
                supabaseTestResult.ok 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-2">
                  <span>{supabaseTestResult.ok ? '✅ SUCCÈS :' : '⚠️ INFORMATION :'}</span>
                  <span>{supabaseTestResult.message}</span>
                </div>
                {supabaseTestResult.database && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-emerald-800/40 text-[11px]">
                    <div><span className="text-slate-400">Projet:</span> <span className="text-white font-bold">{supabaseTestResult.project || 'sjvyhnxklgsgprgkihrr'}</span></div>
                    <div><span className="text-slate-400">Tables trouvées:</span> <span className="text-white font-bold">{supabaseTestResult.tablesCount}</span></div>
                    <div><span className="text-slate-400">Table Store:</span> <span className="text-white font-bold">{supabaseTestResult.storeTableExists ? 'Oui' : 'Non'}</span></div>
                    <div><span className="text-slate-400">Table Users:</span> <span className="text-white font-bold">{supabaseTestResult.usersTableExists ? 'Oui' : 'Non'}</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Sync feedback */}
            {supabaseSyncResult && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono mb-3">
                {supabaseSyncResult}
              </div>
            )}

            {/* Schema execution info */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <span>📄</span>
                  <span>Structure SQL Complète (supabase_schema.sql)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    fetch('/supabase_schema.sql')
                      .then(r => r.text())
                      .then(sql => {
                        navigator.clipboard.writeText(sql);
                        alert("✅ Script SQL copié dans le presse-papiers ! Collez-le dans le SQL Editor de Supabase.");
                      })
                      .catch(() => {
                        alert("Le script SQL se trouve dans le fichier supabase_schema.sql à la racine du projet.");
                      });
                  }}
                  className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 rounded text-[11px] font-mono cursor-pointer"
                >
                  📋 Copier le Script SQL
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Le fichier <code className="text-emerald-300 font-mono">supabase_schema.sql</code> contient toutes les tables relationnelles (<code className="text-slate-300">store, users, deposits, withdrawals, investments, products, commissions, notifications</code>) ainsi que les politiques RLS et la publication temps réel.
              </p>
            </div>
          </div>

          {/* BASE DE DONNÉES & MAINTENANCE */}
          <div id="db-maintenance-section" className="bg-red-950/20 border border-red-900/40 rounded-2xl p-5 col-span-1 lg:col-span-2 shadow-xl">
            <h3 className="font-display font-bold text-sm text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Maintenance Critique & Remise à Zéro</span>
            </h3>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Pour des raisons de migration, de relancement ou d'un nouveau cycle d'inscriptions, supprimez définitivement tous les comptes d'utilisateurs simples du système.
              Les comptes administrateurs seront conservés et protégés de manière permanente. Cette action efface également toutes les transactions, notifications et investissements associés à ces comptes.
            </p>

            <div className="space-y-4">
              <button
                id="btn-force-cleanup-action"
                type="button"
                onClick={handleForceCleanupUsers}
                disabled={isCleaning || isResettingTransactions}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isCleaning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Suppression en cours...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer Définitivement Tous les Comptes (Sauf Admin)</span>
                  </>
                )}
              </button>

              <button
                id="btn-reset-transactions-action"
                type="button"
                onClick={handleResetAllDepositsWithdrawals}
                disabled={isCleaning || isResettingTransactions}
                className="w-full py-3 rounded-xl bg-amber-650 hover:bg-amber-500 disabled:bg-slate-800 text-white font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isResettingTransactions ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Réinitialisation en cours...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Réinitialiser Tous les Dépôts et Retraits</span>
                  </>
                )}
              </button>

              {cleanupMessage && (
                <div id="cleanup-feedback-log" className={`p-4 rounded-xl text-xs font-mono border ${
                  cleanupMessage.toLowerCase().includes("erreur") || cleanupMessage.toLowerCase().includes("exception")
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  {cleanupMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. RECENT TRANSACTIONS CONSOLIDATED FLOW */}
      {activeAdminTab === 'transactions' && (() => {
        const allTx = [
          ...deposits.map(d => ({
            id: d.id,
            userId: d.userId,
            userName: d.userName,
            type: 'Dépôt',
            amount: d.amount,
            operator: d.operator,
            reference: d.reference || 'N/A',
            status: d.status,
            createdAt: d.createdAt
          })),
          ...withdrawals.map(w => ({
            id: w.id,
            userId: w.userId,
            userName: w.userName,
            type: 'Retrait',
            amount: -w.amount,
            operator: w.operator,
            reference: w.number || 'N/A',
            status: w.status,
            createdAt: w.createdAt
          })),
          ...commissions.map(c => {
            const beneficiary = users.find(u => u.id === c.userId);
            return {
              id: c.id,
              userId: c.userId,
              userName: beneficiary ? beneficiary.name : 'Membre inconnu',
              type: 'Commission' as const,
              amount: c.amount,
              operator: `MLM Niveau ${c.level}`,
              reference: `De: ${c.fromUserName}`,
              status: 'approved' as const,
              createdAt: c.createdAt
            };
          }),
          ...investments.flatMap(inv => {
            const client = users.find(u => u.id === inv.userId);
            const clientName = client ? client.name : 'Membre inconnu';
            const txs: any[] = [];
            
            // The VIP purchase itself:
            txs.push({
              id: inv.id,
              userId: inv.userId,
              userName: clientName,
              type: 'Achat VIP' as const,
              amount: -inv.price,
              operator: inv.productName || 'VIP Plan',
              reference: `VIP-${inv.productId}`,
              status: inv.status === 'active' ? 'approved' : 'completed',
              createdAt: inv.createdAt
            });

            // The daily return payouts:
            for (let d = 1; d <= inv.daysPassed; d++) {
              const installmentTime = new Date(inv.createdAt).getTime() + d * 24 * 60 * 60 * 1000;
              const finalTime = Math.min(Date.now(), installmentTime);
              const instDate = new Date(finalTime).toISOString();
              
              txs.push({
                id: `earn-${inv.id}-${d}`,
                userId: inv.userId,
                userName: clientName,
                type: 'Revenu Quotidien' as const,
                amount: inv.dailyReturn,
                operator: `${inv.productName} (Jour ${d}/${inv.durationDays})`,
                reference: 'Crédité automatiquement',
                status: 'approved' as const,
                createdAt: instDate
              });
            }

            return txs;
          })
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const filteredTx = allTx.filter(t => {
          const query = txSearch.toLowerCase();
          const matchText = (t.userName || '').toLowerCase().includes(query) || 
                            (t.id || '').toLowerCase().includes(query) ||
                            (t.operator || '').toLowerCase().includes(query) ||
                            (t.reference || '').toLowerCase().includes(query);
          const matchType = txTypeFilter === 'all' || t.type === txTypeFilter;
          const matchStatus = txStatusFilter === 'all' || 
                              t.status === txStatusFilter || 
                              (txStatusFilter === 'approved' && (t.status === 'completed' || t.status === 'success')) ||
                              (txStatusFilter === 'rejected' && (t.status === 'failed' || t.status === 'cancelled'));
          return matchText && matchType && matchStatus;
        });

        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">🔒 Registre Général des Transactions Récentes</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Vue unifiée en temps réel de tous les flux financiers de la plateforme (dépôts, retraits, achats VIP et commissions parrainages).
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Search field */}
                <div className="relative flex-1 sm:flex-initial min-w-[180px]">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rechercher nom, réf, ID..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500/40 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Filter Type */}
                <select
                  value={txTypeFilter}
                  onChange={(e: any) => setTxTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-1.5 px-3 rounded-xl focus:outline-none focus:border-yellow-500/40 font-mono"
                >
                  <option value="all">Tous types</option>
                  <option value="Dépôt">📥 Dépôts uniquement</option>
                  <option value="Retrait">📤 Retraits uniquement</option>
                  <option value="Commission">💰 Commissions uniquement</option>
                  <option value="Achat VIP">🛍️ Achats VIP uniquement</option>
                  <option value="Revenu Quotidien">💰 Revenus Quotidiens</option>
                </select>

                {/* Filter Status */}
                <select
                  value={txStatusFilter}
                  onChange={(e: any) => setTxStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 py-1.5 px-3 rounded-xl focus:outline-none focus:border-yellow-500/40 font-mono"
                >
                  <option value="all">Tous statuts</option>
                  <option value="pending">⏳ En attente</option>
                  <option value="approved">✅ Approuvé / Complété</option>
                  <option value="rejected">❌ Rejeté / Bloqué</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto text-[11px] md:text-xs">
              <table className="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/30">
                    <th className="p-3">ID Transaction</th>
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Operateur / Détail</th>
                    <th className="p-3">Référence / Infos</th>
                    <th className="p-3">Montant (XOF)</th>
                    <th className="p-3 text-center">Date</th>
                    <th className="p-3 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                        Aucune transaction ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredTx.slice(0, 100).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/10">
                        <td className="p-3 font-mono text-[10px] text-slate-400">{tx.id}</td>
                        <td className="p-3">
                          <span className="font-semibold text-white block">{tx.userName}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                            tx.type === 'Dépôt'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : tx.type === 'Retrait'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : tx.type === 'Achat VIP'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-200">
                          {tx.operator}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {tx.reference}
                        </td>
                        <td className={`p-3 font-mono font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} F
                        </td>
                        <td className="p-3 text-[10px] text-slate-400 font-mono text-center">
                          {new Date(tx.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            tx.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tx.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {tx.status === 'approved' ? 'Succès' : tx.status === 'pending' ? 'Attente' : 'Rejeté'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* SUPPORT EN LIGNE TAB */}
      {activeAdminTab === 'support' && (() => {
        const uniqueMsgUserIds: string[] = Array.from(new Set(supportMessages.map((m: SupportMessage) => m.userId)));
        
        const chatSessions = uniqueMsgUserIds.map(uid => {
          const userObj = users.find(u => u.id === uid);
          const userMsgs = DataStore.deduplicateSupportMessages(supportMessages.filter(m => m.userId === uid));
          const sortedMessages = [...userMsgs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const lastMsgObj = sortedMessages[sortedMessages.length - 1];
          const unreadCount = userMsgs.filter(m => m.sender === 'user' && m.status === 'unread').length;
          
          let threadStatus: 'unread' | 'read' | 'replied' = 'unread';
          if (unreadCount > 0) {
            threadStatus = 'unread';
          } else if (lastMsgObj?.sender === 'admin') {
            threadStatus = 'replied';
          } else if (lastMsgObj?.status === 'read' || lastMsgObj?.status === 'replied') {
            threadStatus = lastMsgObj && lastMsgObj.status ? lastMsgObj.status : 'read';
          }

          return {
            userId: uid,
            user: userObj || { id: uid, name: 'Utilisateur Inconnu', whatsapp: uid, balance: 0 } as any,
            messages: sortedMessages,
            lastMsg: lastMsgObj,
            unreadCount,
            status: threadStatus
          };
        });

        const sortedSessions = [...chatSessions].sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          const aTime = a.lastMsg ? new Date(a.lastMsg.createdAt).getTime() : 0;
          const bTime = b.lastMsg ? new Date(b.lastMsg.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        const selectedSession = sortedSessions.find(s => s.userId === selectedUserId);

        const selectChatSession = async (uid: string) => {
          setSelectedUserId(uid);
          await DataStore.markSupportMessagesAsRead(uid, 'admin');
          executeDirectCentralSync();
        };

        const handleSendAdminReply = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!selectedUserId || !adminReplyInput.trim()) return;

          const replyText = adminReplyInput.trim();
          setAdminReplyInput('');
          try {
            const newMsg = await DataStore.sendMessageToSupport(selectedUserId, replyText, 'admin');
            if (newMsg) {
              setSupportMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          } catch (e) {
            console.error(e);
          }
        };

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 mb-8 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <span className="text-yellow-500">💬</span>
                  <span>Messagerie d'Assistance Directe</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gérez et répondez aux messages d'assistance des membres en temps réel. Les réponses sont synchronisées à Supabase de suite.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => { executeDirectCentralSync(); }}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white rounded-lg border border-slate-750 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualiser ({supportMessages.length})</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
              {/* SESSIONS LIST PANEL (LEFT COLUMN) */}
              <div className="lg:col-span-4 border-r border-slate-800/80 pr-0 lg:pr-6 max-h-[550px] overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3 font-semibold">
                  Conversations ({sortedSessions.length})
                </span>

                {sortedSessions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-sm">Aucun message d'assistance reçu.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedSessions.map(session => {
                      const isActive = session.userId === selectedUserId;
                      return (
                        <div
                          key={session.userId}
                          onClick={() => selectChatSession(session.userId)}
                          className={`w-full text-left p-3.5 rounded-lg cursor-pointer transition-all duration-150 border flex flex-col justify-between ${
                            isActive
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-slate-800/30 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="font-bold text-xs text-slate-200 truncate pr-2 block">
                              {session.user.name}
                            </span>
                            <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded-full ${
                              session.status === 'unread'
                                ? 'bg-red-500/15 text-red-500 border border-red-500/10'
                                : session.status === 'read'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                            }`}>
                              {session.status === 'unread' ? 'Non Lu' : session.status === 'read' ? 'Lu, En attente' : 'Répondu'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span className="font-mono text-slate-400">
                              {session.user.whatsapp || 'Aucun numéro'}
                            </span>
                            {session.lastMsg && (
                              <span className="text-[9px] font-mono text-slate-500">
                                {new Date(session.lastMsg.createdAt).toLocaleDateString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>

                          {session.lastMsg && (
                            <div className="text-[11px] text-slate-300 !text-slate-300 line-clamp-1 italic mt-2 border-t border-slate-800/40 pt-1.5 font-sans font-medium" style={{ color: '#cbd5e1' }}>
                              {session.lastMsg.sender === 'admin' ? <span className="text-yellow-400 font-bold">Vous : </span> : ''}
                              <span>{session.lastMsg.message}</span>
                            </div>
                          )}

                          {session.unreadCount > 0 && (
                            <div className="mt-2 text-right">
                              <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                {session.unreadCount} nouveaux
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ACTIVE CONVERSATION MESSAGES PANEL (RIGHT COLUMN) */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                {!selectedSession ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl p-6 min-h-[460px]">
                    <div className="text-4xl mb-4 text-slate-600">💬</div>
                    <span className="text-sm font-medium text-slate-300">
                      Aucune conversation sélectionnée
                    </span>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm font-sans">
                      Veuillez cliquer sur un membre dans la liste de gauche pour afficher l'historique complet de ses messages et lui envoyer une réponse directe.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full justify-between">
                    {/* Chat Session Header */}
                    <div className="p-3 bg-slate-800/50 border border-slate-750 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                      <div>
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          {selectedSession.user.name}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: <span className="text-slate-300">{selectedSession.userId}</span> • WhatsApp : <span className="text-slate-300">{selectedSession.user.whatsapp}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-750 px-2.5 py-1 rounded text-[10px] uppercase font-mono text-slate-300">
                        Solde principal : <span className="text-emerald-400 font-bold">{selectedSession.user.balance?.toLocaleString()} XOF</span>
                      </div>
                    </div>

                    {/* Message Logs */}
                    <div className="flex-1 min-h-[300px] max-h-[365px] overflow-y-auto p-4 bg-slate-950/40 rounded-lg border border-slate-800/80 mb-4 space-y-4">
                      {selectedSession.messages.map((m) => {
                        const isFromAdmin = m.sender === 'admin';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col max-w-[85%] ${isFromAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <div className={`p-4 rounded-xl text-xs leading-relaxed ${
                              isFromAdmin
                                ? 'bg-yellow-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-yellow-500/5'
                                : 'bg-[#1e293b] text-white font-extrabold rounded-tl-none border-2 border-slate-700/60'
                            }`}>
                              {m.image && (
                                <div className="mb-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-black/50">
                                  <img 
                                    src={m.image} 
                                    alt="Capture utilisateur" 
                                    className="w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity" 
                                    onClick={() => setLightboxImg(m.image)}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="px-2.5 py-1 bg-slate-950/90 text-slate-300 text-[10px] flex items-center justify-between border-t border-slate-800">
                                    <span className="font-mono text-slate-400">📸 Capture d'écran utilisateur</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setLightboxImg(m.image)} 
                                      className="text-yellow-400 hover:underline cursor-pointer font-bold text-[10px]"
                                    >
                                      🔍 Agrandir
                                    </button>
                                  </div>
                                </div>
                              )}
                              {m.message && (
                                <div className="whitespace-pre-line text-white !text-white font-black text-[13px] tracking-wide" style={{ color: '#ffffff' }}>{m.message}</div>
                              )}
                            </div>

                            {/* Requirement 3 specifications display footer */}
                            <div className="flex items-center space-x-2 text-[8.5px] text-slate-500 mt-1 font-mono">
                              <span>{isFromAdmin ? 'Support' : selectedSession.user.name}</span>
                              <span>•</span>
                              <span>
                                {new Date(m.createdAt).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </span>
                              {!isFromAdmin && (
                                <>
                                  <span>•</span>
                                  <span className={`font-bold uppercase ${
                                    m.status === 'unread'
                                      ? 'text-red-400'
                                      : m.status === 'read'
                                      ? 'text-sky-400'
                                      : 'text-emerald-400'
                                  }`}>
                                    {m.status === 'unread' ? 'Non lu' : m.status === 'read' ? 'Lu' : 'Répondu'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Form Input Reply Section */}
                    <form onSubmit={handleSendAdminReply} className="flex gap-2">
                      <input
                        type="text"
                        value={adminReplyInput}
                        disabled={isSendingAdminReply}
                        onChange={(e) => setAdminReplyInput(e.target.value)}
                        placeholder={isSendingAdminReply ? "Envoi en cours..." : `Saisissez votre réponse pour ${selectedSession.user.name}...`}
                        className="flex-1 bg-slate-950 border border-slate-850 focus:border-yellow-500 focus:outline-none rounded-lg text-xs text-white p-3 font-medium transition-colors disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isSendingAdminReply || !adminReplyInput.trim()}
                        className="px-5 py-3 rounded-lg text-xs font-bold tracking-wide transition-colors duration-150 flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span>{isSendingAdminReply ? 'Envoi...' : 'Envoyer'}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* PROOFS / AVIS TAB */}
      {activeAdminTab === 'proofs' && (() => {
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                  <span>📢 Publication, Forum &amp; Gestion des Preuves</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Créez, publiez et modérez les communiqués officiels, ainsi que toutes les publications et preuves de paiement partagées sur le forum.
                </p>
              </div>
              <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                Total Avis: <span className="text-yellow-400 font-bold">{withdrawalProofs.length}</span> | Forum: <span className="text-yellow-400 font-bold">{forumPosts.length}</span>
              </div>
            </div>

            {/* SUB-TABS SELECTOR */}
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850 w-fit select-none">
              <button
                type="button"
                onClick={() => setProofsSubTab('avis')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
                  proofsSubTab === 'avis'
                    ? 'bg-yellow-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>📢 Avis &amp; Communiqués</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    setForumPosts(DataStore.getForumPosts());
                  } catch {}
                  setProofsSubTab('forum');
                }}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
                  proofsSubTab === 'forum'
                    ? 'bg-yellow-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>💬 Flux du Forum</span>
              </button>
            </div>

            {proofsSubTab === 'avis' && (
              <>
                {/* FORM TO PUBLISH AN AVIS */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center space-x-2 text-yellow-500 pb-2 border-b border-slate-850">
                    <span className="text-sm">✍️</span>
                    <span className="font-sans font-black text-xs uppercase tracking-wider text-slate-200">
                      Créer et publier une nouvelle annonce / avis
                    </span>
                  </div>

                  <form onSubmit={handlePublishAdminAvis} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auteur de la publication</label>
                        <input
                          type="text"
                          value={adminAuthorName}
                          onChange={(e) => setAdminAuthorName(e.target.value)}
                          placeholder="Ex: Dreampod Officiel"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Badge / Localisation</label>
                        <input
                          type="text"
                          value={adminAuthorBadge}
                          onChange={(e) => setAdminAuthorBadge(e.target.value)}
                          placeholder="Ex: Officiel, Cameroun, Sénégal"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Montant Transaction (Facultatif - XOF)</label>
                        <input
                          type="number"
                          value={adminAmount}
                          onChange={(e) => setAdminAmount(e.target.value)}
                          placeholder="Ex: 150000 (Laissez vide si non applicable)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Texte de l'avis ou du communiqué</label>
                      <textarea
                        rows={4}
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        placeholder="Saisissez le contenu du communiqué, de l'annonce ou du témoignage de gain..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none resize-none font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Importer une capture d'écran / image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvisImageFileChange}
                          className="w-full bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-400 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-yellow-500 file:text-slate-950 hover:file:bg-yellow-400 file:cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ou coller l'URL d'une image</label>
                        <input
                          type="text"
                          value={adminImage}
                          onChange={(e) => setAdminImage(e.target.value)}
                          placeholder="Ex: https://images.unsplash.com/photo-..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {adminImage && (
                      <div className="pt-2 flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                          <img src={adminImage} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setAdminImage('')}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold duration-150 border border-red-500/10"
                        >
                          Supprimer la photo
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isPublishingAvis || !adminMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-sans font-black text-xs rounded-xl shadow-md transition-all active:scale-95 duration-150 disabled:opacity-40 uppercase tracking-widest flex items-center gap-2 cursor-pointer"
                      >
                        {isPublishingAvis ? 'Publication en cours...' : '🚀 Publier l\'Avis Officiel'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* LIST OF PUBLISHED AVIS */}
                <div className="space-y-4">
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider text-left pl-1">
                    Publications Actuelles sur la page Avis
                  </h4>

                  {withdrawalProofs.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-850">
                      <p className="text-slate-400 text-xs">Aucun communiqué ou avis officiel n'a été publié pour le moment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {withdrawalProofs.map((proof) => {
                        return (
                          <div 
                            key={proof.id} 
                            className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all space-y-4 text-left"
                          >
                            <div className="space-y-3">
                              {/* Upper row: User & Details */}
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="font-sans font-black text-xs text-slate-100 flex items-center gap-1.5">
                                    <span className="text-yellow-500">📢</span>
                                    {proof.userName}
                                    <span className="bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-yellow-500/20 animate-pulse">
                                      {proof.userCountry || 'Officiel'}
                                    </span>
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                                    Publié le : {new Date(proof.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                {proof.amount > 0 && (
                                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[10.5px] font-black font-mono">
                                    +{proof.amount.toLocaleString('en-US')} F
                                  </div>
                                )}
                              </div>

                              {/* Public message */}
                              <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                {proof.message}
                              </div>

                              {/* Image screenshot if exists */}
                              {proof.image && (
                                <div className="space-y-2">
                                  <div className="relative group rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-900 flex justify-center items-center">
                                    <img 
                                      src={proof.image} 
                                      alt="Preuve / Annonce" 
                                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = proof.image!;
                                      link.download = `preuve-retrait-${proof.id}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-500 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer shadow-sm"
                                  >
                                    <span>💾 Enregistrer l'image</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Actions for moderation */}
                            <div className="border-t border-slate-850/60 pt-3 flex justify-between items-center text-[10px]">
                              <span className="text-slate-500 font-mono text-[9px]">{proof.id}</span>
                              <button
                                onClick={() => handleDeleteProof(proof.id)}
                                className="px-3 py-1.5 bg-red-600/15 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/20 hover:border-transparent rounded-xl font-bold transition-all flex items-center space-x-1 duration-150 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Supprimer la publication</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {proofsSubTab === 'forum' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider pl-1">
                    Publications Actuelles sur le Forum Public
                  </h4>
                  <div className="flex items-center gap-2">
                    {forumPosts.length > 0 && (
                      <button
                        onClick={handleClearAllForumPosts}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Tout Supprimer</span>
                      </button>
                    )}
                    <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
                      Total Posts: <span className="text-yellow-400 font-bold">{forumPosts.length}</span>
                    </div>
                  </div>
                </div>

                {forumPosts.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-850">
                    <p className="text-slate-400 text-xs">Aucune publication sur le forum pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forumPosts.map((post) => {
                      return (
                        <div 
                          key={post.id} 
                          className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all space-y-4 text-left"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-sans font-black text-xs text-slate-100 flex items-center gap-1.5">
                                  <span className="text-indigo-400">👤</span>
                                  {maskUserPhone(post.authorName || post.author || "Membre")}
                                  <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-indigo-500/20">
                                    Abonné
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                                  Publié le : {new Date(post.createdAt || post.date || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold">
                                <span>👍 {post.likes?.length || post.likesCount || 0}</span>
                              </div>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                              {maskUserPhone(post.message || post.text)}
                            </div>

                            {(post.image1 || post.image2 || post.image) && (
                              <div className="space-y-3 pt-1 bg-slate-900/40 border border-slate-850/60 p-3 rounded-xl">
                                <span className="text-[9px] font-black uppercase text-yellow-500 block tracking-wider">📁 Preuves / Captures Publiées :</span>
                                
                                {post.image1 && post.image2 ? (
                                  <div className="space-y-2">
                                    {/* Glued/Joined together images (Côte à côte / Collées) */}
                                    <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                                      <div className="relative group h-44 flex justify-center items-center border-r border-slate-800/80">
                                        <img 
                                          src={post.image1} 
                                          alt="Forum attachment 1" 
                                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">Capture 1</div>
                                      </div>
                                      <div className="relative group h-44 flex justify-center items-center">
                                        <img 
                                          src={post.image2} 
                                          alt="Forum attachment 2" 
                                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">Capture 2</div>
                                      </div>
                                    </div>
                                    
                                    {/* Clean, simple download buttons next to each other or a dual download */}
                                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = post.image1;
                                          link.download = `preuve-forum-image1-${post.id}.png`;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                        className="py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-500 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                                      >
                                        <span>💾 Capt. 1</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = post.image2;
                                          link.download = `preuve-forum-image2-${post.id}.png`;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                        className="py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-500 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                                      >
                                        <span>💾 Capt. 2</span>
                                      </button>
                                    </div>
                                    
                                    {/* Dual button to download both in one single action! */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const link1 = document.createElement('a');
                                        link1.href = post.image1;
                                        link1.download = `preuve-forum-image1-${post.id}.png`;
                                        document.body.appendChild(link1);
                                        link1.click();
                                        document.body.removeChild(link1);
                                        
                                        setTimeout(() => {
                                          const link2 = document.createElement('a');
                                          link2.href = post.image2;
                                          link2.download = `preuve-forum-image2-${post.id}.png`;
                                          document.body.appendChild(link2);
                                          link2.click();
                                          document.body.removeChild(link2);
                                        }, 350);
                                      }}
                                      className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-slate-950 border border-yellow-500/20 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                                    >
                                      <span>📥 Enregistrer les 2 Captures</span>
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {post.image1 && (
                                      <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-slate-450 block">Capture d'écran 1 :</span>
                                        <div className="relative group rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-900 flex justify-center items-center">
                                          <img 
                                            src={post.image1} 
                                            alt="Forum attachment 1" 
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = post.image1;
                                            link.download = `preuve-forum-image1-${post.id}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-500 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                                        >
                                          <span>💾 Enregistrer la Capture 1</span>
                                        </button>
                                      </div>
                                    )}

                                    {post.image2 && (
                                      <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-slate-450 block">Capture d'écran 2 :</span>
                                        <div className="relative group rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-900 flex justify-center items-center">
                                          <img 
                                            src={post.image2} 
                                            alt="Forum attachment 2" 
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = post.image2;
                                            link.download = `preuve-forum-image2-${post.id}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-500 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                                        >
                                          <span>💾 Enregistrer la Capture 2</span>
                                        </button>
                                      </div>
                                    )}

                                    {post.image && !post.image1 && !post.image2 && (
                                      <div className="space-y-2">
                                        <div className="relative group rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-900 flex justify-center items-center">
                                          <img 
                                            src={post.image} 
                                            alt="Forum attachment" 
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = post.image;
                                            link.download = `preuve-forum-image-${post.id}.png`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                          className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-yellow-500 font-sans font-black text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-sm"
                                        >
                                          <span>💾 Enregistrer la Capture</span>
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            {/* Comments removed */}
                          </div>

                          <div className="border-t border-slate-850/60 pt-3 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-mono text-[9px]">{post.id}</span>
                            <button
                              onClick={() => handleDeleteForumPost(post.id)}
                              className="px-3 py-1.5 bg-red-600/15 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/20 hover:border-transparent rounded-xl font-bold transition-all flex items-center space-x-1 duration-150 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Supprimer du Forum</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* INVESTMENTS TAB - GESTION DES PRÉCOMPTES / PRODUITS PAYÉS PAR LES UTILISATEURS */}
      {activeAdminTab === 'investments' && (() => {
        // Filter investments based on query and status limiters
        const filteredInvestments = investments.filter((inv) => {
          // Resolve buyer name/whatsapp for thorough matching
          const buyer = users.find(u => u.id === inv.userId);
          const buyerName = buyer ? buyer.name.toLowerCase() : '';
          const buyerPhone = buyer ? buyer.whatsapp.toLowerCase() : '';
          
          const matchQuery = 
            inv.productName.toLowerCase().includes(investSearchQuery.toLowerCase()) ||
            inv.userId.toLowerCase().includes(investSearchQuery.toLowerCase()) ||
            buyerName.includes(investSearchQuery.toLowerCase()) ||
            buyerPhone.includes(investSearchQuery.toLowerCase());

          const matchStatus = 
            investStatusFilter === 'all' || 
            inv.status === investStatusFilter;

          return matchQuery && matchStatus;
        });

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🛡️ Produits Payés par les Utilisateurs (VIP)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Consultez, recherchez et gérez tous les forfaits d'investissement actifs et complets achetés par vos membres. Vous pouvez annuler/supprimer n'importe quel produit payé.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDeleteAllInvestments}
                  disabled={investments.length === 0}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Supprimer définitivement tous les produits payés de tous les utilisateurs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer tous les payés ({investments.length})</span>
                </button>
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                  Total: <span className="text-yellow-400 font-bold">{investments.length}</span>
                </div>
                <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                  Actifs: <span className="font-bold">{investments.filter(i => i.status === 'active').length}</span>
                </div>
              </div>
            </div>

            {/* FILTERS PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search text field */}
              <div className="relative col-span-2">
                <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par membre, numéro, ID de l'utilisateur ou nom de pack..."
                  value={investSearchQuery}
                  onChange={(e) => setInvestSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-yellow-500 focus:outline-none rounded-xl text-xs text-white pl-10 pr-4 py-3 font-medium transition-colors"
                />
              </div>

              {/* Status filter select */}
              <div>
                <select
                  value={investStatusFilter}
                  onChange={(e) => setInvestStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-yellow-500 focus:outline-none rounded-xl text-xs text-white px-4 py-3 font-medium transition-colors cursor-pointer"
                >
                  <option value="all">Tous les statuts ({investments.length})</option>
                  <option value="pending_activation">⏳ En attente d'activation ({investments.filter(i => i.status === 'pending_activation').length})</option>
                  <option value="active">⚡ Actifs ({investments.filter(i => i.status === 'active').length})</option>
                  <option value="completed">🏁 Terminés ({investments.filter(i => i.status === 'completed').length})</option>
                </select>
              </div>
            </div>

            {/* LOGS LIST */}
            {filteredInvestments.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-850">
                <p className="text-slate-400 text-xs">Aucun produit payé ou souscrit ne correspond à votre recherche actuelle.</p>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full text-left text-xs text-slate-200 min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pl-4">Acheteur / Titulaire</th>
                      <th className="pb-3">Pack Souscrit</th>
                      <th className="pb-3">Prix d'Achat</th>
                      <th className="pb-3 text-center">Revenu / Jour</th>
                      <th className="pb-3 text-center">Progression Cycle</th>
                      <th className="pb-3 text-center">Gains Cumulés</th>
                      <th className="pb-3">Date de Début</th>
                      <th className="pb-3 text-center">Statut</th>
                      <th className="pb-3 pr-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {filteredInvestments.map((inv) => {
                      const buyer = users.find(u => u.id === inv.userId);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-4 pl-4">
                            {buyer ? (
                              <div className="space-y-0.5">
                                <span className="font-sans font-black text-slate-100 block">{buyer.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  📞 {buyer.whatsapp} • <span className="text-yellow-500/85">ID: {buyer.id}</span>
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="font-sans font-black text-red-400 italic block">Utilisateur supprimé</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {inv.userId}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4">
                            <span className="font-display font-medium text-amber-500 tracking-wide text-xs">
                              🏆 {inv.productName}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-mono">ID: {inv.id}</span>
                          </td>
                          <td className="py-4 font-bold font-mono text-slate-200">
                            {inv.price.toLocaleString('en-US')} F
                          </td>
                          <td className="py-4 text-center font-bold font-mono text-cyan-400">
                            {inv.dailyReturn.toLocaleString('en-US')} F
                          </td>
                          <td className="py-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-mono font-bold text-slate-300">
                                {inv.status === 'pending_activation' ? '0' : inv.daysPassed} / {inv.durationDays} Jours
                              </span>
                              <div className="w-20 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                                <div 
                                  className={inv.status === 'pending_activation' ? "bg-amber-500/60 h-full rounded-full" : "bg-yellow-500 h-full rounded-full"}
                                  style={{ width: inv.status === 'pending_activation' ? '10%' : `${Math.min(100, Math.round((inv.daysPassed / inv.durationDays) * 100))}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center font-bold font-mono text-emerald-400">
                            {inv.totalReturnClaimed.toLocaleString('en-US')} F
                          </td>
                          <td className="py-4 text-slate-400">
                            <span>{new Date(inv.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </td>
                          <td className="py-4 text-center font-sans">
                            {inv.status === 'pending_activation' ? (
                              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full font-sans font-black uppercase text-[9px] inline-block">
                                En Attente ⏳
                              </span>
                            ) : inv.status === 'active' ? (
                              <span className="bg-emerald-550/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-sans font-black uppercase text-[9px] inline-block animate-pulse">
                                Actif ⚡
                              </span>
                            ) : (
                              <span className="bg-slate-705 text-slate-400 border border-slate-700 px-2 py-1 rounded-full font-sans font-bold uppercase text-[9px] inline-block">
                                Échu 🏁
                              </span>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {inv.status === 'pending_activation' && (
                                <button
                                  onClick={() => handleActivateInvestment(inv.id)}
                                  className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-transparent rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
                                  title="Valider les conditions & Activer ce produit"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Activer</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteInvestment(inv.id)}
                                className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/20 hover:border-transparent rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
                                title="Annuler & Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Custom Confirmation Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl">
            <h3 className="font-sans font-black text-sm uppercase tracking-wider text-red-500 mb-2">
              {confirmConfig.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-sans">
              {confirmConfig.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const onConf = confirmConfig.onConfirm;
                  setConfirmConfig(null);
                  await onConf();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-red-600/20"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {notification.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="text-xs font-medium text-slate-200">
              {notification.message}
            </span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-300 text-xs font-bold leading-none p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
