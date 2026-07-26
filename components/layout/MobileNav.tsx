"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface MenuItem {
  href: string;
  label: string;
}

export function MobileNav({
  menu,
  isLoggedIn,
  akunHref,
}: {
  menu: MenuItem[];
  isLoggedIn: boolean;
  akunHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal cuma bisa jalan di client, setelah komponen ke-mount di browser
  useEffect(() => {
    setMounted(true);
  }, []);

  const drawer = open && (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="font-semibold text-slate-800">Menu</span>
          <button onClick={() => setOpen(false)} aria-label="Tutup menu">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cari"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Search className="h-4 w-4" /> Cari Campaign
          </Link>
          <Link
            href="/galang-dana"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Galang Dana
          </Link>
        </nav>

        <hr className="my-4 border-slate-100" />

        {isLoggedIn ? (
          <div className="flex items-center justify-between px-3">
            <Link
              href={akunHref}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-secondary-dark"
            >
              Akun Saya
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Masuk
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Buka menu" className="text-slate-600">
        <Menu className="h-6 w-6" />
      </button>

      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}