-- ============================================================================
-- ASTARON FINANCE - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Salin dan jalankan seluruh script ini di SQL Editor dashboard Supabase Anda.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: WALLETS (Tempat Penyimpanan Dana / Akun Bank / E-Wallet)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    nama TEXT NOT NULL,
    tipe TEXT NOT NULL DEFAULT 'bank' CHECK (tipe IN ('bank', 'ewallet', 'cash')),
    saldo_awal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    saldo_saat_ini NUMERIC(15, 2) NOT NULL DEFAULT 0,
    nomor_rekening TEXT,
    warna TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL: TRANSACTIONS (Arus Kas Masuk, Keluar, dan Transfer Antar Dompet)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    to_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    jenis TEXT NOT NULL CHECK (jenis IN ('income', 'expense', 'transfer')),
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    kategori TEXT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL: FINANCIAL_GOALS (Tujuan Finansial & Brankas Virtual)
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    nama_tujuan TEXT NOT NULL,
    target_nominal NUMERIC(15, 2) NOT NULL CHECK (target_nominal > 0),
    saldo_terkumpul NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (saldo_terkumpul >= 0),
    tanggal_target DATE,
    kategori TEXT DEFAULT 'Tabungan',
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL: REMINDERS (Pengingat Tagihan Rutin & Hutang-Piutang)
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    nama_pengingat TEXT NOT NULL,
    jenis TEXT NOT NULL CHECK (jenis IN ('bill', 'loan')),
    sub_jenis TEXT CHECK (sub_jenis IN ('debt', 'receivable')),
    nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
    tanggal_mulai_pinjam DATE,
    tanggal_jatuh_tempo DATE NOT NULL,
    frekuensi TEXT DEFAULT 'Bulanan',
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    catatan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Menjamin setiap user hanya dapat melihat, membuat, mengubah, dan menghapus
-- data miliknya sendiri berdasarkan auth.uid() Supabase (Single-User Privacy).
-- ============================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- POLICIES: WALLETS
CREATE POLICY "Users can view own wallets"
    ON public.wallets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
    ON public.wallets FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
    ON public.wallets FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets"
    ON public.wallets FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- POLICIES: TRANSACTIONS
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- POLICIES: FINANCIAL_GOALS
CREATE POLICY "Users can view own financial goals"
    ON public.financial_goals FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial goals"
    ON public.financial_goals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial goals"
    ON public.financial_goals FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial goals"
    ON public.financial_goals FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- POLICIES: REMINDERS
CREATE POLICY "Users can view own reminders"
    ON public.reminders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
    ON public.reminders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
    ON public.reminders FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
    ON public.reminders FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- INDEXES UNTUK PERFORMA TINGGI (QUERY CEPAT)
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders(user_id, tanggal_jatuh_tempo ASC);
