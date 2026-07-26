import { CampaignGrid } from "@/components/campaign/CampaignGrid";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Donasi & Galang Dana",
};

export default async function DonasiListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .eq("type", "donasi");

  if (filter === "mendesak") query = query.eq("is_urgent", true);
  if (filter === "pilihan") query = query.eq("is_featured", true);

  const { data: campaigns } = await query.order("created_at", { ascending: false }).limit(24);

  const heading =
    filter === "mendesak" ? "Campaign Mendesak" : filter === "pilihan" ? "Pilihan Bantu Kita" : "Donasi & Galang Dana";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">{heading}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bantu sesama lewat campaign yang sedang berjalan di bawah ini.
        </p>
      </div>

      {!filter && <CategoryFilter />}

      <CampaignGrid campaigns={campaigns ?? []} />
    </div>
  );
}