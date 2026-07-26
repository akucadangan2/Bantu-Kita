# Kitabisa-Clone — Struktur Awal

Skeleton project untuk platform galang dana ala Kitabisa dengan 4 modul: **Donasi, Zakat, Wakaf, Saling Jaga**.

Stack: **Next.js (App Router) + TypeScript + Tailwind + Supabase**, deploy di Vercel — sesuai stack yang biasa kamu pakai di Maesa Mart & Butik Antam.

## Role & Akses

| Role | Bisa akses |
|---|---|
| Donatur | `/akun/*` — profil, riwayat donasi, status Saling Jaga |
| Fundraiser (Penggalang Dana) | Semua akses Donatur + `/galang-dana`, `/dashboard-penggalang/*` |
| Admin | Semua halaman `/admin/*` (verifikasi campaign, kelola user, approve pencairan dana, dll) |

Proteksi role sudah disiapkan di `middleware.ts` (baca role dari tabel `profiles`).

## Struktur Folder

```
app/
  (public)/       -> halaman publik: donasi, zakat, wakaf, saling-jaga, cari, tentang, bantuan
  (auth)/         -> login, register, lupa-password, verifikasi
  (donatur)/      -> area akun donatur (butuh login)
  (fundraiser)/   -> area galang dana & dashboard fundraiser (butuh login, role fundraiser/admin)
  (admin)/        -> area admin (butuh login, role admin)
  api/            -> route handlers (campaigns, donations, zakat, wakaf, saling-jaga, withdrawals, upload, webhook payment)

components/
  ui/             -> Button, Card, Input, Modal, Badge, ProgressBar (belum ada style final)
  layout/         -> Navbar, Footer, Sidebar admin/fundraiser, MobileNav
  campaign/       -> CampaignCard, CampaignGrid, DonationForm, CampaignProgress, UpdateFeed, CommentSection, ShareButtons
  zakat/          -> ZakatCalculator, NisabInfo, ZakatTypeSelector
  wakaf/          -> WakafCard, WakafForm
  saling-jaga/    -> ProgramCard, ClaimForm, MemberStatus
  dashboard/      -> StatCard, DataTable, ChartRevenue (untuk admin & fundraiser)
  shared/         -> SearchBar, CategoryFilter, Pagination, EmptyState, LoadingSpinner

lib/
  supabase/       -> client.ts (browser), server.ts (server component/route handler), middleware.ts (helper session)
  types/          -> database.types.ts (placeholder, akan digenerate ulang dari Supabase CLI), index.ts
  validations/    -> schema zod: auth, campaign, donation, zakat
  constants.ts    -> kategori, jenis zakat, label status, dsb
  utils.ts        -> formatRupiah, slugify, calcProgressPercent, daysLeft, cn

hooks/            -> useAuth, useCampaigns, useDonations

supabase/
  migrations/0001_init_schema.sql -> semua tabel + enum + RLS dasar
  seed.sql                         -> data awal kategori & jenis zakat

middleware.ts     -> proteksi route berdasarkan role
```

## Yang Sudah Berfungsi (bukan sekadar file kosong)

- Skema database lengkap (`supabase/migrations/0001_init_schema.sql`) untuk 4 modul, termasuk RLS dengan pola `to anon, authenticated` seperti di Butik Antam.
- Koneksi Supabase (client & server) + middleware role-based, mengikuti pola three-tier role di Maesa Mart.
- Validasi form (zod) untuk auth, campaign, donasi, zakat.
- `DonationForm` sudah jalan sebagai form (react-hook-form + zod), tinggal disambungkan ke `/api/donations` dan payment gateway saat kamu siap.
- `CampaignCard`, `CampaignGrid`, `CampaignProgress`, `Navbar`, `Footer` sudah ada logic dasarnya (format Rupiah, hitung persen progress, sisa hari).

## Yang Masih Stub (sengaja, sesuai kesepakatan: struktur & UI dulu)

- Semua halaman di `(admin)`, `(fundraiser)`, `(donatur)`, dan sebagian besar `(public)` baru kerangka `page.tsx` dengan komentar TODO berisi rencana isinya.
- Komponen di `ui/`, `dashboard/`, `zakat/`, `wakaf/`, `saling-jaga/` baru stub kosong — belum ada styling/desain visual.
- Semua route di `api/` mengembalikan `501 Not Implemented` — logic query Supabase & payment gateway menyusul.
- `lib/types/database.types.ts` baru placeholder manual. Setelah migration dijalankan, generate ulang dengan Supabase CLI (lihat script `db:types` di `package.json`).

## Langkah Selanjutnya (Saran Urutan)

1. **Setup Supabase**: buat project baru, jalankan `supabase/migrations/0001_init_schema.sql` lalu `supabase/seed.sql`, isi `.env.local` dari `.env.example`.
2. `npx supabase gen types typescript --project-id <id> > lib/types/database.types.ts` untuk ganti placeholder types.
3. **Desain visual** (palet warna, tipografi, layout hero) — ini best dibahas terpisah sebagai sesi desain, karena beda concern dari struktur file.
4. Isi logic API routes satu-per-satu, mulai dari `campaigns` dan `donations` (paling sering dipakai).
5. Terakhir baru integrasi payment gateway (Midtrans/DOKU) — placeholder webhook sudah disiapkan di `app/api/webhooks/payment/route.ts`.

## Catatan Keamanan yang Perlu Diperhatikan

- RLS policy admin **belum lengkap** — lihat komentar di akhir file migration untuk pola `admin_full_access_*` yang perlu ditambahkan per tabel.
- `SUPABASE_SERVICE_ROLE_KEY` di `.env.example` hanya dipakai di server (route handler/admin operations), **jangan pernah** diexpose ke client.
