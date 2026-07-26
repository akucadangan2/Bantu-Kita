"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Donation } from "@/lib/types";

// TODO: dipakai untuk menampilkan daftar donatur transparan di halaman detail campaign
export function useDonations(campaignId: string) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase
        .from("donations")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });

      if (mounted) {
        setDonations((data as Donation[]) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [campaignId, supabase]);

  return { donations, loading };
}
