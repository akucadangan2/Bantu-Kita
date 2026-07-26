"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DoaCard } from "./DoaCard";

interface DoaItem {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  amin_count: number;
  already_aminned: boolean;
}

export function DoaCarouselRow({ doaList, isLoggedIn }: { doaList: DoaItem[]; isLoggedIn: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (amount: number) => scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });

  if (doaList.length === 0) {
    return <p className="text-sm text-slate-400">Belum ada doa yang dibagikan.</p>;
  }

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-1"
      >
        {doaList.map((doa) => (
          <div key={doa.id} className="w-72 sm:w-80 shrink-0 snap-start">
            <DoaCard doa={doa} isLoggedIn={isLoggedIn} />
          </div>
        ))}
      </div>

      {doaList.length > 2 && (
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