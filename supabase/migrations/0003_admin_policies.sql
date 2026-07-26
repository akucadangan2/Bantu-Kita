-- Admin bisa lihat & update SEMUA campaign, apapun status & pemiliknya.
-- Policy ini nambah, bukan gantiin, policy yang udah ada di 0001
-- (di Postgres RLS, kalau salah satu policy match, row jadi kebaca/keupdate).

create policy "admin_select_all_campaigns" on campaigns for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin_update_all_campaigns" on campaigns for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));