import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL } from "@/lib/constants";

export default async function RiwayatDonasiPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: donations }, { data: zakat }, { data: wakaf }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, amount, payment_status, created_at, campaigns(title)")
      .eq("donor_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("zakat_transactions")
      .select("id, amount, payment_status, created_at, zakat_types(name)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("wakaf_transactions")
      .select("id, amount, payment_status, created_at, wakaf_programs(title)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const combined = [
    ...(donations ?? []).map((d: any) => ({
      id: `donasi-${d.id}`,
      type: "Donasi",
      label: d.campaigns?.title ?? "Campaign",
      amount: d.amount,
      status: d.payment_status,
      date: d.created_at,
    })),
    ...(zakat ?? []).map((z: any) => ({
      id: `zakat-${z.id}`,
      type: "Zakat",
      label: z.zakat_types?.name ?? "Zakat",
      amount: z.amount,
      status: z.payment_status,
      date: z.created_at,
    })),
    ...(wakaf ?? []).map((w: any) => ({
      id: `wakaf-${w.id}`,
      type: "Wakaf",
      label: w.wakaf_programs?.title ?? "Wakaf",
      amount: w.amount,
      status: w.payment_status,
      date: w.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Riwayat Donasi</h1>
        <p className="mt-1 text-sm text-slate-500">Semua donasi, zakat, dan wakaf yang pernah kamu lakukan.</p>
      </div>

      {combined.length === 0 ? (
        <p className="text-sm text-slate-400">Belum ada riwayat.</p>
      ) : (
        <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {combined.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">{item.type} — {item.label}</p>
                <p className="text-slate-400 text-xs">
                  {new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-secondary-dark">{formatRupiah(item.amount)}</p>
                <p className={`text-xs ${item.status === "paid" ? "text-secondary-dark" : "text-amber-600"}`}>
                  {PAYMENT_STATUS_LABEL[item.status]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}