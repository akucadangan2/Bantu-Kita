"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/lib/types";

// TODO: tambah parameter filter (kategori, tipe, status) & pagination
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (mounted) {
        setCampaigns((data as Campaign[]) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { campaigns, loading };
}
