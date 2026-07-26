import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditCampaignForm } from "@/components/campaign/EditCampaignForm";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("fundraiser_id", user!.id) // hanya pemilik yang boleh edit
    .single();

  if (!campaign) notFound();

  const { data: categories } = await supabase
    .from("campaign_categories")
    .select("id, name")
    .eq("type", "donasi")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Edit Campaign</h1>
        <p className="mt-1 text-sm text-slate-500">
          Perbarui detail campaign kamu.
        </p>
      </div>

      <EditCampaignForm campaign={campaign} categories={categories ?? []} />
    </div>
  );
}