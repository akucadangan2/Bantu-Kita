import { createClient } from "@/lib/supabase/server";
import { WakafCard } from "@/components/wakaf/WakafCard";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function WakafListPage() {
  const supabase = await createClient();
  const { data: programs } = await supabase
    .from("wakaf_programs")
    .select("slug, title, price_per_unit, unit_label, total_units, units_taken, cover_image_url")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const list = programs ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Program Wakaf</h1>
        <p className="mt-1 text-sm text-slate-500">
          Wakaf tunai untuk pembangunan fasilitas umat — mulai dari nominal kecil per unit.
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState message="Belum ada program wakaf aktif." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <WakafCard key={p.slug} program={p} />
          ))}
        </div>
      )}
    </div>
  );
}