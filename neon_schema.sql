-- ======================================================================
-- SCRIPT DE MIGRATION VERS NEON POSTGRESQL (Production / Base neondb)
-- Application: Plateforme d'Investissement Dreampod
-- ======================================================================

-- 1. Table principale de synchronisation haute performance (Clé-Valeur JSONB)
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

-- 8. Table du Forum Communautaire (Synchronisé en temps réel)
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
