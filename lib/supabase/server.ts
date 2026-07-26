import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Dipakai di dalam Server Component, Server Action, atau Route Handler
// CATATAN: sama seperti client.ts, generic <Database> sengaja dilepas dulu
// sampai types asli berhasil digenerate.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Diabaikan bila dipanggil dari Server Component murni (read-only).
            // Aman selama middleware.ts menangani refresh session.
          }
        },
      },
    }
  );
}