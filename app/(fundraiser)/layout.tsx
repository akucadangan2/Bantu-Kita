import { SidebarFundraiser } from "@/components/layout/SidebarFundraiser";

export default function FundraiserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl">
      <SidebarFundraiser />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}