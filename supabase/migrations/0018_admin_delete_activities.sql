create policy "admin_delete_activities" on activities for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));