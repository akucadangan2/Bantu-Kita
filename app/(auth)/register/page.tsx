"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "donatur" },
  });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          phone: values.phone,
          role: values.role,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      // Konfirmasi email masih aktif di project Supabase kamu
      setAwaitingVerification(true);
    }
  };

  if (awaitingVerification) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-primary">Cek Email Kamu</h1>
          <p className="mt-2 text-sm text-slate-500">
            Kami sudah kirim link verifikasi. Buka email kamu untuk aktivasi akun sebelum masuk.
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
        <h1 className="text-xl font-bold text-primary">Daftar ke {APP_NAME}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-secondary-dark hover:underline">
            Masuk di sini
          </Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Daftar sebagai</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-light has-[:checked]:text-primary">
                <input type="radio" value="donatur" {...register("role")} className="sr-only" />
                Donatur
              </label>
              <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary-light has-[:checked]:text-primary">
                <input type="radio" value="fundraiser" {...register("role")} className="sr-only" />
                Penggalang Dana
              </label>
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input
              {...register("fullName")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Nomor HP</label>
            <input
              {...register("phone")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
              placeholder="08xxxxxxxxxx"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-secondary focus:outline-none"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Memproses..." : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}