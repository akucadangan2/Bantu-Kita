"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWithdrawalSchema, type CreateWithdrawalInput } from "@/lib/validations/withdrawal";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";

interface CampaignBalance {
  id: string;
  title: string;
  available: number;
}

export function WithdrawalForm({ campaigns }: { campaigns: CampaignBalance[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateWithdrawalInput>({
    resolver: zodResolver(createWithdrawalSchema),
  });

  const selectedCampaignId = watch("campaignId");
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  const onSubmit = async (values: CreateWithdrawalInput) => {
    setServerError(null);

    const campaign = campaigns.find((c) => c.id === values.campaignId);
    if (campaign && values.amount > campaign.available) {
      setError("amount", { message: `Melebihi saldo tersedia (${formatRupiah(campaign.available)})` });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("withdrawals").insert({
      campaign_id: values.campaignId,
      fundraiser_id: user!.id,
      amount: values.amount,
      bank_name: values.bankName,
      account_number: values.accountNumber,
      account_holder: values.accountHolder,
      status: "requested",
    });

    if (error) {
      setServerError("Gagal mengajukan pencairan. Coba lagi.");
      return;
    }

    router.refresh();
  };

  if (campaigns.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Belum ada campaign dengan saldo yang bisa dicairkan.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Campaign</label>
        <select
          {...register("campaignId")}
          defaultValue=""
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        >
          <option value="" disabled>Pilih campaign</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} — saldo {formatRupiah(c.available)}
            </option>
          ))}
        </select>
        {errors.campaignId && <p className="text-xs text-red-500 mt-1">{errors.campaignId.message}</p>}
      </div>

      {selectedCampaign && (
        <p className="text-xs text-slate-500">
          Saldo tersedia: <span className="font-semibold text-secondary-dark">{formatRupiah(selectedCampaign.available)}</span>
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">Jumlah Pencairan (Rp)</label>
        <input
          type="number"
          {...register("amount")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Nama Bank</label>
        <input
          {...register("bankName")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="Contoh: BCA, Mandiri, BRI"
        />
        {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Nomor Rekening</label>
          <input
            {...register("accountNumber")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          />
          {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Nama Pemilik Rekening</label>
          <input
            {...register("accountHolder")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          />
          {errors.accountHolder && <p className="text-xs text-red-500 mt-1">{errors.accountHolder.message}</p>}
        </div>
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors sm:w-auto sm:px-8"
      >
        {isSubmitting ? "Mengajukan..." : "Ajukan Pencairan"}
      </button>
    </form>
  );
}