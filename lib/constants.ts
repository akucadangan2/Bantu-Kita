export const APP_NAME = "Bantu Kita";
export const APP_TAGLINE = "Bersama, kita bisa membantu lebih banyak";

export const CAMPAIGN_CATEGORIES = [
  { slug: "bencana-alam", name: "Bencana Alam" },
  { slug: "kesehatan", name: "Kesehatan" },
  { slug: "pendidikan", name: "Pendidikan" },
  { slug: "kemanusiaan", name: "Kemanusiaan" },
  { slug: "lingkungan", name: "Lingkungan" },
  { slug: "difabel", name: "Difabel" },
  { slug: "hewan", name: "Hewan & Lingkungan" },
] as const;

export const ZAKAT_TYPES = [
  { slug: "maal", name: "Zakat Maal" },
  { slug: "fitrah", name: "Zakat Fitrah" },
  { slug: "penghasilan", name: "Zakat Penghasilan" },
  { slug: "perdagangan", name: "Zakat Perdagangan" },
] as const;

// Nisab & rate contoh — WAJIB diverifikasi ke lembaga zakat resmi (mis. BAZNAS)
// sebelum dipakai untuk kalkulasi nyata. Ini hanya starting point struktur data.
export const ZAKAT_NISAB_EMAS_GRAM = 85;
export const ZAKAT_RATE = 0.025; // 2.5%
// Estimasi kasar buat starting point kalkulator — user tetap bisa edit manual
// nilainya sebelum hitung, karena harga emas & standar fitrah berubah-ubah.
export const GOLD_PRICE_PER_GRAM_ESTIMATE = 1_500_000;
export const ZAKAT_FITRAH_PRICE_PER_JIWA_ESTIMATE = 45_000;

export const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  draft: "Draf",
  pending_review: "Menunggu Verifikasi",
  active: "Aktif",
  completed: "Selesai",
  rejected: "Ditolak",
  closed: "Ditutup",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

export const MIN_DONATION_AMOUNT = 10_000; // Rp
