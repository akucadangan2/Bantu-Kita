"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/cari?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari campaign donasi..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-secondary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
      >
        Cari
      </button>
    </form>
  );
}