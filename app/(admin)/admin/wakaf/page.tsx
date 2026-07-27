import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, slugify } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { Badge } from "@/components/ui/Badge";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";

async function createWakafProgram(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const slug = `${slugify(title)}-${Date.now().toString(36)}`;

  let coverImageUrl: string | null = null;
  const file = formData.get("cover_image") as File | null;
  if (file && file.size > 0) {
    const path = `wakaf-${slug}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, file);
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
      coverImageUrl = urlData.publicUrl;
    }
  }

  await supabase.from("wakaf_programs").insert({
    title,
    slug,
    description: formData.get("description") as string,
    cover_image_url: coverImageUrl,
    price_per_unit: Number(formData.get("price_per_unit")),
    unit_label: formData.get("unit_label") as string,
    total_units: Number(formData.get("total_units")),
    status: "active",
  });

  revalidatePath("/admin/wakaf");
  revalidatePath("/wakaf");
}

async function deleteWakafProgram(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.from("wakaf_programs").delete().eq("id", id);
  revalidatePath("/admin/wakaf");
  revalidatePath("/wakaf");
}

async function verifyWakaf(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.rpc("verify_wakaf", { transaction_id: id });
  revalidatePath("/admin/wakaf");
}

export default async function AdminWakafPage() {
  const supabase = await createClient();

  const { data: programs } = await supabase
    .from("wakaf_programs")
    .select("id, title, status, price_per_unit, unit_label, total_units, units_taken")
    .order("created_at", { ascending: false });

  const { data: transactions } = await supabase
    .from("wakaf_transactions")
    .select("id, wakif_name, units, amount, payment_status, payment_proof_url, created_at, wakaf_programs(title, unit_label)")
    .order("created_at", { ascending: false });

  const programList = programs ?? [];
  const txList = transactions ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-primary">Kelola Wakaf</h1>
        <p className="mt-1 text-sm text-slate-500">Buat program wakaf & verifikasi transaksi yang masuk.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Buat Program Wakaf Baru</h2>
        <form action={createWakafProgram} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Judul Program</label>
            <input name="title" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Deskripsi</label>
            <textarea name="description" rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Foto Cover (opsional)</label>
            <input
              type="file"
              name="cover_image"
              accept="image/*"
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Harga per Unit (Rp)</label>
              <input type="number" name="price_per_unit" required min={1} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Label Unit</label>
              <input name="unit_label" required defaultValue="m2" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="m2, unit, dst" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Total Unit</label>
              <input type="number" name="total_units" required min={1} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </div>
          </div>
          <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            Buat Program
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Semua Program Wakaf</h2>
        <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {programList.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-400">Belum ada program wakaf.</li>
          )}
          {programList.map((p) => (
            <li key={p.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-700">{p.title}</p>
                  <p className="text-sm text-slate-500">
                    {p.units_taken}/{p.total_units} {p.unit_label} · {formatRupiah(p.price_per_unit)}/{p.unit_label}
                  </p>
                </div>
                <Badge status={p.status} />
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/wakaf/${p.id}/edit`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  Edit
                </Link>
                <form action={deleteWakafProgram}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmSubmitButton
                    confirmText={`Hapus program wakaf "${p.title}"? Transaksi yang terkait juga akan ikut terhapus.`}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                  >
                    Hapus
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Transaksi Wakaf</h2>
        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-4 font-medium">Wakif</th>
                <th className="p-4 font-medium">Program</th>
                <th className="p-4 font-medium">Unit</th>
                <th className="p-4 font-medium">Nominal</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">Belum ada transaksi wakaf.</td>
                </tr>
              )}
              {txList.map((t: any) => (
                <tr key={t.id}>
                  <td className="p-4 font-medium text-slate-700">{t.wakif_name}</td>
                  <td className="p-4 text-slate-600">{t.wakaf_programs?.title ?? "-"}</td>
                  <td className="p-4 text-slate-600">{t.units} {t.wakaf_programs?.unit_label}</td>
                  <td className="p-4 text-slate-600">{formatRupiah(t.amount)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      t.payment_status === "paid" ? "bg-secondary-light text-secondary-dark" : "bg-amber-100 text-amber-700"
                    }`}>
                      {PAYMENT_STATUS_LABEL[t.payment_status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {t.payment_proof_url && (
                        <a href={t.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-secondary-dark hover:underline">
                          Lihat Bukti
                        </a>
                      )}
                      {t.payment_status !== "paid" ? (
                        <form action={verifyWakaf}>
                          <input type="hidden" name="id" value={t.id} />
                          <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary-dark">
                            Verifikasi
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}