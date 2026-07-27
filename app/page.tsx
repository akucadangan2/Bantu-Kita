import Link from "next/link";
import { CampaignGrid } from "@/components/campaign/CampaignGrid";
import { CampaignCarouselRow } from "@/components/campaign/CampaignCarouselRow";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import { Hero } from "@/components/home/Hero";
import { HighlightModules } from "@/components/home/HighlightModules";
import { ActivityCard } from "@/components/kegiatan/ActivityCard";
import { DoaCarouselRow } from "@/components/doa/DoaCarouselRow";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: urgentCampaigns },
    { data: featuredCampaigns },
    { data: activitiesRaw },
    { data: doaRaw },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .eq("is_urgent", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("activities")
      .select("slug, title, location, activity_date, quota, activity_participants(count)")
      .eq("status", "active")
      .order("activity_date", { ascending: true })
      .limit(3),
    supabase
      .from("doa_posts")
      .select("id, author_name, content, created_at, doa_amins(count)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: myAmins } = currentUser
    ? await supabase.from("doa_amins").select("doa_id").eq("user_id", currentUser.id)
    : { data: [] as { doa_id: string }[] };

  const aminnedSet = new Set((myAmins ?? []).map((a: any) => a.doa_id));

  const doaList = (doaRaw ?? []).map((d: any) => ({
    id: d.id,
    author_name: d.author_name,
    content: d.content,
    created_at: d.created_at,
    amin_count: d.doa_amins?.[0]?.count ?? 0,
    already_aminned: aminnedSet.has(d.id),
  }));

  const activities = (activitiesRaw ?? []).map((a: any) => ({
    ...a,
    joined_count: a.activity_participants?.[0]?.count ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <Hero urgentCampaigns={urgentCampaigns ?? []} />

      <section aria-label="kategori">
        <CategoryFilter />
      </section>

      <section aria-label="campaign-mendesak">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Butuh Bantuan Segera</h2>
          <Link href="/donasi?filter=mendesak" className="text-sm font-medium text-secondary-dark hover:underline">
            Lihat Semua
          </Link>
        </div>
        <CampaignGrid campaigns={urgentCampaigns ?? []} />
      </section>

      <section aria-label="highlight-modul" className="grid gap-4 sm:grid-cols-3">
        <HighlightModules />
      </section>

      <section aria-label="pilihan-bantu-kita">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pilihan Bantu Kita</h2>
          <Link href="/donasi?filter=pilihan" className="text-sm font-medium text-secondary-dark hover:underline">
            Lihat Semua
          </Link>
        </div>
        <CampaignCarouselRow campaigns={featuredCampaigns ?? []} />
      </section>

      <section aria-label="kegiatan-terbaru">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Kegiatan Terbaru</h2>
          <Link href="/kegiatan" className="text-sm font-medium text-secondary-dark hover:underline">
            Lihat Semua
          </Link>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada kegiatan yang tersedia.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {activities.map((a) => (
              <ActivityCard key={a.slug} activity={a} />
            ))}
          </div>
        )}
      </section>

      <section aria-label="doa-orang-baik">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Doa-Doa #OrangBaik</h2>
          <Link href="/doa" className="text-sm font-medium text-secondary-dark hover:underline">
            Lihat Semua
          </Link>
        </div>
        <DoaCarouselRow doaList={doaList} isLoggedIn={!!currentUser} />
      </section>
    </div>
  );
}