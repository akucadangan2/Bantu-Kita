import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  CloudRain,
  HeartPulse,
  GraduationCap,
  Users,
  Leaf,
  Accessibility,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "bencana-alam": CloudRain,
  kesehatan: HeartPulse,
  pendidikan: GraduationCap,
  kemanusiaan: Users,
  lingkungan: Leaf,
  difabel: Accessibility,
  hewan: PawPrint,
};

export default async function DonasiSemuaKategoriPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("campaign_categories")
    .select("slug, name")
    .eq("type", "donasi")
    .order("name");

  const list = categories ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Semua Kategori</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.slug] ?? Users;
          return (
            <Link
              key={cat.slug}
              href={`/donasi/kategori/${cat.slug}`}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:border-primary transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-light text-secondary-dark">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-slate-700">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}