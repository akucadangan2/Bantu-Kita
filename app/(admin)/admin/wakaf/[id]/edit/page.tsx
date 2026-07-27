import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function updateWakafProgram(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price_per_unit: Number(formData.get("price_per_unit")),
    unit_label: formData.get("unit_label") as string,
    total_units: Number(formData.get("total_units")),
  };

  const file = formData.get("cover_image") as File | null;
  if (file && file.size > 0) {
    const path = `wakaf-${id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, file);
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
      updateData.cover_image_url = urlData.publicUrl;
    }
  }

  await supabase.from("wakaf_programs").update(updateData).eq("id", id);
  revalidatePath("/admin/wakaf");
  revalidatePath("/wakaf");
  redirect("/admin/wakaf");
}

export default async function EditWakafProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: program } = await supabase.from("wakaf_programs").select("*").eq("id", id).single();
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Edit Program Wakaf</h1>
      <form action={updateWakafProgram} className="space-y-4">
        <input type="hidden" name="id" value={program.id} />

        <div>
          <label className="text-sm font-medium text-slate-700">Judul Program</label>
          <input name="title" required defaultValue={program.title} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Deskripsi</label>
          <textarea name="description" rows={4} defaultValue={program.description ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Ganti Foto Cover (opsional)</label>
          <input
            type="file"
            name="cover_image"
            accept="image/*"
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
          />
          {program.cover_image_url && <p className="mt-1 text-xs text-slate-400">Kosongkan kalau nggak mau ganti foto lama.</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Harga per Unit (Rp)</label>
            <input type="number" name="price_per_unit" required defaultValue={program.price_per_unit} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Label Unit</label>
            <input name="unit_label" required defaultValue={program.unit_label} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Total Unit</label>
            <input type="number" name="total_units" required defaultValue={program.total_units} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </div>
        </div>

        <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}