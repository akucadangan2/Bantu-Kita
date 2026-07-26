"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCampaignSchema, type CreateCampaignInput } from "@/lib/validations/campaign";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/lib/types";

interface Category {
  id: string;
  name: string;
}

export function EditCampaignForm({
  campaign,
  categories,
}: {
  campaign: Campaign;
  categories: Category[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: campaign.title,
      categoryId: campaign.category_id ?? "",
      story: campaign.story ?? "",
      targetAmount: campaign.target_amount,
      deadline: campaign.deadline ?? "",
      beneficiaryName: campaign.beneficiary_name ?? "",
    },
  });

  const wasRejected = campaign.status === "rejected";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const onSubmit = async (values: CreateCampaignInput) => {
    setServerError(null);

    const { error } = await supabase
      .from("campaigns")
      .update({
        title: values.title,
        category_id: values.categoryId,
        story: values.story,
        target_amount: values.targetAmount,
        deadline: values.deadline || null,
        beneficiary_name: values.beneficiaryName,
        // Kalau sebelumnya ditolak, edit dianggap pengajuan ulang -> perlu direview lagi.
        // Status lain (draft/pending_review/active/completed) dibiarkan apa adanya.
        ...(wasRejected ? { status: "pending_review" } : {}),
      })
      .eq("id", campaign.id);

    if (error) {
      setServerError("Gagal menyimpan perubahan. Coba lagi.");
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      setUploadingImage(true);
      const path = `${campaign.id}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("campaign-images").upload(path, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("campaign-images").getPublicUrl(path);
        await supabase.from("campaigns").update({ cover_image_url: urlData.publicUrl }).eq("id", campaign.id);
      }
      setUploadingImage(false);
    }

    router.push(`/dashboard-penggalang/campaign/${campaign.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {wasRejected && (
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          Campaign ini sebelumnya <b>ditolak</b>. Setelah disimpan, campaign akan otomatis
          diajukan ulang untuk direview admin.
        </div>
      )}

      {/* UPDATE 1: Input file untuk foto cover (opsional) */}
      <div>
        <label className="text-sm font-medium text-slate-700">Ganti Foto Cover (opsional)</label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
        />
        {campaign.cover_image_url && <p className="mt-1 text-xs text-slate-400">Kosongkan kalau nggak mau ganti foto lama.</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Judul Campaign</label>
        <input
          {...register("title")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Kategori</label>
        <select
          {...register("categoryId")}
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
        />
        {errors.beneficiaryName && <p className="text-xs text-red-500 mt-1">{errors.beneficiaryName.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Cerita / Latar Belakang</label>
        <textarea
          {...register("story")}
          rows={6}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
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

      {/* UPDATE 2: Modifikasi kondisi disabled dan teks pada button submit */}
      <button
        type="submit"
        disabled={isSubmitting || uploadingImage}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors sm:w-auto sm:px-8"
      >
        {uploadingImage ? "Mengunggah foto..." : isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}