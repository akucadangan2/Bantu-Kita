import { SidebarAdmin } from "@/components/layout/SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl">
      <SidebarAdmin />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}