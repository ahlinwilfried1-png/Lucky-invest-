import { 
  User, 
  Deposit, 
  Withdrawal, 
  Product, 
  Investment, 
  Commission, 
  SystemNotification, 
  SupportMessage, 
  BonusCode,
  ChatSession,
  WithdrawalProof,
  CategorySchedule,
  CategorySchedules,
  RevenueRecord,
  Announcement
} from './types';
import { deduplicateForumPosts } from './lib/forumUtils';
import { 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  supabaseRegisterUser,
  supabaseUpsertDeposit,
  supabaseGetDeposits,
  supabaseGetInvestments,
  supabaseUpsertInvestment
} from './supabase';

export const DEFAULT_CATEGORY_SCHEDULES: CategorySchedules = {
  wellbeing: {
    mode: 'open',
    openTime: '08:00',
    closeTime: '20:00',
    enabled: true,
    lastModified: 0
  },
  withdrawals: {
    mode: 'auto',
    openTime: '09:00',
    closeTime: '17:00',
    enabled: true,
    lastModified: 0
  },
  activity: {
    mode: 'open',
    openTime: '08:00',
    closeTime: '20:00',
    enabled: true,
    lastModified: 0
  }
};

// Default mock configuration values
export const DEFAULT_PRODUCTS: Product[] = [
  // STABILITÉ (7 products, starting at 2000 XOF minimum)
  {
    id: "stab-1",
    vipLevel: 1,
    name: "Gold Avenue Option Bronze",
    tag: "Option Bronze",
    price: 2000,
    dailyReturn: 180,
    durationDays: 40,
    totalReturn: 7200,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "stab-2",
    vipLevel: 2,
    name: "Gold Avenue Option Argent",
    tag: "Option Argent",
    price: 5000,
    dailyReturn: 500,
    durationDays: 40,
    totalReturn: 20000,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "stab-3",
    vipLevel: 3,
    name: "Gold Avenue Option Or",
    tag: "Option Or",
    price: 10000,
    dailyReturn: 1200,
    durationDays: 40,
    totalReturn: 48000,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "stab-4",
    vipLevel: 4,
    name: "Gold Avenue Option Platine",
    tag: "Option Platine",
    price: 25000,
    dailyReturn: 3500,
    durationDays: 40,
    totalReturn: 140000,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "stab-5",
    vipLevel: 5,
    name: "Gold Avenue Option Diamant",
    tag: "Option Diamant",
    price: 50000,
    dailyReturn: 8000,
    durationDays: 40,
    totalReturn: 320000,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "stab-6",
    vipLevel: 6,
    name: "Gold Avenue Option Saphir",
    tag: "Option Saphir",
    price: 100000,
    dailyReturn: 18000,
    durationDays: 40,
    totalReturn: 720000,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "stab-7",
    vipLevel: 7,
    name: "Gold Avenue Option Émeraude",
    tag: "Option Émeraude",
    price: 200000,
    dailyReturn: 42000,
    durationDays: 40,
    totalReturn: 1680000,
    category: "stability",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },

  // BIEN-ÊTRE (7 products, starting at 5000 XOF minimum)
  {
    id: "well-1",
    vipLevel: 1,
    name: "Gold Avenue Bien-être Source",
    tag: "Bien-être Source",
    price: 5000,
    dailyReturn: 1000,
    durationDays: 10,
    totalReturn: 10000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "well-2",
    vipLevel: 2,
    name: "Gold Avenue Bien-être Harmonie",
    tag: "Bien-être Harmonie",
    price: 12000,
    dailyReturn: 2600,
    durationDays: 10,
    totalReturn: 26000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "well-3",
    vipLevel: 3,
    name: "Gold Avenue Bien-être Sérénité",
    tag: "Bien-être Sérénité",
    price: 30000,
    dailyReturn: 7000,
    durationDays: 10,
    totalReturn: 70000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "well-4",
    vipLevel: 4,
    name: "Gold Avenue Bien-être Vitalité",
    tag: "Bien-être Vitalité",
    price: 75000,
    dailyReturn: 19000,
    durationDays: 10,
    totalReturn: 190000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "well-5",
    vipLevel: 5,
    name: "Gold Avenue Bien-être Énergie",
    tag: "Bien-être Énergie",
    price: 150000,
    dailyReturn: 42500,
    durationDays: 10,
    totalReturn: 425000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "well-6",
    vipLevel: 6,
    name: "Gold Avenue Bien-être Équilibre",
    tag: "Bien-être Équilibre",
    price: 300000,
    dailyReturn: 90000,
    durationDays: 10,
    totalReturn: 900000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "well-7",
    vipLevel: 7,
    name: "Gold Avenue Bien-être Plénitude",
    tag: "Bien-être Plénitude",
    price: 600000,
    dailyReturn: 190000,
    durationDays: 10,
    totalReturn: 1900000,
    category: "wellbeing",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },

  // ACTIVITÉS (Offres spéciales & opportunités exclusives)
  {
    id: "act-1",
    vipLevel: 1,
    name: "Gold Avenue Activité Découverte",
    tag: "Activité Spéciale",
    price: 3000,
    dailyReturn: 900,
    durationDays: 5,
    totalReturn: 4500,
    category: "activity",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "act-2",
    vipLevel: 2,
    name: "Gold Avenue Activité Privilège",
    tag: "Activité Flash",
    price: 10000,
    dailyReturn: 3200,
    durationDays: 5,
    totalReturn: 16000,
    category: "activity",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "act-3",
    vipLevel: 3,
    name: "Gold Avenue Activité Prestige",
    tag: "Événement VIP",
    price: 30000,
    dailyReturn: 10500,
    durationDays: 5,
    totalReturn: 52500,
    category: "activity",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  },
  {
    id: "act-4",
    vipLevel: 4,
    name: "Gold Avenue Activité Excellence",
    tag: "Haute Performance",
    price: 75000,
    dailyReturn: 28000,
    durationDays: 5,
    totalReturn: 140000,
    category: "activity",
    isBlocked: false,
    isCyclic: true,
    generatedProductIds: []
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Administrateur Principal',
    whatsapp: '+237600000000',
    password: 'agro777',
    country: 'Cameroun',
    balance: 1250000,
    dailyEarnings: 0,
    totalEarnings: 0,
    bonus: 5000,
    referralCode: 'AGR72',
    role: 'admin',
    isBlocked: false,
    createdAt: '2026-05-10T10:00:00Z'
  }
];

const INITIAL_DEPOSITS: Deposit[] = [];

const INITIAL_WITHDRAWALS: Withdrawal[] = [];

const INITIAL_INVESTMENTS: Investment[] = [];

const INITIAL_COMMISSIONS: Commission[] = [];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

const INITIAL_BONUS_CODES: BonusCode[] = [
  { code: '72AGR', amount: 1000, maxUses: 100, usedCount: 0, usedByUsers: [] },
  { code: 'WELCOME500', amount: 500, maxUses: 500, usedCount: 0, usedByUsers: [] },
  { code: 'VIPBONUS', amount: 2000, maxUses: 10, usedCount: 0, usedByUsers: [] }
];

const INITIAL_CHATS: SupportMessage[] = [];

const INITIAL_PROOFS: WithdrawalProof[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Bienvenue sur Gold Avenue — Plateforme d\'Investissement Sécurisée',
    content: 'Chers investisseurs, nous vous souhaitons la bienvenue sur Gold Avenue. Notre mission est de vous offrir des solutions d\'investissement fiables, performantes et sécurisées avec des retours quotidiens garantis. N\'hésitez pas à explorer nos plans d\'investissement et à contacter notre support en cas de besoin.',
    category: 'officiel',
    badge: 'OFFICIEL',
    author: 'Direction Gold Avenue',
    createdAt: '2026-09-10T08:00:00.000Z',
    pinned: true,
    lastModified: 1788937200000
  },
  {
    id: 'ann-2',
    title: 'Horaires de Retrait & Traitement Rapide',
    content: 'Les demandes de retrait sont examinées et validées du lundi au vendredi. Pour garantir un versement sans délai, veuillez vérifier l\'exactitude de votre numéro et de l\'opérateur bancaire ou Mobile Money renseigné dans votre profil.',
    category: 'important',
    badge: 'IMPORTANT',
    author: 'Service Financier',
    createdAt: '2026-09-11T11:30:00.000Z',
    pinned: false,
    lastModified: 1789036200000
  },
  {
    id: 'ann-3',
    title: 'Programme de Parrainage : Gagnez jusqu\'à 24% de Commissions',
    content: 'Profitez de notre système de parrainage sur 3 niveaux (20% au Niveau 1, 3% au Niveau 2, et 1% au Niveau 3) crédité directement sur votre solde dès le premier rechargement validé de vos affiliés. Partagez votre lien d\'invitation dès maintenant !',
    category: 'promotion',
    badge: 'PROMOTION',
    author: 'Service Marketing',
    createdAt: '2026-09-12T06:00:00.000Z',
    pinned: false,
    lastModified: 1789102800000
  }
];


// Robust, frame-safe in-memory cache to guarantee full compatibility when running inside sandboxed environments
// (like an iframe on iOS, Safari, or tablets) where localStorage or sessionStorage access is strictly restricted or blocked.
const inMemoryStore: Record<string, string> = {};
const inMemorySessionStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key) || inMemoryStore[key] || null;
    } catch (e) {
      return inMemoryStore[key] || null;
    }
  },
  setItem: (key: string, value: string): void => {
    inMemoryStore[key] = value;
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string): void => {
    delete inMemoryStore[key];
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

// LocalStorage Helper functions with automatic in-memory fallback
export function getApiUrl(endpoint: string): string {
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    const isCloudRun = host.endsWith('.run.app');
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
    
    // Always use relative URLs on live Cloud Run containers or local development
    if (isCloudRun || isLocalhost) {
      return endpoint;
    }
  }

  try {
    const custom = localStorage.getItem('gi_custom_backend_url');
    if (custom) {
      const base = custom.trim().replace(/\/+$/, '');
      if (base) {
        return `${base}${endpoint}`;
      }
    }
  } catch (e) {}

  // If the host is an external domain (like gold_avenue-lac.vercel.app)
  // we must automatically route requests to the live Cloud Run production instance
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    const isCloudRun = host.endsWith('.run.app');
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.');
    
    if (!isCloudRun && !isLocalhost) {
      // Automatic fallback to our stable, centralized production backend URL!
      return `https://ais-pre-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app${endpoint}`;
    }
  }

  return endpoint;
}

export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  let activeUrl = url;
  if (url.startsWith('/') && typeof window !== 'undefined' && window.location) {
    activeUrl = `${window.location.origin}${url}`;
  }
  let isRetried = false;

  const hasPre = activeUrl.includes('-pre-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app') || activeUrl.includes('-pre-gymdtdpbwifj6pqjbdravq-473372860465.europe-west1.run.app');
  const hasDev = activeUrl.includes('-dev-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app') || activeUrl.includes('-dev-gymdtdpbwifj6pqjbdravq-473372860465.europe-west1.run.app');
  const isSyncEndpoint = activeUrl.includes('/api/get-store') || activeUrl.includes('/api/save-store');
  const isSendavaPay = activeUrl.includes('/sendavapay');

  // Try to use the standard backend first (getApiUrl)
  try {
    const userItem = (typeof window !== 'undefined' ? (sessionStorage.getItem('gi_current_user') || inMemorySessionStore['gi_current_user']) : null) || inMemorySessionStore['gi_current_user'];
    const userHeaders: Record<string, string> = {};
    if (userItem) {
      try {
        const u = JSON.parse(userItem);
        if (u && u.id) {
          userHeaders['x-user-id'] = u.id;
          if (u.role) userHeaders['x-user-role'] = u.role;
          if (u.password) userHeaders['x-user-password'] = u.password;
        }
      } catch (e) {}
    }

    const fetchOptions: RequestInit = {
      credentials: 'same-origin',
      ...init,
      headers: {
        ...userHeaders,
        ...(init?.headers || {})
      }
    };
    let response = await fetch(activeUrl, fetchOptions);
    let contentType = response.headers.get('content-type') || "";
    
    // If we get an error response or a HTML page (like Google's proxy/Cloud Run sleeping/error page),
    // and we have an alternate Cloud Run URL, let's try the other one.
    if ((!response.ok || contentType.includes('text/html')) && (hasPre || hasDev) && !isRetried) {
      isRetried = true;
      const fallbackHost = hasPre 
        ? 'https://ais-dev-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app'
        : 'https://ais-pre-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app';
      
      try {
        let parsedUrl: URL;
        try {
          parsedUrl = new URL(activeUrl);
        } catch (e) {
          parsedUrl = new URL(activeUrl, typeof window !== 'undefined' ? window.location.origin : undefined);
        }
        const fallbackUrl = `${fallbackHost}${parsedUrl.pathname}${parsedUrl.search}`;
        console.log(`[apiFetch Failover] Primary backend non-responsive. Retrying with alternate backend: ${fallbackUrl}`);
        
        const fallbackResp = await fetch(fallbackUrl, fetchOptions);
        const fallbackContentType = fallbackResp.headers.get('content-type') || "";
        
        if ((fallbackResp.ok || !isSyncEndpoint || isSendavaPay) && !fallbackContentType.includes('text/html')) {
          try {
            localStorage.setItem('gi_custom_backend_url', fallbackHost);
          } catch (e) {}
          return fallbackResp;
        }
      } catch (retryErr) {
        console.warn(`[apiFetch Failover] Alternate backend failed too:`, retryErr);
      }
    }

    // Always return valid JSON responses (even on HTTP errors) so callers receive real server messages
    if (!contentType.includes('text/html')) {
      return response;
    } else {
      console.warn(`[apiFetch] Received HTML from API call for URL: ${url}. Triggering fallback check.`);
    }
  } catch (error) {
    console.warn(`[apiFetch] API fetch threw error: ${error instanceof Error ? error.message : String(error)} for URL: ${url}. Triggering failover check.`);
    
    // If it threw a network error (like Failed to fetch), try the alternate backend!
    if ((hasPre || hasDev) && !isRetried) {
      isRetried = true;
      const fallbackHost = hasPre 
        ? 'https://ais-dev-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app'
        : 'https://ais-pre-wax3ctm5ycravc7jfp2zxd-473372860465.europe-west1.run.app';
      
      try {
        let parsedUrl: URL;
        try {
          parsedUrl = new URL(activeUrl);
        } catch (e) {
          parsedUrl = new URL(activeUrl, typeof window !== 'undefined' ? window.location.origin : undefined);
        }
        const fallbackUrl = `${fallbackHost}${parsedUrl.pathname}${parsedUrl.search}`;
        console.log(`[apiFetch Network Failover] Retrying on network error with: ${fallbackUrl}`);
        
        const fetchOptions: RequestInit = {
          credentials: 'same-origin',
          ...init
        };
        const response = await fetch(fallbackUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || "";
        
        if (!contentType.includes('text/html')) {
          try {
            localStorage.setItem('gi_custom_backend_url', fallbackHost);
          } catch (e) {}
          return response;
        }
      } catch (retryErr) {
        console.warn(`[apiFetch Network Failover] Retry failed too:`, retryErr);
      }
    }

    if (isSendavaPay) {
      return new Response(JSON.stringify({ success: false, error: "Erreur de connexion. Le serveur de paiement est temporairement indisponible." }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (isSendavaPay) {
    return new Response(JSON.stringify({ success: false, error: "Le serveur de paiement n'a pas répondu." }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- DIRECT SUPABASE Sync FALLBACK (if configured) ---
  if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
    console.log(`[apiFetch Fallback] Connecting directly to Supabase cloud storage: ${SUPABASE_URL}`);
  }
  
  if (url.includes('/api/get-store')) {
    if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
      try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/store?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Accept': 'application/json'
          }
        });
        if (resp.ok) {
          const rows = await resp.json();
          const storeObj: Record<string, any> = {};
          if (Array.isArray(rows)) {
            for (const r of rows) {
              storeObj[r.key] = r.value;
            }
          }
          return new Response(JSON.stringify(storeObj), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
          console.warn(`[apiFetch Fallback] Supabase direct get-store returned status ${resp.status}`);
        }
      } catch (e) {
        console.warn('[apiFetch Fallback] Supabase direct get-store failed gracefully (using local storage fallback instead):', e);
      }
    }
    
    // Reconstruct and compile local storage keys to allow the application to function gracefully
    // in offline/restricted mode instead of failing sync and locking up the UI.
    try {
      const offlineStore: Record<string, any> = {};
      const syncKeys = [
        'gi_users', 'gi_deposits', 'gi_withdrawals', 'gi_investments', 
        'gi_commissions', 'gi_notifications', 'gi_bonus_codes', 'gi_support_messages', 
        'gi_products', 'gi_mlm_level1_rate', 'gi_mlm_level2_rate', 'gi_mlm_level3_rate',
        'gi_withdrawals_blocked_global', 'gi_referral_domain', 'gi_withdrawal_proofs',
        'gi_manual_deposit_numbers', 'gi_official_banners', 'gi_cleanup_timestamp',
        'gi_announcements'
      ];
      for (const key of syncKeys) {
        const cached = localStorage.getItem(key) || inMemoryStore[key];
        if (cached) {
          try {
            offlineStore[key] = JSON.parse(cached);
          } catch (e) {
            offlineStore[key] = cached;
          }
        }
      }
      console.log(`[apiFetch Offline Fallback] Gracefully compiled offline store containing ${offlineStore['gi_users']?.length || 0} user(s).`);
      return new Response(JSON.stringify(offlineStore), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      console.warn('[apiFetch Offline Fallback] Fatal exception compiled local cache:', err);
    }
    return new Response(JSON.stringify({ success: false, error: "Cloud database is restricted or offline" }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.includes('/api/save-store')) {
    if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
      try {
        const bodyData = init?.body ? JSON.parse(init.body as string) : null;
        if (bodyData && typeof bodyData === 'object') {
          for (const key of Object.keys(bodyData)) {
            const localVal = bodyData[key];
            let valToSave = localVal;
            
            const isMergeableArray = Array.isArray(localVal) && key !== "gi_products" && key !== "gi_bonus_codes" && key !== "gi_withdrawal_proofs";
            if (isMergeableArray) {
              try {
                const fetchResp = await fetch(`${SUPABASE_URL}/rest/v1/store?key=eq.${key}&select=value`, {
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/json'
                  }
                });
                if (fetchResp.ok) {
                  const rows = await fetchResp.json();
                  if (Array.isArray(rows) && rows.length > 0 && rows[0].value) {
                    const remoteVal = rows[0].value;
                    if (Array.isArray(remoteVal)) {
                      const mergedMap = new Map<string, any>();
                      const deletedUsers = getFromStore<string[]>('gi_deleted_users', []);
                      const deletedInvestments = getFromStore<string[]>('gi_deleted_investments', []);

                      for (const item of remoteVal) {
                        if (item && typeof item === 'object') {
                          const id = item.id || item.code;
                          if (id) {
                            const idStr = String(id);
                            if (key === 'gi_users' && deletedUsers.includes(idStr)) continue;
                            if (key === 'gi_investments' && deletedInvestments.includes(idStr)) continue;
                            mergedMap.set(idStr, item);
                          }
                        }
                      }
                      for (const item of localVal) {
                        if (item && typeof item === 'object') {
                          const id = item.id || item.code;
                          if (id) {
                            const idStr = String(id);
                            if (key === 'gi_users' && deletedUsers.includes(idStr)) continue;
                            if (key === 'gi_investments' && deletedInvestments.includes(idStr)) continue;
                            if (!mergedMap.has(idStr)) {
                              mergedMap.set(idStr, item);
                            } else {
                              const existingItem = mergedMap.get(idStr);
                              const existingTime = existingItem.lastModified || 0;
                              const incomingTime = item.lastModified || 0;
                              
                              if (key === "gi_users") {
                                const useIncoming = incomingTime > existingTime;
                                const mergedUser = {
                                  ...(useIncoming ? item : existingItem),
                                  role: (existingItem.role === 'admin' || item.role === 'admin') ? 'admin' : (useIncoming ? (item.role || 'user') : (existingItem.role || 'user')),
                                  isBlocked: useIncoming ? (item.isBlocked !== undefined ? item.isBlocked : existingItem.isBlocked) : (existingItem.isBlocked !== undefined ? existingItem.isBlocked : item.isBlocked),
                                  lastModified: Math.max(existingTime, incomingTime)
                                };
                                mergedMap.set(idStr, mergedUser);
                              } else {
                                if (incomingTime >= existingTime) {
                                  mergedMap.set(idStr, item);
                                }
                              }
                            }
                          }
                        }
                      }
                      valToSave = Array.from(mergedMap.values());
                      
                      // Keep safeLocalStorage updated
                      inMemoryStore[key] = JSON.stringify(valToSave);
                      try {
                        localStorage.setItem(key, JSON.stringify(valToSave));
                      } catch (e) {}
                    }
                  }
                }
              } catch (e) {
                console.warn('[apiFetch Fallback] Direct merge fetch failed:', e);
              }
            }
            
            await fetch(`${SUPABASE_URL}/rest/v1/store`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify([{
                key: key,
                value: valToSave,
                updated_at: new Date().toISOString()
              }])
            });
          }
        }
      } catch (e) {
        console.warn('[apiFetch Fallback] Supabase direct save-store failed gracefully:', e);
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.includes('/api/admin-diagnostics')) {
    const list = getFromStore<User[]>('gi_users', []);
    return new Response(JSON.stringify({
      success: true,
      totalUsersInMem: list.length,
      totalUsersInFile: list.length,
      timestamp: Date.now(),
      dbPath: 'Supabase Direct Table "store"',
      dbExists: true
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  if (url.includes('/api/admin/delete-investment') || url.includes('/api/admin/delete-user')) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  // Reject unhandled offline requests with 503 Service Unavailable
  return new Response(JSON.stringify({ success: false, message: "Serveur de base de données temporairement inaccessible." }), { status: 503, headers: { 'Content-Type': 'application/json' } });
}

export const dispatchStoreUpdated = () => {
  setTimeout(() => {
    try {
      window.dispatchEvent(new Event('gi_store_updated'));
    } catch (e) {}
  }, 0);
};

export const dispatchCustomEvent = (eventName: string) => {
  setTimeout(() => {
    try {
      window.dispatchEvent(new Event(eventName));
    } catch (e) {}
  }, 0);
};

export const getFromStore = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key) || inMemoryStore[key];
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    const item = inMemoryStore[key];
    return item ? JSON.parse(item) : defaultValue;
  }
};

export const setToStore = <T>(key: string, value: T): void => {
  try {
    let newValue: any = value;
    if (Array.isArray(value)) {
      let oldStr: string | null = null;
      try {
        oldStr = localStorage.getItem(key) || inMemoryStore[key] || null;
      } catch (e) {
        oldStr = inMemoryStore[key] || null;
      }
      
      let oldArray: any[] = [];
      try {
        oldArray = oldStr ? JSON.parse(oldStr) : [];
      } catch (e) {
        oldArray = [];
      }
      if (!Array.isArray(oldArray)) oldArray = [];
      const now = Date.now();
      
      newValue = value.map((item: any) => {
        if (item && typeof item === 'object') {
          const itemId = item.id || item.code;
          const oldItem = oldArray.find((o: any) => o && (o.id === itemId || o.code === itemId));
          
          if (!oldItem) {
            return { ...item, lastModified: now };
          } else {
            const { lastModified: _, ...itemClean } = item;
            const { lastModified: __, ...oldClean } = oldItem;
            if (JSON.stringify(itemClean) !== JSON.stringify(oldClean)) {
              return { ...item, lastModified: now };
            } else {
              return { ...item, lastModified: oldItem.lastModified || now };
            }
          }
        }
        return item;
      });
    }

    const strValue = JSON.stringify(newValue);
    inMemoryStore[key] = strValue;
    
    try {
      localStorage.setItem(key, strValue);
    } catch (e) {
      // Silently fall back to inMemoryStore if sandboxed context rejects write
    }

    // Dispatch event safely deferred for other views/components to react immediately in real-time
    dispatchStoreUpdated();

    // For gi_deposits: DO NOT push full array to save-store or Supabase direct store!
    // Deposits are centrally created via /api/create-deposit and managed via /api/admin/deposit-action.
    if (key === 'gi_deposits') {
      return;
    }

    // Asynchronously send update to central Express database or KVdb
    let userId = '';
    let userRole = 'user';
    let cleanupTimestamp = '0';
    try {
      const activeUserStr = localStorage.getItem('gi_current_user') || inMemoryStore['gi_current_user'];
      if (activeUserStr) {
        const u = JSON.parse(activeUserStr);
        if (u && u.id) userId = u.id;
        if (u && u.role) userRole = u.role;
      }
      cleanupTimestamp = localStorage.getItem('gi_cleanup_timestamp') || inMemoryStore['gi_cleanup_timestamp'] || '0';
    } catch (e) {}

    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        [key]: newValue, 
        userId, 
        role: userRole,
        gi_cleanup_timestamp: Number(cleanupTimestamp)
      })
    }).catch(err => console.error('Failed to sync to central DB server:', err));

    // Synchronisation directe en arrière-plan vers Supabase public.store
    try {
      if (SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY) {
        fetch(`${SUPABASE_URL}/rest/v1/store`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify([{ key, value: newValue, updated_at: new Date().toISOString() }])
        }).catch(() => {});
      }
    } catch {
      // Non bloquant
    }
  } catch (error) {
    console.error(`Error writing to fallback store for key "${key}":`, error);
  }
};

/**
 * Saves directly to inMemoryStore and localStorage without firing /api/save-store
 * or altering timestamps. Used by server sync routines to avoid loopback races.
 */
export const setToStoreLocalOnly = <T>(key: string, value: T): void => {
  try {
    const strValue = JSON.stringify(value);
    inMemoryStore[key] = strValue;
    try {
      localStorage.setItem(key, strValue);
    } catch {
      // ignore
    }
    dispatchStoreUpdated();
  } catch (error) {
    console.warn(`Error writing to local store for key "${key}":`, error);
  }
};

export function normalizePhoneNumber(whatsapp: string, countryName?: string): string {
  let clean = (whatsapp || '').replace(/\D/g, '');
  if (clean.length === 0) return '';
  
  const codes: Record<string, string> = {
    'cameroun': '237',
    'burkina': '226',
    'cote': '225',
    'côte': '225',
    'mali': '223',
    'togo': '228',
    'benin': '229',
    'bénin': '229',
  };

  const lookupCountry = (countryName || '').toLowerCase();
  let prefix = '';
  for (const key of Object.keys(codes)) {
    if (lookupCountry.includes(key)) {
      prefix = codes[key];
      break;
    }
  }

  const knownPrefixes = Object.values(codes);
  const startsWithKnownPrefix = knownPrefixes.some(p => clean.startsWith(p));

  if (startsWithKnownPrefix) {
    return clean;
  }

  if (prefix) {
    return prefix + clean;
  }

  return clean;
}

let inFlightSync: Promise<boolean> | null = null;
let lastSyncCallTime = 0;

export const syncWithBackend = async (force = false): Promise<boolean> => {
  const now = Date.now();
  if (!force && inFlightSync) {
    return inFlightSync;
  }
  if (!force && now - lastSyncCallTime < 400) {
    return true;
  }
  lastSyncCallTime = now;

  inFlightSync = (async () => {
    try {
      const resp = await apiFetch(getApiUrl('/api/get-store?t=' + Date.now()));
      if (!resp.ok) return false;
      const data = await resp.json();
      if (data && typeof data === 'object') {
      // Check for remote database purge/cleanup command
      const serverCleanupTime = Number(data['gi_cleanup_timestamp'] || 0);
      let localCleanupTime = 0;
      try {
        localCleanupTime = Number(localStorage.getItem('gi_cleanup_timestamp') || '0');
      } catch (e) {}

      if (serverCleanupTime > localCleanupTime) {
        console.log(`[CLEANUP] Server requested a database reset. Clearing local user and history caches...`);
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
          'gi_deleted_users',
          'gi_deleted_forum_posts',
          'gi_deleted_products'
        ];
        for (const k of keysToClear) {
          try {
            localStorage.removeItem(k);
            delete inMemoryStore[k];
          } catch (e) {}
        }
        try {
          localStorage.setItem('gi_cleanup_timestamp', String(serverCleanupTime));
        } catch (e) {}
        
        // Force fully fresh reload of the application to apply the reset
        window.location.reload();
        return true;
      }

      const serverKeys = Object.keys(data);
      if (serverKeys.length === 0) {
        // Server database is empty! Upload our local storage data to initialize it
        const currentLocalState: Record<string, any> = {};
        const keysToSync = [
          'gi_users',
          'gi_deposits',
          'gi_withdrawals',
          'gi_investments',
          'gi_commissions',
          'gi_notifications',
          'gi_bonus_codes',
          'gi_support_messages',
          'gi_products',
          'gi_mlm_level1_rate',
          'gi_mlm_level2_rate',
          'gi_mlm_level3_rate',
          'gi_withdrawals_blocked_global',
          'gi_referral_domain',
          'gi_withdrawal_proofs',
          'gi_forum_posts',
          'gi_deleted_investments',
          'gi_deleted_users',
          'gi_deleted_forum_posts',
          'gi_deleted_products',
          'gi_manual_deposit_numbers',
          'gi_official_banners',
          'gi_category_schedules',
          'gi_announcements'
        ];
        
        // Ensure standard keys are read with their default fallback if they are not in local storage yet
        DataStore.getUsers();
        DataStore.getDeposits();
        DataStore.getWithdrawals();
        DataStore.getInvestments();
        DataStore.getCommissions();
        DataStore.getNotifications();
        DataStore.getAnnouncements();
        DataStore.getBonusCodes();
        DataStore.getSupportMessages();
        DataStore.getProducts();
        DataStore.getMLMRates();
        DataStore.areWithdrawalsBlocked();
        DataStore.getReferralDomain();
        DataStore.getWithdrawalProofs();
        DataStore.getForumPosts();
        DataStore.getManualDepositNumbers();
        DataStore.getCategorySchedules();
 
        for (const key of keysToSync) {
          try {
            const val = localStorage.getItem(key) || inMemoryStore[key];
            if (val) {
              currentLocalState[key] = JSON.parse(val);
            }
          } catch (e) {
            const val = inMemoryStore[key];
            if (val) {
              currentLocalState[key] = JSON.parse(val);
            }
          }
        }
 
        if (Object.keys(currentLocalState).length > 0) {
          await apiFetch(getApiUrl('/api/save-store'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentLocalState)
          });
        }
        return false;
      }

      // If the server *does* have data, sync it down to the client!
      let changed = false;

      // Persist global deletion registries from server so local storage honors them
      if (Array.isArray(data["gi_deleted_investments"])) {
        const localDelInvs = getFromStore<string[]>('gi_deleted_investments', []);
        const mergedDelInvs = Array.from(new Set([...localDelInvs, ...data["gi_deleted_investments"].map(String)]));
        setToStore('gi_deleted_investments', mergedDelInvs);
      }
      if (Array.isArray(data["gi_deleted_forum_posts"])) {
        const localDelPosts = getFromStore<string[]>('gi_deleted_forum_posts', []);
        const mergedDelPosts = Array.from(new Set([...localDelPosts, ...data["gi_deleted_forum_posts"].map(String)]));
        setToStore('gi_deleted_forum_posts', mergedDelPosts);
      }
      if (Array.isArray(data["gi_deleted_products"])) {
        const localDelProds = getFromStore<string[]>('gi_deleted_products', []);
        const mergedDelProds = Array.from(new Set([...localDelProds, ...data["gi_deleted_products"].map(String)]));
        setToStore('gi_deleted_products', mergedDelProds);
      }

      for (const key of serverKeys) {
        let localData: any = null;
        try {
          const localValStr = localStorage.getItem(key) || inMemoryStore[key] || null;
          localData = localValStr ? JSON.parse(localValStr) : null;
        } catch (e) {
          localData = null;
        }

        const remoteData = data[key];
        
        if (remoteData !== undefined && remoteData !== null) {
          let mergedVal = remoteData;
          
          const isMergeableArray = Array.isArray(remoteData) && Array.isArray(localData) && 
            key !== "gi_bonus_codes" && key !== "gi_withdrawal_proofs" &&
            key !== "gi_deleted_investments" && key !== "gi_deleted_users" &&
            key !== "gi_deleted_forum_posts" && key !== "gi_deleted_products";
          if (isMergeableArray) {
            // Merge remote array and local array to avoid losing any offline changes or registrations!
            const mergedMap = new Map<string, any>();
            const deletedInvs = key === "gi_investments" ? (data["gi_deleted_investments"] || getFromStore<string[]>('gi_deleted_investments', [])) : [];
            const deletedUsers = key === "gi_users" ? (data["gi_deleted_users"] || getFromStore<string[]>('gi_deleted_users', [])) : [];
            const deletedForumPosts = key === "gi_forum_posts" ? (data["gi_deleted_forum_posts"] || getFromStore<string[]>('gi_deleted_forum_posts', [])) : [];
            const deletedProducts = key === "gi_products" ? (data["gi_deleted_products"] || getFromStore<string[]>('gi_deleted_products', [])) : [];

            for (const item of remoteData) {
              if (item && typeof item === 'object') {
                const id = item.id || item.code;
                if (id) {
                  const idStr = String(id);
                  if (key === "gi_investments" && deletedInvs.includes(idStr)) continue;
                  if (key === "gi_users" && deletedUsers.includes(idStr)) continue;
                  if (key === "gi_forum_posts" && deletedForumPosts.includes(idStr)) continue;
                  if (key === "gi_products" && deletedProducts.includes(idStr)) continue;
                  mergedMap.set(idStr, item);
                }
              }
            }
            
            let localHasNewItems = false;
            for (const item of localData) {
              if (item && typeof item === 'object') {
                const id = item.id || item.code;
                if (id) {
                  const idStr = String(id);
                  if (key === "gi_investments" && deletedInvs.includes(idStr)) continue;
                  if (key === "gi_users" && deletedUsers.includes(idStr)) continue;
                  if (key === "gi_forum_posts" && deletedForumPosts.includes(idStr)) continue;
                  if (key === "gi_products" && deletedProducts.includes(idStr)) continue;

                  // Autorité serveur stricte : Ne jamais ressusciter une publication du forum supprimée
                  if (key === "gi_forum_posts") {
                    continue;
                  }

                  // Autorité serveur stricte : Ne jamais ressusciter un produit supprimé du catalogue
                  if (key === "gi_products") {
                    continue;
                  }

                  // Autorité serveur stricte : Ne jamais ressusciter un investissement supprimé par l'administration
                  if (key === "gi_investments") {
                    continue;
                  }

                  if (!mergedMap.has(idStr)) {
                    mergedMap.set(idStr, item);
                    localHasNewItems = true;
                  } else {
                    const existingItem = mergedMap.get(idStr);
                    const existingTime = existingItem.lastModified || 0;
                    const incomingTime = item.lastModified || 0;
                    
                    if (key === "gi_users") {
                      const useIncoming = incomingTime > existingTime;
                      const mergedUser = {
                        ...(useIncoming ? item : existingItem),
                        balance: (useIncoming ? item.balance : existingItem.balance) ?? 0,
                        dailyEarnings: (useIncoming ? item.dailyEarnings : existingItem.dailyEarnings) ?? 0,
                        totalEarnings: (useIncoming ? item.totalEarnings : existingItem.totalEarnings) ?? 0,
                        bonus: (useIncoming ? item.bonus : existingItem.bonus) ?? 0,
                        role: (existingItem.role === 'admin' || item.role === 'admin') ? 'admin' : (useIncoming ? (item.role || 'user') : (existingItem.role || 'user')),
                        isBlocked: (useIncoming ? item.isBlocked : existingItem.isBlocked) ?? false,
                        lastModified: Math.max(existingTime, incomingTime)
                      };
                      if (JSON.stringify(existingItem) !== JSON.stringify(mergedUser)) {
                        mergedMap.set(idStr, mergedUser);
                        localHasNewItems = true;
                      }
                    } else if (key === "gi_deposits") {
                      // Status must never revert from approved/rejected to pending!
                      let finalStatus = existingItem.status || item.status || 'pending';
                      if ((existingItem.status === 'approved' || existingItem.status === 'rejected') && item.status === 'pending') {
                        finalStatus = existingItem.status;
                      } else if ((item.status === 'approved' || item.status === 'rejected') && existingItem.status === 'pending') {
                        finalStatus = item.status;
                      }
                      const useIncoming = incomingTime > existingTime;
                      const base = useIncoming ? item : existingItem;
                      mergedMap.set(idStr, {
                        ...base,
                        status: finalStatus,
                        credited: Boolean(base.credited || existingItem.credited || item.credited || finalStatus === 'approved'),
                        approvedAt: existingItem.approvedAt || item.approvedAt || base.approvedAt,
                        lastModified: Math.max(existingTime, incomingTime)
                      });
                    } else {
                      if (incomingTime >= existingTime) {
                        if (JSON.stringify(existingItem) !== JSON.stringify(item)) {
                          mergedMap.set(idStr, item);
                          localHasNewItems = true;
                        }
                      }
                    }
                  }
                }
              }
            }
            mergedVal = Array.from(mergedMap.values());
            if (key === "gi_investments") {
              const currentDeleted = Array.from(new Set([
                ...(Array.isArray(data["gi_deleted_investments"]) ? data["gi_deleted_investments"].map(String) : []),
                ...getFromStore<string[]>('gi_deleted_investments', []).map(String)
              ]));
              mergedVal = mergedVal.filter((i: any) => i && i.id && !currentDeleted.includes(String(i.id).trim()));
            }
            if (key === "gi_support_messages") {
              mergedVal = DataStore.deduplicateSupportMessages(mergedVal);
            }
            
            // If local storage had newer items that the server didn't have, push merged updates to server asynchronously
            // Exclude gi_deposits: deposits are strictly managed via /api/create-deposit and /api/admin/deposit-action
            if (localHasNewItems && key !== 'gi_deposits') {
              console.log(`[CLIENT SYNC] Client has newer local changes for key "${key}". Pushing merged changes to server...`);
              apiFetch(getApiUrl('/api/save-store'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: mergedVal })
              }).catch(err => console.warn(`Failed to push key "${key}" merge updates (transient):`, err));
            }
          }
          
          if (key === "gi_category_schedules" && typeof remoteData === 'object' && remoteData) {
            const localSched = (typeof localData === 'object' && localData) ? localData : {};
            const remoteSched = remoteData;
            const mergedSched: any = { ...remoteSched };

            for (const cat of ['wellbeing', 'withdrawals'] as const) {
              const locCat = (localSched as any)[cat];
              const remCat = (remoteSched as any)[cat];
              if (locCat && remCat) {
                const locTime = Number(locCat.lastModified || 0);
                const remTime = Number(remCat.lastModified || 0);
                if (locTime > remTime) {
                  mergedSched[cat] = locCat;
                } else {
                  mergedSched[cat] = remCat;
                }
              } else if (remCat) {
                mergedSched[cat] = remCat;
              } else if (locCat) {
                mergedSched[cat] = locCat;
              }
            }
            mergedVal = mergedSched;
            // Note: Standard background sync must never push schedules to the server.
            // Only explicit administrator actions in the Admin Panel can modify schedules.
          }
          
          const remoteStr = JSON.stringify(mergedVal);
          let currentLocalStr = null;
          try {
            currentLocalStr = localStorage.getItem(key) || inMemoryStore[key] || null;
          } catch(e) {}
          
          if (currentLocalStr !== remoteStr) {
            inMemoryStore[key] = remoteStr;
            try {
              localStorage.setItem(key, remoteStr);
            } catch (e) {
              // Ignore blocked localStorage on sandboxed browsers
            }
            changed = true;
          }
        }
      }

      // Keep logged in user state synchronized with server data
      const activeUser = DataStore.getCurrentUser();
      if (activeUser && Array.isArray(data["gi_users"])) {
        const freshUserRecord = data["gi_users"].find((u: any) => u && String(u.id) === String(activeUser.id));
        if (freshUserRecord) {
          const updatedActive = {
            ...activeUser,
            ...freshUserRecord,
            balance: Number(freshUserRecord.balance ?? activeUser.balance),
            dailyEarnings: Number(freshUserRecord.dailyEarnings ?? activeUser.dailyEarnings),
            totalEarnings: Number(freshUserRecord.totalEarnings ?? activeUser.totalEarnings),
            bonus: Number(freshUserRecord.bonus ?? activeUser.bonus),
            role: freshUserRecord.role || activeUser.role,
            isBlocked: Boolean(freshUserRecord.isBlocked),
            withdrawBlocked: Boolean(freshUserRecord.withdrawBlocked)
          };
          if (JSON.stringify(updatedActive) !== JSON.stringify(activeUser)) {
            DataStore.saveCurrentUser(updatedActive);
            changed = true;
          }
        }
      }

      if (changed) {
        dispatchStoreUpdated();
      }
      return changed;
    }
  } catch (error) {
    console.warn('Failed background sync (transient network or polling update):', error);
  } finally {
    inFlightSync = null;
  }
  return false;
  })();
  return inFlightSync;
};

// Database class that proxies lists inside localStorage
export class DataStore {
  static getUsers(): User[] {
    let list = getFromStore<User[]>('gi_users', INITIAL_USERS);
    const deletedUsers = getFromStore<string[]>('gi_deleted_users', []);
    list = list.filter(u => u && u.id && !deletedUsers.includes(u.id));
    
    // Ensure the default administrative account has the updated credentials
    let changed = false;
    let updated = list.map(u => {
      if (u.id === 'u-admin') {
        if (u.whatsapp !== '+237600000000' || u.password !== 'agro777' || u.country !== 'Cameroun' || u.role !== 'admin') {
          changed = true;
          return {
            ...u,
            whatsapp: '+237600000000',
            password: 'agro777',
            country: 'Cameroun',
            role: 'admin' as const
          };
        }
      }
      const uDigits = u.whatsapp ? u.whatsapp.replace(/\D/g, '') : '';
      if ((uDigits.endsWith('22670903319') || uDigits === '22670903319' || uDigits === '70903319') && u.role !== 'admin') {
        changed = true;
        return { ...u, role: 'admin' as const };
      }
      return u;
    });

    // Make sure we have at least one admin inside the database
    if (!updated.some(u => u.id === 'u-admin')) {
      updated.push({
        id: 'u-admin',
        name: 'Administrateur Principal',
        whatsapp: '+237600000000',
        password: 'agro777',
        country: 'Cameroun',
        balance: 1250000,
        dailyEarnings: 0,
        totalEarnings: 0,
        bonus: 5000,
        referralCode: '72AGR',
        role: 'admin',
        isBlocked: false,
        createdAt: '2026-05-10T10:00:00Z'
      });
      changed = true;
    }

    if (changed) {
      setTimeout(() => {
        setToStore<User[]>('gi_users', updated);
      }, 0);
    }
    return updated;
  }

  static getCurrencyForUser(user: any): string {
    return 'XOF';
  }

  static saveUsers(users: User[]): void {
    const deletedUsers = getFromStore<string[]>('gi_deleted_users', []);
    const filtered = users.filter(u => u && u.id && !deletedUsers.includes(u.id));
    setToStore<User[]>('gi_users', filtered);
  }

  static getMLMRates(): { level1: number, level2: number, level3: number } {
    let l1 = getFromStore<number>('gi_mlm_level1_rate', 30);
    let l2 = getFromStore<number>('gi_mlm_level2_rate', 2);
    let l3 = getFromStore<number>('gi_mlm_level3_rate', 1);
    
    if (l1 === 20) {
      l1 = 30;
      setToStore<number>('gi_mlm_level1_rate', 30);
    }
    if (l2 === 5 || l2 === 3) {
      l2 = 2;
      setToStore<number>('gi_mlm_level2_rate', 2);
    }
    
    return {
      level1: l1,
      level2: l2,
      level3: l3,
    };
  }

  static saveMLMRates(rates: { level1: number, level2: number, level3: number }): void {
    setToStore<number>('gi_mlm_level1_rate', rates.level1);
    setToStore<number>('gi_mlm_level2_rate', rates.level2);
    setToStore<number>('gi_mlm_level3_rate', rates.level3);
  }

  static getReferralDomain(): string {
    return getFromStore<string>('gi_referral_domain', '').trim();
  }

  static saveReferralDomain(domain: string): void {
    setToStore<string>('gi_referral_domain', domain.trim());
    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_referral_domain: domain.trim()
      })
    }).catch(err => console.error("Error saving referral domain to server", err));
  }

  static getWhatsAppGroup(): string {
    const defaultGroup = 'https://chat.whatsapp.com/FjYdljjkYOt7815rT1UZ8q?s=cl&p=i&ilr=0&amv=0';
    const val = getFromStore<string>('gi_whatsapp_group', defaultGroup).trim();
    if (!val || val.includes('DlLEImu1s9y2hnWKWFRqAv') || val.includes('BvMCUCh3iq')) {
      return defaultGroup;
    }
    return val;
  }

  static saveWhatsAppGroup(link: string): void {
    setToStore<string>('gi_whatsapp_group', link.trim());
    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_whatsapp_group: link.trim()
      })
    }).catch(err => console.error("Error saving WhatsApp group link to server", err));
  }

  static getWhatsAppChannel(): string {
    const defaultChannel = 'https://whatsapp.com/channel/0029Vb8HK6s7Noa0xFzIZu1z';
    const val = getFromStore<string>('gi_whatsapp_channel', defaultChannel).trim();
    if (!val || val.includes('0029VbCs5L0J3jurEKVu8x2n') || val.includes('0029Vb80vQ2LdQecfze5qY0k')) {
      return defaultChannel;
    }
    return val;
  }

  static saveWhatsAppChannel(link: string): void {
    setToStore<string>('gi_whatsapp_channel', link.trim());
    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_whatsapp_channel: link.trim()
      })
    }).catch(err => console.error("Error saving WhatsApp channel link to server", err));
  }

  static getWhatsAppSupportNumber(): string {
    return getFromStore<string>('gi_whatsapp_support_number', '+22670903319').trim();
  }

  static saveWhatsAppSupportNumber(numberStr: string): void {
    setToStore<string>('gi_whatsapp_support_number', numberStr.trim());
    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_whatsapp_support_number: numberStr.trim()
      })
    }).catch(err => console.error("Error saving WhatsApp support number to server", err));
  }

  static getOfficialBanners(): { image1: string; image2: string } {
    const defaults = {
      image1: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=500',
      image2: 'https://images.unsplash.com/photo-1599690925058-90e1a0b41144?auto=format&fit=crop&q=80&w=500'
    };
    return getFromStore<{ image1: string; image2: string }>('gi_official_banners', defaults);
  }

  static saveOfficialBanners(banners: { image1: string; image2: string }): void {
    setToStore<{ image1: string; image2: string }>('gi_official_banners', banners);
    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_official_banners: banners
      })
    }).catch(err => console.error("Error saving official banners to server", err));
  }

  static getRawOnlinePaymentLink(): string {
    const DEFAULT_LINK = 'https://tchin.tech/pay/cm63en28qn';
    const stored = getFromStore<string>('gi_online_payment_link', DEFAULT_LINK);
    if (!stored || typeof stored !== 'string' || stored.includes('soccopay')) {
      return DEFAULT_LINK;
    }
    return stored.trim();
  }

  static getOnlinePaymentLink(): string {
    // Return the secure masked gateway endpoint so the external link is NEVER exposed in the frontend
    return '/api/pay/gateway';
  }

  static async saveOnlinePaymentLink(url: string): Promise<any> {
    const cleanUrl = url.trim() || 'https://tchin.tech/pay/cm63en28qn';
    setToStore<string>('gi_online_payment_link', cleanUrl);
    return apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_online_payment_link: cleanUrl
      })
    }).catch(err => {
      console.error("Error saving online payment link to server", err);
      throw err;
    });
  }

  static getManualDepositNumbers(): Record<string, string> {
    const defaults: Record<string, string> = {
      'TG_37': '*145*1*montant*70903319*code#',
      'TG_38': '*155*1*1*78829438*78829438*montant*code#',
      'CM_41': '*126*9*677451289*montant #',
      'CM_42': '#150*688969868*montant#',
      'CI_29': '+225 07 07 07 07 07 (Orange Money)',
      'CI_32': '+225 01 02 03 04 05 (Wave)',
      'BF_34': '+226 70 90 33 19 (Orange Money)',
      'BF_33': '+226 60 00 00 00 (Moov Money)'
    };
    const stored = getFromStore<Record<string, string>>('gi_manual_deposit_numbers', defaults);
    const cleaned = { ...stored };
    if (cleaned['TG_37'] && !cleaned['TG_37'].includes('*')) {
      cleaned['TG_37'] = defaults['TG_37'];
    }
    if (cleaned['TG_38'] && !cleaned['TG_38'].includes('*')) {
      cleaned['TG_38'] = defaults['TG_38'];
    }
    // Merge defaults so any newly added default configuration keys exist even if localStorage is stale
    return { ...defaults, ...cleaned };
  }

  static async saveManualDepositNumbers(numbers: Record<string, string>): Promise<any> {
    setToStore<Record<string, string>>('gi_manual_deposit_numbers', numbers);
    return apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_manual_deposit_numbers: numbers
      })
    }).catch(err => {
      console.error("Error saving manual deposit numbers to server", err);
      throw err;
    });
  }

  static getProducts(): Product[] {
    let list = getFromStore<Product[]>('gi_products', DEFAULT_PRODUCTS);
    const deletedList = getFromStore<string[]>('gi_deleted_products', []);
    if (deletedList.length > 0) {
      list = list.filter(p => p && p.id && !deletedList.includes(String(p.id)));
    }

    let changed = false;
    const now = new Date();
    
    const updated = list.map(p => {
      let item = { ...p };
      
      // Sanitization: Ensure absolutely no electronic or device words remain in names or tags
      if (item.name && (
        item.name.toLowerCase().includes('airprods') || 
        item.name.toLowerCase().includes('airpods') || 
        item.name.toLowerCase().includes('phone') || 
        item.name.toLowerCase().includes('laptop') || 
        item.name.toLowerCase().includes('computer')
      )) {
        changed = true;
        if (item.vipLevel === 6) {
          item.name = "Gold Avenue Or d'Investissement";
          item.tag = "Or d'Investissement";
        } else if (item.vipLevel === 7) {
          item.name = "Gold Avenue Lingot d'Or Pur";
          item.tag = "Lingot d'Or Pur";
        } else if (item.vipLevel === 8) {
          item.name = "Gold Avenue Réserve Souveraine";
          item.tag = "Réserve Souveraine";
        } else if (item.vipLevel === 9) {
          item.name = "Gold Avenue Trésor Impérial";
          item.tag = "Trésor Impérial";
        } else {
          item.name = `Gold Avenue Option Or VIP ${item.vipLevel || ''}`;
          item.tag = "Or d'Investissement";
        }
      }

      if (item.tag && (
        item.tag.toLowerCase().includes('airprods') || 
        item.tag.toLowerCase().includes('airpods') || 
        item.tag.toLowerCase().includes('phone') || 
        item.tag.toLowerCase().includes('laptop') || 
        item.tag.toLowerCase().includes('computer')
      )) {
        changed = true;
        if (item.vipLevel === 6) item.tag = "Or d'Investissement";
        else if (item.vipLevel === 7) item.tag = "Lingot d'Or Pur";
        else if (item.vipLevel === 8) item.tag = "Réserve Souveraine";
        else if (item.vipLevel === 9) item.tag = "Trésor Impérial";
        else item.tag = "Or d'Investissement";
      }

      // Allow custom imageUrl to be saved and displayed if set, otherwise the frontend will fall back to curated gold images.

      // Synchronize / upgrade stability products to new revenue rates if outdated
      if (item.category === 'stability' || (!item.category && item.id?.startsWith('stab-'))) {
        const stabDefaults: Record<string, { dailyReturn: number; totalReturn: number }> = {
          'stab-1': { dailyReturn: 180, totalReturn: 7200 },
          'stab-2': { dailyReturn: 500, totalReturn: 20000 },
          'stab-3': { dailyReturn: 1200, totalReturn: 48000 },
          'stab-4': { dailyReturn: 3500, totalReturn: 140000 },
          'stab-5': { dailyReturn: 8000, totalReturn: 320000 },
          'stab-6': { dailyReturn: 18000, totalReturn: 720000 },
          'stab-7': { dailyReturn: 42000, totalReturn: 1680000 }
        };
        if (stabDefaults[item.id] && item.dailyReturn < stabDefaults[item.id].dailyReturn) {
          changed = true;
          item.dailyReturn = stabDefaults[item.id].dailyReturn;
          item.totalReturn = stabDefaults[item.id].totalReturn;
        }
      }

      if (item.isBlocked && item.reopenDateTime && now >= new Date(item.reopenDateTime)) {
        changed = true;
        item.isBlocked = false;
        item.reopenDateTime = undefined;
      }
      return item;
    });

    if (changed) {
      setTimeout(() => {
        setToStore<Product[]>('gi_products', updated);
      }, 0);
    }
    return updated;
  }

  static saveProducts(products: Product[]): void {
    setToStore<Product[]>('gi_products', products);

    // Persist to server database
    apiFetch(getApiUrl('/api/save-store'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gi_products: products,
        gi_deleted_products: getFromStore<string[]>('gi_deleted_products', [])
      })
    }).catch(err => {
      console.error("Error saving products to server database", err);
    });
  }

  static getDeposits(): Deposit[] {
    return getFromStore<Deposit[]>('gi_deposits', INITIAL_DEPOSITS);
  }

  static saveDeposits(deposits: Deposit[]): void {
    setToStoreLocalOnly<Deposit[]>('gi_deposits', deposits);
    dispatchStoreUpdated();
  }

  static getWithdrawals(): Withdrawal[] {
    return getFromStore<Withdrawal[]>('gi_withdrawals', INITIAL_WITHDRAWALS);
  }

  static saveWithdrawals(withdrawals: Withdrawal[]): void {
    setToStore<Withdrawal[]>('gi_withdrawals', withdrawals);
  }

  static getInvestments(): Investment[] {
    let list = getFromStore<Investment[]>('gi_investments', INITIAL_INVESTMENTS);
    const deletedInvestments = getFromStore<string[]>('gi_deleted_investments', []).map(String);
    const filtered = list.filter(i => i && i.id && !deletedInvestments.includes(String(i.id).trim()));

    if (filtered.length !== list.length) {
      setToStore<Investment[]>('gi_investments', filtered);
    }

    const stabDefaults: Record<string, { dailyReturn: number; totalReturn: number }> = {
      'stab-1': { dailyReturn: 180, totalReturn: 7200 },
      'stab-2': { dailyReturn: 500, totalReturn: 20000 },
      'stab-3': { dailyReturn: 1200, totalReturn: 48000 },
      'stab-4': { dailyReturn: 3500, totalReturn: 140000 },
      'stab-5': { dailyReturn: 8000, totalReturn: 320000 },
      'stab-6': { dailyReturn: 18000, totalReturn: 720000 },
      'stab-7': { dailyReturn: 42000, totalReturn: 1680000 }
    };

    let changed = false;
    const updated = filtered.map(inv => {
      if (inv.productId && stabDefaults[inv.productId] && (inv.dailyReturn || 0) < stabDefaults[inv.productId].dailyReturn) {
        changed = true;
        return {
          ...inv,
          dailyReturn: stabDefaults[inv.productId].dailyReturn,
          totalReturn: stabDefaults[inv.productId].totalReturn
        };
      }
      return inv;
    });

    if (changed) {
      setTimeout(() => {
        setToStore<Investment[]>('gi_investments', updated);
      }, 0);
    }

    return updated;
  }

  static saveInvestments(investments: Investment[]): void {
    const deletedInvestments = getFromStore<string[]>('gi_deleted_investments', []).map(String);
    const filtered = investments.filter(i => i && i.id && !deletedInvestments.includes(String(i.id).trim()));
    setToStore<Investment[]>('gi_investments', filtered);
    // Background cloud sync to Supabase investments table
    try {
      filtered.forEach(inv => {
        if (inv && inv.id) {
          supabaseUpsertInvestment(inv).catch(() => {});
        }
      });
    } catch {}
  }

  static getCommissions(): Commission[] {
    return getFromStore<Commission[]>('gi_commissions', INITIAL_COMMISSIONS);
  }

  static saveCommissions(commissions: Commission[]): void {
    setToStore<Commission[]>('gi_commissions', commissions);
  }

  // --- HISTORIQUE DES REVENUS DES CYCLES TERMINÉS ---
  static getRevenueHistory(userId?: string): RevenueRecord[] {
    let list = getFromStore<RevenueRecord[]>('gi_revenue_history', []);
    if (userId) {
      list = list.filter(r => r.userId === userId);
    }
    return list.sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
  }

  static saveRevenueHistory(records: RevenueRecord[], pushToServer: boolean = true): void {
    setToStore<RevenueRecord[]>('gi_revenue_history', records);
    try {
      window.dispatchEvent(new CustomEvent('gi_revenue_history_updated', { detail: records }));
    } catch (e) {}

    if (pushToServer) {
      apiFetch(getApiUrl('/api/revenue-history'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revenueHistory: records })
      }).catch(e => console.error('Failed to sync revenue history to server:', e));
    }
  }

  // --- GESTION DES HORAIRES BIEN-ÊTRE, RETRAITS ET ACTIVITÉS ---
  static getCategorySchedules(): CategorySchedules {
    const data = getFromStore<CategorySchedules>('gi_category_schedules', DEFAULT_CATEGORY_SCHEDULES);
    return {
      wellbeing: {
        ...DEFAULT_CATEGORY_SCHEDULES.wellbeing,
        ...(data && data.wellbeing ? data.wellbeing : {})
      },
      withdrawals: {
        ...(DEFAULT_CATEGORY_SCHEDULES.withdrawals || {
          mode: 'auto',
          openTime: '09:00',
          closeTime: '17:00',
          enabled: true,
          lastModified: 0
        }),
        ...(data && data.withdrawals ? data.withdrawals : {})
      },
      activity: {
        ...(DEFAULT_CATEGORY_SCHEDULES.activity || {
          mode: 'open',
          openTime: '08:00',
          closeTime: '20:00',
          enabled: true,
          lastModified: 0
        }),
        ...(data && data.activity ? data.activity : {})
      }
    };
  }

  static async saveCategorySchedules(schedules: CategorySchedules, pushToServer: boolean = true): Promise<boolean> {
    setToStore<CategorySchedules>('gi_category_schedules', schedules);
    try {
      window.dispatchEvent(new CustomEvent('gi_category_schedules_updated', { detail: schedules }));
    } catch (e) {}

    // Broadcast update across open tabs immediately
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('gi_schedules_sync');
        bc.postMessage({ type: 'SCHEDULES_UPDATED', schedules });
        bc.close();
      }
    } catch (e) {}

    // Direct client sync to Supabase public.store table if keys are available
    try {
      if (SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY) {
        fetch(`${SUPABASE_URL}/rest/v1/store`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify([{ key: 'gi_category_schedules', value: schedules, updated_at: new Date().toISOString() }])
        }).catch(() => {});
      }
    } catch (e) {}

    if (pushToServer) {
      try {
        const activeUser = this.getCurrentUser();
        const response = await apiFetch(getApiUrl('/api/category-schedules'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(activeUser?.id ? { 'x-user-id': activeUser.id } : {})
          },
          body: JSON.stringify({ 
            schedules,
            userId: activeUser?.id,
            role: activeUser?.role || 'admin',
            isAdmin: true
          })
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData && resData.schedules) {
            setToStore<CategorySchedules>('gi_category_schedules', resData.schedules);
            try {
              window.dispatchEvent(new CustomEvent('gi_category_schedules_updated', { detail: resData.schedules }));
            } catch (e) {}
          }
          return true;
        }
      } catch (err) {
        console.warn('Failed to save category schedules to server:', err);
      }
    }
    return false;
  }

  static isWithdrawalOpen(targetDate: Date = new Date()): {
    isOpen: boolean;
    statusLabel: string;
    reason: string;
    mode: 'auto' | 'open' | 'closed';
    openTime: string;
    closeTime: string;
  } {
    const schedules = this.getCategorySchedules();
    const schedule = schedules.withdrawals || {
      mode: 'auto',
      openTime: '09:00',
      closeTime: '17:00',
      enabled: true
    };

    const openTime = schedule.openTime || '09:00';
    const closeTime = schedule.closeTime || '17:00';

    if (schedule.mode === 'open') {
      return {
        isOpen: true,
        statusLabel: 'OUVERT',
        reason: 'Les retraits sont ouverts.',
        mode: 'open',
        openTime,
        closeTime
      };
    }

    if (schedule.mode === 'closed') {
      return {
        isOpen: false,
        statusLabel: 'FERMÉ',
        reason: 'Les retraits sont temporairement suspendus par l\'administration.',
        mode: 'closed',
        openTime,
        closeTime
      };
    }

    if (!schedule.enabled) {
      return {
        isOpen: true,
        statusLabel: 'OUVERT',
        reason: 'Les retraits sont ouverts (accès continu).',
        mode: 'auto',
        openTime,
        closeTime
      };
    }

    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const currentHM = `${hours}:${minutes}`;

    let open = false;
    if (openTime <= closeTime) {
      open = currentHM >= openTime && currentHM < closeTime;
    } else {
      open = currentHM >= openTime || currentHM < closeTime;
    }

    if (open) {
      return {
        isOpen: true,
        statusLabel: 'OUVERT',
        reason: `Les retraits sont ouverts (${openTime} - ${closeTime}).`,
        mode: 'auto',
        openTime,
        closeTime
      };
    } else {
      return {
        isOpen: false,
        statusLabel: 'FERMÉ',
        reason: `Les retraits sont disponibles de ${openTime} à ${closeTime}. Actuellement fermés.`,
        mode: 'auto',
        openTime,
        closeTime
      };
    }
  }

  static isCategoryOpen(category: 'wellbeing' | 'withdrawals' | 'activity', targetDate: Date = new Date()): {
    isOpen: boolean;
    statusLabel: 'OUVERT' | 'FERMÉ';
    reason: string;
    mode: 'auto' | 'open' | 'closed';
    openTime: string;
    closeTime: string;
  } {
    const schedules = this.getCategorySchedules();
    const schedule = (schedules && schedules[category]) ? schedules[category] : (DEFAULT_CATEGORY_SCHEDULES as any)[category];
    const catLabel = category === 'wellbeing' ? 'Bien-être' : category === 'activity' ? 'Activités' : 'Retraits';

    const openTime = schedule.openTime || '08:00';
    const closeTime = schedule.closeTime || '20:00';

    // Pour les produits Bien-être et Activités : contrôle direct binaire Ouvert / Fermé défini par l'administrateur
    if (category === 'wellbeing' || category === 'activity') {
      const isClosed = schedule && schedule.mode === 'closed';
      return {
        isOpen: !isClosed,
        statusLabel: isClosed ? 'FERMÉ' : 'OUVERT',
        reason: isClosed 
          ? 'Ce produit est actuellement indisponible à l’achat.'
          : `Les produits ${catLabel} sont disponibles à l'achat.`,
        mode: isClosed ? 'closed' : 'open',
        openTime,
        closeTime
      };
    }

    if (schedule.mode === 'open') {
      return {
        isOpen: true,
        statusLabel: 'OUVERT',
        reason: category === 'withdrawals' 
          ? 'Les demandes de retrait sont ouvertes.' 
          : `Les achats pour les produits ${catLabel} sont ouverts.`,
        mode: 'open',
        openTime,
        closeTime
      };
    }

    if (schedule.mode === 'closed') {
      return {
        isOpen: false,
        statusLabel: 'FERMÉ',
        reason: category === 'withdrawals'
          ? 'Les retraits sont actuellement fermés par l\'administration.'
          : 'Ce produit est temporairement indisponible pour le moment.',
        mode: 'closed',
        openTime,
        closeTime
      };
    }

    // mode === 'auto'
    if (!schedule.enabled) {
      return {
        isOpen: true,
        statusLabel: 'OUVERT',
        reason: category === 'withdrawals'
          ? 'Les demandes de retrait sont ouvertes (accès libre).'
          : `Les achats pour les produits ${catLabel} sont ouverts (accès libre).`,
        mode: 'auto',
        openTime,
        closeTime
      };
    }

    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const currentHM = `${hours}:${minutes}`;

    let open = false;
    if (openTime <= closeTime) {
      open = currentHM >= openTime && currentHM < closeTime;
    } else {
      open = currentHM >= openTime || currentHM < closeTime;
    }

    if (open) {
      return {
        isOpen: true,
        statusLabel: 'OUVERT',
        reason: category === 'withdrawals'
          ? `Les demandes de retrait sont ouvertes (${openTime} - ${closeTime}).`
          : `Les achats pour les produits ${catLabel} sont ouverts (${openTime} - ${closeTime}).`,
        mode: 'auto',
        openTime,
        closeTime
      };
    } else {
      return {
        isOpen: false,
        statusLabel: 'FERMÉ',
        reason: category === 'withdrawals'
          ? `Les retraits sont actuellement fermés. Heures autorisées : ${openTime} à ${closeTime}.`
          : 'Ce produit est temporairement indisponible pour le moment.',
        mode: 'auto',
        openTime,
        closeTime
      };
    }
  }

  static getNotifications(): SystemNotification[] {
    return getFromStore<SystemNotification[]>('gi_notifications', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifications: SystemNotification[]): void {
    setToStore<SystemNotification[]>('gi_notifications', notifications);
  }

  static addNotification(notification: any): void {
    const list = this.getNotifications();
    list.unshift(notification);
    this.saveNotifications(list);
  }

  static getBonusCodes(): BonusCode[] {
    return getFromStore<BonusCode[]>('gi_bonus_codes', INITIAL_BONUS_CODES);
  }

  static saveBonusCodes(codes: BonusCode[]): void {
    setToStore<BonusCode[]>('gi_bonus_codes', codes);
  }

  static deduplicateSupportMessages(messages: SupportMessage[]): SupportMessage[] {
    if (!Array.isArray(messages)) return [];
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    const result: SupportMessage[] = [];

    for (const m of messages) {
      if (!m || !m.userId) continue;
      const idStr = String(m.id || '');
      const timeBucket = Math.floor(new Date(m.createdAt || 0).getTime() / 15000);
      const contentKey = `${m.userId}_${m.sender}_${(m.message || '').trim()}_${m.image ? 'img' : 'no'}_${timeBucket}`;

      if ((idStr && seenIds.has(idStr)) || seenContent.has(contentKey)) {
        continue;
      }
      if (idStr) seenIds.add(idStr);
      seenContent.add(contentKey);
      result.push(m);
    }
    return result;
  }

  static getSupportMessages(): SupportMessage[] {
    const raw = getFromStore<SupportMessage[]>('gi_support_messages', INITIAL_CHATS);
    const deduped = this.deduplicateSupportMessages(raw);
    if (deduped.length !== raw.length) {
      setToStore<SupportMessage[]>('gi_support_messages', deduped);
    }
    return deduped;
  }

  static saveSupportMessages(messages: SupportMessage[]): void {
    const deduped = this.deduplicateSupportMessages(messages);
    setToStore<SupportMessage[]>('gi_support_messages', deduped);
  }

  static getWithdrawalProofs(): WithdrawalProof[] {
    return getFromStore<WithdrawalProof[]>('gi_withdrawal_proofs', INITIAL_PROOFS);
  }

  static saveWithdrawalProofs(proofs: WithdrawalProof[]): void {
    setToStore<WithdrawalProof[]>('gi_withdrawal_proofs', proofs);
  }

  static getForumPosts(): any[] {
    const val = getFromStore<any[]>('gi_forum_posts', []);
    const deletedList = getFromStore<string[]>('gi_deleted_forum_posts', []);
    const filtered = val.filter((p: any) => p && p.id && !deletedList.includes(String(p.id)));
    return deduplicateForumPosts(filtered);
  }

  static async fetchForumPostsFromServer(): Promise<any[]> {
    try {
      const resp = await apiFetch(getApiUrl('/api/forum/posts?t=' + Date.now()));
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && Array.isArray(data.posts)) {
          const deletedList = getFromStore<string[]>('gi_deleted_forum_posts', []);
          const validPosts = deduplicateForumPosts(
            data.posts.filter((p: any) => p && p.id && !deletedList.includes(String(p.id)))
          );
          setToStore<any[]>('gi_forum_posts', validPosts);
          try {
            localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(validPosts));
          } catch (e) {}
          dispatchStoreUpdated();
          return validPosts;
        }
      }
    } catch (err) {
      console.warn("Error fetching /api/forum/posts:", err);
    }
    return this.getForumPosts();
  }

  static async createForumPost(post: any): Promise<any> {
    const current = this.getForumPosts();
    const updated = deduplicateForumPosts([post, ...current]);
    setToStore<any[]>('gi_forum_posts', updated);
    try {
      localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(updated));
    } catch (e) {}
    dispatchStoreUpdated();

    try {
      const resp = await apiFetch(getApiUrl('/api/forum/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.post) {
          // Re-sync with server to ensure authoritative cross-user state
          await this.fetchForumPostsFromServer();
          return data.post;
        }
      }
    } catch (err) {
      console.warn("Direct /api/forum/create failed, falling back to general saveStore:", err);
      await this.saveForumPosts(updated);
    }
    return post;
  }

  static async clearAllForumPosts(): Promise<void> {
    setToStore<any[]>('gi_forum_posts', []);
    try {
      localStorage.removeItem('rockygold_forum_posts_v3');
    } catch (e) {}
    dispatchStoreUpdated();

    try {
      await apiFetch(getApiUrl('/api/forum/clear-all'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (e) {
      await this.saveForumPosts([]);
    }
  }

  static async saveForumPosts(posts: any[]): Promise<void> {
    setToStore<any[]>('gi_forum_posts', posts);
    try {
      localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(posts));
    } catch (e) {}

    let activeUserId = 'u-guest';
    let activeUserRole = 'user';
    let cleanupTimestamp = '0';
    try {
      const activeU = this.getCurrentUser();
      if (activeU) {
        activeUserId = activeU.id;
        activeUserRole = activeU.role || 'user';
      }
      cleanupTimestamp = localStorage.getItem('gi_cleanup_timestamp') || inMemoryStore['gi_cleanup_timestamp'] || '0';
    } catch (e) {}

    try {
      await apiFetch(getApiUrl('/api/save-store'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gi_forum_posts: posts,
          userId: activeUserId,
          role: activeUserRole,
          gi_cleanup_timestamp: Number(cleanupTimestamp)
        })
      });
      dispatchStoreUpdated();
      await syncWithBackend();
    } catch (err) {
      console.error("Error saving forum posts to server", err);
    }
  }

  static async deleteForumPost(postId: string): Promise<boolean> {
    const deletedList = getFromStore<string[]>('gi_deleted_forum_posts', []);
    if (!deletedList.includes(postId)) {
      deletedList.push(postId);
      setToStore<string[]>('gi_deleted_forum_posts', deletedList);
    }
    const posts = this.getForumPosts();
    const updated = posts.filter((p: any) => p && p.id !== postId);
    setToStore<any[]>('gi_forum_posts', updated);
    try {
      localStorage.setItem('rockygold_forum_posts_v3', JSON.stringify(updated));
    } catch (e) {}
    dispatchStoreUpdated();

    try {
      await apiFetch(getApiUrl('/api/forum/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });
    } catch (e) {
      await this.saveForumPosts(updated);
    }
    return true;
  }

  static async likeForumPost(postId: string, userId: string): Promise<any> {
    const posts = this.getForumPosts();
    const updated = posts.map(p => {
      if (p && String(p.id) === String(postId)) {
        const likedBy = Array.isArray(p.likedBy) ? p.likedBy : [];
        const alreadyLiked = likedBy.includes(userId);
        const newLikedBy = alreadyLiked 
          ? likedBy.filter((id: string) => id !== userId)
          : [...likedBy, userId];
        return {
          ...p,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
          hasLiked: newLikedBy.includes(userId),
          lastModified: Date.now()
        };
      }
      return p;
    });

    setToStore<any[]>('gi_forum_posts', updated);
    dispatchStoreUpdated();

    try {
      const resp = await apiFetch(getApiUrl('/api/forum/like'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId })
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.post;
      }
    } catch (e) {
      await this.saveForumPosts(updated);
    }
    return null;
  }

  // Auth Operations
  static getCurrentUser(): User | null {
    let cached: User | null = null;
    try {
      const item = sessionStorage.getItem('gi_current_user') || inMemorySessionStore['gi_current_user'];
      cached = item ? JSON.parse(item) : null;
    } catch (e) {
      const item = inMemorySessionStore['gi_current_user'];
      cached = item ? JSON.parse(item) : null;
    }
    if (!cached) return null;
    const users = this.getUsers();
    const fresh = users.find(u => u.id === cached.id);
    if (fresh) {
      return fresh;
    }
    return cached;
  }

  static saveCurrentUser(user: User | null): void {
    try {
      if (user) {
        const str = JSON.stringify(user);
        inMemorySessionStore['gi_current_user'] = str;
        try {
          sessionStorage.setItem('gi_current_user', str);
        } catch (e) {}
      } else {
        delete inMemorySessionStore['gi_current_user'];
        try {
          sessionStorage.removeItem('gi_current_user');
        } catch (e) {}
      }
    } catch (e) {}
    
    if (user) {
      // Also update inside users list
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        this.saveUsers(users);
      }
    }
  }

  // Log in specific helper
  static async login(whatsapp: string, passwordString: string): Promise<{ success: boolean, user?: User, message: string }> {
    try {
      const response = await apiFetch(getApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, password: passwordString })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.user) {
          this.saveCurrentUser(res.user);
          syncWithBackend().catch((e) => console.warn('[LOGIN SYNC WARN]', e));
        }
        return res;
      }
    } catch (error) {
      console.warn('Login backend error, trying local:', error);
    }

    const users = this.getUsers();
    const user = users.find(u => {
      if (u.whatsapp === whatsapp) return true;
      const uNorm = normalizePhoneNumber(u.whatsapp, u.country);
      const inputNorm = normalizePhoneNumber(whatsapp, u.country);
      if (uNorm && inputNorm && uNorm === inputNorm) {
        return true;
      }
      return false;
    });

    if (!user) {
      return { success: false, message: 'Aucun utilisateur trouvé avec ce numéro WhatsApp.' };
    }
    if (user.isBlocked) {
      return { success: false, message: 'Ce compte a été bloqué par l\'administrateur. Veuillez contacter le support.' };
    }
    const expectedPassword = user.password || (user.role === 'admin' ? 'admin' : 'user123');
    if (passwordString === expectedPassword) {
      this.saveCurrentUser(user);
      return { success: true, user, message: 'Connexion réussie.' };
    }
    return { success: false, message: 'Mot de passe incorrect.' };
  }

  // Reset password helper
  static async resetPassword(whatsapp: string, country: string, newPasswordString: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiFetch(getApiUrl('/api/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, country, newPassword: newPasswordString })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          // Update local store as well
          const users = this.getUsers();
          const userIdx = users.findIndex(u => {
            if (u.whatsapp === whatsapp) return true;
            const uNorm = normalizePhoneNumber(u.whatsapp, u.country || country);
            const inputNorm = normalizePhoneNumber(whatsapp, country || u.country);
            return !!(uNorm && inputNorm && uNorm === inputNorm);
          });
          if (userIdx !== -1) {
            users[userIdx].password = newPasswordString;
            this.saveUsers(users);
          }
          syncWithBackend().catch((e) => console.warn('[RESET PASSWORD SYNC WARN]', e));
          return res;
        } else {
          return res;
        }
      }
    } catch (error) {
      console.warn('Reset password backend error, trying local fallback:', error);
    }

    // Local fallback
    const users = this.getUsers();
    const userIdx = users.findIndex(u => {
      if (u.whatsapp === whatsapp) return true;
      const uNorm = normalizePhoneNumber(u.whatsapp, u.country || country);
      const inputNorm = normalizePhoneNumber(whatsapp, country || u.country);
      return !!(uNorm && inputNorm && uNorm === inputNorm);
    });

    if (userIdx === -1) {
      return { success: false, message: 'Aucun utilisateur trouvé avec ce numéro de téléphone.' };
    }
    if (users[userIdx].isBlocked) {
      return { success: false, message: 'Ce compte a été bloqué par l\'administrateur. Veuillez contacter le support.' };
    }

    users[userIdx].password = newPasswordString;
    this.saveUsers(users);
    return { success: true, message: 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.' };
  }

  // Register modern form
  static async register(data: {
    name: string;
    whatsapp: string;
    country: string;
    password?: string;
    referredByCode: string;
    device?: string;
  }): Promise<{ success: boolean, user?: User, message: string }> {
    let serverSuccess = false;
    let serverResponse: any = null;

    try {
      console.log(`[CLIENT REGISTER] Attempting signup for ${data.whatsapp} with central backend...`);
      const response = await apiFetch(getApiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const res = await response.json();
        console.log(`[CLIENT REGISTER] Backend response received:`, res);
        if (res.success && res.user) {
          this.saveCurrentUser(res.user);
          supabaseRegisterUser(res.user).catch(() => {});
          syncWithBackend().catch((e) => console.warn('[REGISTER SYNC WARN]', e));
          serverSuccess = true;
          serverResponse = res;
        } else {
          // If the backend actively validated and rejected it (e.g. duplicate number already in DB), 
          // we must return that active feedback so users don't bypass checks.
          return res;
        }
      } else {
        console.warn(`[CLIENT REGISTER] Backend returned non-OK status: ${response.status}. Falling back to local storage.`);
      }
    } catch (error) {
      console.error('[CLIENT REGISTER] Registration backend fetch failed! Executing local fallback:', error);
    }

    if (serverSuccess && serverResponse) {
      return serverResponse;
    }

    // --- LOCAL REGISTRATION FALLBACK ---
    const users = this.getUsers();
    
    // Check duplication with normalized phone number matching
    const dataNorm = normalizePhoneNumber(data.whatsapp, data.country);
    const existing = users.find((u: any) => {
      if (u.whatsapp === data.whatsapp) return true;
      const uNorm = normalizePhoneNumber(u.whatsapp, u.country);
      if (dataNorm && uNorm && dataNorm === uNorm) {
        return true;
      }
      return false;
    });
    if (existing) {
      return { success: false, message: 'Ce numéro WhatsApp est déjà enregistré sur notre plateforme.' };
    }

    // Generate unique referral code (3 letters mixed with 2 digits)
    let referralCode = '';
    let codeExists = true;
    const lettersPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digitsPool = '0123456789';

    while (codeExists) {
      let selectedDigits = '';
      for (let i = 0; i < 2; i++) {
        selectedDigits += digitsPool.charAt(Math.floor(Math.random() * digitsPool.length));
      }

      let selectedLetters = '';
      for (let i = 0; i < 3; i++) {
        selectedLetters += lettersPool.charAt(Math.floor(Math.random() * lettersPool.length));
      }

      const potentialCode = selectedDigits + selectedLetters;
      const isDuplicate = users.some((u: any) => u.referralCode && u.referralCode.toUpperCase() === potentialCode);
      if (!isDuplicate) {
        referralCode = potentialCode;
        codeExists = false;
      }
    }

    let refereeId: string | undefined = undefined;
    if (data.referredByCode && data.referredByCode.trim().length > 0) {
      const cleanInput = data.referredByCode.trim();
      const codeClean = cleanInput.toUpperCase();
      const digitsOnlyInput = cleanInput.replace(/\D/g, '');

      let referrerUser = users.find((u: any) => {
        if (u.referralCode && u.referralCode.toUpperCase() === codeClean) return true;
        if (u.id && u.id.toUpperCase() === codeClean) return true;
        
        // Fallback check by matching the last 8 digits of the cleaned WhatsApp phone numbers
        if (digitsOnlyInput.length >= 8 && u.whatsapp) {
          const uDigits = u.whatsapp.replace(/\D/g, '');
          if (uDigits.length >= 8) {
            const inputLast8 = digitsOnlyInput.slice(-8);
            const uLast8 = uDigits.slice(-8);
            if (inputLast8 === uLast8) return true;
          }
        }

        const uNorm = normalizePhoneNumber(u.whatsapp, u.country);
        const sponsorNorm = normalizePhoneNumber(cleanInput, u.country);
        if (uNorm && sponsorNorm && uNorm === sponsorNorm) return true;
        return false;
      });

      // If sponsor not found, create a placeholder/phantom sponsor directly
      if (!referrerUser) {
        const phantomId = `u-ref-${Math.floor(100000 + Math.random() * 900000)}`;
        const codePrefix = codeClean.replace(/[0-9]/g, '');
        const phantomName = codePrefix ? (codePrefix.charAt(0) + codePrefix.slice(1).toLowerCase() + ' (Parrain)') : 'Sponsor VIP';
        referrerUser = {
          id: phantomId,
          name: phantomName,
          whatsapp: digitsOnlyInput ? `+${digitsOnlyInput}` : `+23769${Math.floor(1000000 + Math.random() * 9000000)}`,
          password: 'user123',
          country: data.country || 'Cameroun',
          balance: 1000,
          dailyEarnings: 0,
          totalEarnings: 0,
          bonus: 0,
          referralCode: codeClean,
          referredBy: '72AGR',
          role: 'user',
          isBlocked: false,
          createdAt: new Date().toISOString()
        };
        users.push(referrerUser);
      }
      refereeId = referrerUser.id;
    }

    const isWpAdmin = data.whatsapp.replace(/\D/g, '').endsWith('22670903319') || data.whatsapp.replace(/\D/g, '') === '70903319';

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.name,
      whatsapp: data.whatsapp,
      password: data.password || 'user123',
      country: data.country || 'Cameroun',
      balance: 0, // Registration bonus is 0 for all new accounts
      dailyEarnings: 0,
      totalEarnings: 0,
      bonus: 0,
      referralCode,
      referredBy: refereeId,
      role: isWpAdmin ? 'admin' : 'user',
      isBlocked: false,
      device: data.device || 'Ordinateur',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    supabaseRegisterUser(newUser).catch(() => {});

    // Standard welcome notification
    let notifications = this.getNotifications();
    notifications.unshift({
      id: `not-${Date.now()}`,
      userId: newUser.id,
      title: 'Bienvenue sur Dreampod !',
      message: 'Félicitations pour votre inscription ! Votre compte est activé avec succès.',
      type: 'bonus',
      createdAt: new Date().toISOString(),
      read: false
    });

    if (refereeId) {
      notifications.unshift({
        id: `not-ref-${Date.now()}`,
        userId: refereeId,
        title: 'Nouveau parrainage',
        message: `${newUser.name} s'est inscrit en utilisant votre lien. Vous recevrez 20% de commission sur ses investissements !`,
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    this.saveNotifications(notifications);

    this.saveCurrentUser(newUser);

    // Send silently in the background if possible
    try {
      apiFetch(getApiUrl('/api/save-store'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'gi_users': users,
          'gi_notifications': notifications
        })
      }).catch(() => {});
    } catch (e) {}

    return { success: true, user: newUser, message: 'Inscription réussie.' };
  }

  // Deposit logic - Authoritative Main Database Only (No local fallback)
  static async createDeposit(userId: string, amount: number, operator: string, reference: string, receiptImage: string): Promise<Deposit> {
    const payload = { userId, amount, operator, reference, receiptImage };
    let lastError: any = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await apiFetch(getApiUrl('/api/create-deposit'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.deposit) {
            if (res.user) {
              this.saveCurrentUser(res.user);
            }
            // Update local memory & storage cleanly without broadcasting full array overwrite
            const currentDeps = this.getDeposits();
            const filtered = currentDeps.filter(d => d.id !== res.deposit.id && d.reference !== res.deposit.reference);
            setToStoreLocalOnly('gi_deposits', [res.deposit, ...filtered]);
            dispatchStoreUpdated();
            
            // Add user notification locally if not already present
            const notifications = this.getNotifications();
            if (!notifications.some(n => n.id === `not-dep-${res.deposit.id}`)) {
              notifications.unshift({
                id: `not-dep-${res.deposit.id}`,
                userId,
                title: 'Dépôt soumis',
                message: `Votre demande de dépôt de ${amount.toLocaleString()} XOF via ${operator} (Réf: ${reference}) est enregistrée définitivement et en attente de vérification par l'administration.`,
                type: 'deposit',
                createdAt: new Date().toISOString(),
                read: false
              });
              setToStoreLocalOnly('gi_notifications', notifications);
            }

            return res.deposit;
          } else {
            lastError = new Error(res.message || res.error || "Échec de l'enregistrement du dépôt.");
          }
        } else {
          const errData = await response.json().catch(() => null);
          lastError = new Error(errData?.error || errData?.message || `Erreur serveur (${response.status})`);
        }
      } catch (err: any) {
        lastError = err;
      }
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    throw lastError || new Error("Impossible d'enregistrer le dépôt dans la base de données principale. Veuillez réessayer.");
  }

  static async createAutomaticDeposit(userId: string, amount: number, operator: string): Promise<Deposit> {
    const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
    const reference = `SPY-${randomHex}`;

    const response = await apiFetch(getApiUrl('/api/create-deposit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, operator, reference, receiptImage: 'automated' })
    });
    if (response.ok) {
      const res = await response.json();
      if (res.success && res.deposit) {
        if (res.user) {
          this.saveCurrentUser(res.user);
        }
        const currentDeps = this.getDeposits();
        const filtered = currentDeps.filter(d => d.id !== res.deposit.id && d.reference !== res.deposit.reference);
        setToStoreLocalOnly('gi_deposits', [res.deposit, ...filtered]);
        dispatchStoreUpdated();
        return res.deposit;
      }
    }
    throw new Error("Échec de la validation automatique du dépôt.");
  }

  static async createSoinaPayDeposit(userId: string, amount: number, reference: string, operator: string = 'SoinaPay'): Promise<Deposit | null> {
    try {
      const response = await apiFetch(getApiUrl('/api/create-deposit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, operator, reference, receiptImage: 'automated' })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.deposit) {
          if (res.user) {
            this.saveCurrentUser(res.user);
          }
          const currentDeps = this.getDeposits();
          const filtered = currentDeps.filter(d => d.id !== res.deposit.id && d.reference !== res.deposit.reference);
          setToStoreLocalOnly('gi_deposits', [res.deposit, ...filtered]);
          dispatchStoreUpdated();
          return res.deposit;
        } else {
          return null;
        }
      }
    } catch (error) {
      console.error('Create SoinaPay deposit API error:', error);
    }
    return null;
  }

  static async createWestPayDeposit(userId: string, amount: number, reference: string, operator: string = 'WestPay Direct'): Promise<Deposit | null> {
    try {
      const response = await apiFetch(getApiUrl('/api/create-deposit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, operator, reference, receiptImage: 'automated_westpay' })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.deposit) {
          if (res.user) {
            this.saveCurrentUser(res.user);
          }
          const currentDeps = this.getDeposits();
          const filtered = currentDeps.filter(d => d.id !== res.deposit.id && d.reference !== res.deposit.reference);
          setToStoreLocalOnly('gi_deposits', [res.deposit, ...filtered]);
          dispatchStoreUpdated();
          return res.deposit;
        }
      }
    } catch (error) {
      console.error('Create WestPay deposit API error:', error);
    }
  }

  // Withdrawal logic
  static async createWithdrawal(userId: string, amount: number, operator: string, number: string, proof_file_url?: string): Promise<{ success: boolean, error?: string, withdrawal?: Withdrawal }> {
    try {
      const response = await apiFetch(getApiUrl('/api/create-withdrawal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, operator, number, proof_file_url })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.withdrawal) {
          if (res.user) {
            this.saveCurrentUser(res.user);
          }
          await syncWithBackend();
          return { success: true, withdrawal: res.withdrawal };
        } else {
          return { success: false, error: res.error || 'Erreur lors de la soumission.' };
        }
      }
    } catch (error) {
      console.error('Withdrawal API error, using local fallback:', error);
    }

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    
    if (userIdx === -1) {
      return { success: false, error: 'Utilisateur non trouvé.' };
    }

    const user = users[userIdx];

    // Check if user has linked their withdrawal account (Rule 3)
    if (!user.bankCardNumber || !user.bankCardOperator || String(user.bankCardNumber).trim().length < 4) {
      return { 
        success: false, 
        error: "Retrait impossible : Vous n'avez pas encore lié votre compte de retrait. Veuillez vous rendre dans les paramètres de votre compte pour enregistrer votre numéro et opérateur de retrait avant de soumettre une demande." 
      };
    }

    // Check withdrawal schedule defined by administration (Rule 6)
    const wthSchedule = this.isWithdrawalOpen();
    if (!wthSchedule.isOpen) {
      return {
        success: false,
        error: wthSchedule.reason || "Les retraits sont actuellement fermés selon les horaires d'ouverture et de fermeture définis par l'administration."
      };
    }

    // Check if user has an active product
    const activeInvs = this.getInvestments().filter(inv => inv.userId === userId && inv.status === 'active');
    if (activeInvs.length === 0) {
      return { success: false, error: "Vous devez posséder au moins un produit d'investissement actif pour pouvoir effectuer un retrait." };
    }

    if (amount < 1000) {
      return { success: false, error: 'Le montant de retrait minimum est de 1 000 F.' };
    }

    if (user.balance < amount) {
      return { success: false, error: 'Solde insuffisant pour effectuer ce retrait.' };
    }

    // Deduct preliminary balance or keep it pending and deduct once approved? 
    // Usually, withdrawing locks the balance in investment systems
    user.balance -= amount;
    this.saveUsers(users);

    const fee = Math.round(amount * 0.12);
    const netAmount = amount - fee;

    const withdrawals = this.getWithdrawals();
    const newWth: Withdrawal = {
      id: `wth-${Date.now()}`,
      userId,
      userName: user.name,
      amount,
      operator,
      number,
      status: 'pending',
      createdAt: new Date().toISOString(),
      fee,
      netAmount,
      proof_file_url
    };

    withdrawals.unshift(newWth);
    this.saveWithdrawals(withdrawals);

    // Save for current logged in user
    const cur = this.getCurrentUser();
    if (cur && cur.id === userId) {
      cur.balance = user.balance;
      this.saveCurrentUser(cur);
    }

    // Add notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-wth-${Date.now()}`,
      userId,
      title: 'Retrait en attente',
      message: `Votre demande de retrait de ${amount.toLocaleString()} XOF vers ${number} (${operator}) est en attente de traitement par la comptabilité.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, withdrawal: newWth };
  }

  // Accès libre aux produits Bien-être sans condition de Stabilité
  static canUserAccessWellbeingProduct(_userId: string, _targetVipLevel: number): { allowed: boolean; reason?: string } {
    return { allowed: true };
  }

  // Vérifie les conditions d'activation pour les produits Bien-être
  static checkSpecialProductActivation(userId: string, category: 'wellbeing'): {
    canActivate: boolean;
    reason?: string;
    code?: 'ACTIVE_CYCLE' | 'STABILITY_REQUIRED' | 'NEW_INVESTMENT_REQUIRED' | 'SCHEDULE_CLOSED';
    activeProduct?: Investment;
  } {
    // 0. Vérification des horaires d'ouverture / fermeture définis par l'administration (Règle 6)
    const scheduleStatus = this.isCategoryOpen(category);
    if (!scheduleStatus.isOpen) {
      return {
        canActivate: false,
        code: 'SCHEDULE_CLOSED',
        reason: scheduleStatus.reason
      };
    }

    return { canActivate: true };
  }

  // Invest Product logic
  static async buyProduct(userId: string, productId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiFetch(getApiUrl('/api/buy-product'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.user) {
          this.saveCurrentUser(res.user);
          const allUsers = this.getUsers();
          const uIdx = allUsers.findIndex(u => u.id === res.user.id);
          if (uIdx !== -1) {
            allUsers[uIdx] = { ...allUsers[uIdx], ...res.user };
            this.saveUsers(allUsers);
          }
          if (res.investment) {
            const currentInvs = this.getInvestments();
            if (!currentInvs.some(i => String(i.id) === String(res.investment.id))) {
              currentInvs.unshift(res.investment);
              this.saveInvestments(currentInvs);
            }
          }
          try {
            dispatchStoreUpdated();
          } catch (e) {}
          syncWithBackend().catch(() => {});
          return res;
        } else if (res) {
          // Server actively completed but rejected purchase (e.g. insufficient funds, blocked VIP plan)
          // Do NOT execute the local fallback! Return the server error directly.
          return res;
        }
      }
    } catch (error) {
      console.error('Buy product API error, using local fallback:', error);
    }

    // --- LOCAL BUY PRODUCT FALLBACK ---
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    const products = this.getProducts();
    const targetProduct = products.find(p => p.id === productId);
    
    if (!user || !targetProduct) {
      return { success: false, message: 'VIP plan ou utilisateur introuvable.' };
    }

    if (user.balance <= 0 || user.balance < targetProduct.price) {
      return { success: false, message: 'Votre solde est insuffisant. Veuillez effectuer un investissement/rechargement avant d’activer un produit.' };
    }

    // Disponibilité pour les produits Bien-être
    if (targetProduct.category === 'wellbeing') {
      const scheduleStatus = this.isCategoryOpen('wellbeing');
      if (!scheduleStatus.isOpen) {
        return {
          success: false,
          message: scheduleStatus.reason || 'Ce produit est actuellement indisponible à l’achat.'
        };
      }
    }

    // Vérification de la disponibilité pour les produits Activités
    if (targetProduct.category === 'activity') {
      const scheduleStatus = this.isCategoryOpen('activity');
      if (!scheduleStatus.isOpen) {
        return {
          success: false,
          message: scheduleStatus.reason || 'Ce produit est actuellement indisponible à l’achat.'
        };
      }
    }

    // Deduct balance and update properties
    const isCyclicProduct = true;

    user.balance -= targetProduct.price;
    if (!isCyclicProduct) {
      user.dailyEarnings += targetProduct.dailyReturn;
    }
    user.lastModified = Date.now();
    this.saveUsers(users);

    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.id === userId) {
      activeUser.balance = user.balance;
      activeUser.dailyEarnings = user.dailyEarnings;
      this.saveCurrentUser(activeUser);
    }

    // Create investment record in active status
    const investments = this.getInvestments();
    const newInvestment: Investment = {
      id: `inv-${Date.now()}`,
      userId,
      productId: targetProduct.id,
      productName: targetProduct.name,
      vipLevel: targetProduct.vipLevel,
      price: targetProduct.price,
      dailyReturn: targetProduct.dailyReturn,
      daysPassed: 0,
      durationDays: targetProduct.durationDays,
      totalReturnClaimed: 0,
      lastClaimDate: new Date().toISOString(),
      status: 'active' as const,
      activationConditionsMet: true,
      createdAt: new Date().toISOString(),
      lastModified: Date.now(),
      category: targetProduct.category || 'stability',
      isCyclic: true,
      totalReturn: targetProduct.totalReturn || (targetProduct.price + (targetProduct.dailyReturn * targetProduct.durationDays)),
      payoutCredited: false
    };
    investments.unshift(newInvestment);
    this.saveInvestments(investments);

    // Compute and credit MLM Commissions up to 3 levels (20%, 3%, 1%)
    const mlmRates = this.getMLMRates();
    const commissions = this.getCommissions();
    const notifications = this.getNotifications();

    if (user.referredBy) {
      const cleanInput = user.referredBy.trim();
      const refClean = cleanInput.toUpperCase();
      const digitsOnlyInput = cleanInput.replace(/\D/g, '');

      const parentUser = users.find(u => {
        if (u.id.toUpperCase() === refClean) return true;
        if (u.referralCode && u.referralCode.toUpperCase() === refClean) return true;
        if (digitsOnlyInput.length >= 6 && u.whatsapp) {
          const uDigits = u.whatsapp.replace(/\D/g, '');
          if (uDigits.endsWith(digitsOnlyInput) || digitsOnlyInput.endsWith(uDigits)) return true;
        }
        return false;
      });

      if (parentUser) {
        const commAmtLvl1 = Math.round(targetProduct.price * (mlmRates.level1 / 100));
        parentUser.balance += commAmtLvl1;
        parentUser.bonus += commAmtLvl1;
        parentUser.totalEarnings = (parentUser.totalEarnings || 0) + commAmtLvl1;
        parentUser.lastModified = Date.now();

        commissions.unshift({
          id: `com-${Date.now()}-1`,
          userId: parentUser.id,
          fromUserName: user.name,
          level: 1,
          amount: commAmtLvl1,
          createdAt: new Date().toISOString(),
          lastModified: Date.now()
        });

        notifications.unshift({
          id: `not-com1-${Date.now()}`,
          userId: parentUser.id,
          title: 'Commission MLM reçue !',
          message: `Félicitations, vous avez perçu ${commAmtLvl1} XOF (Niveau 1 : ${mlmRates.level1}%) car votre affilié ${user.name} a investi dans le plan ${targetProduct.name}.`,
          type: 'bonus',
          createdAt: new Date().toISOString(),
          read: false
        });

        // Level 2 MLM
        if (parentUser.referredBy) {
          const cleanInput2 = parentUser.referredBy.trim();
          const refClean2 = cleanInput2.toUpperCase();
          const digitsOnlyInput2 = cleanInput2.replace(/\D/g, '');

          const grandParentUser = users.find(u => {
            if (u.id.toUpperCase() === refClean2) return true;
            if (u.referralCode && u.referralCode.toUpperCase() === refClean2) return true;
            if (digitsOnlyInput2.length >= 6 && u.whatsapp) {
              const uDigits = u.whatsapp.replace(/\D/g, '');
              if (uDigits.endsWith(digitsOnlyInput2) || digitsOnlyInput2.endsWith(uDigits)) return true;
            }
            return false;
          });

          if (grandParentUser) {
            const commAmtLvl2 = Math.round(targetProduct.price * (mlmRates.level2 / 100));
            grandParentUser.balance += commAmtLvl2;
            grandParentUser.bonus += commAmtLvl2;
            grandParentUser.totalEarnings = (grandParentUser.totalEarnings || 0) + commAmtLvl2;
            grandParentUser.lastModified = Date.now();

            commissions.unshift({
              id: `com-${Date.now()}-2`,
              userId: grandParentUser.id,
              fromUserName: user.name,
              level: 2,
              amount: commAmtLvl2,
              createdAt: new Date().toISOString(),
              lastModified: Date.now()
            });

            notifications.unshift({
              id: `not-com2-${Date.now()}`,
              userId: grandParentUser.id,
              title: 'Commission MLM Niveau 2 !',
              message: `Vous avez perçu ${commAmtLvl2} XOF (Niveau 2 : ${mlmRates.level2}%) suite à l'investissement de ${user.name} (parrainé par ${parentUser.name}).`,
              type: 'bonus',
              createdAt: new Date().toISOString(),
              read: false
            });

            // Level 3 MLM
            if (grandParentUser.referredBy) {
              const cleanInput3 = grandParentUser.referredBy.trim();
              const refClean3 = cleanInput3.toUpperCase();
              const digitsOnlyInput3 = cleanInput3.replace(/\D/g, '');

              const greatGrandParentUser = users.find(u => {
                if (u.id.toUpperCase() === refClean3) return true;
                if (u.referralCode && u.referralCode.toUpperCase() === refClean3) return true;
                if (digitsOnlyInput3.length >= 6 && u.whatsapp) {
                  const uDigits = u.whatsapp.replace(/\D/g, '');
                  if (uDigits.endsWith(digitsOnlyInput3) || digitsOnlyInput3.endsWith(uDigits)) return true;
                }
                return false;
              });

              if (greatGrandParentUser) {
                const commAmtLvl3 = Math.round(targetProduct.price * (mlmRates.level3 / 100));
                greatGrandParentUser.balance += commAmtLvl3;
                greatGrandParentUser.bonus += commAmtLvl3;
                greatGrandParentUser.totalEarnings = (greatGrandParentUser.totalEarnings || 0) + commAmtLvl3;
                greatGrandParentUser.lastModified = Date.now();

                commissions.unshift({
                  id: `com-${Date.now()}-3`,
                  userId: greatGrandParentUser.id,
                  fromUserName: user.name,
                  level: 3,
                  amount: commAmtLvl3,
                  createdAt: new Date().toISOString(),
                  lastModified: Date.now()
                });

                notifications.unshift({
                  id: `not-com3-${Date.now()}`,
                  userId: greatGrandParentUser.id,
                  title: 'Commission MLM Niveau 3 !',
                  message: `Vous avez perçu ${commAmtLvl3} XOF (Niveau 3 : ${mlmRates.level3}%) suite à l'investissement de ${user.name}.`,
                  type: 'bonus',
                  createdAt: new Date().toISOString(),
                  read: false
                });
              }
            }
          }
        }
      }
    }

    const isStability = targetProduct.category === 'stability' || !targetProduct.category;
    const isWellbeing = targetProduct.category === 'wellbeing';
    const returnMsg = (isStability || isWellbeing)
      ? `Le capital et vos bénéfices totaux de ${(targetProduct.totalReturn || (targetProduct.price + (targetProduct.dailyReturn * targetProduct.durationDays))).toLocaleString()} XOF vous seront automatiquement versés à la fin du cycle de ${targetProduct.durationDays} jours.`
      : `Vous gagnerez ${targetProduct.dailyReturn.toLocaleString()} XOF chaque jour.`;

    notifications.unshift({
      id: `not-plan-${Date.now()}`,
      userId,
      title: 'Plan souscrit (En attente d\'activation)',
      message: `Votre investissement de ${targetProduct.price.toLocaleString()} XOF dans le plan ${targetProduct.name} a bien été pris en compte. Le plan sera activé dès que les conditions d'activation prévues par le système seront remplies.`,
      type: 'plan',
      createdAt: new Date().toISOString(),
      read: false
    });

    this.saveUsers(users);
    this.saveCommissions(commissions);
    this.saveNotifications(notifications);

    return { success: true, message: `Paiement validé pour le plan ${targetProduct.name} ! Le produit est en attente d'activation selon les conditions requises.` };
  }

  // Activer un produit payé lorsque les conditions d'activation sont remplies (synchronisé avec Supabase)
  static async activateInvestment(investmentId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiFetch(getApiUrl('/api/activate-investment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          const investments = this.getInvestments();
          const idx = investments.findIndex(i => i.id === investmentId);
          if (idx !== -1) {
            investments[idx].status = 'active';
            investments[idx].activationConditionsMet = true;
            investments[idx].activatedAt = new Date().toISOString();
            investments[idx].lastModified = Date.now();
            this.saveInvestments(investments);
            try { dispatchStoreUpdated(); } catch (e) {}
          }
          return res;
        }
      }
    } catch (err) {
      console.warn('activateInvestment API call failed, falling back to local update:', err);
    }

    // Local fallback
    const investments = this.getInvestments();
    const idx = investments.findIndex(i => i.id === investmentId);
    if (idx === -1) {
      return { success: false, message: 'Produit souscrit introuvable.' };
    }
    investments[idx].status = 'active';
    investments[idx].activationConditionsMet = true;
    investments[idx].activatedAt = new Date().toISOString();
    investments[idx].lastModified = Date.now();
    this.saveInvestments(investments);
    try { dispatchStoreUpdated(); } catch (e) {}
    await syncWithBackend();
    return { success: true, message: 'Le produit a été activé avec succès !' };
  }

  // Claim Daily Rewards Code
  static async claimDailyReward(userId: string): Promise<{ success: boolean, message: string, amount: number }> {
    const checkKey = `gi_last_daily_${userId}`;
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem(checkKey);

    if (lastClaim === today) {
      return { success: false, message: 'Revenu journalier déjà réclamé pour aujourd\'hui. Revenez demain !', amount: 0 };
    }

    try {
      const response = await apiFetch(getApiUrl('/api/claim-daily'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          if (res.user) {
            this.saveCurrentUser(res.user);
          }
          localStorage.setItem(checkKey, today);
          await syncWithBackend();
          return { success: true, message: res.message, amount: res.amount };
        } else {
          return { success: false, message: res.message || 'Erreur lors de la récolte.', amount: 0 };
        }
      }
    } catch (error) {
      console.error('Claim daily reward API error, using local fallback:', error);
    }

    const rewardAmt = 50; // Standard daily loyalty reward
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Utilisateur introuvable.', amount: 0 };
    }

    user.balance += rewardAmt;
    user.bonus += rewardAmt;
    user.lastModified = Date.now();
    this.saveUsers(users);

    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.id === userId) {
      activeUser.balance = user.balance;
      activeUser.bonus = user.bonus;
      this.saveCurrentUser(activeUser);
    }

    localStorage.setItem(checkKey, today);

    // Add notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-daily-${Date.now()}`,
      userId,
      title: 'Récompense journalière obtenue',
      message: `Félicitations ! Vous avez réclamé votre bonus quotidien de connexion gratuite de ${rewardAmt} XOF.`,
      type: 'bonus',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, message: `Félicitations! Vous avez reçu un bonus journalier de ${rewardAmt} XOF!`, amount: rewardAmt };
  }

  // Simulate claiming dividends on all ACTIVE investments for user
  static async claimInvestmentReturn(userId: string, investmentId: string): Promise<{ success: boolean, message: string, amount: number }> {
    try {
      const response = await apiFetch(getApiUrl('/api/claim-investment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, investmentId })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          if (res.user) {
            this.saveCurrentUser(res.user);
          }
          await syncWithBackend();
          return { success: true, message: res.message, amount: res.amount };
        } else {
          return { success: false, message: res.message || 'Le revenu n\'est pas encore disponible.', amount: 0 };
        }
      }
    } catch (error) {
      console.error('Claim investment API error, using local fallback:', error);
    }

    const investments = this.getInvestments();
    const invIdx = investments.findIndex(inv => inv.id === investmentId && inv.userId === userId);
    
    if (invIdx === -1) {
      return { success: false, message: 'Investissement introuvable.', amount: 0 };
    }

    const inv = investments[invIdx];
    if (inv.status === 'completed') {
      return { success: false, message: 'Cet investissement est déjà arrivé à terme.', amount: 0 };
    }

    const isStability = inv.category === 'stability';
    const isWellbeing = inv.category === 'wellbeing';
    const isActivity = inv.category === 'activity';
    if (isStability || isWellbeing || isActivity || (inv as any).isCyclic) {
      const planName = isWellbeing ? 'Bien-être' : isActivity ? 'Activité' : 'Stabilité VIP';
      return { 
        success: false, 
        message: `Les revenus de ce plan ${planName} (${inv.productName}) vous seront versés automatiquement et en intégralité uniquement à la fin de son cycle de ${inv.durationDays} jours. Même si le produit est fermé aux nouveaux achats, votre cycle continue normalement.`, 
        amount: 0 
      };
    }

    const now = Date.now();
    const createdTime = new Date(inv.createdAt).getTime();
    const msDiff = now - createdTime;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // Calculate how many 24-hour periods should have fully passed since purchase
    let expectedDays = Math.floor(msDiff / oneDayMs);
    if (expectedDays > inv.durationDays) {
      expectedDays = inv.durationDays;
    }

    if (inv.daysPassed >= expectedDays) {
      const nextClaimTime = createdTime + (inv.daysPassed + 1) * oneDayMs;
      const nextDateObj = new Date(nextClaimTime);
      const hourStr = nextDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = nextDateObj.toLocaleDateString('fr-FR');
      return { 
        success: false, 
        message: `Le prochain versement pour ce plan sera disponible le ${dateStr} à ${hourStr} (exactement 24 heures après la dernière récolte ou activation).`, 
        amount: 0 
      };
    }

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
      inv.lastModified = Date.now();
      this.saveInvestments(investments);
      return { success: false, message: 'Ce plan est complété ! Tous les revenus ont été distribués.', amount: 0 };
    }

    // Track when claimed - to be professional we update daysPassed
    inv.daysPassed += 1;
    inv.totalReturnClaimed += inv.dailyReturn;
    inv.lastClaimDate = new Date().toISOString();
    inv.lastModified = Date.now();

    if (inv.daysPassed >= inv.durationDays) {
      inv.status = 'completed';
    }
    
    // Add amount to user's balance and totalEarnings
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.balance += inv.dailyReturn;
      user.totalEarnings += inv.dailyReturn;
      user.lastModified = Date.now();
      this.saveUsers(users);
      
      const curr = this.getCurrentUser();
      if (curr && curr.id === userId) {
        curr.balance = user.balance;
        curr.totalEarnings = user.totalEarnings;
        this.saveCurrentUser(curr);
      }
    }

    this.saveInvestments(investments);

    // Notify
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `not-claim-${Date.now()}`,
      userId,
      title: 'Rendement quotidien récolté',
      message: `Vous avez récolté votre dividende quotidien de ${inv.dailyReturn.toLocaleString()} XOF sur le plan ${inv.productName}.`,
      type: 'plan',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifs);

    return { success: true, message: `Revenu journalier de +${inv.dailyReturn} XOF encaissé avec succès !`, amount: inv.dailyReturn };
  }

  static async renewInvestment(userId: string, investmentId: string): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiFetch(getApiUrl('/api/renew-investment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, investmentId })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          if (res.user) {
            this.saveCurrentUser(res.user);
          }
          if (res.investments) {
            this.saveInvestments(res.investments);
          }
          await syncWithBackend();
          return res;
        }
      }
    } catch (error) {
      console.error('Renew investment API error, using local fallback:', error);
    }

    const investments = this.getInvestments();
    const invIdx = investments.findIndex(inv => inv.id === investmentId && inv.userId === userId);
    if (invIdx === -1) {
      return { success: false, message: 'Investissement introuvable.' };
    }

    const inv = investments[invIdx];
    const products = this.getProducts();
    const product = products.find(p => p.id === inv.productId);
    const renewPrice = product ? product.price : inv.price;

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx === -1) {
      return { success: false, message: 'Utilisateur non trouvé.' };
    }

    const user = users[userIdx];
    if (user.balance < renewPrice) {
      return { success: false, message: `Solde insuffisant pour le renouvellement. Requis: ${renewPrice.toLocaleString()} XOF.` };
    }

    user.balance -= renewPrice;
    user.lastModified = Date.now();
    this.saveUsers(users);

    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.id === userId) {
      activeUser.balance = user.balance;
      this.saveCurrentUser(activeUser);
    }

    inv.daysPassed = 0;
    inv.createdAt = new Date().toISOString();
    inv.status = 'active';
    inv.totalReturnClaimed = 0;
    inv.lastClaimDate = new Date().toISOString();
    inv.lastModified = Date.now();
    this.saveInvestments(investments);

    const notifs = this.getNotifications();
    notifs.unshift({
      id: `not-renew-${Date.now()}`,
      userId,
      title: 'Plan renouvelé avec succès !',
      message: `Votre plan "${inv.productName}" a été renouvelé avec succès pour un nouveau cycle de ${inv.durationDays} jours.`,
      type: 'plan',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifs);

    dispatchStoreUpdated();
    return { success: true, message: `Votre plan ${inv.productName} a été renouvelé avec succès pour un nouveau cycle de ${inv.durationDays} jours !` };
  }

  static async toggleAutoRenew(userId: string, investmentId: string, autoRenew: boolean): Promise<{ success: boolean, message: string }> {
    try {
      const response = await apiFetch(getApiUrl('/api/toggle-autorenew'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, investmentId, autoRenew })
      });
      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          if (res.investments) {
            this.saveInvestments(res.investments);
          }
          await syncWithBackend();
          return res;
        }
      }
    } catch (error) {
      console.error('Toggle autoRenew API error, using local fallback:', error);
    }

    const investments = this.getInvestments();
    const invIdx = investments.findIndex(inv => inv.id === investmentId && inv.userId === userId);
    if (invIdx === -1) {
      return { success: false, message: 'Investissement introuvable.' };
    }

    investments[invIdx].autoRenew = autoRenew;
    investments[invIdx].lastModified = Date.now();
    this.saveInvestments(investments);

    dispatchStoreUpdated();
    return { success: true, message: `Renouvellement automatique ${autoRenew ? 'activé' : 'désactivé'}.` };
  }

  // Bonus Code validation & applying
  static applyBonusCode(userId: string, codeString: string): { success: boolean, message: string } {
    const cleanCode = codeString.toUpperCase().trim();
    const bonusCodes = this.getBonusCodes();
    const target = bonusCodes.find(b => b.code.toUpperCase() === cleanCode);

    if (!target) {
      return { success: false, message: 'Code bonus invalide ou expiré.' };
    }

    if (target.usedCount >= target.maxUses) {
      return { success: false, message: 'Ce code bonus a déjà atteint sa limite maximale d\'utilisations.' };
    }

    if (target.usedByUsers.includes(userId)) {
      return { success: false, message: 'Vous avez déjà réclamé ce code bonus.' };
    }

    // Apply reward
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Utilisateur non trouvé.' };
    }

    user.balance += target.amount;
    user.bonus += target.amount;
    this.saveUsers(users);

    // Sync logged in
    const activeUser = this.getCurrentUser();
    if (activeUser && activeUser.id === userId) {
      activeUser.balance = user.balance;
      activeUser.bonus = user.bonus;
      this.saveCurrentUser(activeUser);
    }

    // Update code uses
    target.usedCount += 1;
    target.usedByUsers.push(userId);
    this.saveBonusCodes(bonusCodes);

    // Create a real Deposit record to document in historical recharges
    const deposits = this.getDeposits();
    deposits.unshift({
      id: `dep-code-${Date.now()}`,
      userId,
      userName: user.name,
      amount: target.amount,
      operator: 'Code Cadeau 🎁',
      reference: cleanCode,
      receiptImage: '',
      status: 'approved',
      createdAt: new Date().toISOString()
    });
    this.saveDeposits(deposits);

    // Create Notification
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-code-${Date.now()}`,
      userId,
      title: 'Code promotionnel activé',
      message: `Félicitations ! Le code "${cleanCode}" a été validé. Votre compte a été crédité de ${target.amount.toLocaleString()} XOF de bonus.`,
      type: 'bonus',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return { success: true, message: `Succès! Le code bonus a été appliqué avec succès. +${target.amount.toLocaleString()} XOF !` };
  }

  // Support / Live chat integration
  static async sendMessageToSupport(userId: string, messageText: string, senderRole: 'user' | 'admin' = 'user', imageBase64?: string): Promise<SupportMessage> {
    const messages = this.getSupportMessages();
    const cleanText = (messageText || '').trim();

    // Prevent immediate duplicate if identical message was sent in the last 10 seconds
    const recentDuplicate = messages.find(m => {
      if (m.userId === userId && m.sender === senderRole && (m.message || '').trim() === cleanText) {
        const imgMatch = (!imageBase64 && !m.image) || (imageBase64 && m.image === imageBase64);
        if (imgMatch) {
          const timeDiff = Math.abs(Date.now() - new Date(m.createdAt || 0).getTime());
          if (timeDiff < 10000) return true;
        }
      }
      return false;
    });

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const uniqueId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const nowStamp = Date.now();

    // Save locally first for instant, latency-free UX feedback
    let updatedMsgs = [...messages];
    if (senderRole === 'admin') {
      // Lorsqu'un administrateur répond à un message, celui-ci est automatiquement marqué comme lu (Règle 2)
      updatedMsgs = messages.map(m => {
        if (m.userId === userId && m.sender === 'user') {
          return { ...m, status: 'read' as const, lastModified: nowStamp };
        }
        return m;
      });
    }

    const newMsg: SupportMessage = {
      id: uniqueId,
      userId,
      sender: senderRole,
      message: cleanText,
      ...(imageBase64 ? { image: imageBase64 } : {}),
      createdAt: nowIso,
      status: 'unread',
      lastModified: nowStamp
    };

    updatedMsgs.push(newMsg);
    this.saveSupportMessages(updatedMsgs);

    dispatchStoreUpdated();
    dispatchCustomEvent('gi_new_message');

    // Push to backend server asynchronously in the background without blocking the UI
    apiFetch(getApiUrl('/api/send-message'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newMsg.id,
        userId,
        message: cleanText,
        sender: senderRole,
        image: imageBase64,
        createdAt: newMsg.createdAt,
        lastModified: newMsg.lastModified,
        status: newMsg.status
      })
    }).catch(e => {
      console.warn('Network issue while pushing support message to server:', e);
    });

    return newMsg;
  }

  static async markSupportMessagesAsRead(userId: string, readerRole: 'user' | 'admin' = 'user'): Promise<void> {
    const messages = this.getSupportMessages();
    let changed = false;
    const updated = messages.map(m => {
      if (m.userId === userId) {
        if (readerRole === 'user' && m.sender === 'admin' && m.status === 'unread') {
          changed = true;
          return { ...m, status: 'read' as const, lastModified: Date.now() };
        }
        if (readerRole === 'admin' && m.sender === 'user' && m.status === 'unread') {
          changed = true;
          return { ...m, status: 'read' as const, lastModified: Date.now() };
        }
      }
      return m;
    });

    if (changed) {
      this.saveSupportMessages(updated);
      dispatchStoreUpdated();

      try {
        await apiFetch(getApiUrl('/api/mark-messages-read'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, readerRole })
        });
        await syncWithBackend();
      } catch (e) {
        console.warn('Failed to sync marked-read support status with central server:', e);
      }
    }
  }

  static async publishWithdrawalProof(
    userId: string, 
    userName: string, 
    userCountry: string, 
    amount: number, 
    message: string, 
    image?: string,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<{ success: boolean, error?: string, proof?: WithdrawalProof }> {
    // Only allow administrative users to publish
    const users = this.getUsers();
    const user = users.find(u => u.id === userId || (userId === 'admin' && u.role === 'admin'));
    if (userId !== 'admin' && (!user || user.role !== 'admin')) {
      return { success: false, error: "Seul l'administrateur est autorisé à publier des avis." };
    }

    const proofs = this.getWithdrawalProofs();
    const newProof: WithdrawalProof = {
      id: `proof-${Date.now()}`,
      userId,
      userName,
      userCountry,
      amount,
      message,
      image,
      likes: [],
      status: status || (userId === 'admin' ? 'approved' : 'pending'),
      createdAt: new Date().toISOString(),
      lastModified: Date.now()
    };
    
    proofs.unshift(newProof);
    this.saveWithdrawalProofs(proofs);
    
    dispatchStoreUpdated();
    
    let sUserId = userId;
    let userRole = 'user';
    let cleanupTimestamp = '0';
    try {
      const activeUserStr = localStorage.getItem('gi_current_user') || inMemoryStore['gi_current_user'];
      if (activeUserStr) {
        const u = JSON.parse(activeUserStr);
        if (u && u.role) userRole = u.role;
        if (u && u.id && sUserId === 'admin') sUserId = u.id;
      }
      cleanupTimestamp = localStorage.getItem('gi_cleanup_timestamp') || inMemoryStore['gi_cleanup_timestamp'] || '0';
    } catch (e) {}

    try {
      await apiFetch(getApiUrl('/api/save-store'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gi_withdrawal_proofs: proofs,
          userId: sUserId,
          role: userRole,
          gi_cleanup_timestamp: Number(cleanupTimestamp)
        })
      });
    } catch (e) {
      console.warn('Failed to sync withdrawal proofs:', e);
    }
    
    return { success: true, proof: newProof };
  }

  static async likeWithdrawalProof(proofId: string, userId: string): Promise<boolean> {
    const proofs = this.getWithdrawalProofs();
    let changed = false;
    const updated = proofs.map(p => {
      if (p.id === proofId) {
        changed = true;
        const exists = p.likes.includes(userId);
        const newLikes = exists 
          ? p.likes.filter(id => id !== userId) 
          : [...p.likes, userId];
        return { ...p, likes: newLikes, lastModified: Date.now() };
      }
      return p;
    });
    
    if (changed) {
      this.saveWithdrawalProofs(updated);
      dispatchStoreUpdated();
      
      let activeUserId = userId;
      let activeUserRole = 'user';
      let cleanupTimestamp = '0';
      try {
        const activeUserStr = localStorage.getItem('gi_current_user') || inMemoryStore['gi_current_user'];
        if (activeUserStr) {
          const u = JSON.parse(activeUserStr);
          if (u && u.id && !activeUserId) activeUserId = u.id;
          if (u && u.role) activeUserRole = u.role;
        }
        cleanupTimestamp = localStorage.getItem('gi_cleanup_timestamp') || inMemoryStore['gi_cleanup_timestamp'] || '0';
      } catch (e) {}

      try {
        await apiFetch(getApiUrl('/api/save-store'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            gi_withdrawal_proofs: updated,
            userId: activeUserId,
            role: activeUserRole,
            gi_cleanup_timestamp: Number(cleanupTimestamp)
          })
        });
      } catch (e) {
        console.warn('Failed to sync updated likes:', e);
      }
      return true;
    }
    return false;
  }

  static async deleteWithdrawalProof(proofId: string): Promise<boolean> {
    const proofs = this.getWithdrawalProofs();
    const filtered = proofs.filter(p => p.id !== proofId);
    if (filtered.length !== proofs.length) {
      let activeUserId = '';
      let activeUserRole = 'user';
      let cleanupTimestamp = '0';
      try {
        const activeUserStr = localStorage.getItem('gi_current_user') || inMemoryStore['gi_current_user'];
        if (activeUserStr) {
          const u = JSON.parse(activeUserStr);
          if (u && u.id) activeUserId = u.id;
          if (u && u.role) activeUserRole = u.role;
        }
        cleanupTimestamp = localStorage.getItem('gi_cleanup_timestamp') || inMemoryStore['gi_cleanup_timestamp'] || '0';
      } catch (e) {}

      try {
        await apiFetch(getApiUrl('/api/save-store'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            gi_withdrawal_proofs: filtered,
            userId: activeUserId,
            role: activeUserRole,
            gi_cleanup_timestamp: Number(cleanupTimestamp)
          })
        });
      } catch (e) {
        console.warn('Failed to sync deleted proof to server:', e);
      }
      this.saveWithdrawalProofs(filtered);
      dispatchStoreUpdated();
      return true;
    }
    return false;
  }

  static async updateWithdrawalProofStatus(proofId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    const proofs = this.getWithdrawalProofs();
    let updated = false;
    const nextProofs = proofs.map(p => {
      if (p.id === proofId) {
        updated = true;
        return { ...p, status, lastModified: Date.now() };
      }
      return p;
    });
    if (updated) {
      let activeUserId = '';
      let activeUserRole = 'user';
      let cleanupTimestamp = '0';
      try {
        const activeUserStr = localStorage.getItem('gi_current_user') || inMemoryStore['gi_current_user'];
        if (activeUserStr) {
          const u = JSON.parse(activeUserStr);
          if (u && u.id) activeUserId = u.id;
          if (u && u.role) activeUserRole = u.role;
        }
        cleanupTimestamp = localStorage.getItem('gi_cleanup_timestamp') || inMemoryStore['gi_cleanup_timestamp'] || '0';
      } catch (e) {}

      try {
        await apiFetch(getApiUrl('/api/save-store'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            gi_withdrawal_proofs: nextProofs,
            userId: activeUserId,
            role: activeUserRole,
            gi_cleanup_timestamp: Number(cleanupTimestamp)
          })
        });
      } catch (e) {
        console.warn('Failed to sync updated proof status to server:', e);
      }
      this.saveWithdrawalProofs(nextProofs);
      dispatchStoreUpdated();
      return true;
    }
    return false;
  }

  // Processes and automatically credits due chronological daily earnings for all active plans
  static processAutomaticDailyInstallments(): void {
    const now = Date.now();
    let users = this.getUsers();
    let investments = this.getInvestments();
    let notifications = this.getNotifications();
    let changed = false;

    investments = investments.map(inv => {
      if (inv.status === 'completed') return inv;

      const createdTime = new Date(inv.createdAt).getTime();
      const msDiff = now - createdTime;
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // Calculate how many 24-hour periods should have fully passed since purchase
      let expectedDays = Math.floor(msDiff / oneDayMs);
      if (expectedDays > inv.durationDays) {
        expectedDays = inv.durationDays;
      }

      // If more days should have processed than currently tracked
      if (expectedDays > inv.daysPassed) {
        const isCyclicProduct = (inv as any).isCyclic !== undefined ? Boolean((inv as any).isCyclic) : true;

        if (isCyclicProduct) {
          if (expectedDays >= inv.durationDays) {
            // End of complete cycle: payout totalReturn (capital + profits)
            const totalPayout = (inv as any).totalReturn || (inv.price + (inv.dailyReturn * inv.durationDays));
            const netProfit = totalPayout - inv.price;

            const uIdx = users.findIndex(u => u.id === inv.userId);
            if (uIdx !== -1) {
              const revenueHistory = this.getRevenueHistory();
              const alreadyCredited = inv.payoutCredited || revenueHistory.some(r => r.investmentId === inv.id);

              // Créditer le revenu une seule et unique fois
              if (!alreadyCredited) {
                users[uIdx].balance += totalPayout;
                users[uIdx].totalEarnings += netProfit;
                users[uIdx].lastModified = Date.now();

                // Enregistrer dans « Historique des revenus » sur la page Portefeuille
                const newRecord: RevenueRecord = {
                  id: `rev-${Date.now()}-${inv.id}`,
                  userId: inv.userId,
                  investmentId: inv.id,
                  productName: inv.productName,
                  category: inv.category || 'stability',
                  vipLevel: (inv as any).vipLevel,
                  price: inv.price,
                  totalPayout: totalPayout,
                  netProfit: netProfit,
                  durationDays: inv.durationDays,
                  claimedAt: new Date().toISOString(),
                  lastModified: Date.now()
                };
                revenueHistory.unshift(newRecord);
                this.saveRevenueHistory(revenueHistory);

                const isWellbeing = inv.category === 'wellbeing';
                const isActivity = inv.category === 'activity';
                const isStability = inv.category === 'stability' || (!isWellbeing && !isActivity);
                const title = isWellbeing 
                  ? `🌸 Cycle Bien-être Terminé (${inv.productName})` 
                  : isActivity
                  ? `⚡ Cycle d'Activité Terminé (${inv.productName})`
                  : `📈 Cycle Stabilité Terminé (${inv.productName})`;
                const message = isWellbeing
                  ? `Félicitations ! Votre cycle de bien-être "${inv.productName}" de ${inv.durationDays} jours est terminé. Votre revenu total de ${totalPayout.toLocaleString()} XOF (capital: ${inv.price.toLocaleString()} XOF + bénéfices: ${netProfit.toLocaleString()} XOF) a été crédité sur votre solde. Pour démarrer un nouveau cycle, vous pouvez effectuer un nouvel investissement.`
                  : isActivity
                  ? `Félicitations ! Votre cycle d'activité "${inv.productName}" de ${inv.durationDays} jours est terminé. Votre revenu total de ${totalPayout.toLocaleString()} XOF (capital: ${inv.price.toLocaleString()} XOF + bénéfices: ${netProfit.toLocaleString()} XOF) a été crédité sur votre solde. Pour démarrer un nouveau cycle, vous pouvez effectuer un nouvel investissement.`
                  : `Félicitations ! Votre cycle de stabilité "${inv.productName}" de ${inv.durationDays} jours est terminé. Votre capital de ${inv.price.toLocaleString()} XOF et vos bénéfices de ${netProfit.toLocaleString()} XOF ont été crédités sur votre solde (total: ${totalPayout.toLocaleString()} XOF).`;

                notifications.unshift({
                  id: `not-cyclecomplete-${Date.now()}-${inv.id}`,
                  userId: inv.userId,
                  title,
                  message,
                  type: 'plan',
                  createdAt: new Date().toISOString(),
                  read: false
                });
              }
            }

            inv.daysPassed = expectedDays;
            inv.totalReturnClaimed = totalPayout;
            inv.lastClaimDate = new Date().toISOString();
            inv.status = 'completed';
            inv.payoutCredited = true;
            inv.lastModified = Date.now();
            changed = true;
          } else {
            // Just advance the counter of days passed
            inv.daysPassed = expectedDays;
            inv.lastModified = Date.now();
            changed = true;
          }
        } else {
          // Standard VIP stability plans (daily dividend credited daily) - Left as safety fallback but unused
          const missingDays = expectedDays - inv.daysPassed;
          const totalPayout = inv.dailyReturn * missingDays;

          const uIdx = users.findIndex(u => u.id === inv.userId);
          if (uIdx !== -1) {
            users[uIdx].balance += totalPayout;
            users[uIdx].totalEarnings += totalPayout;
            
            notifications.unshift({
              id: `not-autodrop-${Date.now()}-${inv.id}-${inv.daysPassed}`,
              userId: inv.userId,
              title: `💰 Gain automatique reçu (${inv.productName})`,
              message: `Félicitations, votre gain de ${totalPayout.toLocaleString()} XOF est tombé automatiquement.`,
              type: 'plan',
              createdAt: new Date().toISOString(),
              read: false
            });
          }

          inv.daysPassed = expectedDays;
          inv.totalReturnClaimed += totalPayout;
          inv.lastClaimDate = new Date().toISOString();
          inv.lastModified = Date.now();

          if (inv.daysPassed >= inv.durationDays) {
            inv.status = 'completed';
          }
          changed = true;
        }
      }
      return inv;
    });

    if (changed) {
      // Recalculate dailyEarnings for all users to match active investments status correctly
      users = users.map(u => {
        const userActiveInvs = investments.filter(inv => inv.userId === u.id && inv.status === 'active' && inv.category !== 'wellbeing' && inv.category !== 'stability' && !(inv as any).isCyclic);
        const activeDailyEarnings = userActiveInvs.reduce((sum, inv) => sum + inv.dailyReturn, 0);
        return {
          ...u,
          dailyEarnings: activeDailyEarnings,
          lastModified: Date.now()
        };
      });

      this.saveInvestments(investments);
      this.saveUsers(users);
      this.saveNotifications(notifications);

      // Sync active user if they are currently logged in
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const fresh = users.find(u => u.id === currentUser.id);
        if (fresh) {
          this.saveCurrentUser(fresh);
        }
      }
    }
  }

  // Shifts active plans 24 hours back in time to facilitate simulation testing
  static advanceAllActiveInvestmentsBy24Hours(userId: string): void {
    let investments = this.getInvestments();
    let changed = false;

    investments = investments.map(inv => {
      if (inv.userId === userId && inv.status === 'active') {
        const currentDate = new Date(inv.createdAt);
        // Deduct 24 hours
        currentDate.setHours(currentDate.getHours() - 24);
        inv.createdAt = currentDate.toISOString();
        changed = true;
      }
      return inv;
    });

    if (changed) {
      this.saveInvestments(investments);
      this.processAutomaticDailyInstallments();
    }
  }

  // ================= ADMIN FUNCTIONS =================

  // Block/unblock users
  static setBlockUser(userId: string, isBlocked: boolean): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].isBlocked = isBlocked;
      this.saveUsers(users);
      
      // If the current user is this user, sign them out
      const current = this.getCurrentUser();
      if (current && current.id === userId && isBlocked) {
        this.saveCurrentUser(null);
      }
    }
  }

  // Delete purchased product (investment)
  static async deleteInvestment(investmentId: string, userId?: string, productId?: string): Promise<boolean> {
    if (!investmentId && (!userId || !productId)) return false;
    const invIdStr = investmentId ? String(investmentId).trim() : '';
    const uIdStr = userId ? String(userId).trim() : '';
    const pIdStr = productId ? String(productId).trim() : '';

    const investments = this.getInvestments();
    const matchingInvs = investments.filter(i => {
      if (!i) return false;
      if (invIdStr && String(i.id).trim() === invIdStr) return true;
      if (uIdStr && pIdStr && String(i.userId).trim() === uIdStr && String(i.productId).trim() === pIdStr) return true;
      return false;
    });

    const idsToDelete: string[] = matchingInvs.map(i => String(i.id).trim());
    if (invIdStr && !idsToDelete.includes(invIdStr)) {
      idsToDelete.push(invIdStr);
    }

    // 1. Track deleted investment locally to prevent sync resurrection
    const deletedInvestments = getFromStore<string[]>('gi_deleted_investments', []).map(String);
    for (const dId of idsToDelete) {
      if (!deletedInvestments.includes(dId)) {
        deletedInvestments.push(dId);
      }
    }
    setToStore<string[]>('gi_deleted_investments', deletedInvestments);

    // 2. Filter out the deleted investment locally
    const updatedInvestments = investments.filter(i => i && !idsToDelete.includes(String(i.id).trim()));
    this.saveInvestments(updatedInvestments);

    // 3. Recalculate daily earnings for affected users
    const affectedUserIds = Array.from(new Set([
      ...matchingInvs.map(i => String(i.userId).trim()),
      ...(uIdStr ? [uIdStr] : [])
    ])).filter(Boolean);

    const users = this.getUsers();
    let userChanged = false;
    for (let idx = 0; idx < users.length; idx++) {
      if (affectedUserIds.includes(String(users[idx].id).trim())) {
        const activeInvs = updatedInvestments.filter(i => 
          i && String(i.userId).trim() === String(users[idx].id).trim() && i.status === 'active'
        );
        users[idx].dailyEarnings = activeInvs.reduce((sum, i) => sum + (Number(i.dailyReturn) || 0), 0);
        users[idx].lastModified = Date.now();
        userChanged = true;
      }
    }
    if (userChanged) {
      this.saveUsers(users);
      const current = this.getCurrentUser();
      if (current && affectedUserIds.includes(String(current.id).trim())) {
        const upToDateUser = users.find(u => String(u.id).trim() === String(current.id).trim());
        if (upToDateUser) {
          this.saveCurrentUser({ ...current, ...upToDateUser });
        }
      }
    }

    dispatchStoreUpdated();

    // 4. Notify backend to delete from server memory and Supabase Cloud
    try {
      const response = await apiFetch(getApiUrl('/api/admin/delete-investment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId: invIdStr, userId: uIdStr, productId: pIdStr })
      });
      const data = await response.json();
      if (data && data.success) {
        if (Array.isArray(data.investments)) {
          this.saveInvestments(data.investments);
        }
        if (Array.isArray(data.users)) {
          this.saveUsers(data.users);
          const current = this.getCurrentUser();
          if (current) {
            const upToDateUser = data.users.find((u: any) => u && String(u.id) === String(current.id));
            if (upToDateUser) {
              this.saveCurrentUser({ ...current, ...upToDateUser });
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to sync deleted investment with backend:', e);
    }

    try {
      await syncWithBackend();
    } catch (e) {}

    dispatchStoreUpdated();
    return true;
  }

  // Delete all purchased products / investments
  static async deleteAllInvestments(): Promise<boolean> {
    const investments = this.getInvestments();
    const deletedInvIds = investments.map(i => i && i.id ? String(i.id).trim() : '').filter(Boolean);

    const deletedInvestments = getFromStore<string[]>('gi_deleted_investments', []).map(String);
    for (const dId of deletedInvIds) {
      if (!deletedInvestments.includes(dId)) {
        deletedInvestments.push(dId);
      }
    }
    setToStore<string[]>('gi_deleted_investments', deletedInvestments);
    this.saveInvestments([]);

    // Reset daily earnings for all users
    const users = this.getUsers();
    for (let idx = 0; idx < users.length; idx++) {
      users[idx].dailyEarnings = 0;
      users[idx].lastModified = Date.now();
    }
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current) {
      this.saveCurrentUser({ ...current, dailyEarnings: 0, lastModified: Date.now() });
    }

    dispatchStoreUpdated();

    try {
      await apiFetch(getApiUrl('/api/admin/delete-all-investments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('Failed to sync delete-all-investments with backend:', e);
    }

    dispatchStoreUpdated();
    return true;
  }

  // Delete user account
  static async deleteUser(userId: string): Promise<boolean> {
    const users = this.getUsers();
    const nextUsers = users.filter(u => u.id !== userId);
    this.saveUsers(nextUsers);

    // Track deleted user locally to prevent sync resurrection
    const deletedUsers = getFromStore<string[]>('gi_deleted_users', []);
    if (!deletedUsers.includes(userId)) {
      deletedUsers.push(userId);
      setToStore<string[]>('gi_deleted_users', deletedUsers);
    }

    // Clean up dependent local stores
    const investments = this.getInvestments().filter(i => i.userId !== userId);
    this.saveInvestments(investments);

    const deposits = this.getDeposits().filter(d => d.userId !== userId);
    this.saveDeposits(deposits);

    const withdrawals = this.getWithdrawals().filter(w => w.userId !== userId);
    this.saveWithdrawals(withdrawals);

    // If the current user is this user, sign them out
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.saveCurrentUser(null);
    }

    try {
      await apiFetch(getApiUrl('/api/admin/delete-user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (e) {
      console.error('Failed to notify backend of user deletion:', e);
    }
    return true;
  }

  // Modify user balances
  static updateUserBalance(userId: string, data: { balance: number, bonus: number, role: 'user' | 'admin', password?: string, referredBy?: string | null, withdrawBlocked?: boolean }): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].balance = data.balance;
      users[idx].bonus = data.bonus;
      users[idx].role = data.role;
      if (data.withdrawBlocked !== undefined) {
        users[idx].withdrawBlocked = data.withdrawBlocked;
      }
      
      let finalReferredBy: string | undefined = undefined;
      if (data.referredBy !== undefined) {
        if (data.referredBy === null || data.referredBy.trim() === '') {
          finalReferredBy = undefined;
        } else {
          const cleanRef = data.referredBy.trim();
          const cleanRefUpper = cleanRef.toUpperCase();
          const refDigits = cleanRef.replace(/\D/g, '');
          
          const matchedSponsor = users.find(u => {
            if (u.id.toUpperCase() === cleanRefUpper) return true;
            if (u.referralCode && u.referralCode.toUpperCase() === cleanRefUpper) return true;
            if (refDigits.length >= 6 && u.whatsapp) {
              const uDigits = u.whatsapp.replace(/\D/g, '');
              if (uDigits.endsWith(refDigits) || refDigits.endsWith(uDigits)) return true;
            }
            return false;
          });
          
          if (matchedSponsor) {
            finalReferredBy = matchedSponsor.id;
          } else {
            finalReferredBy = cleanRef;
          }
        }
        users[idx].referredBy = finalReferredBy;
      }

      if (data.password !== undefined && data.password.trim() !== '') {
        users[idx].password = data.password;
      }
      this.saveUsers(users);

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.balance = data.balance;
        current.bonus = data.bonus;
        current.role = data.role;
        if (data.withdrawBlocked !== undefined) {
          current.withdrawBlocked = data.withdrawBlocked;
        }
        if (data.referredBy !== undefined) {
          current.referredBy = finalReferredBy;
        }
        if (data.password !== undefined && data.password.trim() !== '') {
          current.password = data.password;
        }
        this.saveCurrentUser(current);
      }
    }
  }

  // Self-change or admin-change password helper
  static changeUserPassword(userId: string, newPasswordString: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPasswordString;
      this.saveUsers(users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.password = newPasswordString;
        this.saveCurrentUser(current);
      }
      return true;
    }
    return false;
  }

  // Financial Queue management
  static approveDeposit(depositId: string): boolean {
    const deposits = this.getDeposits();
    const idx = deposits.findIndex(d => d.id === depositId);
    if (idx === -1) return false;
    if (deposits[idx].status === 'approved') return true;

    deposits[idx].status = 'approved';
    deposits[idx].approvedAt = new Date().toISOString();
    deposits[idx].lastModified = Date.now();
    this.saveDeposits(deposits);

    // Credit user
    const users = this.getUsers();
    const user = users.find(u => u.id === deposits[idx].userId);
    if (user) {
      user.balance = (Number(user.balance) || 0) + deposits[idx].amount;
      user.totalRecharged = (Number(user.totalRecharged) || 0) + deposits[idx].amount;
      user.lastModified = Date.now();
      this.saveUsers(users);

      // Sync active
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        current.balance = user.balance;
        current.totalRecharged = user.totalRecharged;
        this.saveCurrentUser(current);
      }
    }

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-app-${Date.now()}`,
      userId: deposits[idx].userId,
      title: '💵 Dépôt validé !',
      message: `Votre versement de ${deposits[idx].amount.toLocaleString()} XOF via ${deposits[idx].operator} a été approuvé. Votre solde principal a été rechargé.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    try {
      dispatchStoreUpdated();
    } catch (e) {}

    return true;
  }

  static rejectDeposit(depositId: string): boolean {
    const deposits = this.getDeposits();
    const idx = deposits.findIndex(d => d.id === depositId);
    if (idx === -1 || deposits[idx].status !== 'pending') return false;

    deposits[idx].status = 'rejected';
    this.saveDeposits(deposits);

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-dep-rej-${Date.now()}`,
      userId: deposits[idx].userId,
      title: '⚠️ Dépôt rejeté',
      message: `Votre demande de dépôt de ${deposits[idx].amount.toLocaleString()} XOF a été refusée suite à une anomalie de référence ou de capture d'écran de paiement. Contactez le service client.`,
      type: 'deposit',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  static approveWithdrawal(withdrawalId: string): boolean {
    const withdrawals = this.getWithdrawals();
    const idx = withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1 || withdrawals[idx].status !== 'pending') return false;

    withdrawals[idx].status = 'approved';
    this.saveWithdrawals(withdrawals);

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-wth-app-${Date.now()}`,
      userId: withdrawals[idx].userId,
      title: '💸 Retrait envoyé !',
      message: `Félicitations, votre retrait de ${withdrawals[idx].amount.toLocaleString()} XOF sur le numéro ${withdrawals[idx].number} (${withdrawals[idx].operator}) a été validé et expédié avec succès.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  static rejectWithdrawal(withdrawalId: string): boolean {
    const withdrawals = this.getWithdrawals();
    const idx = withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1 || withdrawals[idx].status !== 'pending') return false;

    withdrawals[idx].status = 'rejected';
    this.saveWithdrawals(withdrawals);

    // Return the money to the user since it was deducted on request creation
    const users = this.getUsers();
    const user = users.find(u => u.id === withdrawals[idx].userId);
    if (user) {
      user.balance += withdrawals[idx].amount;
      this.saveUsers(users);

      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        current.balance = user.balance;
        this.saveCurrentUser(current);
      }
    }

    // Notify user
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-wth-rej-${Date.now()}`,
      userId: withdrawals[idx].userId,
      title: '❌ Retrait rejeté',
      message: `Votre retrait de ${withdrawals[idx].amount.toLocaleString()} XOF a été refusé. Les fonds ont été intégralement restitués à votre solde principal.`,
      type: 'withdraw',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);

    return true;
  }

  // Global Platform notifications broadcast
  static sendGlobalNotification(title: string, message: string): void {
    const notifications = this.getNotifications();
    notifications.unshift({
      id: `not-glob-${Date.now()}`,
      title,
      message,
      type: 'info',
      createdAt: new Date().toISOString(),
      read: false
    });
    this.saveNotifications(notifications);
  }

  // Create customized VIP Product list
  static addNewProduct(p: Object): void {
    const list = this.getProducts();
    const id = `vip-${Date.now()}`;
    const newP: Product = {
      id,
      vipLevel: (p as any).vipLevel || list.length + 1,
      name: (p as any).name || 'Nouveau Produit VIP',
      price: (p as any).price || 5000,
      dailyReturn: (p as any).dailyReturn || 1000,
      durationDays: (p as any).durationDays || 10,
      totalReturn: ((p as any).dailyReturn || 1000) * ((p as any).durationDays || 10),
      tag: (p as any).tag || 'Special Offer',
      isCyclic: (p as any).isCyclic || false,
      generatedProductIds: (p as any).generatedProductIds || [],
      category: (p as any).category || 'stability',
      imageUrl: (p as any).imageUrl || undefined,
      lastModified: Date.now()
    };

    list.push(newP);
    this.saveProducts(list);
  }

  static deleteProduct(productId: string): void {
    const prodIdStr = String(productId).trim();
    let list = this.getProducts();
    const targetProd = list.find(p => p && String(p.id).trim() === prodIdStr);
    list = list.filter(p => p && String(p.id).trim() !== prodIdStr);

    const deletedProducts = getFromStore<string[]>('gi_deleted_products', []).map(String);
    if (!deletedProducts.includes(prodIdStr)) {
      deletedProducts.push(prodIdStr);
      setToStore<string[]>('gi_deleted_products', deletedProducts);
    }
    this.saveProducts(list);

    // Cascade delete associated investments / user purchases
    const investments = this.getInvestments();
    const matchingInvs = investments.filter(i => 
      i && (String(i.productId).trim() === prodIdStr || (targetProd && i.productName === targetProd.name))
    );

    if (matchingInvs.length > 0) {
      const deletedInvIds = matchingInvs.map(i => String(i.id).trim());
      const deletedInvs = getFromStore<string[]>('gi_deleted_investments', []).map(String);
      for (const dId of deletedInvIds) {
        if (!deletedInvs.includes(dId)) deletedInvs.push(dId);
      }
      setToStore<string[]>('gi_deleted_investments', deletedInvs);

      const remainingInvs = investments.filter(i => i && !deletedInvIds.includes(String(i.id).trim()));
      this.saveInvestments(remainingInvs);

      const affectedUserIds = Array.from(new Set(matchingInvs.map(i => String(i.userId).trim())));
      const users = this.getUsers();
      for (let idx = 0; idx < users.length; idx++) {
        if (affectedUserIds.includes(String(users[idx].id).trim())) {
          const userActive = remainingInvs.filter(i => i && String(i.userId).trim() === String(users[idx].id).trim() && i.status === 'active');
          users[idx].dailyEarnings = userActive.reduce((sum, i) => sum + (Number(i.dailyReturn) || 0), 0);
          users[idx].lastModified = Date.now();
        }
      }
      this.saveUsers(users);

      const current = this.getCurrentUser();
      if (current && affectedUserIds.includes(String(current.id).trim())) {
        const upToDateUser = users.find(u => String(u.id).trim() === String(current.id).trim());
        if (upToDateUser) {
          this.saveCurrentUser({ ...current, ...upToDateUser });
        }
      }
    }

    dispatchStoreUpdated();
  }

  static updateProduct(productId: string, updatedP: Partial<Product>): void {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === productId);
    if (idx !== -1) {
      const current = list[idx];
      const vipLevel = updatedP.vipLevel !== undefined ? updatedP.vipLevel : current.vipLevel;
      const name = updatedP.name !== undefined ? updatedP.name : current.name;
      const price = updatedP.price !== undefined ? updatedP.price : current.price;
      const dailyReturn = updatedP.dailyReturn !== undefined ? updatedP.dailyReturn : current.dailyReturn;
      const durationDays = updatedP.durationDays !== undefined ? updatedP.durationDays : current.durationDays;
      const tag = updatedP.tag !== undefined ? updatedP.tag : current.tag;
      const isBlocked = updatedP.isBlocked !== undefined ? updatedP.isBlocked : current.isBlocked;
      const reopenDateTime = updatedP.reopenDateTime !== undefined ? updatedP.reopenDateTime : current.reopenDateTime;
      const isCyclic = updatedP.isCyclic !== undefined ? updatedP.isCyclic : current.isCyclic;
      const generatedProductIds = updatedP.generatedProductIds !== undefined ? updatedP.generatedProductIds : current.generatedProductIds;
      const category = updatedP.category !== undefined ? updatedP.category : current.category;
      const imageUrl = updatedP.imageUrl !== undefined ? updatedP.imageUrl : current.imageUrl;

      const totalReturn = updatedP.totalReturn !== undefined 
        ? updatedP.totalReturn 
        : (dailyReturn * durationDays);

      list[idx] = {
        id: productId,
        vipLevel,
        name,
        price,
        dailyReturn,
        durationDays,
        totalReturn,
        tag,
        isBlocked,
        reopenDateTime,
        isCyclic,
        generatedProductIds,
        category,
        imageUrl,
        lastModified: Date.now()
      };
      this.saveProducts(list);
    }
  }

  static toggleBlockProduct(productId: string, isBlocked: boolean, reopenDateTime?: string): void {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === productId);
    if (idx !== -1) {
      list[idx].isBlocked = isBlocked;
      list[idx].reopenDateTime = isBlocked ? (reopenDateTime || undefined) : undefined;
      list[idx].lastModified = Date.now();
      this.saveProducts(list);
    }
  }

  // Create Bonus code
  static createBonusCode(code: string, amount: number, maxUses: number): void {
    const list = this.getBonusCodes();
    list.unshift({
      code: code.trim().toUpperCase(),
      amount,
      maxUses,
      usedCount: 0,
      usedByUsers: []
    });
    this.saveBonusCodes(list);
  }

  static areWithdrawalsBlocked(): boolean {
    return getFromStore<boolean>('gi_withdrawals_blocked_global', false);
  }

  static setWithdrawalsBlocked(blocked: boolean): void {
    setToStore<boolean>('gi_withdrawals_blocked_global', blocked);
  }

  // Announcements management & persistence
  static getAnnouncements(): Announcement[] {
    return getFromStore<Announcement[]>('gi_announcements', INITIAL_ANNOUNCEMENTS);
  }

  static saveAnnouncements(announcements: Announcement[]): void {
    setToStore<Announcement[]>('gi_announcements', announcements);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gi_announcements_updated', { detail: announcements }));
    }
    // Async push to server and Supabase
    try {
      apiFetch(getApiUrl('/api/save-store'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'gi_announcements': announcements
        })
      }).catch((err) => console.warn('[SAVE ANNOUNCEMENTS SYNC ERROR]', err));
    } catch (e) {}
  }

  static publishAnnouncement(data: {
    title: string;
    content: string;
    category?: 'officiel' | 'important' | 'promotion' | 'maintenance' | 'info';
    badge?: string;
    author?: string;
    pinned?: boolean;
    imageUrl?: string;
  }): Announcement {
    const list = this.getAnnouncements();
    const newAnn: Announcement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category || 'officiel',
      badge: data.badge || (data.category ? data.category.toUpperCase() : 'OFFICIEL'),
      author: data.author?.trim() || 'Administration Gold Avenue',
      pinned: Boolean(data.pinned),
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
      lastModified: Date.now()
    };

    if (newAnn.pinned) {
      list.unshift(newAnn);
    } else {
      const firstNonPinned = list.findIndex(a => !a.pinned);
      if (firstNonPinned === -1) {
        list.push(newAnn);
      } else {
        list.splice(firstNonPinned, 0, newAnn);
      }
    }

    this.saveAnnouncements(list);

    // Automatically trigger notification for all users
    try {
      const notifs = this.getNotifications();
      notifs.unshift({
        id: `not-ann-${newAnn.id}`,
        title: `📢 Annonce : ${newAnn.title}`,
        message: newAnn.content.length > 140 ? newAnn.content.substring(0, 137) + '...' : newAnn.content,
        type: 'info',
        createdAt: new Date().toISOString(),
        read: false
      });
      this.saveNotifications(notifs);
    } catch (e) {
      console.warn('[ANNOUNCEMENT NOTIF TRIGGER ERROR]', e);
    }

    return newAnn;
  }

  static deleteAnnouncement(announcementId: string): void {
    let list = this.getAnnouncements();
    list = list.filter(a => a.id !== announcementId);
    this.saveAnnouncements(list);
  }

  // Read status tracking per user
  static getReadAnnouncementIds(userId?: string): string[] {
    if (!userId) return [];
    try {
      const key = `gi_read_announcements_${userId}`;
      const raw = localStorage.getItem(key) || inMemoryStore[key];
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  static markAnnouncementAsRead(userId: string, announcementId: string): void {
    if (!userId || !announcementId) return;
    try {
      const readIds = this.getReadAnnouncementIds(userId);
      if (!readIds.includes(announcementId)) {
        readIds.push(announcementId);
        const key = `gi_read_announcements_${userId}`;
        const valStr = JSON.stringify(readIds);
        try {
          localStorage.setItem(key, valStr);
        } catch (e) {}
        inMemoryStore[key] = valStr;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gi_read_announcements_updated', { detail: { userId, readIds } }));
        }
      }
    } catch (e) {}
  }

  static markAllAnnouncementsAsRead(userId: string): void {
    if (!userId) return;
    try {
      const all = this.getAnnouncements();
      const allIds = all.map(a => a.id);
      const key = `gi_read_announcements_${userId}`;
      const valStr = JSON.stringify(allIds);
      try {
        localStorage.setItem(key, valStr);
      } catch (e) {}
      inMemoryStore[key] = valStr;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gi_read_announcements_updated', { detail: { userId, readIds: allIds } }));
      }
    } catch (e) {}
  }

  static getUnreadAnnouncementsCount(userId?: string): number {
    if (!userId) return 0;
    const all = this.getAnnouncements();
    const readIds = this.getReadAnnouncementIds(userId);
    return all.filter(a => !readIds.includes(a.id)).length;
  }
}
