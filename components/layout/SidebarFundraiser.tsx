"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Wallet } from "lucide-react";

const MENU = [
  { href: "/dashboard-penggalang", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/galang-dana", label: "Buat Campaign", icon: PlusCircle },
  { href: "/dashboard-penggalang/pencairan-dana", label: "Pencairan Dana", icon: Wallet },
];

export function SidebarFundraiser() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-100 p-4 hidden md:block">
      <nav className="space-y-1">
        {MENU.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-primary-light text-primary" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}