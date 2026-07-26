create table doa_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  author_name text not null default 'Orang Baik',
  content text not null,
  created_at timestamptz not null default now()
);

create table doa_amins (
  id uuid primary key default gen_random_uuid(),
  doa_id uuid not null references doa_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (doa_id, user_id) -- 1 orang cuma bisa aamiin sekali per doa
);

alter table doa_posts enable row level security;
alter table doa_amins enable row level security;

create policy "doa_posts_select_all" on doa_posts for select to anon, authenticated using (true);
create policy "doa_posts_insert_own" on doa_posts for insert to authenticated with check (user_id = auth.uid());

create policy "doa_amins_select_all" on doa_amins for select to anon, authenticated using (true);
create policy "doa_amins_insert_own" on doa_amins for insert to authenticated with check (user_id = auth.uid());