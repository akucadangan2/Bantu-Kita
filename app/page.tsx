import { CampaignGrid } from "@/components/campaign/CampaignGrid";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import { Hero } from "@/components/home/Hero";
import { HighlightModules } from "@/components/home/HighlightModules";
import { createClient } from "@/lib/supabase/server";

// Rencana section (urut dari atas):
// 1. Hero — SUDAH JADI (components/home/Hero.tsx)
// 2. Kategori cepat — SUDAH JADI (components/shared/CategoryFilter.tsx)
// 3. Campaign mendesak — SUDAH JADI, data asli dari Supabase
// 4. Highlight Zakat/Wakaf/Saling Jaga — SUDAH JADI (components/home/HighlightModules.tsx)
// 5. Campaign terbaru — SUDAH JADI, data asli dari Supabase

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: urgentCampaigns }, { data: latestCampaigns }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .eq("is_urgent", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
    <Hero urgentCampaigns={urgentCampaigns ?? []} />

      <section aria-label="kategori">
        <CategoryFilter />
      </section>

      <section aria-label="campaign-mendesak">
        <h2 className="text-xl font-semibold mb-4">Butuh Bantuan Segera</h2>
        <CampaignGrid campaigns={urgentCampaigns ?? []} />
      </section>

      <section aria-label="highlight-modul" className="grid gap-4 sm:grid-cols-3">
        <HighlightModules />
      </section>

      <section aria-label="campaign-terbaru">
        <h2 className="text-xl font-semibold mb-4">Galang Dana Terbaru</h2>
        <CampaignGrid campaigns={latestCampaigns ?? []} />
      </section>
    </div>
  );
}