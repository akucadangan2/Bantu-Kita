-- Function ini yang bikin verifikasi donasi jadi "atomic": begitu admin klik
-- verifikasi, payment_status donasi jadi 'paid' DAN collected_amount campaign
-- ikut nambah, dalam satu operasi — jadi nggak ada celah datanya nggak sinkron.
-- SECURITY DEFINER dipakai supaya function ini bisa update tabel donations &
-- campaigns walau RLS donations belum ada policy UPDATE untuk siapapun.

create or replace function public.verify_donation(donation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric;
  v_campaign_id uuid;
  v_current_status payment_status;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Hanya admin yang boleh memverifikasi donasi';
  end if;

  select amount, campaign_id, payment_status
    into v_amount, v_campaign_id, v_current_status
    from donations
    where id = donation_id;

  if v_current_status = 'paid' then
    return; -- sudah pernah diverifikasi, jangan diproses dua kali (double count)
  end if;

  update donations set payment_status = 'paid' where id = donation_id;
  update campaigns set collected_amount = collected_amount + v_amount where id = v_campaign_id;
end;
$$;