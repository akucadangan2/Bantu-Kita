"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError("Gagal menyimpan perubahan.");
      return;
    }

    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Nomor HP</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-secondary-dark">Perubahan tersimpan.</p>}

      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  );
}