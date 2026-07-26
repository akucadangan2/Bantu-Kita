interface UpdateItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function UpdateFeed({ updates }: { updates: UpdateItem[] }) {
  if (updates.length === 0) {
    return <p className="text-sm text-slate-400">Belum ada kabar terbaru.</p>;
  }

  return (
    <ul className="space-y-4">
      {updates.map((u) => (
        <li key={u.id} className="rounded-xl border border-slate-100 p-4">
          <p className="font-semibold text-slate-800">{u.title}</p>
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{u.content}</p>
          <p className="mt-2 text-xs text-slate-400">
            {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </li>
      ))}
    </ul>
  );
}