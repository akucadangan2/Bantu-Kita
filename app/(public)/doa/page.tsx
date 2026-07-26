import { createClient } from "@/lib/supabase/server";
import { DoaCard } from "@/components/doa/DoaCard";
import { DoaForm } from "@/components/doa/DoaForm";

export const metadata = { title: "Doa-Doa #OrangBaik" };

export default async function DoaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: doaRaw }, { data: myAmins }, { data: myProfile }] = await Promise.all([
    supabase
      .from("doa_posts")
      .select("id, author_name, content, created_at, doa_amins(count)")
      .order("created_at", { ascending: false })
      .limit(50),
    user
      ? supabase.from("doa_amins").select("doa_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { doa_id: string }[] }),
    user ? supabase.from("profiles").select("full_name").eq("id", user.id).single() : Promise.resolve({ data: null }),
  ]);

  const aminnedSet = new Set((myAmins ?? []).map((a: any) => a.doa_id));

  const doaList = (doaRaw ?? []).map((d: any) => ({
    id: d.id,
    author_name: d.author_name,
    content: d.content,
    created_at: d.created_at,
    amin_count: d.doa_amins?.[0]?.count ?? 0,
    already_aminned: aminnedSet.has(d.id),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Doa-Doa #OrangBaik</h1>
        <p className="mt-1 text-sm text-slate-500">Bagikan doa & harapan baikmu, saling aminkan sesama.</p>
      </div>

      <DoaForm isLoggedIn={!!user} defaultName={myProfile?.full_name ?? "Pengguna"} />

      {doaList.length === 0 ? (
        <p className="text-sm text-slate-400">Belum ada doa yang dibagikan.</p>
      ) : (
        <div className="space-y-4">
          {doaList.map((doa) => (
            <DoaCard key={doa.id} doa={doa} isLoggedIn={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}