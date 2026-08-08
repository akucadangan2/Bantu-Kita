import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";
import { formatRupiah, calcProgressPercent } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

async function approveCampaign(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.from("campaigns").update({ status: "active" }).eq("id", id);
  revalidatePath(`/admin/campaign/${id}`);
  revalidatePath("/admin/campaign");
}

async function rejectCampaign(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.from("campaigns").update({ status: "rejected" }).eq("id", id);
  revalidatePath(`/admin/campaign/${id}`);
  revalidatePath("/admin/campaign");
}

async function toggleUrgent(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("current") as string;
  const supabase = await createClient();
  await supabase.from("campaigns").update({ is_urgent: current !== "true" }).eq("id", id);
  revalidatePath(`/admin/campaign/${id}`);
  revalidatePath("/admin/campaign");
  revalidatePath("/");
}

async function toggleFeatured(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const current = formData.get("current") as string;
  const supabase = await createClient();
  await supabase.from("campaigns").update({ is_featured: current !== "true" }).eq("id", id);
  revalidatePath(`/admin/campaign/${id}`);
  revalidatePath("/admin/campaign");
  revalidatePath("/");
}

async function verifyDonation(formData: FormData) {
  "use server";
  const donationId = formData.get("donationId") as string;
  const campaignId = formData.get("campaignId") as string;
  const supabase = await createClient();
  await supabase.rpc("verify_donation", { donation_id: donationId });
  revalidatePath(`/admin/campaign/${campaignId}`);
}

async function verifyAllDonations(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId") as string;
  const supabase = await createClient();
  await supabase.rpc("verify_all_donations", { p_campaign_id: campaignId });
  revalidatePath(`/admin/campaign/${campaignId}`);
}

async function postUpdate(formData: FormData) {
  "use server";
  const campaignId = formData.get("campaignId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const supabase = await createClient();

  let imageUrl: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const path = `update-${campaignId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, file);
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }
  }

  await supabase.from("campaign_updates").insert({ campaign_id: campaignId, title, content, image_url: imageUrl });
  revalidatePath(`/admin/campaign/${campaignId}`);
}

export default async function AdminCampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; per_page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam, per_page: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = PAGE_SIZE_OPTIONS.includes(Number(perPageParam)) ? Number(perPageParam) : 10;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, campaign_categories(name)")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  const [{ data: donations, count: totalCount }, { count: pendingCount }, { data: updates }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, amount, is_anonymous, payment_status, message, payment_proof_url, created_at", { count: "exact" })
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", id)
      .eq("payment_status", "pending"),
    supabase
      .from("campaign_updates")
      .select("id, title, content, image_url, created_at")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const list = donations ?? [];
  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const percent = calcProgressPercent(campaign.collected_amount, campaign.target_amount);
  const categoryName = (campaign as any).campaign_categories?.name;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link href="/admin/campaign" className="text-sm text-secondary-dark hover:underline">
        ← Kembali ke daftar campaign
      </Link>

      {campaign.cover_image_url ? (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-secondary">
          <img src={campaign.cover_image_url} alt={campaign.title} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      ) : (
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary to-secondary" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{campaign.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge status={campaign.status} />
            {categoryName && <span className="text-xs text-slate-400">{categoryName}</span>}
            {campaign.is_urgent && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-white">Mendesak</span>
            )}
            {campaign.is_featured && (
              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white">Pilihan Bantu Kita</span>
            )}
          </div>
        </div>
        {campaign.status === "active" && (
          <div className="flex gap-2">
            <form action={toggleUrgent}>
              <input type="hidden" name="id" value={campaign.id} />
              <input type="hidden" name="current" value={String(campaign.is_urgent)} />
              <button className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                {campaign.is_urgent ? "Batalkan Mendesak" : "Tandai Mendesak"}
              </button>
            </form>
            <form action={toggleFeatured}>
              <input type="hidden" name="id" value={campaign.id} />
              <input type="hidden" name="current" value={String(campaign.is_featured)} />
              <button className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                {campaign.is_featured ? "Batalkan dari Pilihan" : "Tandai Pilihan Bantu Kita"}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-sm">
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-slate-400">Penerima Manfaat</p>
          <p className="font-medium text-slate-700">{campaign.beneficiary_name || "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-4">
          <p className="text-slate-400">Batas Waktu</p>
          <p className="font-medium text-slate-700">
            {campaign.deadline
              ? new Date(campaign.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
              : "Tidak ada batas waktu"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-800 mb-2">Cerita / Latar Belakang</p>
        <div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-600 whitespace-pre-wrap">
          {campaign.story || "Tidak ada cerita yang diisi."}
        </div>
      </div>

      {campaign.status === "pending_review" && (
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-amber-700 mb-3">
            Campaign ini menunggu verifikasi. Pastikan cerita & data di atas sudah jelas dan valid.
          </p>
          <div className="flex gap-2">
            <form action={approveCampaign}>
              <input type="hidden" name="id" value={campaign.id} />
              <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-dark">
                Setujui Campaign
              </button>
            </form>
            <form action={rejectCampaign}>
              <input type="hidden" name="id" value={campaign.id} />
              <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
                Tolak Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Post Kabar Terbaru</h2>
        <form action={postUpdate} className="space-y-3">
          <input type="hidden" name="campaignId" value={campaign.id} />
          <input
            name="title"
            required
            placeholder="Judul kabar"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Ceritakan perkembangan terbaru..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-primary-dark"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            Kirim Kabar
          </button>
        </form>

        {updates && updates.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {updates.map((u) => (
              <li key={u.id} className="text-sm">
                <p className="font-medium text-slate-700">{u.title}</p>
                <p className="text-xs text-slate-400">
                  {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 p-5 space-y-3">
        <CampaignProgress percent={percent} />
        <div className="flex justify-between text-sm text-slate-600">
          <span>{formatRupiah(campaign.collected_amount)} terkumpul</span>
          <span>Target {formatRupiah(campaign.target_amount)}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Verifikasi Donasi</h2>
          {(pendingCount ?? 0) > 0 && (
            <form action={verifyAllDonations}>
              <input type="hidden" name="campaignId" value={campaign.id} />
              <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary-dark">
                Verifikasi Semua ({pendingCount})
              </button>
            </form>
          )}
        </div>

        {list.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada donasi masuk.</p>
        ) : (
          <>
            <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
              {list.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div className="min-w-0">
                  <p className="font-medium text-slate-700">
                    {d.is_anonymous ? "Orang Baik" : d.donor_name}
                  </p>
                      {d.message && <p className="text-slate-500 truncate">&quot;{d.message}&quot;</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {d.payment_proof_url && (
                      <a
                        href={d.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-secondary-dark hover:underline"
                      >
                        Lihat Bukti
                      </a>
                    )}
                    <span className="font-semibold text-secondary-dark">{formatRupiah(d.amount)}</span>
                    {d.payment_status === "paid" ? (
                      <span className="rounded-full bg-secondary-light px-2.5 py-1 text-xs font-medium text-secondary-dark">
                        Lunas
                      </span>
                    ) : (
                      <form action={verifyDonation}>
                        <input type="hidden" name="donationId" value={d.id} />
                        <input type="hidden" name="campaignId" value={id} />
                        <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary-dark">
                          Verifikasi
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <span>Tampilkan:</span>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <Link
                    key={size}
                    href={`/admin/campaign/${id}?page=1&per_page=${size}`}
                    className={`rounded-lg px-2 py-1 transition-colors ${
                      perPage === size ? "bg-primary text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    {size}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-500">Halaman {page}/{totalPages}</span>
                {page > 1 && (
                  <Link
                    href={`/admin/campaign/${id}?page=${page - 1}&per_page=${perPage}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/campaign/${id}?page=${page + 1}&per_page=${perPage}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    Selanjutnya →
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}