import Link from "next/link";
import { MapPin, Calendar, Users } from "lucide-react";

interface ActivitySummary {
  slug: string;
  title: string;
  location: string | null;
  activity_date: string | null;
  quota: number;
  joined_count: number;
}

export function ActivityCard({ activity }: { activity: ActivitySummary }) {
  const sisaKuota = activity.quota - activity.joined_count;
  const tanggal = activity.activity_date
    ? new Date(activity.activity_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Link
      href={`/kegiatan/${activity.slug}`}
      className="block rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-gradient-to-br from-accent to-primary" />
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2">{activity.title}</h3>
        {tanggal && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <Calendar className="h-3.5 w-3.5" /> {tanggal}
          </p>
        )}
        {activity.location && (
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {activity.location}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-sm text-secondary-dark font-medium">
          <Users className="h-3.5 w-3.5" /> {sisaKuota > 0 ? `${sisaKuota} slot tersisa` : "Kuota penuh"}
        </p>
      </div>
    </Link>
  );
}