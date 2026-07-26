export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-4 sm:p-5">
      <p className="text-xs sm:text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg sm:text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}