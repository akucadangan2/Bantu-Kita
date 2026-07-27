import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, calcProgressPercent } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function cancelCampaign(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // .eq("fundraiser_id", ...) sebagai pengaman tambahan, walau RLS juga udah nge-block
  // kalau ada yang coba batalin campaign milik orang lain
  await supabase
    .from("campaigns")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("fundraiser_id", user!.id);

  revalidatePath(`/dashboard-penggalang/campaign/${id}`);
  revalidatePath("/dashboard-penggalang");
}

export default async function DetailCampaignFundraiserPage({
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
    .eq("fundraiser_id", user!.id) // pastikan cuma pemilik yang bisa lihat
    .single();

  if (!campaign) notFound();

  const { data: donations } = await supabase
    .from("donations")
    .select("donor_name, amount, is_anonymous, payment_status, created_at")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const list = donations ?? [];
  const pendingCount = list.filter((d) => d.payment_status === "pending").length;
  const percent = calcProgressPercent(campaign.collected_amount, campaign.target_amount);
  const canCancel = ["pending_review", "active"].includes(campaign.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link href="/dashboard-penggalang" className="text-sm text-secondary-dark hover:underline">
        ← Kembali ke dashboard
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{campaign.title}</h1>
          <div className="mt-2"><Badge status={campaign.status} /></div>
        </div>
        <Link
          href={`/galang-dana/${campaign.id}/edit`}
          className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Edit Campaign
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-100 p-5 space-y-3">
        <CampaignProgress percent={percent} />
        <div className="flex justify-between text-sm text-slate-600">
          <span>{formatRupiah(campaign.collected_amount)} terkumpul</span>
          <span>Target {formatRupiah(campaign.target_amount)}</span>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          Ada {pendingCount} donasi menunggu verifikasi admin — belum masuk ke total terkumpul.
        </div>
      )}

      {canCancel && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700 mb-3">
            Batalkan campaign ini kalau kebutuhannya sudah tidak ada lagi. Campaign akan ditutup
            dan tidak bisa menerima donasi baru — riwayat donasi yang sudah masuk tetap tersimpan.
          </p>
          <form action={cancelCampaign}>
            <input type="hidden" name="id" value={campaign.id} />
            <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
              Batalkan Campaign
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Riwayat Donasi Masuk</h2>
        {list.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada donasi masuk.</p>
        ) : (
          <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
            {list.map((d, i) => (
              <li key={i} className="flex items-center justify-between p-4 text-sm">
                <span className="font-medium text-slate-700">
                  {d.is_anonymous ? "Orang Baik" : d.donor_name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    {d.payment_status === "pending" ? "Menunggu" : "Lunas"}
                  </span>
                  <span className="font-semibold text-secondary-dark">{formatRupiah(d.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}