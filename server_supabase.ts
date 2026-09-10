import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase credentials (Service Role Key for admin operations - NEVER exposed to browser)
export const DEFAULT_SUPABASE_URL = 'https://sjvyhnxklgsgprgkihrr.supabase.co';
export const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdnlobnhrbGdzZ3ByZ2tpaHJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODcyNzM2OCwiZXhwIjoyMTA0MzAzMzY4fQ.q8aNC6Ak8gj0m_6_yq3MQF_yYHQYoFpEz7Fn3zI2gxM';

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

  // If environment points to stale project or is empty, use user's explicit project URL
  if (envUrl && !envUrl.includes("ajluqalpxchoshqieuyj") && envUrl.startsWith("http")) {
    return envUrl;
  }
  return DEFAULT_SUPABASE_URL;
}

/**
 * Returns the Supabase Service Role Key currently configured (Server-only)
 */
export function getSupabaseServiceKey(): string {
  const envKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  // If environment contains the old project key, prioritize the user's explicit service key
  if (envKey && !envKey.includes("ajluqalpxchoshqieuyj")) {
    try {
      const parts = envKey.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload && payload.ref && payload.ref !== "ajluqalpxchoshqieuyj") {
          return envKey;
        }
      }
    } catch {
      // ignore parse error and fallback
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
      result['gi_users'] = userRows
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
      foundAny = true;
    }

    // Deposits
    const { data: depRows, error: depErr } = await client
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (!depErr && Array.isArray(depRows) && depRows.length > 0) {
      result['gi_deposits'] = depRows
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
      foundAny = true;
    }

    // Withdrawals
    const { data: wthRows, error: wthErr } = await client
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!wthErr && Array.isArray(wthRows) && wthRows.length > 0) {
      result['gi_withdrawals'] = wthRows
        .filter(r => !deletedUsers.includes(r.user_id))
        .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            userName: r.user_name || raw.userName || 'Investisseur',
            amount: Number(r.amount || raw.amount || 0),
            netAmount: Number(r.net_amount || raw.netAmount || r.amount || 0),
            fee: Number(r.fee || raw.fee || 0),
            method: r.method || raw.method || 'Mobile Money',
            accountNumber: r.account_number || raw.accountNumber || '',
            accountName: r.account_name || raw.accountName || '',
            status: r.status || raw.status || 'pending',
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            processedAt: r.processed_at ? new Date(r.processed_at).toISOString() : raw.processedAt,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      foundAny = true;
    }

    // Investments
    const { data: invRows, error: invErr } = await client
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!invErr && Array.isArray(invRows) && invRows.length > 0) {
      result['gi_investments'] = invRows
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
      result['gi_products'] = prodRows
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

    const { error } = await client.from('users').upsert(payload, { onConflict: 'id' });
    return !error;
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

    const { error } = await client.from('deposits').upsert(payload, { onConflict: 'id' });
    return !error;
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
    const payload = {
      id: withdrawal.id,
      user_id: withdrawal.userId,
      user_name: withdrawal.userName || 'Investisseur',
      amount: Number(withdrawal.amount || 0),
      net_amount: Number(withdrawal.netAmount || withdrawal.amount || 0),
      fee: Number(withdrawal.fee || 0),
      method: withdrawal.method || 'Mobile Money',
      account_number: withdrawal.accountNumber || '',
      account_name: withdrawal.accountName || '',
      status: withdrawal.status || 'pending',
      created_at: withdrawal.createdAt ? new Date(withdrawal.createdAt).toISOString() : new Date().toISOString(),
      processed_at: withdrawal.processedAt ? new Date(withdrawal.processedAt).toISOString() : null,
      last_modified: Number(withdrawal.lastModified || Date.now()),
      raw_data: withdrawal
    };

    const { error } = await client.from('withdrawals').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
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

    const { error } = await client.from('investments').upsert(payload, { onConflict: 'id' });
    return !error;
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
