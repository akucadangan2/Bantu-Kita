"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient()); // dibuat sekali aja, bukan tiap render

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (mounted) {
        setProfile(data ?? null);
        setLoading(false);
      }
    }

    load();

    // Dengarkan perubahan status login (login/logout) secara real-time,
    // jadi begitu kamu login di halaman lain, tab bar ini otomatis update
    // tanpa perlu buka-tutup halaman dulu.
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    isFundraiser: profile?.role === "fundraiser",
  };
}