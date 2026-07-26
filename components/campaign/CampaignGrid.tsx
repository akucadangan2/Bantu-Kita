import type { Campaign } from "@/lib/types";
import { CampaignCard } from "./CampaignCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return <EmptyState message="Belum ada campaign untuk ditampilkan." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}
