-- Ganti default kolom, biar insert baru tanpa isi nama otomatis pakai "Orang Baik"
alter table donations alter column donor_name set default 'Orang Baik';
alter table zakat_transactions alter column muzakki_name set default 'Orang Baik';
alter table wakaf_transactions alter column wakif_name set default 'Orang Baik';

-- Update data yang udah ada juga, biar konsisten di laporan/riwayat lama
update donations set donor_name = 'Orang Baik' where donor_name = 'Hamba Allah';
update zakat_transactions set muzakki_name = 'Orang Baik' where muzakki_name = 'Hamba Allah';
update wakaf_transactions set wakif_name = 'Orang Baik' where wakif_name = 'Hamba Allah';