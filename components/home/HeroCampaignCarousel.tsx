"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignProgress } from "@/components/campaign/CampaignProgress";
import { formatRupiah, calcProgressPercent, daysLeft } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

export function HeroCampaignCarousel({ campaigns }: { campaigns: Campaign[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = campaigns.length > 1;

  // Auto-geser tiap 5 detik kalau campaign mendesaknya lebih dari 1
  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % campaigns.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hasMultiple, campaigns.length]);

  const goTo = (i: number) => setIndex((i + campaigns.length) % campaigns.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goTo(index - 1) : goTo(index + 1);
    }
    touchStartX.current = null;
  };

  // Fallback: belum ada campaign mendesak sama sekali
  if (campaigns.length === 0) {
    return (
      <div className="relative mx-auto w-full max-w-sm md:ml-auto">
        <Link href="/donasi" className="sm:rotate-2 block rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:shadow-xl shadow-primary/5">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary">
            <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
              Mendesak
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <p className="font-semibold text-slate-800 line-clamp-2">Bantu Biaya Pengobatan Adik Nabila</p>
            <CampaignProgress percent={68} />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatRupiah(34_000_000)} terkumpul</span>
              <span>12 hari lagi</span>
            </div>
          </div>
        </Link>
        <div className="absolute -bottom-6 -left-6 -z-10 hidden -rotate-3 rounded-2xl bg-secondary-light p-4 sm:block">
          <p className="text-xs font-medium text-secondary-dark">Contoh tampilan campaign</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-sm md:ml-auto">
      <div
        className="sm:rotate-2 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:shadow-xl shadow-primary/5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {campaigns.map((c) => {
            const percent = calcProgressPercent(c.collected_amount, c.target_amount);
            const sisaHari = daysLeft(c.deadline);
            return (
              <Link key={c.id} href={`/donasi/${c.slug}`} className="w-full shrink-0">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-primary to-secondary">
                  {c.cover_image_url && (
                    <Image src={c.cover_image_url} alt={c.title} fill className="object-cover" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
                    Mendesak
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-slate-800 line-clamp-2">{c.title}</p>
                  <CampaignProgress percent={percent} />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{formatRupiah(c.collected_amount)} terkumpul</span>
                    {sisaHari !== null && <span>{sisaHari} hari lagi</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Sebelumnya"
            className="absolute left-1 top-[35%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Selanjutnya"
            className="absolute right-1 top-[35%] -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {campaigns.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ke campaign ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-primary" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}