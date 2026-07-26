"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [serverError, setServerError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError("Email atau password salah.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="nama@email.com"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <div className="text-right">
        <Link href="/lupa-password" className="text-xs font-medium text-secondary-dark hover:underline">
          Lupa password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-primary">Masuk ke {APP_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-secondary-dark hover:underline">
            Daftar di sini
          </Link>
        </p>

        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-slate-400">Memuat...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}