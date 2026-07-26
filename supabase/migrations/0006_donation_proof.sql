-- Kolom buat nyimpen URL bukti transfer yang diupload donatur
alter table donations add column payment_proof_url text;

-- Izin upload & baca file di bucket "payment-proofs" — perlu ditambah manual
-- karena RLS storage.objects nggak otomatis ngikutin RLS tabel biasa
create policy "payment_proofs_insert_all"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'payment-proofs');

create policy "payment_proofs_select_all"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'payment-proofs');