-- Kolom bukti transfer, sama pola kayak donations & zakat_transactions
alter table wakaf_transactions add column payment_proof_url text;

-- Admin bisa lihat & update semua transaksi wakaf
create policy "admin_select_all_wakaf_tx" on wakaf_transactions for select to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "admin_update_all_wakaf_tx" on wakaf_transactions for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Sama kayak verify_donation: verifikasi wakaf harus "atomic" —
-- payment_status jadi 'paid' DAN units_taken program ikut nambah,
-- dalam 1 operasi biar nggak ada celah data nggak sinkron.
create or replace function public.verify_wakaf(transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_units numeric;
  v_program_id uuid;
  v_current_status payment_status;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Hanya admin yang boleh memverifikasi transaksi wakaf';
  end if;

  select units, program_id, payment_status
    into v_units, v_program_id, v_current_status
    from wakaf_transactions
    where id = transaction_id;

  if v_current_status = 'paid' then
    return; -- sudah pernah diverifikasi, jangan diproses dua kali
  end if;

  update wakaf_transactions set payment_status = 'paid' where id = transaction_id;
  update wakaf_programs set units_taken = units_taken + v_units where id = v_program_id;
end;
$$;