import { createClient } from "@/lib/supabase/server";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";
import { formatRupiah } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  requested: "Diajukan",
  approved: "Disetujui",
  rejected: "Ditolak",
  disbursed: "Dicairkan",
};

const STATUS_STYLE: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-secondary-light text-secondary-dark",
  rejected: "bg-red-100 text-red-600",
  disbursed: "bg-primary-light text-primary",
};

export default async function PencairanDanaFundraiserPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, collected_amount")
    .eq("fundraiser_id", user!.id)
    .in("status", ["active", "completed"]);

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("id, campaign_id, amount, bank_name, account_number, status, requested_at")
    .eq("fundraiser_id", user!.id)
    .order("requested_at", { ascending: false });

  const withdrawalList = withdrawals ?? [];

  // Saldo tersedia = total terkumpul - semua pencairan yang belum ditolak
  const campaignBalances = (campaigns ?? [])
    .map((c) => {
      const reserved = withdrawalList
        .filter((w) => w.campaign_id === c.id && w.status !== "rejected")
        .reduce((sum, w) => sum + w.amount, 0);
      return { id: c.id, title: c.title, available: c.collected_amount - reserved };
    })
    .filter((c) => c.available > 0);

  const campaignTitleMap = new Map((campaigns ?? []).map((c) => [c.id, c.title]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pencairan Dana</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ajukan pencairan dana dari campaign yang sudah terverifikasi.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Ajukan Pencairan Baru</h2>
        <WithdrawalForm campaigns={campaignBalances} />
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Riwayat Pencairan</h2>
        {withdrawalList.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada pengajuan pencairan.</p>
        ) : (
          <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
            {withdrawalList.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-700 truncate">
                    {campaignTitleMap.get(w.campaign_id) ?? "Campaign"}
                  </p>
                  <p className="text-slate-500">{w.bank_name} · {w.account_number}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-secondary-dark">{formatRupiah(w.amount)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[w.status]}`}>
                    {STATUS_LABEL[w.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}