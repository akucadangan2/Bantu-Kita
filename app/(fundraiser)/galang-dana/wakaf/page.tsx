import { CreateWakafProgramForm } from "@/components/wakaf/CreateWakafProgramForm";

export const metadata = { title: "Ajukan Program Wakaf" };

export default function GalangDanaWakafPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Ajukan Program Wakaf</h1>
        <p className="mt-1 text-sm text-slate-500">
          Isi detail program wakaf kamu selengkap mungkin — makin jelas, makin cepat direview admin.
        </p>
      </div>
      <CreateWakafProgramForm />
    </div>
  );
}