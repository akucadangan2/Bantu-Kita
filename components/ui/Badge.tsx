import { CAMPAIGN_STATUS_LABEL } from "@/lib/constants";
import type { CampaignStatus } from "@/lib/types";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_review: "bg-amber-100 text-amber-700",
  active: "bg-secondary-light text-secondary-dark",
  completed: "bg-primary-light text-primary",
  rejected: "bg-red-100 text-red-600",
  closed: "bg-slate-100 text-slate-500",
};

export function Badge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {CAMPAIGN_STATUS_LABEL[status]}
    </span>
  );
}