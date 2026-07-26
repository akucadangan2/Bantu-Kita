"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={onLogout}
      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
      title="Keluar"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}