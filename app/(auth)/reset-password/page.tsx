"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");

    async function exchangeCode() {
      if (code) {
        // Pola PKCE: link dari email bawa "code", harus ditukar jadi session
        // dulu sebelum bisa updateUser(). Sama persis pola yang dipakai di Butik Antam.
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("Link reset tidak valid atau sudah kedaluwarsa.");
        }
      } else {
        setError("Link reset tidak valid.");
      }
      setReady(true);
    }

    exchangeCode();
  }, [searchParams, supabase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (updateError) {
      setError("Gagal mengubah password. Coba lagi.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  if (!ready) {
    return <p className="text-center text-sm text-slate-400">Memverifikasi link...</p>;
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-secondary-light p-6 text-center">
        <p className="font-semibold text-secondary-dark">Password Berhasil Diubah!</p>
        <p className="mt-1 text-sm text-slate-600">Mengarahkan ke halaman masuk...</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Password Baru</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Konfirmasi Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {submitting ? "Menyimpan..." : "Ubah Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-primary mb-6">Atur Ulang Password</h1>
        <Suspense fallback={<p className="text-sm text-slate-400">Memuat...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}