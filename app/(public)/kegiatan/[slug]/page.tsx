import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinActivityButton } from "@/components/kegiatan/JoinActivityButton";
import { MapPin, Calendar, Users } from "lucide-react";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: activity } = await supabase
    .from("activities")
    .select("*, activity_participants(count)")
    .eq("slug", slug)
    .single();

  if (!activity) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alreadyJoined = false;
  if (user) {
    const { data: existing } = await supabase
      .from("activity_participants")
      .select("id")
      .eq("activity_id", activity.id)
      .eq("user_id", user.id)
      .maybeSingle();
    alreadyJoined = !!existing;
  }

  const joinedCount = (activity as any).activity_participants?.[0]?.count ?? 0;
  const isFull = joinedCount >= activity.quota;
  const tanggal = activity.activity_date
    ? new Date(activity.activity_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-accent to-primary" />
        <h1 className="text-2xl font-bold text-slate-800">{activity.title}</h1>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-600">
          {activity.description}
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="sticky top-20 rounded-2xl border border-slate-100 p-5 space-y-4">
          {tanggal && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-secondary-dark" /> {tanggal}
            </p>
          )}
          {activity.location && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-secondary-dark" /> {activity.location}
            </p>
          )}
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="h-4 w-4 text-secondary-dark" /> {joinedCount}/{activity.quota} peserta
          </p>

          <hr className="border-slate-100" />

          <JoinActivityButton
            activityId={activity.id}
            isFull={isFull}
            alreadyJoined={alreadyJoined}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}