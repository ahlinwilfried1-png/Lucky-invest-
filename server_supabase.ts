import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase credentials (Service Role Key for admin operations - NEVER exposed to browser)
export const DEFAULT_SUPABASE_URL = 'https://muixbrojlvfbjwnflgot.supabase.co';
export const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXhicm9qbHZmYmp3bmZsZ290Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE4NTg2NiwiZXhwIjoyMTA0NzYxODY2fQ.XH4UhUoRvfz1npdEi7pRTT4eH6VtSCs84FT_Eu3qJFU';

let supabaseAdmin: SupabaseClient | null = null;
let isSyncingRelational = false;
let lastLogTime = 0;

/**
 * Returns the Supabase URL currently configured
 */
export function getSupabaseUrl(): string {
  const envUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();

  // If environment points to a valid URL that is not an old superseded project, use it
  if (
    envUrl && 
    !envUrl.includes("ajluqalpxchoshqieuyj") && 
    !envUrl.includes("sjvyhnxklgsgprgkihrr") && 
    envUrl.startsWith("http")
  ) {
    return envUrl;
  }
  return DEFAULT_SUPABASE_URL;
}

/**
 * Returns the Supabase Service Role Key currently configured (Server-only)
 */
export function getSupabaseServiceKey(): string {
  const envKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  // If environment contains a key that is not from an old superseded project, use it
  if (
    envKey && 
    !envKey.includes("ajluqalpxchoshqieuyj") && 
    !envKey.includes("sjvyhnxklgsgprgkihrr") && 
    envKey.length > 20
  ) {
    try {
      const parts = envKey.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload && payload.ref && payload.ref !== "ajluqalpxchoshqieuyj" && payload.ref !== "sjvyhnxklgsgprgkihrr") {
          return envKey;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Sanitizes Supabase URL for safe display
 */
export function sanitizeSupabaseUrl(url?: string): string {
  const target = url || getSupabaseUrl();
  try {
    const parsed = new URL(target);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return target || '(non configuré)';
  }
}

/**
 * Initializes and returns the admin Supabase client with Service Role privileges
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey();

  if (!url || !key) return null;

  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public',
        }
      });
      console.log(`[SUPABASE SERVER] Client initialisé avec succès pour ${sanitizeSupabaseUrl(url)}`);
    } catch (err: any) {
      console.error('[SUPABASE SERVER ERROR] Échec initialisation Supabase client:', err?.message || err);
      supabaseAdmin = null;
    }
  }

  return supabaseAdmin;
}

/**
 * Tests connection to Supabase and reports which tables are ready
 */
export function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
  url: string;
  tablesCount: number;
  existingTables: string[];
  missingTables: string[];
}> {
  return new Promise(async (resolve) => {
    const client = getSupabaseAdminClient();
    const url = getSupabaseUrl();

    if (!client) {
      return resolve({
        ok: false,
        message: "Client Supabase non initialisé (vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY).",
        url: sanitizeSupabaseUrl(url),
        tablesCount: 0,
        existingTables: [],
        missingTables: ['store', 'users', 'deposits', 'withdrawals', 'investments', 'products']
      });
    }

    try {
      const requiredTables = ['store', 'users', 'deposits', 'withdrawals', 'investments', 'products', 'commissions', 'notifications'];
      const existingTables: string[] = [];
      const missingTables: string[] = [];

      await Promise.all(
        requiredTables.map(async (table) => {
          try {
            const timeoutPromise = new Promise<{ error: any }>((res) => setTimeout(() => res({ error: 'timeout' }), 2500));
            const queryPromise = (table === 'store' ? client.from('store').select('key').limit(1) : client.from(table).select('id').limit(1));
            const res: any = await Promise.race([queryPromise, timeoutPromise]);
            if (!res.error) {
              existingTables.push(table);
            } else {
              missingTables.push(table);
            }
          } catch {
            missingTables.push(table);
          }
        })
      );

      const ok = existingTables.length > 0;
      let msg = '';
      if (existingTables.length === requiredTables.length) {
        msg = `Connexion Supabase 100% opérationnelle. Toutes les ${existingTables.length} tables sont prêtes.`;
      } else if (existingTables.length > 0) {
        msg = `Connexion Supabase active (${existingTables.length} tables prêtes : ${existingTables.join(', ')}). Exécutez le script SQL pour créer les tables manquantes (${missingTables.join(', ')}).`;
      } else {
        msg = `Connexion établie avec Supabase, mais les tables n'existent pas encore. Veuillez exécuter le script SQL dans l'éditeur SQL de votre projet Supabase.`;
      }

      return resolve({
        ok,
        message: msg,
        url: sanitizeSupabaseUrl(url),
        tablesCount: existingTables.length,
        existingTables,
        missingTables
      });
    } catch (err: any) {
      return resolve({
        ok: false,
        message: `Erreur de connexion Supabase: ${err?.message || err}`,
        url: sanitizeSupabaseUrl(url),
        tablesCount: 0,
        existingTables: [],
        missingTables: ['store', 'users', 'deposits', 'withdrawals', 'investments', 'products']
      });
    }
  });
}

/**
 * Merges an existing entity list (e.g. from store) with relational rows by ID.
 * Keeps the newer item if timestamps differ, or merges fields to avoid losing attributes.
 */
function mergeEntityArrays(storeList: any[], relationalList: any[], idField = 'id'): any[] {
  const map = new Map<string, any>();
  if (Array.isArray(storeList)) {
    for (const item of storeList) {
      if (item && item[idField]) {
        map.set(String(item[idField]).trim(), item);
      }
    }
  }
  if (Array.isArray(relationalList)) {
    for (const item of relationalList) {
      if (!item || !item[idField]) continue;
      const id = String(item[idField]).trim();
      const existing = map.get(id);
      if (!existing) {
        map.set(id, item);
      } else {
        const existingTime = Number(existing.lastModified || new Date(existing.createdAt || 0).getTime() || 0);
        const incomingTime = Number(item.lastModified || new Date(item.createdAt || 0).getTime() || 0);
        if (incomingTime >= existingTime) {
          map.set(id, { ...existing, ...item });
        } else {
          map.set(id, { ...item, ...existing });
        }
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Fetches authoritative store data from Supabase
 */
export async function fetchSupabaseStoreData(): Promise<Record<string, any> | null> {
  const client = getSupabaseAdminClient();
  if (!client) return null;

  const result: Record<string, any> = {};
  let foundAny = false;

  // 1. Try public.store key-value table first
  try {
    const { data: storeRows, error: storeError } = await client
      .from('store')
      .select('key, value');

    if (!storeError && Array.isArray(storeRows)) {
      for (const row of storeRows) {
        if (row && row.key) {
          result[row.key] = row.value;
          foundAny = true;
        }
      }
    }
  } catch (e: any) {
    // Silently continue to check relational tables
  }

  // 2. Fetch directly from relational tables if they exist
  try {
    const deletedUsers: string[] = Array.isArray(result['gi_deleted_users']) ? result['gi_deleted_users'].map(s => String(s).trim()) : [];
    const deletedInvestments: string[] = Array.isArray(result['gi_deleted_investments']) ? result['gi_deleted_investments'].map(s => String(s).trim()) : [];
    const deletedForumPosts: string[] = Array.isArray(result['gi_deleted_forum_posts']) ? result['gi_deleted_forum_posts'].map(s => String(s).trim()) : [];
    const deletedProducts: string[] = Array.isArray(result['gi_deleted_products']) ? result['gi_deleted_products'].map(s => String(s).trim()) : [];

    // Filter store-based forum posts and products if loaded
    if (Array.isArray(result['gi_forum_posts'])) {
      result['gi_forum_posts'] = result['gi_forum_posts'].filter((p: any) => p && p.id && !deletedForumPosts.includes(String(p.id).trim()));
    }
    if (Array.isArray(result['gi_products'])) {
      result['gi_products'] = result['gi_products'].filter((p: any) => p && p.id && !deletedProducts.includes(String(p.id).trim()));
    }
    if (Array.isArray(result['gi_investments'])) {
      result['gi_investments'] = result['gi_investments'].filter((i: any) => 
        i && i.id && 
        !deletedInvestments.includes(String(i.id).trim()) &&
        (!i.productId || !deletedProducts.includes(String(i.productId).trim()))
      );
    }

    // Users
    const { data: userRows, error: userErr } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (!userErr && Array.isArray(userRows) && userRows.length > 0) {
      const mappedUsers = userRows
        .filter(r => !deletedUsers.includes(r.id))
        .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            name: r.name || raw.name || 'Utilisateur',
            whatsapp: r.whatsapp || raw.whatsapp || '',
            password: r.password || raw.password || '',
            balance: Number(r.balance !== null && r.balance !== undefined ? r.balance : (raw.balance || 0)),
            bonus: Number(r.bonus !== null && r.bonus !== undefined ? r.bonus : (raw.bonus || 0)),
            totalRecharged: Number(r.total_recharged !== null && r.total_recharged !== undefined ? r.total_recharged : (raw.totalRecharged || 0)),
            totalWithdrawn: Number(r.total_withdrawn !== null && r.total_withdrawn !== undefined ? r.total_withdrawn : (raw.totalWithdrawn || 0)),
            dailyEarnings: Number(r.daily_earnings !== null && r.daily_earnings !== undefined ? r.daily_earnings : (raw.dailyEarnings || 0)),
            referralEarnings: Number(r.referral_earnings !== null && r.referral_earnings !== undefined ? r.referral_earnings : (raw.referralEarnings || 0)),
            referredBy: r.referred_by || raw.referredBy || undefined,
            referralCode: r.referral_code || raw.referralCode || '',
            role: r.role || raw.role || 'user',
            isBlocked: Boolean(r.is_blocked !== null && r.is_blocked !== undefined ? r.is_blocked : raw.isBlocked),
            withdrawBlocked: Boolean(r.withdraw_blocked !== null && r.withdraw_blocked !== undefined ? r.withdraw_blocked : raw.withdrawBlocked),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      result['gi_users'] = mergeEntityArrays(result['gi_users'], mappedUsers);
      foundAny = true;
    }

    // Deposits
    const { data: depRows, error: depErr } = await client
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (!depErr && Array.isArray(depRows) && depRows.length > 0) {
      const mappedDeps = depRows
        .filter(r => !deletedUsers.includes(r.user_id))
        .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            userName: r.user_name || raw.userName || 'Investisseur',
            amount: Number(r.amount || raw.amount || 0),
            operator: r.operator || r.method || raw.operator || 'Mobile Money',
            method: r.method || raw.method || 'Mobile Money',
            status: r.status || raw.status || 'pending',
            receiptImage: r.receipt_image || r.proof_image || raw.receiptImage || raw.proofImage,
            proofImage: r.proof_image || raw.proofImage || r.receipt_image,
            txId: r.tx_id || raw.txId,
            reference: r.reference || r.tx_id || raw.reference || `DEP-${r.id}`,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            approvedAt: r.approved_at ? new Date(r.approved_at).toISOString() : raw.approvedAt,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      result['gi_deposits'] = mergeEntityArrays(result['gi_deposits'], mappedDeps);
      foundAny = true;
    }

    // Withdrawals
    const { data: wthRows, error: wthErr } = await client
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!wthErr && Array.isArray(wthRows) && wthRows.length > 0) {
      const mappedWths = wthRows
        .filter(r => !deletedUsers.includes(r.user_id))
        .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          const fee = Number(r.fee !== null && r.fee !== undefined ? r.fee : (raw.fee !== undefined ? raw.fee : Math.round(Number(r.amount || raw.amount || 0) * 0.12)));
          const net = Number(r.net_amount !== null && r.net_amount !== undefined ? r.net_amount : (raw.netAmount !== undefined ? raw.netAmount : (Number(r.amount || raw.amount || 0) - fee)));
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            userName: r.user_name || raw.userName || 'Investisseur',
            amount: Number(r.amount || raw.amount || 0),
            netAmount: net,
            fee: fee,
            method: r.method || raw.operator || raw.method || 'Mobile Money',
            operator: r.method || raw.operator || raw.method || 'Mobile Money',
            accountNumber: r.account_number || raw.number || raw.accountNumber || '',
            number: r.account_number || raw.number || raw.accountNumber || '',
            accountName: r.account_name || raw.accountName || '',
            status: r.status || raw.status || 'pending',
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            processedAt: r.processed_at ? new Date(r.processed_at).toISOString() : raw.processedAt,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      result['gi_withdrawals'] = mergeEntityArrays(result['gi_withdrawals'], mappedWths);
      foundAny = true;
    }

    // Investments
    const { data: invRows, error: invErr } = await client
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!invErr && Array.isArray(invRows) && invRows.length > 0) {
      const mappedInvs = invRows
        .filter(r => 
          !deletedUsers.includes(String(r.user_id).trim()) && 
          !deletedInvestments.includes(String(r.id).trim()) &&
          (!r.product_id || !deletedProducts.includes(String(r.product_id).trim()))
        )
        .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            productId: r.product_id || raw.productId,
            productName: r.product_name || raw.productName,
            price: Number(r.price || raw.price || 0),
            dailyReturn: Number(r.daily_return || raw.dailyReturn || 0),
            daysPassed: Number(r.days_passed !== null && r.days_passed !== undefined ? r.days_passed : (raw.daysPassed || 0)),
            durationDays: Number(r.duration_days || raw.durationDays || 30),
            totalReturnClaimed: Number(r.total_return_claimed || raw.totalReturnClaimed || 0),
            status: r.status || raw.status || 'active',
            isCyclic: Boolean(r.is_cyclic !== null && r.is_cyclic !== undefined ? r.is_cyclic : raw.isCyclic),
            category: r.category || raw.category || 'wellbeing',
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            lastClaimDate: r.last_claim_date ? new Date(r.last_claim_date).toISOString() : raw.lastClaimDate,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      result['gi_investments'] = mergeEntityArrays(result['gi_investments'], mappedInvs);
      foundAny = true;
    }

    // Recalculate users dailyEarnings from filtered active investments
    if (Array.isArray(result['gi_users']) && Array.isArray(result['gi_investments'])) {
      result['gi_users'] = result['gi_users'].map((u: any) => {
        if (!u || !u.id) return u;
        const uId = String(u.id).trim();
        const activeInvs = result['gi_investments'].filter((i: any) => 
          i && String(i.userId || i.user_id).trim() === uId && i.status === 'active'
        );
        const calculatedDaily = activeInvs.reduce((sum: number, i: any) => sum + (Number(i.dailyReturn || i.daily_return) || 0), 0);
        return {
          ...u,
          dailyEarnings: calculatedDaily
        };
      });
    }

    // Products
    const { data: prodRows, error: prodErr } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (!prodErr && Array.isArray(prodRows) && prodRows.length > 0) {
      const mappedProds = prodRows
        .filter(r => r && r.id && !deletedProducts.includes(String(r.id)))
        .map(r => {
        const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
        return {
          ...raw,
          id: r.id,
          name: r.name || raw.name,
          price: Number(r.price || raw.price || 0),
          dailyReturn: Number(r.daily_return || raw.dailyReturn || 0),
          durationDays: Number(r.duration_days || raw.durationDays || 30),
          category: r.category || raw.category || 'wellbeing',
          isCyclic: Boolean(r.is_cyclic !== null && r.is_cyclic !== undefined ? r.is_cyclic : raw.isCyclic),
          isBlocked: Boolean(r.is_blocked !== null && r.is_blocked !== undefined ? r.is_blocked : raw.isBlocked),
          totalReturn: Number(r.total_return || raw.totalReturn || (Number(r.daily_return || 0) * Number(r.duration_days || 30))),
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
          lastModified: Number(r.last_modified || raw.lastModified || Date.now())
        };
      });
      result['gi_products'] = mergeEntityArrays(result['gi_products'], mappedProds);
      foundAny = true;
    }

    // Support Messages
    const { data: msgRows, error: msgErr } = await client
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!msgErr && Array.isArray(msgRows) && msgRows.length > 0) {
      const mappedMsgs = msgRows
        .filter(r => !deletedUsers.includes(String(r.user_id || '').trim()))
        .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: String(r.id),
            userId: String(r.user_id || raw.userId),
            sender: (r.sender || raw.sender || 'user') as 'user' | 'admin',
            message: String(r.message || raw.message || ''),
            image: r.image || raw.image || undefined,
            status: (raw.status || (r.read ? 'read' : 'unread')) as 'unread' | 'read' | 'replied',
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            lastModified: Number(raw.lastModified || new Date(r.created_at || 0).getTime() || Date.now())
          };
        });
      result['gi_support_messages'] = mergeEntityArrays(result['gi_support_messages'], mappedMsgs);
      foundAny = true;
    }
  } catch (err: any) {
    console.warn('[SUPABASE RELATIONAL PULL WARN]', err?.message || err);
  }

  return foundAny ? result : null;
}

/**
 * Upserts key-value entries into public.store
 */
export async function saveSupabaseStoreBatch(rows: Array<{ key: string; value: any }>): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || rows.length === 0) return false;

  try {
    const payload = rows.map(r => ({
      key: r.key,
      value: r.value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await client
      .from('store')
      .upsert(payload, { onConflict: 'key' });

    if (error) {
      const now = Date.now();
      if (now - lastLogTime > 30000) {
        console.warn('[SUPABASE STORE UPSERT WARN]', error.message);
        lastLogTime = now;
      }
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[SUPABASE STORE UPSERT EXCEPTION]', err?.message || err);
    return false;
  }
}

/**
 * Syncs full in-memory store data to relational Supabase tables
 */
export async function syncSupabaseRelationalTables(storeData: Record<string, any>): Promise<void> {
  if (isSyncingRelational) return;
  const client = getSupabaseAdminClient();
  if (!client) return;

  isSyncingRelational = true;
  try {
    const deletedUsers: string[] = Array.isArray(storeData['gi_deleted_users']) ? storeData['gi_deleted_users'] : [];
    const deletedInvestments: string[] = Array.isArray(storeData['gi_deleted_investments']) ? storeData['gi_deleted_investments'] : [];

    // 1. Users
    if (Array.isArray(storeData['gi_users']) && storeData['gi_users'].length > 0) {
      const validUsers = storeData['gi_users'].filter((u: any) => u && u.id && !deletedUsers.includes(u.id));
      const byWhatsapp = new Map<string, any>();
      for (const u of validUsers) {
        const phone = (u.whatsapp || '').trim();
        if (!phone) {
          byWhatsapp.set(u.id, u);
          continue;
        }
        const existing = byWhatsapp.get(phone);
        if (!existing) {
          byWhatsapp.set(phone, u);
        } else {
          // Keep the one with higher balance or admin role
          if ((Number(u.balance) || 0) > (Number(existing.balance) || 0) || (u.role === 'admin' && existing.role !== 'admin')) {
            byWhatsapp.set(phone, u);
          }
        }
      }

      const deduplicatedUsers = Array.from(byWhatsapp.values());
      for (const u of deduplicatedUsers) {
        try {
          const payload = {
            id: u.id,
            name: u.name || 'Utilisateur',
            whatsapp: u.whatsapp || '',
            password: u.password || '',
            balance: Number(u.balance || 0),
            bonus: Number(u.bonus || 0),
            total_recharged: Number(u.totalRecharged || 0),
            total_withdrawn: Number(u.totalWithdrawn || 0),
            daily_earnings: Number(u.dailyEarnings || 0),
            referral_earnings: Number(u.referralEarnings || 0),
            referred_by: u.referredBy || null,
            referral_code: u.referralCode || '',
            role: u.role || 'user',
            is_blocked: Boolean(u.isBlocked),
            withdraw_blocked: Boolean(u.withdrawBlocked),
            created_at: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            last_modified: Number(u.lastModified || Date.now()),
            raw_data: u
          };
          await client.from('users').upsert(payload, { onConflict: 'id' });
        } catch (uErr: any) {
          console.warn('[SUPABASE UPSERT USER ITEM WARN]', u.id, uErr?.message || uErr);
        }
      }
    }

    // 2. Deposits
    if (Array.isArray(storeData['gi_deposits']) && storeData['gi_deposits'].length > 0) {
      const depPayloads = storeData['gi_deposits']
        .filter((d: any) => d && d.id && !deletedUsers.includes(d.userId))
        .map((d: any) => ({
          id: d.id,
          user_id: d.userId,
          user_name: d.userName || 'Investisseur',
          amount: Number(d.amount || 0),
          method: d.method || d.operator || 'Mobile Money',
          operator: d.operator || d.method || 'Mobile Money',
          status: d.status || 'pending',
          receipt_image: d.receiptImage || d.proofImage || null,
          proof_image: d.proofImage || d.receiptImage || null,
          tx_id: d.txId || null,
          reference: d.reference || d.txId || `DEP-${d.id}`,
          created_at: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          approved_at: d.approvedAt ? new Date(d.approvedAt).toISOString() : null,
          last_modified: Number(d.lastModified || Date.now()),
          raw_data: d
        }));

      if (depPayloads.length > 0) {
        await client.from('deposits').upsert(depPayloads, { onConflict: 'id' });
      }
    }

    // 3. Withdrawals
    if (Array.isArray(storeData['gi_withdrawals']) && storeData['gi_withdrawals'].length > 0) {
      const wthPayloads = storeData['gi_withdrawals']
        .filter((w: any) => w && w.id && !deletedUsers.includes(w.userId))
        .map((w: any) => ({
          id: w.id,
          user_id: w.userId,
          user_name: w.userName || 'Investisseur',
          amount: Number(w.amount || 0),
          net_amount: Number(w.netAmount || w.amount || 0),
          fee: Number(w.fee || 0),
          method: w.method || 'Mobile Money',
          account_number: w.accountNumber || '',
          account_name: w.accountName || '',
          status: w.status || 'pending',
          created_at: w.createdAt ? new Date(w.createdAt).toISOString() : new Date().toISOString(),
          processed_at: w.processedAt ? new Date(w.processedAt).toISOString() : null,
          last_modified: Number(w.lastModified || Date.now()),
          raw_data: w
        }));

      if (wthPayloads.length > 0) {
        await client.from('withdrawals').upsert(wthPayloads, { onConflict: 'id' });
      }
    }

    // 4. Investments
    if (Array.isArray(storeData['gi_investments']) && storeData['gi_investments'].length > 0) {
      const invPayloads = storeData['gi_investments']
        .filter((i: any) => i && i.id && !deletedUsers.includes(i.userId) && !deletedInvestments.includes(i.id))
        .map((i: any) => ({
          id: i.id,
          user_id: i.userId,
          product_id: i.productId,
          product_name: i.productName || 'Plan Investissement',
          price: Number(i.price || 0),
          daily_return: Number(i.dailyReturn || 0),
          days_passed: Number(i.daysPassed || 0),
          duration_days: Number(i.durationDays || 30),
          total_return_claimed: Number(i.totalReturnClaimed || 0),
          status: i.status || 'active',
          is_cyclic: Boolean(i.isCyclic),
          category: i.category || 'wellbeing',
          created_at: i.createdAt ? new Date(i.createdAt).toISOString() : new Date().toISOString(),
          last_claim_date: i.lastClaimDate ? new Date(i.lastClaimDate).toISOString() : null,
          last_modified: Number(i.lastModified || Date.now()),
          raw_data: i
        }));

      if (invPayloads.length > 0) {
        await client.from('investments').upsert(invPayloads, { onConflict: 'id' });
      }
    }

    // 5. Products
    if (Array.isArray(storeData['gi_products']) && storeData['gi_products'].length > 0) {
      const deletedProducts = Array.isArray(storeData['gi_deleted_products']) ? storeData['gi_deleted_products'].map(String) : [];
      const prodPayloads = storeData['gi_products']
        .filter((p: any) => p && p.id && !deletedProducts.includes(String(p.id)))
        .map((p: any) => ({
          id: p.id,
          name: p.name || 'Produit',
          price: Number(p.price || 0),
          daily_return: Number(p.dailyReturn || 0),
          duration_days: Number(p.durationDays || 30),
          category: p.category || 'wellbeing',
          is_cyclic: Boolean(p.isCyclic),
          is_blocked: Boolean(p.isBlocked),
          total_return: Number(p.totalReturn || (Number(p.dailyReturn || 0) * Number(p.durationDays || 30))),
          created_at: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          last_modified: Number(p.lastModified || Date.now()),
          raw_data: p
        }));

      if (prodPayloads.length > 0) {
        await client.from('products').upsert(prodPayloads, { onConflict: 'id' });
      }
    }

    // 6. Announcements
    if (Array.isArray(storeData['gi_announcements']) && storeData['gi_announcements'].length > 0) {
      const annPayloads = storeData['gi_announcements']
        .filter((a: any) => a && a.id)
        .map((a: any) => ({
          id: a.id,
          title: a.title || 'Annonce',
          content: a.content || '',
          summary: a.summary || null,
          category: a.category || 'officiel',
          importance: a.importance || 'normal',
          date: a.date || new Date().toISOString().split('T')[0],
          active: a.active !== false,
          created_at: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
          raw_data: a
        }));

      if (annPayloads.length > 0) {
        try {
          await client.from('announcements').upsert(annPayloads, { onConflict: 'id' });
        } catch {
          // non-blocking if table is not yet created
        }
      }
    }

    // 7. Support Messages
    if (Array.isArray(storeData['gi_support_messages']) && storeData['gi_support_messages'].length > 0) {
      const msgPayloads = storeData['gi_support_messages']
        .filter((m: any) => m && m.id && !deletedUsers.includes(String(m.userId || '').trim()))
        .map((m: any) => ({
          id: String(m.id),
          user_id: String(m.userId),
          sender: String(m.sender || 'user'),
          message: String(m.message || ''),
          image: m.image || null,
          read: m.status === 'read' || m.status === 'replied',
          created_at: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
          raw_data: m
        }));

      if (msgPayloads.length > 0) {
        try {
          await client.from('support_messages').upsert(msgPayloads, { onConflict: 'id' });
        } catch (msgErr: any) {
          console.warn('[SUPABASE SUPPORT MESSAGES RELATIONAL UPSERT WARN]', msgErr?.message || msgErr);
        }
      }
    }
  } catch (err: any) {
    console.warn('[SUPABASE RELATIONAL SYNC WARN]', err?.message || err);
  } finally {
    isSyncingRelational = false;
  }
}

/**
 * Direct user upsert to Supabase
 */
export async function upsertSupabaseUser(user: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !user?.id) return false;

  try {
    const payload = {
      id: user.id,
      name: user.name || 'Utilisateur',
      whatsapp: user.whatsapp || '',
      password: user.password || '',
      balance: Number(user.balance || 0),
      bonus: Number(user.bonus || 0),
      total_recharged: Number(user.totalRecharged || 0),
      total_withdrawn: Number(user.totalWithdrawn || 0),
      daily_earnings: Number(user.dailyEarnings || 0),
      referral_earnings: Number(user.referralEarnings || 0),
      referred_by: user.referredBy || null,
      referral_code: user.referralCode || '',
      role: user.role || 'user',
      is_blocked: Boolean(user.isBlocked),
      withdraw_blocked: Boolean(user.withdrawBlocked),
      created_at: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      last_modified: Number(user.lastModified || Date.now()),
      raw_data: user
    };

    try {
      await client.from('users').upsert(payload, { onConflict: 'id' });
    } catch (tblErr) {
      console.warn('[SUPABASE USERS TABLE UPSERT WARN]', tblErr);
    }

    // Dual persistence: also guarantee entry in public.store key 'gi_users'
    try {
      const { data: sData } = await client.from('store').select('value').eq('key', 'gi_users').maybeSingle();
      let currentUsers = (sData && Array.isArray(sData.value)) ? sData.value : [];
      currentUsers = [user, ...currentUsers.filter((u: any) => u && String(u.id).trim() !== String(user.id).trim())];
      await client.from('store').upsert({ key: 'gi_users', value: currentUsers, updated_at: new Date().toISOString() });
    } catch (storeErr) {
      console.warn('[SUPABASE STORE USERS UPSERT WARN]', storeErr);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Direct deposit update / upsert to Supabase
 */
export async function upsertSupabaseDeposit(deposit: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !deposit?.id) return false;

  try {
    const payload = {
      id: deposit.id,
      user_id: deposit.userId,
      user_name: deposit.userName || 'Investisseur',
      amount: Number(deposit.amount || 0),
      method: deposit.method || deposit.operator || 'Mobile Money',
      operator: deposit.operator || deposit.method || 'Mobile Money',
      status: deposit.status || 'pending',
      receipt_image: deposit.receiptImage || deposit.proofImage || null,
      proof_image: deposit.proofImage || deposit.receiptImage || null,
      tx_id: deposit.txId || null,
      reference: deposit.reference || deposit.txId || `DEP-${deposit.id}`,
      created_at: deposit.createdAt ? new Date(deposit.createdAt).toISOString() : new Date().toISOString(),
      approved_at: deposit.approvedAt ? new Date(deposit.approvedAt).toISOString() : null,
      last_modified: Number(deposit.lastModified || Date.now()),
      raw_data: deposit
    };

    try {
      await client.from('deposits').upsert(payload, { onConflict: 'id' });
    } catch (tblErr) {
      console.warn('[SUPABASE DEPOSITS TABLE UPSERT WARN]', tblErr);
    }

    // Dual persistence: also guarantee entry in public.store key 'gi_deposits'
    try {
      const { data: sData } = await client.from('store').select('value').eq('key', 'gi_deposits').maybeSingle();
      let currentDeps = (sData && Array.isArray(sData.value)) ? sData.value : [];
      currentDeps = [deposit, ...currentDeps.filter((d: any) => d && String(d.id).trim() !== String(deposit.id).trim())];
      await client.from('store').upsert({ key: 'gi_deposits', value: currentDeps, updated_at: new Date().toISOString() });
    } catch (storeErr) {
      console.warn('[SUPABASE STORE DEPOSITS UPSERT WARN]', storeErr);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Direct withdrawal update / upsert to Supabase
 */
export async function upsertSupabaseWithdrawal(withdrawal: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !withdrawal?.id) return false;

  try {
    const fee = Number(withdrawal.fee !== null && withdrawal.fee !== undefined ? withdrawal.fee : Math.round(Number(withdrawal.amount || 0) * 0.12));
    const net = Number(withdrawal.netAmount !== null && withdrawal.netAmount !== undefined ? withdrawal.netAmount : (Number(withdrawal.amount || 0) - fee));
    const payload = {
      id: withdrawal.id,
      user_id: withdrawal.userId,
      user_name: withdrawal.userName || 'Investisseur',
      amount: Number(withdrawal.amount || 0),
      net_amount: net,
      fee: fee,
      method: withdrawal.method || withdrawal.operator || 'Mobile Money',
      account_number: withdrawal.accountNumber || withdrawal.number || '',
      account_name: withdrawal.accountName || '',
      status: withdrawal.status || 'pending',
      created_at: withdrawal.createdAt ? new Date(withdrawal.createdAt).toISOString() : new Date().toISOString(),
      processed_at: withdrawal.processedAt ? new Date(withdrawal.processedAt).toISOString() : null,
      last_modified: Number(withdrawal.lastModified || Date.now()),
      raw_data: withdrawal
    };

    try {
      await client.from('withdrawals').upsert(payload, { onConflict: 'id' });
    } catch (tblErr) {
      console.warn('[SUPABASE WITHDRAWALS TABLE UPSERT WARN]', tblErr);
    }

    // Dual persistence: also guarantee entry in public.store key 'gi_withdrawals'
    try {
      const { data: sData } = await client.from('store').select('value').eq('key', 'gi_withdrawals').maybeSingle();
      let currentWiths = (sData && Array.isArray(sData.value)) ? sData.value : [];
      currentWiths = [withdrawal, ...currentWiths.filter((w: any) => w && String(w.id).trim() !== String(withdrawal.id).trim())];
      await client.from('store').upsert({ key: 'gi_withdrawals', value: currentWiths, updated_at: new Date().toISOString() });
    } catch (storeErr) {
      console.warn('[SUPABASE STORE WITHDRAWALS UPSERT WARN]', storeErr);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Direct support message upsert to Supabase
 */
export async function upsertSupabaseSupportMessage(message: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !message?.id) return false;

  try {
    const payload = {
      id: String(message.id),
      user_id: String(message.userId),
      sender: String(message.sender || 'user'),
      message: String(message.message || ''),
      image: message.image || null,
      read: message.status === 'read' || message.status === 'replied',
      created_at: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
      raw_data: message
    };

    try {
      await client.from('support_messages').upsert(payload, { onConflict: 'id' });
    } catch (tblErr: any) {
      console.warn('[SUPABASE SUPPORT MESSAGES TABLE UPSERT WARN]', tblErr?.message || tblErr);
    }

    // Dual persistence: also guarantee entry in public.store key 'gi_support_messages'
    try {
      const { data: sData } = await client.from('store').select('value').eq('key', 'gi_support_messages').maybeSingle();
      let currentMsgs = (sData && Array.isArray(sData.value)) ? sData.value : [];
      currentMsgs = [message, ...currentMsgs.filter((m: any) => m && String(m.id).trim() !== String(message.id).trim())];
      await client.from('store').upsert({ key: 'gi_support_messages', value: currentMsgs, updated_at: new Date().toISOString() });
    } catch (storeErr: any) {
      console.warn('[SUPABASE STORE SUPPORT MESSAGES UPSERT WARN]', storeErr?.message || storeErr);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Mark support messages read in Supabase
 */
export async function markSupabaseSupportMessagesRead(userId: string, readerRole: 'user' | 'admin'): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !userId) return false;

  try {
    const filterSender = readerRole === 'admin' ? 'user' : 'admin';
    await client
      .from('support_messages')
      .update({ read: true })
      .eq('user_id', String(userId).trim())
      .eq('sender', filterSender);

    // Also update in public.store
    try {
      const { data: sData } = await client.from('store').select('value').eq('key', 'gi_support_messages').maybeSingle();
      if (sData && Array.isArray(sData.value)) {
        const updated = sData.value.map((m: any) => {
          if (m && String(m.userId).trim() === String(userId).trim() && m.sender === filterSender && m.status === 'unread') {
            return { ...m, status: 'read', lastModified: Date.now() };
          }
          return m;
        });
        await client.from('store').upsert({ key: 'gi_support_messages', value: updated, updated_at: new Date().toISOString() });
      }
    } catch (storeErr: any) {
      console.warn('[SUPABASE STORE MARK READ WARN]', storeErr?.message || storeErr);
    }

    return true;
  } catch (err: any) {
    console.warn('[SUPABASE MARK READ WARN]', err?.message || err);
    return false;
  }
}

/**
 * Direct investment update / upsert to Supabase
 */
export async function upsertSupabaseInvestment(investment: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !investment?.id) return false;

  try {
    const payload = {
      id: investment.id,
      user_id: investment.userId,
      product_id: investment.productId,
      product_name: investment.productName || 'Plan Investissement',
      price: Number(investment.price || 0),
      daily_return: Number(investment.dailyReturn || 0),
      days_passed: Number(investment.daysPassed || 0),
      duration_days: Number(investment.durationDays || 30),
      total_return_claimed: Number(investment.totalReturnClaimed || 0),
      status: investment.status || 'active',
      is_cyclic: Boolean(investment.isCyclic),
      category: investment.category || 'wellbeing',
      created_at: investment.createdAt ? new Date(investment.createdAt).toISOString() : new Date().toISOString(),
      last_claim_date: investment.lastClaimDate ? new Date(investment.lastClaimDate).toISOString() : null,
      last_modified: Number(investment.lastModified || Date.now()),
      raw_data: investment
    };

    try {
      await client.from('investments').upsert(payload, { onConflict: 'id' });
    } catch (tblErr) {
      console.warn('[SUPABASE INVESTMENTS TABLE UPSERT WARN]', tblErr);
    }

    // Dual persistence: also guarantee entry in public.store key 'gi_investments'
    try {
      const { data: sData } = await client.from('store').select('value').eq('key', 'gi_investments').maybeSingle();
      let currentInvs = (sData && Array.isArray(sData.value)) ? sData.value : [];
      currentInvs = [investment, ...currentInvs.filter((i: any) => i && String(i.id).trim() !== String(investment.id).trim())];
      await client.from('store').upsert({ key: 'gi_investments', value: currentInvs, updated_at: new Date().toISOString() });
    } catch (storeErr) {
      console.warn('[SUPABASE STORE INVESTMENTS UPSERT WARN]', storeErr);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Permanently deletes a user from Supabase
 */
export async function deleteSupabaseUser(userId: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !userId) return false;

  try {
    await client.from('users').delete().eq('id', userId);
    await client.from('deposits').delete().eq('user_id', userId);
    await client.from('withdrawals').delete().eq('user_id', userId);
    await client.from('investments').delete().eq('user_id', userId);
    await client.from('commissions').delete().eq('user_id', userId);
    await client.from('notifications').delete().eq('user_id', userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Permanently deletes an investment from Supabase (by investment ID and/or userId + productId)
 */
export async function deleteSupabaseInvestment(
  investmentId: string, 
  userId?: string, 
  productId?: string
): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || (!investmentId && (!userId || !productId))) return false;

  try {
    const invIdStr = investmentId ? String(investmentId).trim() : '';
    const uIdStr = userId ? String(userId).trim() : '';
    const pIdStr = productId ? String(productId).trim() : '';

    // 1. Delete from dedicated relational investments table
    if (invIdStr) {
      try {
        await client.from('investments').delete().eq('id', invIdStr);
      } catch (e: any) {
        console.warn('[SUPABASE DELETE INV BY ID WARN]', e?.message || e);
      }
    }
    if (uIdStr && pIdStr) {
      try {
        await client.from('investments').delete().eq('user_id', uIdStr).eq('product_id', pIdStr);
      } catch (e: any) {
        console.warn('[SUPABASE DELETE INV BY USER/PROD WARN]', e?.message || e);
      }
    }
    
    // 2. Also track in gi_deleted_investments store key
    try {
      const { data } = await client.from('store').select('value').eq('key', 'gi_deleted_investments').maybeSingle();
      let deleted = (data && Array.isArray(data.value)) ? data.value.map(String) : [];
      if (invIdStr && !deleted.includes(invIdStr)) {
        deleted.push(invIdStr);
      }
      await client.from('store').upsert({ key: 'gi_deleted_investments', value: deleted, updated_at: new Date().toISOString() });
    } catch {}

    // 3. Clean up gi_investments in store if present
    try {
      const { data: invStore } = await client.from('store').select('value').eq('key', 'gi_investments').maybeSingle();
      if (invStore && Array.isArray(invStore.value)) {
        const filtered = invStore.value.filter((i: any) => {
          if (!i) return false;
          if (invIdStr && String(i.id).trim() === invIdStr) return false;
          if (uIdStr && pIdStr && String(i.userId || i.user_id).trim() === uIdStr && String(i.productId || i.product_id).trim() === pIdStr) return false;
          return true;
        });
        await client.from('store').upsert({ key: 'gi_investments', value: filtered, updated_at: new Date().toISOString() });
      }
    } catch {}

    // 4. Recalculate daily earnings for the user in Supabase
    if (uIdStr) {
      try {
        const { data: userInvs } = await client.from('investments').select('daily_return, status').eq('user_id', uIdStr).eq('status', 'active');
        const calculatedDaily = Array.isArray(userInvs)
          ? userInvs.reduce((sum, item) => sum + (Number(item.daily_return) || 0), 0)
          : 0;
        await client.from('users').update({ daily_earnings: calculatedDaily, last_modified: Date.now() }).eq('id', uIdStr);

        const { data: userStore } = await client.from('store').select('value').eq('key', 'gi_users').maybeSingle();
        if (userStore && Array.isArray(userStore.value)) {
          const updatedUsers = userStore.value.map((u: any) => {
            if (u && String(u.id).trim() === uIdStr) {
              return { ...u, dailyEarnings: calculatedDaily, lastModified: Date.now() };
            }
            return u;
          });
          await client.from('store').upsert({ key: 'gi_users', value: updatedUsers, updated_at: new Date().toISOString() });
        }
      } catch {}
    }

    return true;
  } catch (err: any) {
    console.warn('[SUPABASE DELETE INVESTMENT WARN]', err?.message || err);
    return false;
  }
}

/**
 * Inserts or updates a community forum post
 */
export async function insertSupabaseForumPost(post: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !post?.id) return false;

  try {
    // Forum posts can also be saved into store key 'gi_forum_posts' or dedicated table
    const { data } = await client.from('store').select('value').eq('key', 'gi_forum_posts').maybeSingle();
    let posts = (data && Array.isArray(data.value)) ? data.value : [];
    posts = [post, ...posts.filter((p: any) => p.id !== post.id)];
    await client.from('store').upsert({ key: 'gi_forum_posts', value: posts, updated_at: new Date().toISOString() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes a community forum post
 */
export async function deleteSupabaseForumPost(postId: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !postId) return false;

  try {
    // Delete from possible dedicated table
    try {
      await client.from('forum_posts').delete().eq('id', postId);
    } catch {}

    // Delete from store gi_forum_posts
    const { data } = await client.from('store').select('value').eq('key', 'gi_forum_posts').maybeSingle();
    if (data && Array.isArray(data.value)) {
      const filtered = data.value.filter((p: any) => String(p.id) !== String(postId));
      await client.from('store').upsert({ key: 'gi_forum_posts', value: filtered, updated_at: new Date().toISOString() });
    }

    // Also track in gi_deleted_forum_posts
    const { data: delData } = await client.from('store').select('value').eq('key', 'gi_deleted_forum_posts').maybeSingle();
    let delPosts = (delData && Array.isArray(delData.value)) ? delData.value : [];
    if (!delPosts.includes(String(postId))) {
      delPosts.push(String(postId));
      await client.from('store').upsert({ key: 'gi_deleted_forum_posts', value: delPosts, updated_at: new Date().toISOString() });
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Permanently deletes a product from Supabase (relational products table + public.store)
 */
export async function deleteSupabaseProduct(productId: string): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !productId) return false;

  try {
    const prodIdStr = String(productId).trim();

    // 1. Delete from dedicated relational 'products' table
    try {
      await client.from('products').delete().eq('id', prodIdStr);
    } catch (err: any) {
      console.warn('[SUPABASE RELATIONAL DELETE PRODUCT WARN]', err?.message || err);
    }

    // 2. Cascade delete all investments / purchases for this product from relational investments table
    try {
      const { data: matchingInvs } = await client.from('investments').select('id, user_id').eq('product_id', prodIdStr);
      const affectedInvs = Array.isArray(matchingInvs) ? matchingInvs : [];
      const affectedInvIds = affectedInvs.map(i => String(i.id).trim());
      const affectedUserIds = Array.from(new Set(affectedInvs.map(i => String(i.user_id).trim())));

      // Delete from relational investments table
      await client.from('investments').delete().eq('product_id', prodIdStr);

      // Track in gi_deleted_investments
      if (affectedInvIds.length > 0) {
        const { data: delInvData } = await client.from('store').select('value').eq('key', 'gi_deleted_investments').maybeSingle();
        let deletedInvs = (delInvData && Array.isArray(delInvData.value)) ? delInvData.value.map(String) : [];
        for (const iId of affectedInvIds) {
          if (!deletedInvs.includes(iId)) deletedInvs.push(iId);
        }
        await client.from('store').upsert({ key: 'gi_deleted_investments', value: deletedInvs, updated_at: new Date().toISOString() });
      }

      // Recalculate daily earnings for affected users
      for (const uId of affectedUserIds) {
        const { data: userRemainingInvs } = await client.from('investments').select('daily_return').eq('user_id', uId).eq('status', 'active');
        const daily = Array.isArray(userRemainingInvs) 
          ? userRemainingInvs.reduce((sum, item) => sum + (Number(item.daily_return) || 0), 0)
          : 0;
        await client.from('users').update({ daily_earnings: daily, last_modified: Date.now() }).eq('id', uId);
      }
    } catch (err: any) {
      console.warn('[SUPABASE CASCADE DELETE INVESTMENTS WARN]', err?.message || err);
    }

    // 3. Delete from store 'gi_products'
    try {
      const { data } = await client.from('store').select('value').eq('key', 'gi_products').maybeSingle();
      if (data && Array.isArray(data.value)) {
        const filtered = data.value.filter((p: any) => p && String(p.id) !== prodIdStr);
        await client.from('store').upsert({ key: 'gi_products', value: filtered, updated_at: new Date().toISOString() });
      }
    } catch (err: any) {
      console.warn('[SUPABASE STORE PRODUCTS DELETE WARN]', err?.message || err);
    }

    // 4. Delete matching purchases from store 'gi_investments'
    try {
      const { data: invStore } = await client.from('store').select('value').eq('key', 'gi_investments').maybeSingle();
      if (invStore && Array.isArray(invStore.value)) {
        const filtered = invStore.value.filter((i: any) => i && String(i.productId || i.product_id).trim() !== prodIdStr);
        await client.from('store').upsert({ key: 'gi_investments', value: filtered, updated_at: new Date().toISOString() });
      }
    } catch (err: any) {
      console.warn('[SUPABASE STORE INVESTMENTS CASCADE WARN]', err?.message || err);
    }

    // 5. Track in 'gi_deleted_products'
    try {
      const { data: delData } = await client.from('store').select('value').eq('key', 'gi_deleted_products').maybeSingle();
      let delProducts = (delData && Array.isArray(delData.value)) ? delData.value : [];
      if (!delProducts.includes(prodIdStr)) {
        delProducts.push(prodIdStr);
        await client.from('store').upsert({ key: 'gi_deleted_products', value: delProducts, updated_at: new Date().toISOString() });
      }
    } catch (err: any) {
      console.warn('[SUPABASE STORE DELETED PRODUCTS TRACK WARN]', err?.message || err);
    }

    return true;
  } catch (err: any) {
    console.error('[SUPABASE DELETE PRODUCT ERROR]', err);
    return false;
  }
}

/**
 * Fetches real-time row counts directly from Supabase
 */
export async function fetchLiveSupabaseCounts(): Promise<{
  usersCount: number;
  depositsCount: number;
  withdrawalsCount: number;
  investmentsCount: number;
  productsCount: number;
}> {
  const client = getSupabaseAdminClient();
  const counts = {
    usersCount: 0,
    depositsCount: 0,
    withdrawalsCount: 0,
    investmentsCount: 0,
    productsCount: 0,
  };

  if (!client) return counts;

  try {
    const [u, d, w, i, p] = await Promise.all([
      client.from('users').select('id', { count: 'exact', head: true }),
      client.from('deposits').select('id', { count: 'exact', head: true }),
      client.from('withdrawals').select('id', { count: 'exact', head: true }),
      client.from('investments').select('id', { count: 'exact', head: true }),
      client.from('products').select('id', { count: 'exact', head: true })
    ]);

    counts.usersCount = u.count || 0;
    counts.depositsCount = d.count || 0;
    counts.withdrawalsCount = w.count || 0;
    counts.investmentsCount = i.count || 0;
    counts.productsCount = p.count || 0;
  } catch {
    // Non-critical diagnostic
  }

  return counts;
}

/**
 * Verifies in Supabase whether a referral's deposit is their very first approved recharge.
 * Strict business rule:
 * Referral commission is credited ONLY ONCE per referral, on their FIRST validated recharge.
 * 2nd, 3rd, and all subsequent deposits of that referral must yield NO new commission.
 */
export async function isReferralFirstApprovedDepositInSupabase(
  referralUserId: string,
  currentDepositId?: string
): Promise<{ isFirst: boolean; reason: string; priorApprovedCount: number }> {
  const client = getSupabaseAdminClient();
  const uId = String(referralUserId || '').trim();
  if (!uId) {
    return { isFirst: false, reason: 'ID de filleul manquant.', priorApprovedCount: 0 };
  }

  if (!client) {
    return { isFirst: true, reason: 'Client Supabase non initialisé, vérification locale.', priorApprovedCount: 0 };
  }

  try {
    // 1. Check in Supabase relational 'deposits' table
    try {
      const { data: depRows, error: depErr } = await client
        .from('deposits')
        .select('id, user_id, status, created_at, approved_at')
        .eq('user_id', uId);

      if (!depErr && Array.isArray(depRows)) {
        const priorApproved = depRows.filter((d: any) => {
          if (!d) return false;
          const isApproved = String(d.status || '').toLowerCase() === 'approved';
          if (!isApproved) return false;
          // Exclude the current deposit that is currently being approved/processed
          if (currentDepositId && String(d.id).trim() === String(currentDepositId).trim()) {
            return false;
          }
          return true;
        });

        if (priorApproved.length > 0) {
          return {
            isFirst: false,
            reason: `Supabase (table deposits) contient déjà ${priorApproved.length} rechargement(s) approuvé(s) pour ce filleul (${uId}).`,
            priorApprovedCount: priorApproved.length
          };
        }
      }
    } catch (err: any) {
      console.warn('[SUPABASE DEPOSITS CHECK WARN]', err?.message || err);
    }

    // 2. Check in Supabase 'store' table for gi_deposits as backup verification
    try {
      const { data: storeDep } = await client
        .from('store')
        .select('value')
        .eq('key', 'gi_deposits')
        .maybeSingle();

      if (storeDep && Array.isArray(storeDep.value)) {
        const priorInStore = storeDep.value.filter((d: any) => {
          if (!d || String(d.userId || d.user_id).trim() !== uId) return false;
          if (String(d.status || '').toLowerCase() !== 'approved') return false;
          if (currentDepositId && String(d.id).trim() === String(currentDepositId).trim()) return false;
          return true;
        });

        if (priorInStore.length > 0) {
          return {
            isFirst: false,
            reason: `Supabase store gi_deposits contient déjà ${priorInStore.length} rechargement(s) approuvé(s) pour ce filleul (${uId}).`,
            priorApprovedCount: priorInStore.length
          };
        }
      }
    } catch (err: any) {
      console.warn('[SUPABASE STORE DEPOSITS CHECK WARN]', err?.message || err);
    }

    // 3. Check in Supabase 'store' table for gi_commissions to prevent double attribution
    try {
      const { data: storeComm } = await client
        .from('store')
        .select('value')
        .eq('key', 'gi_commissions')
        .maybeSingle();

      if (storeComm && Array.isArray(storeComm.value)) {
        const existingRechargeCommission = storeComm.value.some((c: any) => {
          if (!c) return false;
          const matchesUser = String(c.fromUserId || c.referralId).trim() === uId;
          const isRecharge = c.type === 'recharge' || c.originType === 'recharge';
          return matchesUser && isRecharge;
        });

        if (existingRechargeCommission) {
          return {
            isFirst: false,
            reason: `Une commission de rechargement a déjà été attribuée pour le filleul (${uId}) dans Supabase gi_commissions.`,
            priorApprovedCount: 1
          };
        }
      }
    } catch (err: any) {
      console.warn('[SUPABASE STORE COMMISSIONS CHECK WARN]', err?.message || err);
    }

    // 4. Check in Supabase 'commissions' relational table if present
    try {
      const { data: commRows, error: commErr } = await client
        .from('commissions')
        .select('*')
        .limit(100);

      if (!commErr && Array.isArray(commRows)) {
        const alreadyGranted = commRows.some((c: any) => {
          if (!c) return false;
          const raw = (c.raw_data && typeof c.raw_data === 'object') ? c.raw_data : {};
          const cFromUserId = String(c.from_user_id || raw.fromUserId || raw.referralId || '').trim();
          const isRecharge = String(c.type || raw.type || raw.originType || '').toLowerCase() === 'recharge';
          return cFromUserId === uId && isRecharge;
        });

        if (alreadyGranted) {
          return {
            isFirst: false,
            reason: `La table relationnelle commissions contient déjà une commission pour ce filleul (${uId}).`,
            priorApprovedCount: 1
          };
        }
      }
    } catch {
      // Non-blocking if table structure differs
    }

    return {
      isFirst: true,
      reason: `Aucun historique de rechargement antérieur trouvé dans Supabase pour ${uId}. Premier rechargement autorisé.`,
      priorApprovedCount: 0
    };
  } catch (err: any) {
    console.warn('[SUPABASE FIRST RECHARGE CHECK WARN]', err?.message || err);
    return {
      isFirst: true,
      reason: 'Erreur lors de la requête Supabase, repli sur les vérifications locales.',
      priorApprovedCount: 0
    };
  }
}

/**
 * Permanently saves category schedules (Bien-être & Retraits) to Supabase public.store table
 */
export async function saveSupabaseCategorySchedules(schedules: any): Promise<boolean> {
  const client = getSupabaseAdminClient();
  if (!client || !schedules) return false;

  try {
    const payload = {
      key: 'gi_category_schedules',
      value: schedules,
      updated_at: new Date().toISOString()
    };

    const { error } = await client
      .from('store')
      .upsert([payload], { onConflict: 'key' });

    if (error) {
      console.warn('[SUPABASE CATEGORY SCHEDULES SAVE WARN]', error.message);
      return false;
    }

    console.log('[SUPABASE CATEGORY SCHEDULES] Successfully persisted category schedules to Supabase public.store.');
    return true;
  } catch (err: any) {
    console.warn('[SUPABASE CATEGORY SCHEDULES EXCEPTION]', err?.message || err);
    return false;
  }
}

/**
 * Fetches category schedules (Bien-être & Retraits) from Supabase public.store table
 */
export async function fetchSupabaseCategorySchedules(): Promise<any | null> {
  const client = getSupabaseAdminClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store')
      .select('value')
      .eq('key', 'gi_category_schedules')
      .maybeSingle();

    if (!error && data && data.value) {
      return data.value;
    }
  } catch (err: any) {
    console.warn('[SUPABASE FETCH CATEGORY SCHEDULES WARN]', err?.message || err);
  }
  return null;
}
