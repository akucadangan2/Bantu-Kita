import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignGrid } from "@/components/campaign/CampaignGrid";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import { CAMPAIGN_CATEGORIES } from "@/lib/constants";

export default async function DonasiKategoriPage({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const supabase = await createClient();

  const categoryInfo = CAMPAIGN_CATEGORIES.find((c) => c.slug === kategori);
  if (!categoryInfo) notFound();

  const { data: category } = await supabase
    .from("campaign_categories")
    .select("id, name")
    .eq("slug", kategori)
    .single();

  const { data: campaigns } = category
    ? await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .eq("category_id", category.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">{categoryInfo.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Campaign donasi dengan kategori {categoryInfo.name.toLowerCase()}.
        </p>
      </div>

      <CategoryFilter activeSlug={kategori} />

      <CampaignGrid campaigns={campaigns ?? []} />
    </div>
  );
}