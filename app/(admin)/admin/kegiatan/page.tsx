import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/Badge";

async function createActivity(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-") + "-" + Date.now().toString(36);

  await supabase.from("activities").insert({
    title,
    slug,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    activity_date: formData.get("activity_date") as string,
    quota: Number(formData.get("quota")),
    status: "active",
  });

  revalidatePath("/admin/kegiatan");
}

export default async function AdminKegiatanPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("activities")
    .select("id, title, status, quota, activity_date, activity_participants(count)")
    .order("created_at", { ascending: false });

  const list = (activities ?? []).map((a: any) => ({
    ...a,
    joined_count: a.activity_participants?.[0]?.count ?? 0,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Kelola Kegiatan</h1>
        <p className="mt-1 text-sm text-slate-500">Buat & kelola kegiatan sosial/volunteer.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Buat Kegiatan Baru</h2>
        <form action={createActivity} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Judul</label>
            <input name="title" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Lokasi</label>
              <input name="location" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Tanggal</label>
              <input type="date" name="activity_date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Kuota Peserta</label>
            <input type="number" name="quota" required min={1} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            Buat Kegiatan
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Semua Kegiatan</h2>
        <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {list.length === 0 && <li className="p-6 text-center text-sm text-slate-400">Belum ada kegiatan.</li>}
          {list.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">{a.title}</p>
                <p className="text-slate-500">{a.joined_count}/{a.quota} peserta</p>
              </div>
              <Badge status={a.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}