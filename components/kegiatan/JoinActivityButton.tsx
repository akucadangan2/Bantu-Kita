"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JoinActivityButton({
  activityId,
  isFull,
  alreadyJoined,
  isLoggedIn,
}: {
  activityId: string;
  isFull: boolean;
  alreadyJoined: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [joined, setJoined] = useState(alreadyJoined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onJoin = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/kegiatan`);
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase
      .from("activity_participants")
      .insert({ activity_id: activityId, user_id: user!.id });

    setLoading(false);

    if (insertError) {
      setError("Gagal mendaftar. Coba lagi.");
      return;
    }

    setJoined(true);
    router.refresh();
  };

  if (joined) {
    return (
      <button disabled className="w-full rounded-xl bg-secondary-light py-3 text-sm font-semibold text-secondary-dark">
        Kamu Sudah Terdaftar
      </button>
    );
  }

  if (isFull) {
    return (
      <button disabled className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-400">
        Kuota Penuh
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={onJoin}
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "Mendaftar..." : "Ikut Kegiatan Ini"}
      </button>
    </div>
  );
}