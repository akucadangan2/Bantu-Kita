-- profiles udah bisa di-SELECT semua orang dari awal (policy profiles_select_all),
-- tapi UPDATE cuma boleh ke diri sendiri. Ini nambah izin admin buat ubah role user lain.

create policy "admin_update_all_profiles" on profiles for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));