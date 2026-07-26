import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatRupiah } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/admin/campaign", label: "Kelola Campaign" },
  { href: "/admin/users", label: "Kelola User" },
  { href: "/admin/zakat", label: "Transaksi Zakat" },
  { href: "/admin/wakaf", label: "Kelola Wakaf" },
  { href: "/admin/saling-jaga", label: "Saling Jaga" },
  { href: "/admin/pencairan-dana", label: "Pencairan Dana" },
];

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalCampaigns },
    { count: pendingCampaigns },
    { data: activeCampaigns },
    { count: pendingDonations },
  ] = await Promise.all([
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
    supabase.from("campaigns").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("campaigns").select("collected_amount").in("status", ["active", "completed"]),
    supabase.from("donations").select("*", { count: "exact", head: true }).eq("payment_status", "pending"),
  ]);

  const totalTerkumpul = (activeCampaigns ?? []).reduce((sum, c) => sum + c.collected_amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan aktivitas platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Campaign" value={String(totalCampaigns ?? 0)} />
        <StatCard label="Menunggu Verifikasi" value={String(pendingCampaigns ?? 0)} />
        <StatCard label="Total Dana Terkumpul" value={formatRupiah(totalTerkumpul)} />
        <StatCard label="Donasi Belum Diverifikasi" value={String(pendingDonations ?? 0)} />
      </div>

      {(pendingCampaigns ?? 0) > 0 && (
        <Link
          href="/admin/campaign"
          className="block rounded-xl bg-amber-50 p-4 text-sm text-amber-700 hover:bg-amber-100 transition-colors"
        >
          Ada {pendingCampaigns} campaign menunggu verifikasi kamu →
        </Link>
      )}

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Menu Cepat</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-slate-100 p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors text-center sm:text-left"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}