import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";
import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = profile?.role ?? null;
  }

  const akunHref = role === "admin" ? "/admin" : role === "fundraiser" ? "/dashboard-penggalang" : "/akun";

  const menu = [
    { href: "/donasi", label: "Donasi" },
    { href: "/zakat", label: "Zakat" },
    { href: "/wakaf", label: "Wakaf" },
    { href: "/kegiatan", label: "Kegiatan" },
  ];

  const [firstWord, ...rest] = APP_NAME.split(" ");
  const secondWord = rest.join(" ");

  return (
    <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-40">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <Image src="/logo.jpg" alt={APP_NAME} width={36} height={36} className="rounded-lg object-cover" />
          <span>
            <span className="text-primary">{firstWord}</span>
            {secondWord && <span className="text-secondary"> {secondWord}</span>}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          {menu.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-secondary-dark transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cari" className="text-slate-500 hover:text-secondary-dark transition-colors" aria-label="Cari campaign">
            <Search className="h-5 w-5" />
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/galang-dana"
              className="text-sm font-medium text-slate-700 hover:text-secondary-dark transition-colors"
            >
              Galang Dana
            </Link>

            {user ? (
              <>
                <Link href={akunHref} className="text-sm font-medium text-slate-700 hover:text-secondary-dark transition-colors">
                  Akun Saya
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>

          <MobileNav menu={menu} isLoggedIn={!!user} akunHref={akunHref} />
        </div>
      </div>
    </header>
  );
}