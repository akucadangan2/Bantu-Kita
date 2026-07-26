import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default async function AdminCampaignListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string }>;
}) {
  const { page: pageParam, per_page: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = PAGE_SIZE_OPTIONS.includes(Number(perPageParam)) ? Number(perPageParam) : 10;

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createClient();

  const { data: campaigns, count } = await supabase
    .from("campaigns")
    .select("id, title, status, target_amount, collected_amount, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const list = campaigns ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Kelola Campaign</h1>
        <p className="mt-1 text-sm text-slate-500">
          Klik campaign untuk baca detail lengkap sebelum verifikasi.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>Tampilkan:</span>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <Link
            key={size}
            href={`/admin/campaign?page=1&per_page=${size}`}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              perPage === size ? "bg-primary text-white" : "hover:bg-slate-100"
            }`}
          >
            {size}
          </Link>
        ))}
      </div>

      <ul className="rounded-2xl border border-slate-100 divide-y divide-slate-100">
        {list.length === 0 && (
          <li className="p-6 text-center text-sm text-slate-400">Belum ada campaign.</li>
        )}
        {list.map((c) => (
          <li key={c.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-slate-700 line-clamp-2">{c.title}</p>
              <Badge status={c.status} />
            </div>
            <p className="text-xs text-slate-500">
              {formatRupiah(c.collected_amount)} dari {formatRupiah(c.target_amount)}
            </p>
            <Link
              href={`/admin/campaign/${c.id}`}
              className="inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              {c.status === "pending_review" ? "Review" : "Lihat Detail"}
            </Link>
          </li>
        ))}
      </ul>

      {totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-500">
            Halaman {page} dari {totalPages} ({totalCount} campaign)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/campaign?page=${page - 1}&per_page=${perPage}`}
                className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
              >
                ← Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/campaign?page=${page + 1}&per_page=${perPage}`}
                className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
              >
                Selanjutnya →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}