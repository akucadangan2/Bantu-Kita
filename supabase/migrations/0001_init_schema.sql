-- =========================================================
-- KITABISA-CLONE — INITIAL SCHEMA
-- Modul: Donasi, Zakat, Wakaf, Saling Jaga
-- =========================================================

-- ---------- ENUMS ----------
create type user_role as enum ('donatur', 'fundraiser', 'admin');
create type campaign_type as enum ('donasi', 'wakaf');
create type campaign_status as enum ('draft', 'pending_review', 'active', 'completed', 'rejected', 'closed');
create type payment_status as enum ('pending', 'paid', 'failed', 'expired');
create type withdrawal_status as enum ('requested', 'approved', 'rejected', 'disbursed');
create type saling_jaga_member_status as enum ('pending', 'active', 'inactive');
create type saling_jaga_claim_status as enum ('submitted', 'review', 'approved', 'rejected', 'disbursed');

-- ---------- PROFILES ----------
-- Diperluas dari auth.users milik Supabase
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'donatur',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table campaign_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type campaign_type not null default 'donasi',
  icon text,
  created_at timestamptz not null default now()
);

-- ---------- CAMPAIGNS (Donasi & Wakaf umum) ----------
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references profiles(id) on delete cascade,
  category_id uuid references campaign_categories(id),
  type campaign_type not null default 'donasi',
  title text not null,
  slug text not null unique,
  story text,
  cover_image_url text,
  beneficiary_name text,
  target_amount numeric(14,2) not null default 0,
  collected_amount numeric(14,2) not null default 0,
  deadline date,
  is_urgent boolean not null default false,
  status campaign_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaigns_status on campaigns(status);
create index idx_campaigns_type on campaigns(type);

-- ---------- CAMPAIGN UPDATES ----------
create table campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- CAMPAIGN COMMENTS ----------
create table campaign_comments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------- DONATIONS ----------
create table donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  donor_id uuid references profiles(id) on delete set null,
  donor_name text not null default 'Hamba Allah',
  is_anonymous boolean not null default false,
  amount numeric(14,2) not null,
  message text,
  payment_status payment_status not null default 'pending',
  payment_method text,
  payment_reference text,
  created_at timestamptz not null default now()
);

create index idx_donations_campaign on donations(campaign_id);

-- ---------- ZAKAT ----------
create table zakat_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,          -- Zakat Maal, Zakat Fitrah, Zakat Penghasilan, dst
  slug text not null unique,
  description text
);

create table zakat_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  zakat_type_id uuid not null references zakat_types(id),
  muzakki_name text not null default 'Hamba Allah',
  amount numeric(14,2) not null,
  payment_status payment_status not null default 'pending',
  payment_reference text,
  created_at timestamptz not null default now()
);

-- ---------- WAKAF ----------
create table wakaf_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  price_per_unit numeric(14,2) not null,
  unit_label text not null default 'm2',
  total_units numeric(14,2) not null,
  units_taken numeric(14,2) not null default 0,
  status campaign_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table wakaf_transactions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references wakaf_programs(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  wakif_name text not null default 'Hamba Allah',
  units numeric(14,2) not null,
  amount numeric(14,2) not null,
  payment_status payment_status not null default 'pending',
  payment_reference text,
  created_at timestamptz not null default now()
);

-- ---------- SALING JAGA (gotong royong iuran komunitas) ----------
create table saling_jaga_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  monthly_fee numeric(12,2) not null,
  coverage_description text,
  max_claim_amount numeric(14,2),
  status campaign_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table saling_jaga_members (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references saling_jaga_programs(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status saling_jaga_member_status not null default 'pending',
  joined_at timestamptz not null default now(),
  next_billing_date date,
  unique (program_id, user_id)
);

create table saling_jaga_claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references saling_jaga_members(id) on delete cascade,
  title text not null,
  description text,
  attachment_url text,
  amount_requested numeric(14,2) not null,
  amount_approved numeric(14,2),
  status saling_jaga_claim_status not null default 'submitted',
  created_at timestamptz not null default now()
);

-- ---------- WITHDRAWALS (pencairan dana untuk fundraiser) ----------
create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  wakaf_program_id uuid references wakaf_programs(id) on delete cascade,
  fundraiser_id uuid not null references profiles(id) on delete cascade,
  amount numeric(14,2) not null,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  status withdrawal_status not null default 'requested',
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

-- =========================================================
-- ROW LEVEL SECURITY
-- Catatan: policy diarahkan ke "anon, authenticated" karena
-- banyak data (campaign aktif, progres donasi) bersifat publik,
-- namun sebagian aksi tulis tetap dibatasi lewat kondisi role.
-- =========================================================

alter table profiles enable row level security;
alter table campaigns enable row level security;
alter table campaign_categories enable row level security;
alter table campaign_updates enable row level security;
alter table campaign_comments enable row level security;
alter table donations enable row level security;
alter table zakat_types enable row level security;
alter table zakat_transactions enable row level security;
alter table wakaf_programs enable row level security;
alter table wakaf_transactions enable row level security;
alter table saling_jaga_programs enable row level security;
alter table saling_jaga_members enable row level security;
alter table saling_jaga_claims enable row level security;
alter table withdrawals enable row level security;

-- Profiles: publik boleh baca info dasar, hanya pemilik yang boleh update
create policy "profiles_select_all" on profiles for select to anon, authenticated using (true);
create policy "profiles_update_own" on profiles for update to authenticated using (auth.uid() = id);

-- Categories: publik baca
create policy "categories_select_all" on campaign_categories for select to anon, authenticated using (true);

-- Campaigns: publik hanya lihat yang status aktif/selesai; fundraiser lihat & kelola miliknya sendiri
create policy "campaigns_select_public" on campaigns for select to anon, authenticated
  using (status in ('active', 'completed') or fundraiser_id = auth.uid());
create policy "campaigns_insert_fundraiser" on campaigns for insert to authenticated
  with check (fundraiser_id = auth.uid());
create policy "campaigns_update_own" on campaigns for update to authenticated
  using (fundraiser_id = auth.uid());

-- Campaign updates & comments: publik baca, user login boleh komentar
create policy "updates_select_all" on campaign_updates for select to anon, authenticated using (true);
create policy "comments_select_all" on campaign_comments for select to anon, authenticated using (true);
create policy "comments_insert_auth" on campaign_comments for insert to authenticated
  with check (user_id = auth.uid());

-- Donations: publik lihat daftar donatur per campaign (untuk transparansi), insert oleh siapa saja (bisa anonim)
create policy "donations_select_all" on donations for select to anon, authenticated using (true);
create policy "donations_insert_all" on donations for insert to anon, authenticated with check (true);

-- Zakat & wakaf: tipe/paket publik dibaca, transaksi hanya bisa dibuat, dibaca oleh pemilik
create policy "zakat_types_select_all" on zakat_types for select to anon, authenticated using (true);
create policy "zakat_tx_insert_all" on zakat_transactions for insert to anon, authenticated with check (true);
create policy "zakat_tx_select_own" on zakat_transactions for select to authenticated using (user_id = auth.uid());

create policy "wakaf_programs_select_all" on wakaf_programs for select to anon, authenticated using (true);
create policy "wakaf_tx_insert_all" on wakaf_transactions for insert to anon, authenticated with check (true);
create policy "wakaf_tx_select_own" on wakaf_transactions for select to authenticated using (user_id = auth.uid());

-- Saling Jaga: program publik dibaca; member & claim hanya bisa diakses pemiliknya
create policy "sj_programs_select_all" on saling_jaga_programs for select to anon, authenticated using (true);
create policy "sj_members_select_own" on saling_jaga_members for select to authenticated using (user_id = auth.uid());
create policy "sj_members_insert_own" on saling_jaga_members for insert to authenticated with check (user_id = auth.uid());
create policy "sj_claims_select_own" on saling_jaga_claims for select to authenticated
  using (member_id in (select id from saling_jaga_members where user_id = auth.uid()));
create policy "sj_claims_insert_own" on saling_jaga_claims for insert to authenticated
  with check (member_id in (select id from saling_jaga_members where user_id = auth.uid()));

-- Withdrawals: hanya fundraiser pemilik campaign yang bisa lihat & ajukan
create policy "withdrawals_select_own" on withdrawals for select to authenticated using (fundraiser_id = auth.uid());
create policy "withdrawals_insert_own" on withdrawals for insert to authenticated with check (fundraiser_id = auth.uid());

-- =========================================================
-- CATATAN PENTING UNTUK ADMIN
-- Policy di atas BELUM mencakup akses penuh admin (approve/reject
-- campaign, kelola withdrawal, dll). Tambahkan policy terpisah yang
-- mengecek role = 'admin' dari tabel profiles, contoh:
--
-- create policy "admin_full_access_campaigns" on campaigns
--   for all to authenticated
--   using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
--
-- Terapkan pola serupa ke tabel lain yang perlu dikelola admin.
-- =========================================================
