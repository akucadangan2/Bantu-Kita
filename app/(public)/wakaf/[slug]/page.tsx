import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WakafForm } from "@/components/wakaf/WakafForm";
import { formatRupiah, calcProgressPercent } from "@/lib/utils";

export default async function WakafDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("wakaf_programs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!program) notFound();

  const percent = calcProgressPercent(program.units_taken, program.total_units);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary to-secondary" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{program.title}</h1>
        </div>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-600">
          {program.description}
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="sticky top-20 rounded-2xl border border-slate-100 p-5 space-y-4">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-secondary transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-bold text-primary">{program.units_taken} {program.unit_label}</p>
              <p className="text-slate-500">dari {program.total_units} {program.unit_label}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatRupiah(program.price_per_unit)}</p>
              <p className="text-slate-500">per {program.unit_label}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          <WakafForm program={program} />
        </div>
      </div>
    </div>
  );
}