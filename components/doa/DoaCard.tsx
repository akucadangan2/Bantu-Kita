"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Heart } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DoaItem {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  amin_count: number;
  already_aminned: boolean;
}

export function DoaCard({ doa, isLoggedIn }: { doa: DoaItem; isLoggedIn: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [aminned, setAminned] = useState(doa.already_aminned);
  const [count, setCount] = useState(doa.amin_count);
  const [loading, setLoading] = useState(false);

  const onAmin = async () => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/doa");
      return;
    }
    if (aminned || loading) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("doa_amins").insert({ doa_id: doa.id, user_id: user!.id });
    setLoading(false);

    if (!error) {
      setAminned(true);
      setCount((c) => c + 1);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-4 space-y-3 h-full flex flex-col">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <User className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-700">{doa.author_name}</p>
          <p className="text-xs text-slate-400">{timeAgo(doa.created_at)}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4 flex-1">{doa.content}</p>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400">{count} orang mengaminkan</p>
        <button
          onClick={onAmin}
          disabled={aminned || loading}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            aminned ? "text-accent" : "text-slate-500 hover:text-accent"
          }`}
        >
          <Heart className="h-4 w-4" fill={aminned ? "currentColor" : "none"} />
          Aamiin
        </button>
      </div>
    </div>
  );
}