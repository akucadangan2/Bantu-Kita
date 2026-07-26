import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { revalidatePath } from "next/cache";

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

async function updateWithdrawalStatus(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const supabase = await createClient();
  await supabase
    .from("withdrawals")
    .update({ status, processed_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/pencairan-dana");
}

export default async function AdminPencairanDanaPage() {
  const supabase = await createClient();

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("id, amount, bank_name, account_number, account_holder, status, requested_at, campaigns(title)")
    .order("requested_at", { ascending: false });

  const list = withdrawals ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pencairan Dana</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola permintaan pencairan dana dari penggalang dana.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-4 font-medium">Campaign</th>
              <th className="p-4 font-medium">Rekening</th>
              <th className="p-4 font-medium">Jumlah</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Belum ada pengajuan pencairan.
                </td>
              </tr>
            )}
            {list.map((w: any) => (
              <tr key={w.id}>
                <td className="p-4 font-medium text-slate-700">{w.campaigns?.title ?? "-"}</td>
                <td className="p-4 text-slate-600">{w.account_holder} · {w.bank_name} · {w.account_number}</td>
                <td className="p-4 text-slate-600">{formatRupiah(w.amount)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[w.status]}`}>
                    {STATUS_LABEL[w.status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {w.status === "requested" && (
                      <>
                        <form action={updateWithdrawalStatus}>
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white hover:bg-secondary-dark">
                            Setujui
                          </button>
                        </form>
                        <form action={updateWithdrawalStatus}>
                          <input type="hidden" name="id" value={w.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">
                            Tolak
                          </button>
                        </form>
                      </>
                    )}
                    {w.status === "approved" && (
                      <form action={updateWithdrawalStatus}>
                        <input type="hidden" name="id" value={w.id} />
                        <input type="hidden" name="status" value="disbursed" />
                        <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                          Tandai Sudah Ditransfer
                        </button>
                      </form>
                    )}
                    {(w.status === "rejected" || w.status === "disbursed") && (
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