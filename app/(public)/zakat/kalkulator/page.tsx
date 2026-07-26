import { createClient } from "@/lib/supabase/server";
import { ZakatCalculator } from "@/components/zakat/ZakatCalculator";

export const metadata = { title: "Kalkulator Zakat" };

export default async function ZakatKalkulatorPage() {
  const supabase = await createClient();
  const { data: zakatTypes } = await supabase.from("zakat_types").select("id, name, slug").order("name");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary">Kalkulator Zakat</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hitung kewajiban zakat kamu, lalu bayar langsung lewat QRIS.
        </p>
      </div>
      <ZakatCalculator zakatTypes={zakatTypes ?? []} />
    </div>
  );
}