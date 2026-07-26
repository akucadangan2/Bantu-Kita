-- Bongkar tabel saling_jaga_* yang lama — belum ada data sama sekali, aman dihapus
drop table if exists saling_jaga_claims;
drop table if exists saling_jaga_members;
drop table if exists saling_jaga_programs;
drop type if exists saling_jaga_claim_status;
drop type if exists saling_jaga_member_status;

-- Modul baru: Kegiatan (mirip Kitabisa Experience — listing kegiatan sosial/volunteer)
create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  location text,
  activity_date timestamptz,
  quota integer not null default 0,
  status campaign_status not null default 'draft', -- reuse enum yang sama (draft/active/completed/closed dipakai, pending_review/rejected diabaikan)
  created_at timestamptz not null default now()
);

create table activity_participants (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (activity_id, user_id) -- satu orang cuma bisa ikut sekali per kegiatan
);

alter table activities enable row level security;
alter table activity_participants enable row level security;

create policy "activities_select_public" on activities for select to anon, authenticated
  using (status in ('active', 'completed'));
create policy "admin_select_all_activities" on activities for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "admin_insert_activities" on activities for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "admin_update_activities" on activities for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "participants_select_own" on activity_participants for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "participants_insert_own" on activity_participants for insert to authenticated
  with check (user_id = auth.uid());