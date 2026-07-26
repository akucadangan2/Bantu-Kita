-- campaign_updates dari awal cuma bisa di-SELECT (updates_select_all di 0001),
-- belum ada yang boleh INSERT. Ini kasih izin fundraiser nge-post update
-- ke campaign miliknya sendiri.
create policy "updates_insert_own_campaign" on campaign_updates for insert to authenticated
  with check (exists (select 1 from campaigns where id = campaign_id and fundraiser_id = auth.uid()));