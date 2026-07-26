"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCampaignSchema, type CreateCampaignInput } from "@/lib/validations/campaign";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

export function CreateCampaignForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
  });

  const onSubmit = async (values: CreateCampaignInput) => {
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
      .from("campaigns")
      .insert({
        fundraiser_id: user.id,
        category_id: values.categoryId,
        type: "donasi",
        title: values.title,
        slug,
        story: values.story,
        target_amount: values.targetAmount,
        deadline: values.deadline || null,
        beneficiary_name: values.beneficiaryName,
        status: "pending_review",
      })
      .select("id")
      .single();

    if (error || !data) {
      setServerError("Gagal membuat campaign. Coba lagi.");
      return;
    }

    // Upload cover image kalau ada file dipilih — dilakuin setelah campaign
    // tersimpan, jadi kalau upload gagal, campaign tetap kebuat (nggak blocking).
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      setUploadingImage(true);
      const path = `${data.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
        await supabase.from("campaigns").update({ cover_image_url: urlData.publicUrl }).eq("id", data.id);
      }
      setUploadingImage(false);
    }

    router.push(`/dashboard-penggalang/campaign/${data.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Judul Campaign</label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="Contoh: Bantu Biaya Pengobatan Adik Nabila"
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
        <label className="text-sm font-medium text-slate-700">Kategori</label>
        <select
          {...register("categoryId")}
          defaultValue=""
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        >
          <option value="" disabled>Pilih kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Nama Penerima Manfaat</label>
        <input
          {...register("beneficiaryName")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="Siapa yang akan dibantu?"
        />
        {errors.beneficiaryName && <p className="text-xs text-red-500 mt-1">{errors.beneficiaryName.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Cerita / Latar Belakang</label>
        <textarea
          {...register("story")}
          rows={6}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="Ceritakan kondisi & kebutuhan secara jelas..."
        />
        {errors.story && <p className="text-xs text-red-500 mt-1">{errors.story.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Target Donasi (Rp)</label>
          <input
            type="number"
            {...register("targetAmount")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            placeholder="10000000"
          />
          {errors.targetAmount && <p className="text-xs text-red-500 mt-1">{errors.targetAmount.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Batas Waktu (opsional)</label>
          <input
            type="date"
            {...register("deadline")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          />
        </div>
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="rounded-xl bg-primary-light p-4 text-sm text-primary">
        Campaign akan direview admin dulu sebelum tayang publik (status: <b>Menunggu Verifikasi</b>).
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploadingImage}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors sm:w-auto sm:px-8"
      >
        {uploadingImage ? "Mengunggah foto..." : isSubmitting ? "Menyimpan..." : "Ajukan Campaign"}
      </button>
    </form>
  );
}