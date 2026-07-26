"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";
import {
  ZAKAT_NISAB_EMAS_GRAM,
  ZAKAT_RATE,
  GOLD_PRICE_PER_GRAM_ESTIMATE,
  ZAKAT_FITRAH_PRICE_PER_JIWA_ESTIMATE,
} from "@/lib/constants";

interface ZakatType {
  id: string;
  name: string;
  slug: string;
}

type Step = "calc" | "payment" | "submitted";

export function ZakatCalculator({ zakatTypes }: { zakatTypes: ZakatType[] }) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>("calc");
  const [slug, setSlug] = useState(zakatTypes[0]?.slug ?? "maal");

  const [harta, setHarta] = useState("");
  const [hutang, setHutang] = useState("");
  const [hargaEmas, setHargaEmas] = useState(String(GOLD_PRICE_PER_GRAM_ESTIMATE));

  const [penghasilan, setPenghasilan] = useState("");

  const [jiwa, setJiwa] = useState("1");
  const [hargaFitrah, setHargaFitrah] = useState(String(ZAKAT_FITRAH_PRICE_PER_JIWA_ESTIMATE));

  const [muzakkiName, setMuzakkiName] = useState("Hamba Allah");
  const [zakatTransactionId, setZakatTransactionId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const nisab = ZAKAT_NISAB_EMAS_GRAM * (Number(hargaEmas) || 0);
  const hartaBersih = (Number(harta) || 0) - (Number(hutang) || 0);
  const wajibMaal = hartaBersih >= nisab && hartaBersih > 0;
  const zakatMaal = wajibMaal ? hartaBersih * ZAKAT_RATE : 0;
  const zakatPenghasilan = (Number(penghasilan) || 0) * ZAKAT_RATE;
  const zakatFitrah = (Number(jiwa) || 0) * (Number(hargaFitrah) || 0);

  let hasil = 0;
  if (slug === "maal" || slug === "perdagangan") hasil = zakatMaal;
  else if (slug === "penghasilan") hasil = zakatPenghasilan;
  else if (slug === "fitrah") hasil = zakatFitrah;

  const selectedType = zakatTypes.find((z) => z.slug === slug);

  const onBayar = async () => {
    if (!selectedType || hasil <= 0) return;
    setSubmitting(true);
    setServerError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: inserted, error } = await supabase
      .from("zakat_transactions")
      .insert({
        user_id: user?.id ?? null,
        zakat_type_id: selectedType.id,
        muzakki_name: muzakkiName || "Hamba Allah",
        amount: hasil,
        payment_status: "pending",
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error || !inserted) {
      setServerError("Gagal menyimpan transaksi zakat. Coba lagi.");
      return;
    }

    setZakatTransactionId(inserted.id);
    setStep("payment");
  };

  const onUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !zakatTransactionId) return;

    setUploading(true);
    setServerError(null);

    const path = `zakat-${zakatTransactionId}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(path, file);

    if (uploadError) {
      setServerError("Gagal upload bukti pembayaran. Coba lagi.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("zakat_transactions")
      .update({ payment_proof_url: publicUrlData.publicUrl })
      .eq("id", zakatTransactionId);

    setUploading(false);

    if (updateError) {
      setServerError("Bukti terupload tapi gagal disimpan. Hubungi admin.");
      return;
    }

    setStep("submitted");
  };

  if (step === "submitted") {
    return (
      <div className="rounded-xl bg-secondary-light p-6 text-center">
        <p className="font-semibold text-secondary-dark">Bukti Terkirim!</p>
        <p className="mt-1 text-sm text-slate-600">
          Zakat kamu akan diverifikasi admin setelah bukti transfer dicek. Jazakallah khair.
        </p>
      </div>
    );
  }

  if (step === "payment" && zakatTransactionId) {
    return (
      <div className="mx-auto max-w-sm space-y-4">
        <div className="rounded-xl bg-primary-light p-4 text-center">
          <p className="text-sm text-primary">Total zakat</p>
          <p className="text-2xl font-bold text-primary">{formatRupiah(hasil)}</p>
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
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-wrap gap-2">
        {zakatTypes.map((z) => (
          <button
            key={z.id}
            onClick={() => setSlug(z.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              slug === z.slug ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      {(slug === "maal" || slug === "perdagangan") && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Total Harta (Rp)</label>
            <input
              type="number"
              value={harta}
              onChange={(e) => setHarta(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Total Hutang (Rp, opsional)</label>
            <input
              type="number"
              value={hutang}
              onChange={(e) => setHutang(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Harga Emas per Gram (Rp)</label>
            <input
              type="number"
              value={hargaEmas}
              onChange={(e) => setHargaEmas(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Nilai default cuma estimasi — cek harga emas hari ini biar akurat. Nisab: {ZAKAT_NISAB_EMAS_GRAM} gram emas ({formatRupiah(nisab)}).
            </p>
          </div>
          {!wajibMaal && hartaBersih > 0 && (
            <p className="text-sm text-amber-600">Harta kamu belum mencapai nisab, belum wajib zakat maal.</p>
          )}
        </div>
      )}

      {slug === "penghasilan" && (
        <div>
          <label className="text-sm font-medium text-slate-700">Penghasilan per Bulan (Rp)</label>
          <input
            type="number"
            value={penghasilan}
            onChange={(e) => setPenghasilan(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          />
        </div>
      )}

      {slug === "fitrah" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Jumlah Jiwa</label>
            <input
              type="number"
              min={1}
              value={jiwa}
              onChange={(e) => setJiwa(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Nilai per Jiwa (Rp)</label>
            <input
              type="number"
              value={hargaFitrah}
              onChange={(e) => setHargaFitrah(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">Nilai default cuma estimasi — cek ketetapan BAZNAS daerah kamu.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-primary-light p-4 text-center">
        <p className="text-sm text-primary">Estimasi Zakat</p>
        <p className="text-2xl font-bold text-primary">{formatRupiah(hasil)}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Nama Muzakki</label>
        <input
          value={muzakkiName}
          onChange={(e) => setMuzakkiName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <button
        onClick={onBayar}
        disabled={submitting || hasil <= 0}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {submitting ? "Memproses..." : "Bayar Zakat Sekarang"}
      </button>
    </div>
  );
}