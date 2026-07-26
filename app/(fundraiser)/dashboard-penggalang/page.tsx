import Link from "next/link";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, calcProgressPercent } from "@/lib/utils";

export default async function DashboardFundraiserPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("fundraiser_id", user!.id)
    .order("created_at", { ascending: false });

  const list = campaigns ?? [];
  const totalTerkumpul = list.reduce((sum, c) => sum + c.collected_amount, 0);
  const totalAktif = list.filter((c) => c.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard Penggalang Dana</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola campaign yang kamu buat.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/galang-dana"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          + Campaign Baru
        </Link>
        <Link
          href="/dashboard-penggalang/pencairan-dana"
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Wallet className="h-4 w-4" /> Tarik Dana
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total Campaign" value={String(list.length)} />
        <StatCard label="Total Terkumpul" value={formatRupiah(totalTerkumpul)} />
        <StatCard label="Sedang Aktif" value={String(totalAktif)} />
      </div>

      <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
        {list.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Belum ada campaign. Yuk buat yang pertama.
          </p>
        )}

        {list.map((c) => {
          const percent = calcProgressPercent(c.collected_amount, c.target_amount);
          return (
            <Link
              key={c.id}
              href={`/dashboard-penggalang/campaign/${c.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{c.title}</p>
                <p className="text-sm text-slate-500">
                  {formatRupiah(c.collected_amount)} · {percent}% dari target
                </p>
              </div>
              <Badge status={c.status} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}