"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

// TODO: pertimbangkan pindah ke React Context jika dipakai di banyak tempat
// supaya tidak fetch profile berulang kali.
export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { profile, loading, isAdmin: profile?.role === "admin", isFundraiser: profile?.role === "fundraiser" };
}
