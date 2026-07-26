"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DoaForm({ isLoggedIn, defaultName }: { isLoggedIn: boolean; defaultName: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isLoggedIn) {
      router.push("/login?redirect=/doa");
      return;
    }

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("doa_posts").insert({
      user_id: user!.id,
      author_name: isAnonymous ? "Orang Baik" : defaultName,
      content: content.trim(),
    });

    setSubmitting(false);

    if (insertError) {
      setError("Gagal mengirim doa. Coba lagi.");
      return;
    }

    setContent("");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-100 p-4 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Bagikan doa atau harapan baikmu..."
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Kirim sebagai Orang Baik (anonim)
        </label>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Bagikan Doa"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!isLoggedIn && (
        <p className="text-xs text-slate-400">
          <a href="/login?redirect=/doa" className="text-secondary-dark hover:underline">Masuk</a> dulu buat berbagi doa.
        </p>
      )}
    </form>
  );
}