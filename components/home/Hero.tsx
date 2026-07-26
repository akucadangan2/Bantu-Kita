import Link from "next/link";
import { HeartHandshake, ShieldCheck, Zap } from "lucide-react";
import { APP_TAGLINE } from "@/lib/constants";
import { HeroCampaignCarousel } from "./HeroCampaignCarousel";
import type { Campaign } from "@/lib/types";

const VALUE_PROPS = [
  { icon: ShieldCheck, label: "Campaign terverifikasi admin" },
  { icon: Zap, label: "Dana cair cepat ke penggalang" },
  { icon: HeartHandshake, label: "100% transparan ke donatur" },
];

export function Hero({ urgentCampaigns }: { urgentCampaigns: Campaign[] }) {
  return (
    <section aria-label="hero" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-10 -right-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative grid gap-8 py-6 md:py-16 md:grid-cols-2 md:items-center md:gap-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-light px-4 py-1.5 text-xs font-semibold text-secondary-dark">
            Donasi · Zakat · Wakaf · Kegiatan
          </span>

          <h1 className="mt-4 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-primary leading-tight">
            Uluran Tangan Kecil,{" "}
            <span className="text-secondary">Bisa Jadi Harapan Besar</span>
          </h1>

          <p className="mt-3 text-slate-600 text-sm sm:text-lg max-w-md">
            {APP_TAGLINE}. Mulai dari donasi, zakat, wakaf, hingga kegiatan sosial
            bersama komunitas — semua dalam satu tempat yang bisa dipercaya.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/donasi"
              className="rounded-xl bg-primary px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              Mulai Berdonasi
            </Link>
            <Link
              href="/galang-dana"
              className="rounded-xl border border-primary/20 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-primary hover:bg-primary-light transition-colors"
            >
              Galang Dana Sekarang
            </Link>
          </div>

          <ul className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
            {VALUE_PROPS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-slate-600">
                <Icon className="h-4 w-4 text-secondary-dark shrink-0" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <HeroCampaignCarousel campaigns={urgentCampaigns} />
      </div>
    </section>
  );
}