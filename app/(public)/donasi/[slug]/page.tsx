import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";
import { DonationForm } from "@/components/campaign/DonationForm";
import { ShareButtons } from "@/components/campaign/ShareButtons";
import { UpdateFeed } from "@/components/campaign/UpdateFeed";
import { CommentSection } from "@/components/campaign/CommentSection";
import { CampaignQuickMenu } from "@/components/campaign/CampaignQuickMenu";
import { formatRupiah, calcProgressPercent, daysLeft } from "@/lib/utils";

export default async function DonasiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase.from("campaigns").select("*").eq("slug", slug).single();
  if (!campaign) notFound();

  const [
    { data: donors },
    { count: totalDonorCount },
    { data: updates },
    { data: rawComments },
    { data: disbursements },
    {
      data: { user: currentUser },
    },
  ] = await Promise.all([
    supabase
      .from("donations")
      .select("donor_name, amount, message, is_anonymous, created_at")
      .eq("campaign_id", campaign.id)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false }),
    supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("payment_status", "paid"),
    supabase
      .from("campaign_updates")
      .select("id, title, content, created_at")
      .eq("campaign_id", campaign.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("campaign_comments")
      .select("id, content, profiles(full_name)")
      .eq("campaign_id", campaign.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("public_campaign_disbursements")
      .select("id, amount, processed_at")
      .eq("campaign_id", campaign.id)
      .order("processed_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const comments = (rawComments ?? []).map((c: any) => ({
    id: c.id,
    content: c.content,
    author_name: c.profiles?.full_name ?? "Pengguna",
  }));

  const percent = calcProgressPercent(campaign.collected_amount, campaign.target_amount);
  const sisaHari = daysLeft(campaign.deadline);
  const disbursementList = disbursements ?? [];
  const donorList = donors ?? [];
  const totalDisbursed = disbursementList.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-secondary">
          {campaign.cover_image_url && (
            <Image src={campaign.cover_image_url} alt={campaign.title} fill className="object-cover" />
          )}
        </div>

        <div>
          {campaign.is_urgent && (
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white mb-3">
              Mendesak
            </span>
          )}
          <h1 className="text-2xl font-bold text-slate-800">{campaign.title}</h1>
          {campaign.beneficiary_name && (
            <p className="mt-1 text-sm text-slate-500">
              Untuk: <span className="font-medium">{campaign.beneficiary_name}</span>
            </p>
          )}
        </div>

        <ShareButtons title={campaign.title} slug={campaign.slug} />

        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-600">
          {campaign.story}
        </div>

        <CampaignQuickMenu
          items={[
            {
              id: "kabar",
              label: "Kabar Terbaru",
              count: updates?.length ?? 0,
              subtitle: updates?.[0]
                ? `Terakhir update • ${new Date(updates[0].created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                : undefined,
            },
            {
              id: "pencairan",
              label: "Pencairan Dana",
              count: disbursementList.length,
              subtitle: disbursementList[0]?.processed_at
                ? `Terakhir pencairan dana • ${new Date(disbursementList[0].processed_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                : undefined,
            },
            { id: "donatur", label: "Donatur", count: totalDonorCount ?? 0 },
          ]}
        >
          <UpdateFeed updates={updates ?? []} />

          {disbursementList.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada dana yang dicairkan.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Total {formatRupiah(totalDisbursed)} sudah dicairkan ke penggalang dana.
              </p>
              <ul className="space-y-2">
                {disbursementList.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {d.processed_at
                        ? new Date(d.processed_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                        : "-"}
                    </span>
                    <span className="font-semibold text-secondary-dark">{formatRupiah(d.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {donorList.length === 0 ? (
            <p className="text-sm text-slate-400">Belum ada donatur terverifikasi.</p>
          ) : (
            <ul className="space-y-3">
              {donorList.map((d, i) => (
                <li key={i} className="flex justify-between text-sm border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-700">{d.is_anonymous ? "Orang Baik" : d.donor_name}</p>
                    {d.message && <p className="text-slate-500 mt-0.5">&quot;{d.message}&quot;</p>}
                  </div>
                  <span className="font-semibold text-secondary-dark whitespace-nowrap">{formatRupiah(d.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CampaignQuickMenu>

        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Komentar & Dukungan</h2>
          <CommentSection campaignId={campaign.id} comments={comments} isLoggedIn={!!currentUser} />
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="sticky top-20 rounded-2xl border border-slate-100 p-5 space-y-4">
          <CampaignProgress percent={percent} />
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-bold text-primary">{formatRupiah(campaign.collected_amount)}</p>
              <p className="text-slate-500">terkumpul dari {formatRupiah(campaign.target_amount)}</p>
            </div>
            {sisaHari !== null && (
              <div className="text-right">
                <p className="font-bold text-primary">{sisaHari}</p>
                <p className="text-slate-500">hari lagi</p>
              </div>
            )}
          </div>
          <hr className="border-slate-100" />
          <DonationForm campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
}