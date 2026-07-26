import { createClient } from "@/lib/supabase/server";
import { CreateCampaignForm } from "@/components/campaign/CreateCampaignForm";

export const metadata = {
  title: "Galang Dana Baru",
};

export default async function GalangDanaPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("campaign_categories")
    .select("id, name")
    .eq("type", "donasi")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Buat Galang Dana Baru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Isi detail campaign kamu selengkap mungkin — makin jelas ceritanya, makin cepat proses verifikasi admin.
        </p>
      </div>

      <CreateCampaignForm categories={categories ?? []} />
    </div>
  );
}