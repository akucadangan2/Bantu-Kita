import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

const ROLE_LABEL: Record<string, string> = {
  donatur: "Donatur",
  fundraiser: "Penggalang Dana",
  admin: "Admin",
};

export default async function AkunSayaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Akun Saya</h1>
        <p className="mt-1 text-sm text-slate-500">{ROLE_LABEL[profile?.role ?? "donatur"]}</p>
      </div>

      <div className="rounded-2xl border border-slate-100 p-6">
        <ProfileForm profile={profile!} />
      </div>

      <div className="flex gap-4">
        <Link href="/akun/riwayat-donasi" className="text-sm font-medium text-secondary-dark hover:underline">
          Riwayat Donasi →
        </Link>
        <Link href="/akun/pengaturan" className="text-sm font-medium text-secondary-dark hover:underline">
          Pengaturan Akun →
        </Link>
      </div>
    </div>
  );
}