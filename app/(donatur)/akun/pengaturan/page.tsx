import Link from "next/link";
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";

export default function PengaturanAkunPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola keamanan akun kamu.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Ubah Password</h2>
        <ChangePasswordForm />
      </div>

      <Link href="/akun" className="inline-block text-sm font-medium text-secondary-dark hover:underline">
        ← Kembali ke Akun Saya
      </Link>
    </div>
  );
}