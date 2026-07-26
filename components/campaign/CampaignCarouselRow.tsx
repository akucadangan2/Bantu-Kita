"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CampaignCard } from "./CampaignCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Campaign } from "@/lib/types";

export function CampaignCarouselRow({ campaigns }: { campaigns: Campaign[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (campaigns.length === 0) {
    return <EmptyState message="Belum ada campaign untuk ditampilkan." />;
  }

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-1"
      >
        {campaigns.map((c) => (
          <div key={c.id} className="w-64 sm:w-72 shrink-0 snap-start">
            <CampaignCard campaign={c} />
          </div>
        ))}
      </div>

      {campaigns.length > 2 && (
        <>
          <button
            onClick={() => scrollBy(-300)}
            aria-label="Sebelumnya"
            className="hidden sm:flex absolute -left-4 top-1/3 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <button
            onClick={() => scrollBy(300)}
            aria-label="Selanjutnya"
            className="hidden sm:flex absolute -right-4 top-1/3 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </>
      )}
    </div>
  );
}