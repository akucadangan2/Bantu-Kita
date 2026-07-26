import { createBrowserClient } from "@supabase/ssr";

// Dipakai di dalam Client Component ("use client")
// CATATAN: generic <Database> sengaja dilepas dulu — placeholder types kita
// baru cover 3 tabel (profiles/campaigns/donations), padahal project ini
// sudah punya belasan tabel lain. Kalau tetap dipaksa pakai Database yang
// belum lengkap, TypeScript salah nganggep operasi ke tabel lain sebagai
// tidak valid. Pasang lagi <Database> setelah types asli berhasil digenerate
// dari Supabase CLI (lib/types/database.types.ts akan tercover penuh).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}