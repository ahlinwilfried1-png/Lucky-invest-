import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;
let isConnecting = false;
let lastLogTime = 0;
let isSyncingRelational = false;

/**
 * Sanitizes a PostgreSQL connection URL to hide credentials from logs and browser
 */
export function sanitizeDatabaseUrl(url?: string): string {
  if (!url) return '(non configuré)';
  try {
    return url.replace(/(:)([^@/]+)(@)/, '$1******$3');
  } catch {
    return '(url masquée)';
  }
}

/**
 * Gets or initializes the PostgreSQL Pool for Neon
 */
export function getNeonPool(): Pool | null {
  const connectionString = (process.env.DATABASE_URL || '').trim();
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    try {
      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 8000,
      });

      pool.on('error', (err) => {
        const now = Date.now();
        if (now - lastLogTime > 30000) {
          console.warn('[NEON POOL ERROR]', err.message);
          lastLogTime = now;
        }
      });

      console.log(`[NEON] Pool PostgreSQL initialisé avec succès vers ${sanitizeDatabaseUrl(connectionString)}`);
    } catch (e: any) {
      console.error('[NEON ERROR] Échec de l\'initialisation du pool:', e.message);
      pool = null;
    }
  }

  return pool;
}

/**
 * Tests the connection to Neon PostgreSQL
 */
export async function testNeonConnection(): Promise<{
  ok: boolean;
  message: string;
  database?: string;
  version?: string;
  tables?: string[];
  hasStoreTable?: boolean;
}> {
  const p = getNeonPool();
  if (!p) {
    return {
      ok: false,
      message: 'DATABASE_URL n\'est pas encore configurée dans les variables d\'environnement.'
    };
  }

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    
    // Check connection and database name
    const infoRes = await client.query(`
      SELECT 
        current_database() as db_name, 
        version() as pg_version,
        NOW() as server_time;
    `);

    // List all user tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    const hasStoreTable = tables.includes('store');

    return {
      ok: true,
      message: 'Connexion à Neon PostgreSQL réussie avec succès !',
      database: infoRes.rows[0]?.db_name,
      version: infoRes.rows[0]?.pg_version?.split(' ')[0] + ' ' + (infoRes.rows[0]?.pg_version?.split(' ')[1] || ''),
      tables,
      hasStoreTable
    };
  } catch (err: any) {
    return {
      ok: false,
      message: `Erreur de connexion à Neon : ${err.message || String(err)}`
    };
  } finally {
    if (client) {
      try {
        client.release();
      } catch {}
    }
  }
}

/**
 * Initializes all tables in Neon PostgreSQL safely without duplicate errors
 */
export async function initAllNeonTables(): Promise<{ success: boolean; message: string }> {
  const p = getNeonPool();
  if (!p) return { success: false, message: 'DATABASE_URL absente' };

  let client: PoolClient | null = null;
  try {
    client = await p.connect();

    await client.query(`
      -- 1. Table principale de synchronisation KV et haute performance
      CREATE TABLE IF NOT EXISTS public.store (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_store_updated_at ON public.store (updated_at);

      -- 2. Table des Utilisateurs
      CREATE TABLE IF NOT EXISTS public.users (
        id TEXT PRIMARY KEY,
        name TEXT,
        whatsapp TEXT UNIQUE,
        password TEXT,
        balance NUMERIC(15, 2) DEFAULT 0,
        total_recharged NUMERIC(15, 2) DEFAULT 0,
        total_withdrawn NUMERIC(15, 2) DEFAULT 0,
        daily_earnings NUMERIC(15, 2) DEFAULT 0,
        referral_earnings NUMERIC(15, 2) DEFAULT 0,
        referred_by TEXT,
        referral_code TEXT,
        role TEXT DEFAULT 'user',
        is_blocked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON public.users (whatsapp);
      CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users (referred_by);

      -- 3. Table des Produits / Plans d'Investissement
      CREATE TABLE IF NOT EXISTS public.products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC(15, 2) NOT NULL,
        daily_return NUMERIC(15, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        total_return NUMERIC(15, 2) NOT NULL,
        category TEXT DEFAULT 'classic',
        badge TEXT,
        is_cyclic BOOLEAN DEFAULT FALSE,
        generated_product_ids JSONB DEFAULT '[]'::jsonb,
        is_blocked BOOLEAN DEFAULT FALSE,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

      -- 4. Table des Investissements / Commandes actives
      CREATE TABLE IF NOT EXISTS public.investments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        daily_return NUMERIC(15, 2) NOT NULL,
        total_return NUMERIC(15, 2) NOT NULL,
        duration_days INTEGER NOT NULL,
        days_remaining INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        activated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_payout_at TIMESTAMP WITH TIME ZONE,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments (user_id);
      CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments (status);

      -- 5. Table des Recharges / Dépôts
      CREATE TABLE IF NOT EXISTS public.deposits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        method TEXT,
        status TEXT DEFAULT 'pending',
        proof_image TEXT,
        tx_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP WITH TIME ZONE,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits (user_id);
      CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits (status);

      -- 6. Table des Retraits
      CREATE TABLE IF NOT EXISTS public.withdrawals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        fee NUMERIC(15, 2) DEFAULT 0,
        net_amount NUMERIC(15, 2) NOT NULL,
        method TEXT,
        status TEXT DEFAULT 'pending',
        account_details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP WITH TIME ZONE,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals (user_id);
      CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals (status);

      -- 7. Table des Commissions d'Affiliation
      CREATE TABLE IF NOT EXISTS public.commissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        from_user_id TEXT,
        from_user_name TEXT,
        level INTEGER DEFAULT 1,
        amount NUMERIC(15, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON public.commissions (user_id);

      -- 8. Table du Forum Communautaire
      CREATE TABLE IF NOT EXISTS public.forum_posts (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        author_name TEXT,
        author_phone TEXT,
        avatar_letter TEXT,
        text TEXT,
        image1 TEXT,
        image2 TEXT,
        likes INTEGER DEFAULT 0,
        liked_by JSONB DEFAULT '[]'::jsonb,
        comments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON public.forum_posts (created_at DESC);

      -- 9. Table des Messages du Service Client (Support)
      CREATE TABLE IF NOT EXISTS public.support_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        message TEXT,
        sender TEXT,
        image TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_modified BIGINT,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages (user_id);

      -- 10. Table des Preuves de Retrait publiques
      CREATE TABLE IF NOT EXISTS public.withdrawal_proofs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        amount NUMERIC(15, 2),
        image TEXT,
        date TEXT,
        status TEXT,
        raw_data JSONB
      );

      -- 11. Table des Codes Bonus / Cadeaux
      CREATE TABLE IF NOT EXISTS public.bonus_codes (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        max_uses INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0,
        used_by JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        raw_data JSONB
      );

      -- 12. Table des Notifications Système
      CREATE TABLE IF NOT EXISTS public.system_notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        message TEXT,
        type TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        raw_data JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.system_notifications (user_id);
    `);

    console.log('[NEON] Toutes les tables PostgreSQL ont été vérifiées/créées avec succès dans Neon !');
    return { success: true, message: 'Tables créées et vérifiées avec succès dans Neon.' };
  } catch (err: any) {
    console.error('[NEON ERROR] Erreur lors de l\'initialisation des tables:', err.message);
    return { success: false, message: err.message };
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Fetches all real data from Neon PostgreSQL (both 'store' table and relational tables)
 */
export async function fetchNeonStoreData(): Promise<Record<string, any> | null> {
  const p = getNeonPool();
  if (!p) return null;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    const res = await client.query(`SELECT key, value FROM public.store;`);
    const result: Record<string, any> = {};
    for (const row of res.rows) {
      result[row.key] = row.value;
    }

    // Also pull directly from relational tables to guarantee 100% real-time reflection
    // of any direct PostgreSQL inserts, updates, or administration actions
    try {
      const deletedUsers: string[] = (result['gi_deleted_users'] && Array.isArray(result['gi_deleted_users'])) ? result['gi_deleted_users'] : [];
      const deletedInvestments: string[] = (result['gi_deleted_investments'] && Array.isArray(result['gi_deleted_investments'])) ? result['gi_deleted_investments'] : [];

      // 1. Users
      const uRes = await client.query(`SELECT * FROM public.users ORDER BY created_at ASC;`);
      if (uRes.rows && uRes.rows.length > 0) {
        result['gi_users'] = uRes.rows
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
            totalRecharged: Number(r.total_recharged !== null && r.total_recharged !== undefined ? r.total_recharged : (raw.totalRecharged || 0)),
            totalWithdrawn: Number(r.total_withdrawn !== null && r.total_withdrawn !== undefined ? r.total_withdrawn : (raw.totalWithdrawn || 0)),
            dailyEarnings: Number(r.daily_earnings !== null && r.daily_earnings !== undefined ? r.daily_earnings : (raw.dailyEarnings || 0)),
            referralEarnings: Number(r.referral_earnings !== null && r.referral_earnings !== undefined ? r.referral_earnings : (raw.referralEarnings || 0)),
            referredBy: r.referred_by || raw.referredBy || undefined,
            referralCode: r.referral_code || raw.referralCode || '',
            role: r.role || raw.role || 'user',
            isBlocked: Boolean(r.is_blocked !== null && r.is_blocked !== undefined ? r.is_blocked : raw.isBlocked),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      }

      // 2. Deposits
      const dRes = await client.query(`SELECT * FROM public.deposits ORDER BY created_at DESC;`);
      if (dRes.rows && dRes.rows.length > 0) {
        result['gi_deposits'] = dRes.rows
          .filter(r => !deletedUsers.includes(r.user_id))
          .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            userName: raw.userName || 'Investisseur',
            amount: Number(r.amount || raw.amount || 0),
            operator: r.method || raw.operator || 'Mobile Money',
            method: r.method || raw.method,
            status: r.status || raw.status || 'pending',
            receiptImage: r.proof_image || raw.receiptImage || raw.proofImage,
            proofImage: r.proof_image || raw.proofImage,
            txId: r.tx_id || raw.txId,
            reference: r.tx_id || raw.reference || `DEP-${r.id}`,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            approvedAt: r.approved_at ? new Date(r.approved_at).toISOString() : raw.approvedAt,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      }

      // 3. Withdrawals
      const wRes = await client.query(`SELECT * FROM public.withdrawals ORDER BY created_at DESC;`);
      if (wRes.rows && wRes.rows.length > 0) {
        result['gi_withdrawals'] = wRes.rows
          .filter(r => !deletedUsers.includes(r.user_id))
          .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            userName: raw.userName || 'Investisseur',
            amount: Number(r.amount || raw.amount || 0),
            fee: Number(r.fee || raw.fee || 0),
            netAmount: Number(r.net_amount || raw.netAmount || 0),
            operator: r.method || raw.operator || 'Mobile Money',
            method: r.method || raw.method,
            status: r.status || raw.status || 'pending',
            accountDetails: r.account_details || raw.accountDetails,
            number: r.account_details || raw.number,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            processedAt: r.processed_at ? new Date(r.processed_at).toISOString() : raw.processedAt,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      }

      // 4. Products
      const pRes = await client.query(`SELECT * FROM public.products ORDER BY price ASC;`);
      if (pRes.rows && pRes.rows.length > 0) {
        result['gi_products'] = pRes.rows.map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            name: r.name || raw.name,
            price: Number(r.price || raw.price || 0),
            dailyReturn: Number(r.daily_return || raw.dailyReturn || 0),
            durationDays: Number(r.duration_days || raw.durationDays || 0),
            totalReturn: Number(r.total_return || raw.totalReturn || 0),
            category: r.category || raw.category || 'classic',
            badge: r.badge || raw.badge,
            isCyclic: Boolean(r.is_cyclic !== null && r.is_cyclic !== undefined ? r.is_cyclic : raw.isCyclic),
            generatedProductIds: r.generated_product_ids || raw.generatedProductIds || [],
            isBlocked: Boolean(r.is_blocked !== null && r.is_blocked !== undefined ? r.is_blocked : raw.isBlocked),
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      }

      // 5. Investments
      const iRes = await client.query(`SELECT * FROM public.investments ORDER BY activated_at DESC;`);
      if (iRes.rows && iRes.rows.length > 0) {
        result['gi_investments'] = iRes.rows
          .filter(r => !deletedUsers.includes(r.user_id) && !deletedInvestments.includes(r.id))
          .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            productId: r.product_id || raw.productId,
            productName: r.product_name || raw.productName,
            amount: Number(r.amount || raw.amount || 0),
            dailyReturn: Number(r.daily_return || raw.dailyReturn || 0),
            totalReturn: Number(r.total_return || raw.totalReturn || 0),
            durationDays: Number(r.duration_days || raw.durationDays || 0),
            daysRemaining: Number(r.days_remaining || raw.daysRemaining || 0),
            status: r.status || raw.status || 'active',
            activatedAt: r.activated_at ? new Date(r.activated_at).toISOString() : (raw.activatedAt || new Date().toISOString()),
            lastPayoutAt: r.last_payout_at ? new Date(r.last_payout_at).toISOString() : raw.lastPayoutAt,
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      }

      // 6. Commissions
      const cRes = await client.query(`SELECT * FROM public.commissions ORDER BY created_at DESC;`);
      if (cRes.rows && cRes.rows.length > 0) {
        result['gi_commissions'] = cRes.rows
          .filter(r => !deletedUsers.includes(r.user_id) && !deletedUsers.includes(r.from_user_id))
          .map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            fromUserId: r.from_user_id || raw.fromUserId,
            fromUserName: r.from_user_name || raw.fromUserName,
            level: Number(r.level || raw.level || 1),
            amount: Number(r.amount || raw.amount || 0),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString())
          };
        });
      }

      // 7. Forum Posts - merge relational table and store table to ensure no posts are ever dropped
      const fRes = await client.query(`SELECT * FROM public.forum_posts ORDER BY created_at DESC;`);
      const storePosts = Array.isArray(result['gi_forum_posts']) ? result['gi_forum_posts'] : [];
      const relPosts = (fRes.rows && fRes.rows.length > 0) ? fRes.rows.map(r => {
        const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
        return {
          ...raw,
          id: r.id,
          authorId: r.author_id || raw.authorId,
          authorName: r.author_name || raw.authorName,
          authorPhone: r.author_phone || raw.authorPhone,
          avatarLetter: r.avatar_letter || raw.avatarLetter,
          text: r.text || raw.text,
          image1: r.image1 || raw.image1,
          image2: r.image2 || raw.image2,
          likes: Number(r.likes || raw.likes || 0),
          likedBy: r.liked_by || raw.likedBy || [],
          comments: r.comments || raw.comments || [],
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
          lastModified: Number(r.last_modified || raw.lastModified || Date.now())
        };
      }) : [];

      const postMap = new Map<string, any>();
      for (const p of storePosts) {
        if (p && p.id) postMap.set(String(p.id), p);
      }
      for (const p of relPosts) {
        if (p && p.id) {
          if (!postMap.has(String(p.id))) {
            postMap.set(String(p.id), p);
          } else {
            const existing = postMap.get(String(p.id));
            if ((p.lastModified || 0) >= (existing.lastModified || 0)) {
              postMap.set(String(p.id), { ...existing, ...p });
            }
          }
        }
      }
      result['gi_forum_posts'] = Array.from(postMap.values());

      // 8. Support Messages
      const sRes = await client.query(`SELECT * FROM public.support_messages ORDER BY created_at ASC;`);
      if (sRes.rows && sRes.rows.length > 0) {
        result['gi_support_messages'] = sRes.rows.map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            message: r.message || raw.message,
            sender: r.sender || raw.sender,
            image: r.image || raw.image,
            read: Boolean(r.read),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : (raw.createdAt || new Date().toISOString()),
            lastModified: Number(r.last_modified || raw.lastModified || Date.now())
          };
        });
      }

      // 9. Withdrawal Proofs
      const wpRes = await client.query(`SELECT * FROM public.withdrawal_proofs;`);
      if (wpRes.rows && wpRes.rows.length > 0) {
        result['gi_withdrawal_proofs'] = wpRes.rows.map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            userName: r.user_name || raw.userName,
            amount: Number(r.amount || raw.amount || 0),
            image: r.image || raw.image,
            date: r.date || raw.date,
            status: r.status || raw.status
          };
        });
      }

      // 10. Bonus Codes
      const bRes = await client.query(`SELECT * FROM public.bonus_codes;`);
      if (bRes.rows && bRes.rows.length > 0) {
        result['gi_bonus_codes'] = bRes.rows.map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            code: r.code || raw.code,
            amount: Number(r.amount || raw.amount || 0),
            maxUses: Number(r.max_uses || raw.maxUses || 1),
            usedCount: Number(r.used_count || raw.usedCount || 0),
            usedByUsers: r.used_by || raw.usedByUsers || [],
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : raw.createdAt,
            expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : raw.expiresAt
          };
        });
      }

      // 11. System Notifications
      const nRes = await client.query(`SELECT * FROM public.system_notifications ORDER BY created_at DESC;`);
      if (nRes.rows && nRes.rows.length > 0) {
        result['gi_notifications'] = nRes.rows.map(r => {
          const raw = (r.raw_data && typeof r.raw_data === 'object') ? r.raw_data : {};
          return {
            ...raw,
            id: r.id,
            userId: r.user_id || raw.userId,
            title: r.title || raw.title,
            message: r.message || raw.message,
            type: r.type || raw.type,
            read: Boolean(r.read),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : raw.createdAt
          };
        });
      }
    } catch (relErr: any) {
      console.warn('[NEON RELATIONAL PULL INFO] Tables relationnelles partielles ou en cours de configuration:', relErr.message);
    }

    return result;
  } catch (err: any) {
    console.warn('[NEON FETCH WARN] Erreur lors de la récupération des données Neon:', err.message);
    return null;
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Saves or updates batch keys into Neon 'store' table
 */
export async function saveNeonStoreBatch(rows: { key: string; value: any }[]): Promise<boolean> {
  const p = getNeonPool();
  if (!p || rows.length === 0) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    await client.query('BEGIN');

    for (const r of rows) {
      await client.query(
        `INSERT INTO public.store (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
        [r.key, JSON.stringify(r.value)]
      );
    }

    await client.query('COMMIT');
    return true;
  } catch (err: any) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    console.warn('[NEON SAVE WARN] Erreur lors de la sauvegarde batch sur Neon:', err.message);
    return false;
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Synchronizes relational tables from storeData in background
 */
export async function syncRelationalTables(storeData: Record<string, any>): Promise<void> {
  const p = getNeonPool();
  if (!p || isSyncingRelational) return;

  isSyncingRelational = true;
  let client: PoolClient | null = null;
  try {
    client = await p.connect();

    // 1. Sync Users
    const users = storeData['gi_users'];
    if (Array.isArray(users) && users.length > 0) {
      for (const u of users) {
        if (!u || !u.id) continue;
        await client.query(
          `INSERT INTO public.users (
            id, name, whatsapp, password, balance, total_recharged, total_withdrawn,
            daily_earnings, referral_earnings, referred_by, referral_code, role,
            is_blocked, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            whatsapp = EXCLUDED.whatsapp,
            password = EXCLUDED.password,
            balance = EXCLUDED.balance,
            total_recharged = EXCLUDED.total_recharged,
            total_withdrawn = EXCLUDED.total_withdrawn,
            daily_earnings = EXCLUDED.daily_earnings,
            referral_earnings = EXCLUDED.referral_earnings,
            referred_by = EXCLUDED.referred_by,
            referral_code = EXCLUDED.referral_code,
            role = EXCLUDED.role,
            is_blocked = EXCLUDED.is_blocked,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            u.id, u.name || null, u.whatsapp || null, u.password || null,
            Number(u.balance || 0), Number(u.totalRecharged || 0), Number(u.totalWithdrawn || 0),
            Number(u.dailyEarnings || 0), Number(u.referralEarnings || 0),
            u.referredBy || null, u.referralCode || null, u.role || 'user',
            Boolean(u.isBlocked), Number(u.lastModified || Date.now()), JSON.stringify(u)
          ]
        );
      }
    }

    // 2. Sync Products
    const products = storeData['gi_products'];
    if (Array.isArray(products) && products.length > 0) {
      for (const prod of products) {
        if (!prod || !prod.id) continue;
        await client.query(
          `INSERT INTO public.products (
            id, name, price, daily_return, duration_days, total_return,
            category, badge, is_cyclic, generated_product_ids, is_blocked, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            daily_return = EXCLUDED.daily_return,
            duration_days = EXCLUDED.duration_days,
            total_return = EXCLUDED.total_return,
            category = EXCLUDED.category,
            badge = EXCLUDED.badge,
            is_cyclic = EXCLUDED.is_cyclic,
            generated_product_ids = EXCLUDED.generated_product_ids,
            is_blocked = EXCLUDED.is_blocked,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            prod.id, prod.name, Number(prod.price || 0), Number(prod.dailyReturn || 0),
            Number(prod.durationDays || 0), Number(prod.totalReturn || 0),
            prod.category || 'classic', prod.badge || null, Boolean(prod.isCyclic),
            JSON.stringify(prod.generatedProductIds || []), Boolean(prod.isBlocked),
            Number(prod.lastModified || Date.now()), JSON.stringify(prod)
          ]
        );
      }
    }

    // 3. Sync Investments
    const investments = storeData['gi_investments'];
    if (Array.isArray(investments) && investments.length > 0) {
      for (const inv of investments) {
        if (!inv || !inv.id) continue;
        await client.query(
          `INSERT INTO public.investments (
            id, user_id, product_id, product_name, amount, daily_return,
            total_return, duration_days, days_remaining, status, activated_at,
            last_payout_at, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            days_remaining = EXCLUDED.days_remaining,
            status = EXCLUDED.status,
            last_payout_at = EXCLUDED.last_payout_at,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            inv.id, inv.userId, inv.productId, inv.productName, Number(inv.amount || 0),
            Number(inv.dailyReturn || 0), Number(inv.totalReturn || 0), Number(inv.durationDays || 0),
            Number(inv.daysRemaining || 0), inv.status || 'active',
            inv.activatedAt ? new Date(inv.activatedAt) : new Date(),
            inv.lastPayoutAt ? new Date(inv.lastPayoutAt) : null,
            Number(inv.lastModified || Date.now()), JSON.stringify(inv)
          ]
        );
      }
    }

    // 4. Sync Deposits
    const deposits = storeData['gi_deposits'];
    if (Array.isArray(deposits) && deposits.length > 0) {
      for (const dep of deposits) {
        if (!dep || !dep.id) continue;
        await client.query(
          `INSERT INTO public.deposits (
            id, user_id, amount, method, status, proof_image, tx_id,
            created_at, approved_at, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            approved_at = EXCLUDED.approved_at,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            dep.id, dep.userId, Number(dep.amount || 0), dep.method || null,
            dep.status || 'pending', dep.proofImage || null, dep.txId || null,
            dep.createdAt ? new Date(dep.createdAt) : new Date(),
            dep.approvedAt ? new Date(dep.approvedAt) : null,
            Number(dep.lastModified || Date.now()), JSON.stringify(dep)
          ]
        );
      }
    }

    // 5. Sync Withdrawals
    const withdrawals = storeData['gi_withdrawals'];
    if (Array.isArray(withdrawals) && withdrawals.length > 0) {
      for (const w of withdrawals) {
        if (!w || !w.id) continue;
        await client.query(
          `INSERT INTO public.withdrawals (
            id, user_id, amount, fee, net_amount, method, status,
            account_details, created_at, processed_at, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            processed_at = EXCLUDED.processed_at,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            w.id, w.userId, Number(w.amount || 0), Number(w.fee || 0), Number(w.netAmount || 0),
            w.method || null, w.status || 'pending', w.accountDetails || null,
            w.createdAt ? new Date(w.createdAt) : new Date(),
            w.processedAt ? new Date(w.processedAt) : null,
            Number(w.lastModified || Date.now()), JSON.stringify(w)
          ]
        );
      }
    }

    // 6. Sync Forum Posts
    const forumPosts = storeData['gi_forum_posts'];
    if (Array.isArray(forumPosts) && forumPosts.length > 0) {
      for (const post of forumPosts) {
        if (!post || !post.id) continue;
        await client.query(
          `INSERT INTO public.forum_posts (
            id, author_id, author_name, author_phone, avatar_letter, text,
            image1, image2, likes, liked_by, comments, created_at, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            likes = EXCLUDED.likes,
            liked_by = EXCLUDED.liked_by,
            comments = EXCLUDED.comments,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            post.id, post.authorId || 'anonymous', post.authorName || null, post.authorPhone || null,
            post.avatarLetter || null, post.text || null, post.image1 || null, post.image2 || null,
            Number(post.likes || 0), JSON.stringify(post.likedBy || []), JSON.stringify(post.comments || []),
            post.createdAt ? new Date(post.createdAt) : new Date(),
            Number(post.lastModified || Date.now()), JSON.stringify(post)
          ]
        );
      }
    }
    // 7. Sync Commissions
    const commissions = storeData['gi_commissions'];
    if (Array.isArray(commissions) && commissions.length > 0) {
      for (const comm of commissions) {
        if (!comm || !comm.id) continue;
        await client.query(
          `INSERT INTO public.commissions (
            id, user_id, from_user_id, from_user_name, level, amount, created_at, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            amount = EXCLUDED.amount,
            raw_data = EXCLUDED.raw_data;`,
          [
            comm.id, comm.userId, comm.fromUserId || null, comm.fromUserName || null,
            Number(comm.level || 1), Number(comm.amount || 0),
            comm.createdAt ? new Date(comm.createdAt) : new Date(),
            JSON.stringify(comm)
          ]
        );
      }
    }

    // 8. Sync Support Messages
    const supportMessages = storeData['gi_support_messages'];
    if (Array.isArray(supportMessages) && supportMessages.length > 0) {
      for (const msg of supportMessages) {
        if (!msg || !msg.id) continue;
        await client.query(
          `INSERT INTO public.support_messages (
            id, user_id, message, sender, image, read, created_at, last_modified, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            message = EXCLUDED.message,
            read = EXCLUDED.read,
            last_modified = EXCLUDED.last_modified,
            raw_data = EXCLUDED.raw_data;`,
          [
            msg.id, msg.userId, msg.message || '', msg.sender || 'user',
            msg.image || null, Boolean(msg.read),
            msg.createdAt ? new Date(msg.createdAt) : new Date(),
            Number(msg.lastModified || Date.now()), JSON.stringify(msg)
          ]
        );
      }
    }

    // 9. Sync Withdrawal Proofs
    const proofs = storeData['gi_withdrawal_proofs'];
    if (Array.isArray(proofs) && proofs.length > 0) {
      for (const proof of proofs) {
        if (!proof || !proof.id) continue;
        await client.query(
          `INSERT INTO public.withdrawal_proofs (
            id, user_id, user_name, amount, image, date, status, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            raw_data = EXCLUDED.raw_data;`,
          [
            proof.id, proof.userId, proof.userName || null, Number(proof.amount || 0),
            proof.image || null, proof.date || null, proof.status || 'pending',
            JSON.stringify(proof)
          ]
        );
      }
    }

    // 10. Sync Bonus Codes
    const bonusCodes = storeData['gi_bonus_codes'];
    if (Array.isArray(bonusCodes) && bonusCodes.length > 0) {
      for (const code of bonusCodes) {
        if (!code || !code.id) continue;
        await client.query(
          `INSERT INTO public.bonus_codes (
            id, code, amount, max_uses, used_count, used_by, created_at, expires_at, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            used_count = EXCLUDED.used_count,
            used_by = EXCLUDED.used_by,
            raw_data = EXCLUDED.raw_data;`,
          [
            code.id, code.code, Number(code.amount || 0), Number(code.maxUses || 1),
            Number(code.usedCount || 0), JSON.stringify(code.usedByUsers || []),
            code.createdAt ? new Date(code.createdAt) : new Date(),
            code.expiresAt ? new Date(code.expiresAt) : null,
            JSON.stringify(code)
          ]
        );
      }
    }

    // 11. Sync System Notifications
    const notifications = storeData['gi_notifications'];
    if (Array.isArray(notifications) && notifications.length > 0) {
      for (const notif of notifications) {
        if (!notif || !notif.id) continue;
        await client.query(
          `INSERT INTO public.system_notifications (
            id, user_id, title, message, type, read, created_at, raw_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            read = EXCLUDED.read,
            raw_data = EXCLUDED.raw_data;`,
          [
            notif.id, notif.userId, notif.title || '', notif.message || '',
            notif.type || 'info', Boolean(notif.read),
            notif.createdAt ? new Date(notif.createdAt) : new Date(),
            JSON.stringify(notif)
          ]
        );
      }
    }

    // 12. Purge deleted users, investments, products from relational tables
    const deletedUsers = storeData['gi_deleted_users'];
    if (Array.isArray(deletedUsers) && deletedUsers.length > 0) {
      await client.query(`DELETE FROM public.users WHERE id = ANY($1::text[]);`, [deletedUsers]);
      await client.query(`DELETE FROM public.investments WHERE user_id = ANY($1::text[]);`, [deletedUsers]);
      await client.query(`DELETE FROM public.deposits WHERE user_id = ANY($1::text[]);`, [deletedUsers]);
      await client.query(`DELETE FROM public.withdrawals WHERE user_id = ANY($1::text[]);`, [deletedUsers]);
      await client.query(`DELETE FROM public.commissions WHERE user_id = ANY($1::text[]) OR from_user_id = ANY($1::text[]);`, [deletedUsers]);
      await client.query(`DELETE FROM public.support_messages WHERE user_id = ANY($1::text[]);`, [deletedUsers]);
      await client.query(`DELETE FROM public.withdrawal_proofs WHERE user_id = ANY($1::text[]);`, [deletedUsers]);
    }
    const deletedInvestments = storeData['gi_deleted_investments'];
    if (Array.isArray(deletedInvestments) && deletedInvestments.length > 0) {
      await client.query(`DELETE FROM public.investments WHERE id = ANY($1::text[]);`, [deletedInvestments]);
    }
    const deletedProducts = storeData['gi_deleted_products'];
    if (Array.isArray(deletedProducts) && deletedProducts.length > 0) {
      await client.query(`DELETE FROM public.products WHERE id = ANY($1::text[]);`, [deletedProducts]);
    }
  } catch (e: any) {
    console.warn('[NEON RELATIONAL SYNC WARN]', e.message);
  } finally {
    isSyncingRelational = false;
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Returns live counts of rows in all Neon PostgreSQL tables
 */
export async function fetchLiveNeonCounts(): Promise<Record<string, number> | null> {
  const p = getNeonPool();
  if (!p) return null;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    const tables = ['users', 'deposits', 'withdrawals', 'products', 'investments', 'commissions', 'forum_posts', 'support_messages', 'withdrawal_proofs', 'bonus_codes', 'system_notifications', 'store'];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) as cnt FROM public.${t};`);
        counts[t] = parseInt(res.rows[0]?.cnt || '0', 10);
      } catch {
        counts[t] = 0;
      }
    }
    return counts;
  } catch (err: any) {
    console.warn('[NEON COUNTS WARN]', err.message);
    return null;
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Inserts or updates a forum post directly in Neon's relational table
 */
export async function insertNeonForumPost(post: any): Promise<boolean> {
  const p = getNeonPool();
  if (!p || !post || !post.id) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    await client.query(
      `INSERT INTO public.forum_posts (
        id, author_id, author_name, author_phone, avatar_letter, text,
        image1, image2, likes, liked_by, comments, created_at, last_modified, raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        text = EXCLUDED.text,
        image1 = EXCLUDED.image1,
        image2 = EXCLUDED.image2,
        likes = EXCLUDED.likes,
        liked_by = EXCLUDED.liked_by,
        comments = EXCLUDED.comments,
        last_modified = EXCLUDED.last_modified,
        raw_data = EXCLUDED.raw_data;`,
      [
        String(post.id),
        String(post.authorId || 'anonymous'),
        post.authorName || null,
        post.authorPhone || null,
        post.avatarLetter || '★',
        post.text || null,
        post.image1 || null,
        post.image2 || null,
        Number(post.likes || 0),
        JSON.stringify(post.likedBy || []),
        JSON.stringify(post.comments || []),
        post.createdAt ? new Date(post.createdAt) : new Date(),
        Number(post.lastModified || Date.now()),
        JSON.stringify(post)
      ]
    );
    return true;
  } catch (err: any) {
    console.warn('[NEON FORUM INSERT WARN]', err.message);
    return false;
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Deletes a forum post from Neon's relational table
 */
export async function deleteNeonForumPost(postId: string): Promise<boolean> {
  const p = getNeonPool();
  if (!p || !postId) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    await client.query(`DELETE FROM public.forum_posts WHERE id = $1;`, [String(postId)]);
    return true;
  } catch (err: any) {
    console.warn('[NEON FORUM DELETE WARN]', err.message);
    return false;
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

/**
 * Deletes a user and all related child records from Neon PostgreSQL
 */
export async function deleteNeonUser(userId: string): Promise<boolean> {
  const p = getNeonPool();
  if (!p || !userId) return false;

  let client: PoolClient | null = null;
  try {
    client = await p.connect();
    await client.query(`DELETE FROM public.users WHERE id = $1;`, [userId]);
    await client.query(`DELETE FROM public.investments WHERE user_id = $1;`, [userId]);
    await client.query(`DELETE FROM public.deposits WHERE user_id = $1;`, [userId]);
    await client.query(`DELETE FROM public.withdrawals WHERE user_id = $1;`, [userId]);
    await client.query(`DELETE FROM public.commissions WHERE user_id = $1 OR from_user_id = $1;`, [userId]);
    await client.query(`DELETE FROM public.support_messages WHERE user_id = $1;`, [userId]);
    await client.query(`DELETE FROM public.withdrawal_proofs WHERE user_id = $1;`, [userId]);
    return true;
  } catch (err: any) {
    console.warn('[NEON DELETE USER WARN]', err.message);
    return false;
  } finally {
    if (client) {
      try { client.release(); } catch {}
    }
  }
}

