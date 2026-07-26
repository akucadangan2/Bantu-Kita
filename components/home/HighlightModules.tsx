import Link from "next/link";
import { HandCoins, Landmark, CalendarHeart, type LucideIcon } from "lucide-react";

interface ModuleItem {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "primary" | "secondary" | "accent";
}

const MODULES: ModuleItem[] = [
  {
    href: "/zakat",
    icon: HandCoins,
    title: "Zakat",
    description:
      "Tunaikan zakat maal, fitrah, atau penghasilan. Kalkulator otomatis bantu hitung nisabnya.",
    accent: "primary",
  },
  {
    href: "/wakaf",
    icon: Landmark,
    title: "Wakaf",
    description:
      "Wakaf tunai untuk pembangunan masjid, sumur, dan fasilitas umat — mulai dari nominal kecil.",
    accent: "secondary",
  },
  {
    href: "/kegiatan",
    icon: CalendarHeart,
    title: "Kegiatan",
    description:
      "Ikut kegiatan sosial & volunteer bareng komunitas — bukan cuma donasi, tapi turun langsung.",
    accent: "accent",
  },
];

const ACCENT_STYLES: Record<ModuleItem["accent"], string> = {
  primary: "bg-primary-light text-primary",
  secondary: "bg-secondary-light text-secondary-dark",
  accent: "bg-accent-light text-accent",
};

export function HighlightModules() {
  return (
    <>
      {MODULES.map(({ href, icon: Icon, title, description, accent }) => (
        <Link
          key={href}
          href={href}
          className="group rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <span
            className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${ACCENT_STYLES[accent]}`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-semibold text-slate-800 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </Link>
      ))}
    </>
  );
}