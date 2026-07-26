import { HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Tentang {APP_NAME}</h1>
        <p className="mt-3 text-slate-600">{APP_TAGLINE}</p>
      </div>

      <div className="prose prose-sm max-w-none text-slate-600">
        <p>
          {APP_NAME} adalah platform galang dana dan donasi online yang menghubungkan
          orang-orang yang ingin membantu dengan mereka yang membutuhkan — lewat donasi,
          zakat, wakaf, hingga kegiatan sosial bersama komunitas.
        </p>
        <p>
          Kami percaya kebaikan kecil, kalau dilakukan bersama-sama, bisa jadi bantuan
          yang besar. Setiap campaign yang tayang di platform ini sudah melalui proses
          verifikasi, dan setiap donasi bisa dipantau progresnya secara transparan.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-800">Transparan</h3>
          <p className="mt-1 text-sm text-slate-500">
            Setiap donasi, zakat, dan wakaf tercatat jelas — progres bisa dipantau langsung.
          </p>
        </div>
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-light text-secondary-dark">
            <HeartHandshake className="h-6 w-6" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-800">Terverifikasi</h3>
          <p className="mt-1 text-sm text-slate-500">
            Campaign direview admin sebelum tayang, memastikan kebutuhan yang diajukan jelas & valid.
          </p>
        </div>
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-accent">
            <Users className="h-6 w-6" />
          </span>
          <h3 className="mt-3 font-semibold text-slate-800">Gotong Royong</h3>
          <p className="mt-1 text-sm text-slate-500">
            Bukan cuma donasi — ikut kegiatan sosial langsung bareng komunitas lewat modul Kegiatan.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Cara Kerja</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: "1", title: "Ajukan atau Pilih Campaign", desc: "Penggalang dana ajukan campaign, atau donatur pilih campaign yang ingin dibantu." },
            { step: "2", title: "Verifikasi Admin", desc: "Campaign direview dulu sebelum tayang publik, memastikan kebutuhannya jelas." },
            { step: "3", title: "Donasi & Pencairan", desc: "Donasi masuk, terverifikasi, lalu dana dicairkan ke penggalang dana." },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-slate-100 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {item.step}
              </span>
              <h3 className="mt-3 font-semibold text-slate-800">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}