import { CampaignGrid } from "@/components/campaign/CampaignGrid";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Donasi & Galang Dana",
};

export default async function DonasiListPage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .eq("type", "donasi")
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Donasi & Galang Dana</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bantu sesama lewat campaign yang sedang berjalan di bawah ini.
        </p>
      </div>

      <CategoryFilter />

      {/* TODO: Pagination — sementara dibatasi 24 campaign terbaru dulu */}
      <CampaignGrid campaigns={campaigns ?? []} />
    </div>
  );
}