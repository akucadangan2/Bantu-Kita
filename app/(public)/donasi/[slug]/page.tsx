import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/campaign/ShareButtons"; // <-- Tambahan import
import { createClient } from "@/lib/supabase/server";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";
import { DonationForm } from "@/components/campaign/DonationForm";
import { formatRupiah, calcProgressPercent, daysLeft } from "@/lib/utils";
import Image from "next/image";
import { UpdateFeed } from "@/components/campaign/UpdateFeed";
import { CommentSection } from "@/components/campaign/CommentSection";

export default async function DonasiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!campaign) notFound();

  const { data: donors } = await supabase
    .from("donations")
    .select("donor_name, amount, message, is_anonymous, created_at")
    .eq("campaign_id", campaign.id)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: updates } = await supabase
    .from("campaign_updates")
    .select("id, title, content, created_at")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const { data: rawComments } = await supabase
    .from("campaign_comments")
    .select("id, content, profiles(full_name)")
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  const comments = (rawComments ?? []).map((c: any) => ({
    id: c.id,
    content: c.content,
    author_name: c.profiles?.full_name ?? "Pengguna",
  }));

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const percent = calcProgressPercent(campaign.collected_amount, campaign.target_amount);
  const sisaHari = daysLeft(campaign.deadline);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-3">
      {/* Kolom utama */}
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

        {/* --- TAMBAHAN TOMBOL SHARE --- */}
        <ShareButtons title={campaign.title} slug={campaign.slug} />
        {/* ----------------------------- */}

        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-600">
          {campaign.story}
        </div>

        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Donatur Terbaru</h2>
          {donors && donors.length > 0 ? (
            <ul className="space-y-3">
              {donors.map((d, i) => (
                <li key={i} className="flex justify-between text-sm border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-medium text-slate-700">
                      {d.is_anonymous ? "Hamba Allah" : d.donor_name}
                    </p>
                    {d.message && <p className="text-slate-500 mt-0.5">&quot;{d.message}&quot;</p>}
                  </div>
                  <span className="font-semibold text-secondary-dark whitespace-nowrap">
                    {formatRupiah(d.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Belum ada donatur terverifikasi.</p>
          )}
        </div>

        {/* --- TAMBAHAN KABAR TERBARU & KOMENTAR --- */}
        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Kabar Terbaru</h2>
          <UpdateFeed updates={updates ?? []} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-800 mb-3">Komentar & Dukungan</h2>
          <CommentSection campaignId={campaign.id} comments={comments} isLoggedIn={!!currentUser} />
        </div>
        {/* ------------------------------------------- */}
      </div>

      {/* Sidebar donasi */}
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