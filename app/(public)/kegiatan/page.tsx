import { createClient } from "@/lib/supabase/server";
import { ActivityCard } from "@/components/kegiatan/ActivityCard";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function KegiatanListPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activities")
    .select("slug, title, location, activity_date, quota, activity_participants(count)")
    .eq("status", "active")
    .order("activity_date", { ascending: true });

  const list = (activities ?? []).map((a: any) => ({
    ...a,
    joined_count: a.activity_participants?.[0]?.count ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Kegiatan Sosial</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ikut kegiatan volunteer & aksi sosial bareng komunitas.
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState message="Belum ada kegiatan yang tersedia." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ActivityCard key={a.slug} activity={a} />
          ))}
        </div>
      )}
    </div>
  );
}