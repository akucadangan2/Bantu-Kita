import Link from "next/link";
import type { Campaign } from "@/lib/types";
import { formatRupiah, calcProgressPercent, daysLeft } from "@/lib/utils";
import { CampaignProgress } from "./CampaignProgress";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const percent = calcProgressPercent(campaign.collected_amount, campaign.target_amount);
  const sisaHari = daysLeft(campaign.deadline);

  return (
    <Link
      href={`/donasi/${campaign.slug}`}
      className="block rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-slate-100">
        {/* TODO: next/image dengan campaign.cover_image_url */}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2">{campaign.title}</h3>
        <CampaignProgress percent={percent} />
        <div className="flex justify-between text-sm text-slate-500">
          <span>{formatRupiah(campaign.collected_amount)} terkumpul</span>
          {sisaHari !== null && <span>{sisaHari} hari lagi</span>}
        </div>
      </div>
    </Link>
  );
}
