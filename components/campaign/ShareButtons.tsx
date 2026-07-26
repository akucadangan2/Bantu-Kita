"use client";

import { useState } from "react";
import { Facebook, MessageCircle, Link2, Check } from "lucide-react";

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/donasi/${slug}`;
  const shareText = `Yuk bantu "${title}" — ${url}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Diamkan aja kalau clipboard API gagal (jarang terjadi) — user masih bisa select & copy manual
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2">Bagikan Campaign Ini</p>
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
          aria-label="Bagikan ke WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
        
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
          aria-label="Bagikan ke Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>
        
        <button
          onClick={onCopy}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Salin link"
        >
          {copied ? <Check className="h-5 w-5 text-secondary-dark" /> : <Link2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}