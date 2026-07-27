import Link from "next/link";
import Image from "next/image";
import { formatRupiah, calcProgressPercent } from "@/lib/utils";

interface WakafProgramSummary {
  slug: string;
  title: string;
  price_per_unit: number;
  unit_label: string;
  total_units: number;
  units_taken: number;
  cover_image_url?: string | null;
}

export function WakafCard({ program }: { program: WakafProgramSummary }) {
  const percent = calcProgressPercent(program.units_taken, program.total_units);
  const sisaUnit = program.total_units - program.units_taken;

  return (
    <Link
      href={`/wakaf/${program.slug}`}
      className="block rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-gradient-to-br from-primary to-secondary">
        {program.cover_image_url && (
          <Image src={program.cover_image_url} alt={program.title} fill className="object-cover" />
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2">{program.title}</h3>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-secondary transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>{formatRupiah(program.price_per_unit)} / {program.unit_label}</span>
          <span>{sisaUnit} {program.unit_label} tersisa</span>
        </div>
      </div>
    </Link>
  );
}