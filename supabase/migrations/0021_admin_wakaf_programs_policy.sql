create policy "admin_insert_wakaf_programs" on wakaf_programs for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin_update_wakaf_programs" on wakaf_programs for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin_delete_wakaf_programs" on wakaf_programs for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));