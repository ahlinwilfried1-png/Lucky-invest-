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
