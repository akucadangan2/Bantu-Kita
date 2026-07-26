"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CommentItem {
  id: string;
  content: string;
  author_name: string;
}

export function CommentSection({
  campaignId,
  comments,
  isLoggedIn,
}: {
  campaignId: string;
  comments: CommentItem[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("campaign_comments").insert({
      campaign_id: campaignId,
      user_id: user!.id,
      content: content.trim(),
    });

    setSubmitting(false);

    if (insertError) {
      setError("Gagal mengirim komentar. Coba lagi.");
      return;
    }

    setContent("");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {isLoggedIn ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Tulis dukungan atau komentar..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={onSubmit}
            disabled={submitting || !content.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Mengirim..." : "Kirim Komentar"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          <a href="/login" className="text-secondary-dark hover:underline">Masuk</a> dulu buat kasih komentar.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-slate-400">Belum ada komentar.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border-b border-slate-100 pb-3 text-sm">
              <p className="font-medium text-slate-700">{c.author_name}</p>
              <p className="mt-0.5 text-slate-600">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}