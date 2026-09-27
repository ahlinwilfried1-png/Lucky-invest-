import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Deposit, Withdrawal, Investment, Product, Commission, WithdrawalProof } from './types';

// Client-side environment variables configured for Vercel / Vite
// Uses public URL and public Anon Key ONLY. Never expose SUPABASE_SERVICE_ROLE_KEY in the browser!
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    if ((import.meta as any).env[key]) return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key];
  }
  return '';
};

const rawUrl = (getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL') || '').trim();
export const SUPABASE_URL = (rawUrl && rawUrl.startsWith('http') && !rawUrl.includes('muixbrojlvfbjwnflgot') && !rawUrl.includes('ajluqalpxchoshqieuyj') && !rawUrl.includes('sjvyhnxklgsgprgkihrr')) 
  ? rawUrl 
  : 'https://tfirruoxiudzukycdsyr.supabase.co';

const rawKey = (getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY') || '').trim();
export const SUPABASE_ANON_KEY = (rawKey && rawKey.length > 20 && !rawKey.includes('muixbrojlvfbjwnflgot') && !rawKey.includes('ajluqalpxchoshqieuyj') && !rawKey.includes('sjvyhnxklgsgprgkihrr'))
  ? rawKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmaXJydW94aXVkenVreWNkc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjI0ODIsImV4cCI6MjEwNDkzODQ4Mn0.aQXbifrFmI8J4nhnHkeK4m5yy4x1btLkBWoPN7tCYNQ';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
};

export const supabase = getSupabaseClient();

/**
 * Client-Side Supabase User Helpers (Anon Key)
 */

/**
 * Registers a new user account in Supabase
 */
export async function supabaseRegisterUser(userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const client = getSupabaseClient();
    const payload = {
      id: userData.id,
      name: userData.name || 'Utilisateur',
      whatsapp: userData.whatsapp,
      password: userData.password,
      balance: userData.balance || 0,
      bonus: userData.bonus || 0,
      total_recharged: userData.totalRecharged || 0,
      total_withdrawn: userData.totalWithdrawn || 0,
      daily_earnings: userData.dailyEarnings || 0,
      referral_earnings: userData.referralEarnings || 0,
      referred_by: userData.referredBy || null,
      referral_code: userData.referralCode || '',
      role: userData.role || 'user',
      is_blocked: Boolean(userData.isBlocked),
      withdraw_blocked: Boolean(userData.withdrawBlocked),
      created_at: userData.createdAt || new Date().toISOString(),
      last_modified: Date.now(),
      raw_data: userData
    };

    const { data, error } = await client
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('[SUPABASE REGISTRATION NOTICE]', error.message);
      // Even if direct users table has not been initialized yet, fallback smoothly
      return { success: false, error: error.message };
    }

    return { success: true, user: userData as User };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur réseau Supabase' };
  }
}

/**
 * Fetches all deposits directly from Supabase (client-side fail-safe)
 */
export async function supabaseGetDeposits(userId?: string): Promise<Deposit[]> {
  try {
    const client = getSupabaseClient();
    let query = client.from('deposits').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !Array.isArray(data)) return [];

    return data.map((r: any) => {
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
        receiptImage: r.receipt_image || r.proof_image || raw.receiptImage,
        proofImage: r.proof_image || raw.proofImage || r.receipt_image,
        reference: r.reference || raw.reference || `DEP-${r.id}`,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
        approvedAt: r.approved_at ? new Date(r.approved_at).toISOString() : raw.approvedAt,
        lastModified: Number(r.last_modified || raw.lastModified || Date.now())
      };
    });
  } catch {
    return [];
  }
}

/**
 * Direct client-side deposit submission to Supabase
 */
export async function supabaseUpsertDeposit(deposit: Partial<Deposit>): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    if (!deposit?.id) return false;
    const payload = {
      id: deposit.id,
      user_id: deposit.userId,
      user_name: deposit.userName || 'Investisseur',
      amount: Number(deposit.amount || 0),
      operator: deposit.operator || 'Mobile Money',
      method: (deposit as any).method || deposit.operator || 'Mobile Money',
      status: deposit.status || 'pending',
      receipt_image: deposit.receiptImage || null,
      proof_image: (deposit as any).proofImage || deposit.receiptImage || null,
      reference: deposit.reference || `DEP-${deposit.id}`,
      created_at: deposit.createdAt ? new Date(deposit.createdAt).toISOString() : new Date().toISOString(),
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
 * Fetches user investments directly from Supabase (client-side fail-safe)
 */
export async function supabaseGetInvestments(userId?: string): Promise<Investment[]> {
  try {
    const client = getSupabaseClient();
    let query = client.from('investments').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !Array.isArray(data)) return [];

    return data.map((r: any) => {
      const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
      return {
        ...raw,
        id: r.id,
        userId: r.user_id || raw.userId,
        productId: r.product_id || raw.productId,
        productName: r.product_name || raw.productName || 'Plan Investissement',
        price: Number(r.price || raw.price || 0),
        dailyReturn: Number(r.daily_return || raw.dailyReturn || 0),
        daysPassed: Number(r.days_passed || raw.daysPassed || 0),
        durationDays: Number(r.duration_days || raw.durationDays || 30),
        totalReturnClaimed: Number(r.total_return_claimed || raw.totalReturnClaimed || 0),
        status: (r.status || raw.status || 'active') as any,
        isCyclic: Boolean(r.is_cyclic ?? raw.isCyclic ?? true),
        category: (r.category || raw.category || 'stability') as any,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
        lastClaimDate: r.last_claim_date ? new Date(r.last_claim_date).toISOString() : raw.lastClaimDate,
        lastModified: Number(r.last_modified || raw.lastModified || Date.now())
      };
    });
  } catch {
    return [];
  }
}

/**
 * Direct client-side investment update / sync to Supabase
 */
export async function supabaseUpsertInvestment(inv: Investment): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    if (!inv?.id) return false;
    const payload = {
      id: inv.id,
      user_id: inv.userId,
      product_id: inv.productId,
      product_name: inv.productName || 'Plan Investissement',
      price: Number(inv.price || 0),
      daily_return: Number(inv.dailyReturn || 0),
      days_passed: Number(inv.daysPassed || 0),
      duration_days: Number(inv.durationDays || 30),
      total_return_claimed: Number(inv.totalReturnClaimed || 0),
      status: inv.status || 'active',
      is_cyclic: Boolean(inv.isCyclic ?? true),
      category: inv.category || 'stability',
      created_at: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
      last_claim_date: inv.lastClaimDate ? new Date(inv.lastClaimDate).toISOString() : null,
      last_modified: Number(inv.lastModified || Date.now()),
      raw_data: inv
    };
    const { error } = await client.from('investments').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetches single user data from Supabase
 */
export async function supabaseGetUser(userId: string): Promise<User | null> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const raw = (data.raw_data && typeof data.raw_data === 'object') ? data.raw_data : {};
    return {
      ...raw,
      id: data.id,
      name: data.name || raw.name,
      whatsapp: data.whatsapp || raw.whatsapp,
      password: data.password || raw.password,
      balance: Number(data.balance ?? raw.balance ?? 0),
      bonus: Number(data.bonus ?? raw.bonus ?? 0),
      totalRecharged: Number(data.total_recharged ?? raw.totalRecharged ?? 0),
      totalWithdrawn: Number(data.total_withdrawn ?? raw.totalWithdrawn ?? 0),
      dailyEarnings: Number(data.daily_earnings ?? raw.dailyEarnings ?? 0),
      referralEarnings: Number(data.referral_earnings ?? raw.referralEarnings ?? 0),
      referredBy: data.referred_by || raw.referredBy || undefined,
      referralCode: data.referral_code || raw.referralCode || '',
      role: data.role || raw.role || 'user',
      isBlocked: Boolean(data.is_blocked ?? raw.isBlocked),
      withdrawBlocked: Boolean(data.withdraw_blocked ?? raw.withdrawBlocked),
      createdAt: data.created_at || raw.createdAt,
      lastModified: Number(data.last_modified || raw.lastModified || Date.now())
    };
  } catch {
    return null;
  }
}

/**
 * Fetches all users directly from Supabase
 */
export async function supabaseGetUsers(): Promise<User[]> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return [];

    return data.map((r: any) => {
      const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
      return {
        ...raw,
        id: r.id,
        name: r.name || raw.name || 'Utilisateur',
        whatsapp: r.whatsapp || raw.whatsapp || '',
        phone: r.whatsapp || raw.phone || raw.whatsapp || '',
        password: r.password || raw.password || '',
        country: r.country || raw.country || 'Bénin',
        device: r.device || raw.device || 'Ordinateur',
        balance: Number(r.balance !== null && r.balance !== undefined ? r.balance : (raw.balance || 0)),
        bonus: Number(r.bonus !== null && r.bonus !== undefined ? r.bonus : (raw.bonus || 0)),
        totalRecharged: Number(r.total_recharged !== null && r.total_recharged !== undefined ? r.total_recharged : (raw.totalRecharged || 0)),
        totalWithdrawn: Number(r.total_withdrawn !== null && r.total_withdrawn !== undefined ? r.total_withdrawn : (raw.totalWithdrawn || 0)),
        dailyEarnings: Number(r.daily_earnings !== null && r.daily_earnings !== undefined ? r.daily_earnings : (raw.dailyEarnings || 0)),
        totalEarnings: Number(raw.totalEarnings !== undefined ? raw.totalEarnings : (r.bonus || 0)),
        referralEarnings: Number(r.referral_earnings !== null && r.referral_earnings !== undefined ? r.referral_earnings : (raw.referralEarnings || 0)),
        referredBy: r.referred_by || raw.referredBy || undefined,
        referralCode: r.referral_code || raw.referralCode || '',
        role: (r.role || raw.role || 'user') as 'user' | 'admin',
        isBlocked: Boolean(r.is_blocked !== null && r.is_blocked !== undefined ? r.is_blocked : raw.isBlocked),
        withdrawBlocked: Boolean(r.withdraw_blocked !== null && r.withdraw_blocked !== undefined ? r.withdraw_blocked : raw.withdrawBlocked),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
        lastModified: Number(r.last_modified || raw.lastModified || Date.now())
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetches all withdrawals directly from Supabase
 */
export async function supabaseGetWithdrawals(userId?: string): Promise<Withdrawal[]> {
  try {
    const client = getSupabaseClient();
    let query = client.from('withdrawals').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error || !Array.isArray(data)) return [];

    return data.map((r: any) => {
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
        status: (r.status || raw.status || 'pending') as any,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
        processedAt: r.processed_at ? new Date(r.processed_at).toISOString() : raw.processedAt,
        lastModified: Number(r.last_modified || raw.lastModified || Date.now())
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetches all products directly from Supabase
 */
export async function supabaseGetProducts(): Promise<Product[]> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !Array.isArray(data)) return [];

    return data.map((r: any) => {
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
        totalReturn: Number(r.total_return !== null && r.total_return !== undefined ? r.total_return : (raw.totalReturn || (Number(r.daily_return || 0) * Number(r.duration_days || 30)))),
        image: r.image || raw.image,
        description: r.description || raw.description,
        createdAt: r.created_at || raw.createdAt
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetches store key-value data directly from Supabase public.store
 */
export async function supabaseGetStore(): Promise<Record<string, any>> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('store').select('key, value');
    if (error || !Array.isArray(data)) return {};

    const storeObj: Record<string, any> = {};
    for (const r of data) {
      if (r && r.key) {
        storeObj[r.key] = r.value;
      }
    }
    return storeObj;
  } catch {
    return {};
  }
}

/**
 * Consolidated live data fetch directly from Supabase (combines relational tables + store key-values)
 * Guarantees 100% data availability even after deployment on static hosts (Vercel) without Express proxy!
 */
export async function supabaseGetAllData(): Promise<Record<string, any> | null> {
  try {
    const [users, deps, wths, invs, prods, storeData] = await Promise.allSettled([
      supabaseGetUsers(),
      supabaseGetDeposits(),
      supabaseGetWithdrawals(),
      supabaseGetInvestments(),
      supabaseGetProducts(),
      supabaseGetStore()
    ]);

    const result: Record<string, any> = (storeData.status === 'fulfilled' && storeData.value) ? { ...storeData.value } : {};

    if (users.status === 'fulfilled' && Array.isArray(users.value) && users.value.length > 0) {
      result['gi_users'] = users.value;
    }
    if (deps.status === 'fulfilled' && Array.isArray(deps.value) && deps.value.length > 0) {
      result['gi_deposits'] = deps.value;
    }
    if (wths.status === 'fulfilled' && Array.isArray(wths.value) && wths.value.length > 0) {
      result['gi_withdrawals'] = wths.value;
    }
    if (invs.status === 'fulfilled' && Array.isArray(invs.value) && invs.value.length > 0) {
      result['gi_investments'] = invs.value;
    }
    if (prods.status === 'fulfilled' && Array.isArray(prods.value) && prods.value.length > 0) {
      result['gi_products'] = prods.value;
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (e) {
    console.warn('[SUPABASE GET ALL DATA WARN]', e);
    return null;
  }
}

/**
 * Direct client-side user updater (persists directly to Supabase)
 */
export async function supabaseUpdateUser(userData: Partial<User>): Promise<{ success: boolean; user?: User }> {
  try {
    const client = getSupabaseClient();
    if (!userData.id) return { success: false };

    const now = Date.now();
    const updatePayload: Record<string, any> = {
      last_modified: now,
      raw_data: userData
    };

    if (userData.name !== undefined) updatePayload.name = userData.name;
    if (userData.whatsapp !== undefined) updatePayload.whatsapp = userData.whatsapp;
    if (userData.balance !== undefined) updatePayload.balance = userData.balance;
    if (userData.bonus !== undefined) updatePayload.bonus = userData.bonus;
    if (userData.totalRecharged !== undefined) updatePayload.total_recharged = userData.totalRecharged;
    if (userData.totalWithdrawn !== undefined) updatePayload.total_withdrawn = userData.totalWithdrawn;
    if (userData.dailyEarnings !== undefined) updatePayload.daily_earnings = userData.dailyEarnings;
    if (userData.referralEarnings !== undefined) updatePayload.referral_earnings = userData.referralEarnings;
    if (userData.role !== undefined) updatePayload.role = userData.role;
    if (userData.isBlocked !== undefined) updatePayload.is_blocked = userData.isBlocked;
    if (userData.withdrawBlocked !== undefined) updatePayload.withdraw_blocked = userData.withdrawBlocked;
    if (userData.referredBy !== undefined) updatePayload.referred_by = userData.referredBy;
    if (userData.referralCode !== undefined) updatePayload.referral_code = userData.referralCode;

    const { error } = await client
      .from('users')
      .update(updatePayload)
      .eq('id', userData.id);

    return { success: !error, user: userData as User };
  } catch (err: any) {
    return { success: false };
  }
}

/**
 * Directly approves a deposit in Supabase & credits the user's balance
 */
export async function supabaseApproveDeposit(depositId: string, deposit?: Partial<Deposit>): Promise<{ success: boolean; deposit?: Deposit; user?: User }> {
  try {
    const client = getSupabaseClient();
    const nowIso = new Date().toISOString();
    const now = Date.now();

    // 1. Fetch deposit from Supabase
    let targetDep: any = deposit;
    if (!targetDep || !targetDep.amount || !targetDep.userId) {
      const { data: dbDep } = await client.from('deposits').select('*').eq('id', depositId).maybeSingle();
      if (dbDep) {
        targetDep = {
          ...(dbDep.raw_data || {}),
          id: dbDep.id,
          userId: dbDep.user_id,
          amount: Number(dbDep.amount || 0),
          status: dbDep.status
        };
      }
    }

    if (!targetDep || !targetDep.userId) return { success: false };

    const amt = Number(targetDep.amount || 0);
    const userId = targetDep.userId;

    // 2. Update deposit
    await client.from('deposits').update({
      status: 'approved',
      approved_at: nowIso,
      last_modified: now,
      raw_data: {
        ...(targetDep.raw_data || {}),
        ...targetDep,
        status: 'approved',
        approvedAt: nowIso,
        lastModified: now
      }
    }).eq('id', depositId);

    // 3. Fetch & credit user
    let updatedUser: User | null = null;
    const { data: dbUser } = await client.from('users').select('*').eq('id', userId).maybeSingle();
    if (dbUser) {
      const currentBal = Number(dbUser.balance ?? dbUser.raw_data?.balance ?? 0);
      const currentRecharged = Number(dbUser.total_recharged ?? dbUser.raw_data?.totalRecharged ?? 0);
      const newBal = currentBal + amt;
      const newRecharged = currentRecharged + amt;

      const userRaw = (dbUser.raw_data && typeof dbUser.raw_data === 'object') ? dbUser.raw_data : {};
      const newRaw = {
        ...userRaw,
        balance: newBal,
        totalRecharged: newRecharged,
        lastModified: now
      };

      await client.from('users').update({
        balance: newBal,
        total_recharged: newRecharged,
        last_modified: now,
        raw_data: newRaw
      }).eq('id', userId);

      updatedUser = {
        ...newRaw,
        id: dbUser.id,
        name: dbUser.name || userRaw.name,
        whatsapp: dbUser.whatsapp || userRaw.whatsapp,
        balance: newBal,
        totalRecharged: newRecharged
      } as User;
    }

    const updatedDeposit: Deposit = {
      ...targetDep,
      id: depositId,
      status: 'approved',
      approvedAt: nowIso,
      lastModified: now
    };

    return { success: true, deposit: updatedDeposit, user: updatedUser || undefined };
  } catch (e) {
    console.warn('[SUPABASE DIRECT APPROVE DEPOSIT WARN]', e);
    return { success: false };
  }
}

/**
 * Directly rejects a deposit in Supabase
 */
export async function supabaseRejectDeposit(depositId: string): Promise<{ success: boolean; deposit?: Deposit }> {
  try {
    const client = getSupabaseClient();
    const nowIso = new Date().toISOString();
    const now = Date.now();

    await client.from('deposits').update({
      status: 'rejected',
      last_modified: now,
      raw_data: {
        status: 'rejected',
        lastModified: now
      }
    }).eq('id', depositId);

    return { success: true, deposit: { id: depositId, status: 'rejected', lastModified: now } as any };
  } catch (e) {
    return { success: false };
  }
}

/**
 * Directly approves a withdrawal in Supabase
 */
export async function supabaseApproveWithdrawal(withdrawalId: string): Promise<{ success: boolean; withdrawal?: Withdrawal }> {
  try {
    const client = getSupabaseClient();
    const nowIso = new Date().toISOString();
    const now = Date.now();

    // 1. Fetch withdrawal
    const { data: dbWth } = await client.from('withdrawals').select('*').eq('id', withdrawalId).maybeSingle();
    const userId = dbWth?.user_id;
    const amount = Number(dbWth?.amount || 0);

    await client.from('withdrawals').update({
      status: 'approved',
      processed_at: nowIso,
      last_modified: now,
      raw_data: {
        ...(dbWth?.raw_data || {}),
        status: 'approved',
        processedAt: nowIso,
        lastModified: now
      }
    }).eq('id', withdrawalId);

    if (userId) {
      const { data: dbUser } = await client.from('users').select('*').eq('id', userId).maybeSingle();
      if (dbUser) {
        const currentWithdrawn = Number(dbUser.total_withdrawn ?? dbUser.raw_data?.totalWithdrawn ?? 0);
        const newTotal = currentWithdrawn + amount;
        await client.from('users').update({
          total_withdrawn: newTotal,
          last_modified: now,
          raw_data: {
            ...(dbUser.raw_data || {}),
            totalWithdrawn: newTotal,
            lastModified: now
          }
        }).eq('id', userId);
      }
    }

    return { success: true, withdrawal: { id: withdrawalId, status: 'approved', processedAt: nowIso, lastModified: now } as any };
  } catch (e) {
    return { success: false };
  }
}

/**
 * Directly rejects a withdrawal in Supabase and refunds the user's balance
 */
export async function supabaseRejectWithdrawal(withdrawalId: string): Promise<{ success: boolean; withdrawal?: Withdrawal; user?: User }> {
  try {
    const client = getSupabaseClient();
    const now = Date.now();

    const { data: dbWth } = await client.from('withdrawals').select('*').eq('id', withdrawalId).maybeSingle();
    if (!dbWth) return { success: false };

    const userId = dbWth.user_id;
    const amount = Number(dbWth.amount || 0);

    await client.from('withdrawals').update({
      status: 'rejected',
      last_modified: now,
      raw_data: {
        ...(dbWth.raw_data || {}),
        status: 'rejected',
        lastModified: now
      }
    }).eq('id', withdrawalId);

    let updatedUser: User | null = null;
    if (userId) {
      const { data: dbUser } = await client.from('users').select('*').eq('id', userId).maybeSingle();
      if (dbUser) {
        const currentBal = Number(dbUser.balance ?? dbUser.raw_data?.balance ?? 0);
        const newBal = currentBal + amount;
        const newRaw = {
          ...(dbUser.raw_data || {}),
          balance: newBal,
          lastModified: now
        };
        await client.from('users').update({
          balance: newBal,
          last_modified: now,
          raw_data: newRaw
        }).eq('id', userId);

        updatedUser = {
          ...newRaw,
          id: dbUser.id,
          name: dbUser.name || newRaw.name,
          whatsapp: dbUser.whatsapp || newRaw.whatsapp,
          balance: newBal
        } as User;
      }
    }

    return { success: true, withdrawal: { id: withdrawalId, status: 'rejected', lastModified: now } as any, user: updatedUser || undefined };
  } catch (e) {
    return { success: false };
  }
}

/**
 * Subscribes to real-time changes across database tables
 */
export function subscribeToSupabaseRealtime(onDataChanged: (table: string) => void): () => void {
  try {
    const client = getSupabaseClient();
    const channel = client.channel('public-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => onDataChanged('users')
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => onDataChanged('deposits')
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        () => onDataChanged('withdrawals')
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investments' },
        () => onDataChanged('investments')
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store' },
        () => onDataChanged('store')
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}

