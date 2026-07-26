import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ZakatLandingPage() {
  const supabase = await createClient();
  const { data: zakatTypes } = await supabase
    .from("zakat_types")
    .select("name, slug, description")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Tunaikan Zakat</h1>
        <p className="mt-1 text-sm text-slate-500">
          Zakat maal, fitrah, penghasilan, hingga perdagangan — hitung otomatis, bayar langsung.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(zakatTypes ?? []).map((z) => (
          <div key={z.slug} className="rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800">{z.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{z.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/zakat/kalkulator"
          className="inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          Hitung & Bayar Zakat
        </Link>
      </div>
    </div>
  );
}