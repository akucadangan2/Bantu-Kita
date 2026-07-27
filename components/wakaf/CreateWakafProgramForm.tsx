"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWakafProgramSchema, type CreateWakafProgramInput } from "@/lib/validations/wakaf";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export function CreateWakafProgramForm() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWakafProgramInput>({
    resolver: zodResolver(createWakafProgramSchema),
    defaultValues: { unitLabel: "m2" },
  });

  const onSubmit = async (values: CreateWakafProgramInput) => {
    setServerError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setServerError("Sesi login sudah habis, silakan masuk ulang.");
      return;
    }

    const slug = `${slugify(values.title)}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from("wakaf_programs")
      .insert({
        fundraiser_id: user.id,
        title: values.title,
        slug,
        description: values.description,
        price_per_unit: values.pricePerUnit,
        unit_label: values.unitLabel,
        total_units: values.totalUnits,
        status: "pending_review",
      })
      .select("id")
      .single();

    if (error || !data) {
      setServerError("Gagal mengajukan program wakaf. Coba lagi.");
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      setUploadingImage(true);
      const path = `wakaf-${data.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
        await supabase.from("wakaf_programs").update({ cover_image_url: urlData.publicUrl }).eq("id", data.id);
      }
      setUploadingImage(false);
    }

    router.push("/wakaf");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Judul Program</label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="Contoh: Wakaf Tanah untuk Perluasan Masjid Al-Ikhlas"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Foto Cover (opsional)</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Deskripsi</label>
        <textarea
          {...register("description")}
          rows={5}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="Jelaskan tujuan wakaf, lokasi, dan manfaatnya..."
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Harga per Unit (Rp)</label>
          <input
            type="number"
            {...register("pricePerUnit")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          />
          {errors.pricePerUnit && <p className="text-xs text-red-500 mt-1">{errors.pricePerUnit.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Label Unit</label>
          <input
            {...register("unitLabel")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            placeholder="m2, unit, dst"
          />
          {errors.unitLabel && <p className="text-xs text-red-500 mt-1">{errors.unitLabel.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Total Unit</label>
          <input
            type="number"
            {...register("totalUnits")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          />
          {errors.totalUnits && <p className="text-xs text-red-500 mt-1">{errors.totalUnits.message}</p>}
        </div>
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="rounded-xl bg-primary-light p-4 text-sm text-primary">
        Program akan direview admin dulu sebelum tayang publik (status: <b>Menunggu Verifikasi</b>).
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploadingImage}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors sm:w-auto sm:px-8"
      >
        {uploadingImage ? "Mengunggah foto..." : isSubmitting ? "Menyimpan..." : "Ajukan Program Wakaf"}
      </button>
    </form>
  );
}