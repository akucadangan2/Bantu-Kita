import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Footer() {
  const [firstWord, ...rest] = APP_NAME.split(" ");
  const secondWord = rest.join(" ");

  return (
    <footer className="bg-primary text-slate-300 mt-12">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-extrabold text-lg mb-2">
            <span className="text-white">{firstWord}</span>
            {secondWord && <span className="text-secondary"> {secondWord}</span>}
          </p>
          <p className="text-slate-400">{APP_TAGLINE}</p>
        </div>

        <div>
          <p className="font-semibold text-white mb-2">Program</p>
          <ul className="space-y-1">
            <li><Link href="/donasi" className="hover:text-secondary transition-colors">Donasi</Link></li>
            <li><Link href="/zakat" className="hover:text-secondary transition-colors">Zakat</Link></li>
            <li><Link href="/wakaf" className="hover:text-secondary transition-colors">Wakaf</Link></li>
            <li><Link href="/kegiatan" className="hover:text-secondary transition-colors">Kegiatan</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white mb-2">Bantuan</p>
          <ul className="space-y-1">
            <li><Link href="/bantuan" className="hover:text-secondary transition-colors">Pusat Bantuan</Link></li>
            <li><Link href="/tentang" className="hover:text-secondary transition-colors">Tentang Kami</Link></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 border-t border-white/10 pt-4 pb-6">
        © {new Date().getFullYear()} {APP_NAME}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}