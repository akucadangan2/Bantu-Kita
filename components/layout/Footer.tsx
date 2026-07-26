import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const CS_WHATSAPP_NUMBER = "6285136257876"; // 085136257876 dalam format internasional

export function Footer() {
  const [firstWord, ...rest] = APP_NAME.split(" ");
  const secondWord = rest.join(" ");
  const waLink = `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo, saya ingin bertanya soal kerja sama dengan " + APP_NAME)}`;

  return (
    <footer className="bg-primary text-slate-300 mt-8 sm:mt-12">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 text-sm">
        <div className="mb-6 sm:mb-0">
          <p className="font-extrabold text-lg mb-1.5">
            <span className="text-white">{firstWord}</span>
            {secondWord && <span className="text-secondary"> {secondWord}</span>}
          </p>
          <p className="text-slate-400 text-xs sm:text-sm">{APP_TAGLINE}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-8 sm:mt-8">
          <div>
            <p className="font-semibold text-white mb-2 text-xs sm:text-sm">Program</p>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li><Link href="/donasi" className="hover:text-secondary transition-colors">Donasi</Link></li>
              <li><Link href="/zakat" className="hover:text-secondary transition-colors">Zakat</Link></li>
              <li><Link href="/wakaf" className="hover:text-secondary transition-colors">Wakaf</Link></li>
              <li><Link href="/kegiatan" className="hover:text-secondary transition-colors">Kegiatan</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white mb-2 text-xs sm:text-sm">Bantuan</p>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li><Link href="/bantuan" className="hover:text-secondary transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="/tentang" className="hover:text-secondary transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white mb-2 text-xs sm:text-sm">Kerja Sama</p>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-secondary transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Hubungi Kami
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] sm:text-xs text-slate-500 border-t border-white/10 pt-3 sm:pt-4 pb-4 sm:pb-6">
        © {new Date().getFullYear()} {APP_NAME}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}