create policy "campaign_images_insert_all"
on storage.objects for insert
to authenticated
with check (bucket_id = 'campaign-images');

create policy "campaign_images_select_all"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'campaign-images');