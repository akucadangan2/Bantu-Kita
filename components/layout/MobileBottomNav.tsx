"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, PlusCircle, Receipt, CalendarHeart, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { profile, isAdmin, isFundraiser } = useAuth();

  const akunHref = isAdmin ? "/admin" : isFundraiser ? "/dashboard-penggalang" : "/akun";

  const TABS = [
    { href: "/", label: "Donasi", icon: Heart, exact: true },
    { href: "/galang-dana", label: "Galang Dana", icon: PlusCircle },
    { href: "/akun/riwayat-donasi", label: "Riwayat", icon: Receipt },
    { href: "/kegiatan", label: "Kegiatan", icon: CalendarHeart },
    { href: profile ? akunHref : "/login", label: "Akun", icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" fill={isActive && Icon === Heart ? "currentColor" : "none"} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}