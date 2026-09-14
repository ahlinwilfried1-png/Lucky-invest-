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
