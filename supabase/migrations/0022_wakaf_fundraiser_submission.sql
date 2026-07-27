alter table wakaf_programs add column fundraiser_id uuid references profiles(id) on delete set null;

-- Policy select lama ("using (true)") ketauan kurang tepat — bikin SEMUA program
-- (termasuk draft/pending) kebaca publik. Ganti jadi konsisten sama pola campaigns:
-- publik cuma lihat yang active/completed, pemilik bisa lihat punyanya sendiri.
drop policy if exists "wakaf_programs_select_all" on wakaf_programs;

create policy "wakaf_programs_select_public" on wakaf_programs for select to anon, authenticated
  using (status in ('active', 'completed') or fundraiser_id = auth.uid());

create policy "wakaf_programs_insert_fundraiser" on wakaf_programs for insert to authenticated
  with check (fundraiser_id = auth.uid());