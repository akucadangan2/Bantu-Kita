-- Verifikasi SEMUA donasi pending dalam 1 campaign sekaligus, dalam 1 transaksi
-- (kalau di tengah jalan ada error, semua di-rollback, nggak ada yang setengah-setengah)
create or replace function public.verify_all_donations(p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Hanya admin yang boleh memverifikasi donasi';
  end if;

  for r in select id, amount from donations where campaign_id = p_campaign_id and payment_status = 'pending'
  loop
    update donations set payment_status = 'paid' where id = r.id;
    update campaigns set collected_amount = collected_amount + r.amount where id = p_campaign_id;
  end loop;
end;
$$;