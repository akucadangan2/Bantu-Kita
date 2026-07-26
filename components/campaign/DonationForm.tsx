"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDonationSchema, type CreateDonationInput } from "@/lib/validations/donation";
import { createClient } from "@/lib/supabase/client";
import { MIN_DONATION_AMOUNT } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";

type Step = "form" | "payment" | "submitted";

export function DonationForm({ campaignId }: { campaignId: string }) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>("form");
  const [donationId, setDonationId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateDonationInput>({
    resolver: zodResolver(createDonationSchema),
    defaultValues: { campaignId, donorName: "Hamba Allah", isAnonymous: false },
  });

  const onSubmit = async (data: CreateDonationInput) => {
    setServerError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: inserted, error } = await supabase
      .from("donations")
      .insert({
        campaign_id: data.campaignId,
        donor_id: user?.id ?? null,
        donor_name: data.isAnonymous ? "Hamba Allah" : data.donorName,
        is_anonymous: data.isAnonymous,
        amount: data.amount,
        message: data.message || null,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      setServerError("Gagal menyimpan donasi. Coba lagi.");
      return;
    }

    setDonationId(inserted.id);
    setAmount(data.amount);
    setStep("payment");
  };

  const onUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !donationId) return;

    setUploading(true);
    setServerError(null);

    const path = `${donationId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file);

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      setServerError(`DEBUG: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("donations")
      .update({ payment_proof_url: publicUrlData.publicUrl })
      .eq("id", donationId);

    setUploading(false);

    if (updateError) {
      console.error("UPDATE ERROR:", updateError);
      setServerError(`DEBUG: ${updateError.message}`);
      return;
    }

    setStep("submitted");
  };

  if (step === "submitted") {
    return (
      <div className="rounded-xl bg-secondary-light p-5 text-center">
        <p className="font-semibold text-secondary-dark">Bukti Terkirim!</p>
        <p className="mt-1 text-sm text-slate-600">
          Donasi kamu akan diverifikasi admin setelah bukti transfer dicek. Terima kasih!
        </p>
      </div>
    );
  }

  if (step === "payment" && donationId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-primary-light p-4 text-center">
          <p className="text-sm text-primary">Total transfer</p>
          <p className="text-2xl font-bold text-primary">{formatRupiah(amount)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 p-4 text-center">
          <Image
            src="/images/QRIS.jpg"
            alt="Kode QRIS"
            width={280}
            height={280}
            className="mx-auto rounded-lg"
          />
          <p className="mt-2 text-xs text-slate-500">
            Scan QRIS di atas pakai aplikasi e-wallet atau m-banking kamu.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Upload Bukti Transfer</label>
          <input
            type="file"
            accept="image/*"
            onChange={onUploadProof}
            disabled={uploading}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
          />
          {uploading && <p className="mt-2 text-xs text-slate-400">Mengunggah...</p>}
        </div>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nominal Donasi</label>
        <input
          type="number"
          min={MIN_DONATION_AMOUNT}
          {...register("amount")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          placeholder={`Minimal Rp${MIN_DONATION_AMOUNT.toLocaleString("id-ID")}`}
        />
        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Nama Donatur</label>
        <input {...register("donorName")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
      </div>

      <div>
        <label className="text-sm font-medium">Doa / Dukungan (opsional)</label>
        <textarea {...register("message")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" rows={3} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isAnonymous")} />
        Sembunyikan nama saya (anonim)
      </label>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary text-white py-3 font-semibold hover:bg-primary-dark disabled:opacity-50"
      >
        {isSubmitting ? "Menyimpan..." : "Lanjut ke Pembayaran"}
      </button>
    </form>
  );
}