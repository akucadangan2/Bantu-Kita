import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { PAYMENT_STATUS_LABEL } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function verifyZakat(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.from("zakat_transactions").update({ payment_status: "paid" }).eq("id", id);
  revalidatePath("/admin/zakat");
}

export default async function AdminZakatPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("zakat_transactions")
    .select("id, muzakki_name, amount, payment_status, payment_proof_url, created_at, zakat_types(name)")
    .order("created_at", { ascending: false });

  const list = transactions ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Transaksi Zakat</h1>
        <p className="mt-1 text-sm text-slate-500">Verifikasi pembayaran zakat yang masuk.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-4 font-medium">Muzakki</th>
              <th className="p-4 font-medium">Jenis</th>
              <th className="p-4 font-medium">Nominal</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">Belum ada transaksi zakat.</td>
              </tr>
            )}
            {list.map((t: any) => (
              <tr key={t.id}>
                <td className="p-4 font-medium text-slate-700">{t.muzakki_name}</td>
                <td className="p-4 text-slate-600">{t.zakat_types?.name ?? "-"}</td>
                <td className="p-4 text-slate-600">{formatRupiah(t.amount)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    t.payment_status === "paid" ? "bg-secondary-light text-secondary-dark" : "bg-amber-100 text-amber-700"
                  }`}>
                    {PAYMENT_STATUS_LABEL[t.payment_status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {t.payment_proof_url && (
                      <a href={t.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-secondary-dark hover:underline">
                        Lihat Bukti
                      </a>
                    )}
                    {t.payment_status !== "paid" ? (
                      <form action={verifyZakat}>
                        <input type="hidden" name="id" value={t.id} />
                        <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary-dark">
                          Verifikasi
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}