import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  donatur: "Donatur",
  fundraiser: "Penggalang Dana",
  admin: "Admin",
};

const ROLE_STYLE: Record<UserRole, string> = {
  donatur: "bg-slate-100 text-slate-600",
  fundraiser: "bg-secondary-light text-secondary-dark",
  admin: "bg-primary-light text-primary",
};

async function updateRole(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as UserRole;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  const list = profiles ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Kelola User</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ubah role user — donatur, penggalang dana, atau admin.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-4 font-medium">Nama</th>
              <th className="p-4 font-medium">No. HP</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Ubah Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  Belum ada user.
                </td>
              </tr>
            )}
            {list.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-medium text-slate-700">
                  {p.full_name || "-"}
                  {p.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-slate-400">(kamu)</span>
                  )}
                </td>
                <td className="p-4 text-slate-600">{p.phone || "-"}</td>
                <td className="p-4">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_STYLE[p.role]}`}>
                    {ROLE_LABEL[p.role]}
                  </span>
                </td>
                <td className="p-4">
                  <form action={updateRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={p.id} />
                    <select
                      name="role"
                      defaultValue={p.role}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                    >
                      <option value="donatur">Donatur</option>
                      <option value="fundraiser">Penggalang Dana</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">
                      Simpan
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}