create policy "admin_insert_campaign_updates" on campaign_updates for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));