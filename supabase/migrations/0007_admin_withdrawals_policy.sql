-- Admin bisa lihat & proses SEMUA permintaan pencairan, apapun fundraiser-nya.
-- (Fundraiser sendiri udah bisa lihat pencairan miliknya dari policy withdrawals_select_own di 0001)

create policy "admin_select_all_withdrawals" on withdrawals for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin_update_all_withdrawals" on withdrawals for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));