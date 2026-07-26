import Link from "next/link";
import {
  CloudRain,
  HeartPulse,
  GraduationCap,
  Users,
  Leaf,
  Accessibility,
  PawPrint,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";
import { CAMPAIGN_CATEGORIES } from "@/lib/constants";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "bencana-alam": CloudRain,
  kesehatan: HeartPulse,
  pendidikan: GraduationCap,
  kemanusiaan: Users,
  lingkungan: Leaf,
  difabel: Accessibility,
  hewan: PawPrint,
};

export function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
      {CAMPAIGN_CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat.slug] ?? Users;
        const isActive = activeSlug === cat.slug;

        return (
          <Link
            key={cat.slug}
            href={`/donasi/kategori/${cat.slug}`}
            className="flex flex-col items-center gap-2 text-center group"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-secondary-light text-secondary-dark group-hover:bg-primary group-hover:text-white"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="text-xs font-medium text-slate-600">{cat.name}</span>
          </Link>
        );
      })}

      <Link href="/donasi/kategori" className="flex flex-col items-center gap-2 text-center group">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
          <Grid3x3 className="h-6 w-6" />
        </span>
        <span className="text-xs font-medium text-slate-600">Lainnya</span>
      </Link>
    </div>
  );
}