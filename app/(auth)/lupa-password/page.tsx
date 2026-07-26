"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LupaPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError("Gagal mengirim email reset. Coba lagi.");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-primary">Cek Email Kamu</h1>
          <p className="mt-2 text-sm text-slate-500">
            Kalau email <b>{email}</b> terdaftar, kami sudah kirim link buat atur ulang password.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-secondary-dark hover:underline">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-primary">Lupa Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Masukkan email kamu, kami akan kirim link buat atur ulang password.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
              placeholder="nama@email.com"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {submitting ? "Mengirim..." : "Kirim Link Reset"}
          </button>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-secondary-dark hover:underline">
              Kembali ke halaman masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}