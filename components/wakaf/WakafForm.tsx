"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";

interface WakafProgramDetail {
  id: string;
  price_per_unit: number;
  unit_label: string;
  total_units: number;
  units_taken: number;
}

type Step = "form" | "payment" | "submitted";

export function WakafForm({ program }: { program: WakafProgramDetail }) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>("form");
  const [units, setUnits] = useState("1");
  const [wakifName, setWakifName] = useState("Hamba Allah");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const sisaUnit = program.total_units - program.units_taken;
  const unitsNum = Number(units) || 0;
  const total = unitsNum * program.price_per_unit;
  const isValid = unitsNum > 0 && unitsNum <= sisaUnit;

  const onSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setServerError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: inserted, error } = await supabase
      .from("wakaf_transactions")
      .insert({
        program_id: program.id,
        user_id: user?.id ?? null,
        wakif_name: wakifName || "Hamba Allah",
        units: unitsNum,
        amount: total,
        payment_status: "pending",
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error || !inserted) {
      setServerError("Gagal menyimpan transaksi wakaf. Coba lagi.");
      return;
    }

    setTransactionId(inserted.id);
    setStep("payment");
  };

  const onUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !transactionId) return;

    setUploading(true);
    setServerError(null);

    const path = `wakaf-${transactionId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file);

    if (uploadError) {
      setServerError("Gagal upload bukti pembayaran. Coba lagi.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("wakaf_transactions")
      .update({ payment_proof_url: publicUrlData.publicUrl })
      .eq("id", transactionId);

    setUploading(false);

    if (updateError) {
      setServerError("Bukti terupload tapi gagal disimpan. Hubungi admin.");
      return;
    }

    setStep("submitted");
  };

  if (step === "submitted") {
    return (
      <div className="rounded-xl bg-secondary-light p-5 text-center">
        <p className="font-semibold text-secondary-dark">Bukti Terkirim!</p>
        <p className="mt-1 text-sm text-slate-600">
          Wakaf kamu akan diverifikasi admin setelah bukti transfer dicek. Jazakallah khair.
        </p>
      </div>
    );
  }

  if (step === "payment" && transactionId) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-primary-light p-4 text-center">
          <p className="text-sm text-primary">Total wakaf</p>
          <p className="text-2xl font-bold text-primary">{formatRupiah(total)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 p-4 text-center">
          <Image src="/images/QRIS.jpg" alt="Kode QRIS" width={280} height={280} className="mx-auto rounded-lg" />
          <p className="mt-2 text-xs text-slate-500">Scan QRIS di atas pakai aplikasi e-wallet atau m-banking kamu.</p>
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
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">
          Jumlah {program.unit_label} (tersisa {sisaUnit})
        </label>
        <input
          type="number"
          min={1}
          max={sisaUnit}
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
        {!isValid && unitsNum > 0 && (
          <p className="text-xs text-red-500 mt-1">Melebihi sisa {program.unit_label} yang tersedia.</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Nama Wakif</label>
        <input
          value={wakifName}
          onChange={(e) => setWakifName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
      </div>

      <div className="rounded-xl bg-primary-light p-4 text-center">
        <p className="text-sm text-primary">Total Wakaf</p>
        <p className="text-2xl font-bold text-primary">{formatRupiah(total)}</p>
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <button
        onClick={onSubmit}
        disabled={submitting || !isValid}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {submitting ? "Memproses..." : "Wakaf Sekarang"}
      </button>
    </div>
  );
}