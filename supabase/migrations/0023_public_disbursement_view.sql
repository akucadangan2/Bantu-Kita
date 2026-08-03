-- VIEW ini SENGAJA cuma expose kolom aman (amount, status, tanggal cair),
-- TIDAK termasuk bank_name/account_number/account_holder yang sensitif.
-- View di Postgres by default jalan pakai hak akses pemiliknya (bukan ikut RLS
-- pemanggil), jadi ini aman diberi akses publik tanpa nge-expose data mentah
-- tabel withdrawals.
create view public_campaign_disbursements as
select id, campaign_id, amount, status, processed_at
from withdrawals
where status = 'disbursed';

grant select on public_campaign_disbursements to anon, authenticated;