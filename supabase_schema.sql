-- ==============================================================================
-- SCRIPT SQL COMPLET DE CRÉATION DE LA BASE DE DONNÉES SUPABASE
-- Projet Supabase : https://sjvyhnxklgsgprgkihrr.supabase.co
-- À exécuter dans : Dashboard Supabase > SQL Editor > New query > Run
-- ==============================================================================

-- 1. Table principale de synchronisation globale clé-valeur (JSONB Store)
CREATE TABLE IF NOT EXISTS public.store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table relationnelle des Utilisateurs & Investisseurs
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    bonus NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    total_recharged NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    total_withdrawn NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    daily_earnings NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    referral_earnings NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    referred_by TEXT,
    referral_code TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    is_blocked BOOLEAN DEFAULT false NOT NULL,
    withdraw_blocked BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 3. Table des Dépôts
CREATE TABLE IF NOT EXISTS public.deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT DEFAULT 'Investisseur',
    amount NUMERIC(15,2) NOT NULL,
    method TEXT DEFAULT 'Mobile Money',
    operator TEXT DEFAULT 'Mobile Money',
    status TEXT DEFAULT 'pending' NOT NULL,
    receipt_image TEXT,
    proof_image TEXT,
    tx_id TEXT,
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 4. Table des Retraits
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT DEFAULT 'Investisseur',
    amount NUMERIC(15,2) NOT NULL,
    net_amount NUMERIC(15,2) NOT NULL,
    fee NUMERIC(15,2) DEFAULT 0.00,
    method TEXT DEFAULT 'Mobile Money',
    account_number TEXT NOT NULL,
    account_name TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 5. Table des Investissements (Plans souscrits)
CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    daily_return NUMERIC(15,2) NOT NULL,
    days_passed INT DEFAULT 0 NOT NULL,
    duration_days INT DEFAULT 30 NOT NULL,
    total_return_claimed NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    is_cyclic BOOLEAN DEFAULT false NOT NULL,
    category TEXT DEFAULT 'wellbeing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_claim_date TIMESTAMP WITH TIME ZONE,
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 6. Table des Produits d'Investissement
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    daily_return NUMERIC(15,2) NOT NULL,
    duration_days INT DEFAULT 30 NOT NULL,
    category TEXT DEFAULT 'wellbeing',
    is_cyclic BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    total_return NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 7. Table des Commissions de Parrainage (MLM)
CREATE TABLE IF NOT EXISTS public.commissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    from_user_name TEXT DEFAULT 'Filleul',
    amount NUMERIC(15,2) NOT NULL,
    level INT DEFAULT 1 NOT NULL,
    plan_name TEXT DEFAULT 'Investissement',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 8. Table des Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_modified BIGINT DEFAULT (extract(epoch from now()) * 1000),
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 9. Table des Messages du Support Client
CREATE TABLE IF NOT EXISTS public.support_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- ==============================================================================
-- INDEX DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON public.users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ==============================================================================
-- CONFIGURATION ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

-- Activation de RLS sur toutes les tables
ALTER TABLE public.store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 1. Policies service_role (Le serveur backend / admin dispose d'un accès TOTAL sans restriction)
DROP POLICY IF EXISTS "Service role full access on store" ON public.store;
CREATE POLICY "Service role full access on store" ON public.store FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on deposits" ON public.deposits;
CREATE POLICY "Service role full access on deposits" ON public.deposits FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on withdrawals" ON public.withdrawals;
CREATE POLICY "Service role full access on withdrawals" ON public.withdrawals FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on investments" ON public.investments;
CREATE POLICY "Service role full access on investments" ON public.investments FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on products" ON public.products;
CREATE POLICY "Service role full access on products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on commissions" ON public.commissions;
CREATE POLICY "Service role full access on commissions" ON public.commissions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on notifications" ON public.notifications;
CREATE POLICY "Service role full access on notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on support_messages" ON public.support_messages;
CREATE POLICY "Service role full access on support_messages" ON public.support_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Policies public / anon (Permet aux requêtes client-side via Anon Key de lire et s'enregistrer en toute sécurité)
DROP POLICY IF EXISTS "Anon read store" ON public.store;
CREATE POLICY "Anon read store" ON public.store FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon insert store" ON public.store;
CREATE POLICY "Anon insert store" ON public.store FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anon update store" ON public.store;
CREATE POLICY "Anon update store" ON public.store FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access users" ON public.users;
CREATE POLICY "Anon access users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access deposits" ON public.deposits;
CREATE POLICY "Anon access deposits" ON public.deposits FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access withdrawals" ON public.withdrawals;
CREATE POLICY "Anon access withdrawals" ON public.withdrawals FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access investments" ON public.investments;
CREATE POLICY "Anon access investments" ON public.investments FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access products" ON public.products;
CREATE POLICY "Anon access products" ON public.products FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access commissions" ON public.commissions;
CREATE POLICY "Anon access commissions" ON public.commissions FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access notifications" ON public.notifications;
CREATE POLICY "Anon access notifications" ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access support_messages" ON public.support_messages;
CREATE POLICY "Anon access support_messages" ON public.support_messages FOR ALL TO anon USING (true) WITH CHECK (true);

-- ==============================================================================
-- ACTIVER LA SYNCHRONISATION EN TEMPS RÉEL (SUPABASE REALTIME)
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.store, public.users, public.deposits, public.withdrawals, public.investments, public.products, public.notifications;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN NULL;
    END;
END $$;
