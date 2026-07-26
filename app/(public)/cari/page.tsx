import { createClient } from "@/lib/supabase/server";
import { CampaignGrid } from "@/components/campaign/CampaignGrid";
import { SearchBar } from "@/components/shared/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function CariHasilPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let campaigns: any[] = [];
  if (query) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .ilike("title", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(24);
    campaigns = data ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-primary mb-4">Cari Campaign</h1>
        <SearchBar initialQuery={query} />
      </div>

      {query ? (
        <>
          <p className="text-sm text-slate-500">
            {campaigns.length > 0
              ? `Menampilkan ${campaigns.length} hasil untuk "${query}"`
              : `Tidak ada hasil untuk "${query}"`}
          </p>
          <CampaignGrid campaigns={campaigns} />
        </>
      ) : (
        <EmptyState message="Ketik kata kunci untuk mulai mencari campaign." />
      )}
    </div>
  );
}