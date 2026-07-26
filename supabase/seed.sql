-- Data awal supaya dropdown kategori & jenis zakat tidak kosong saat development

insert into campaign_categories (name, slug, type) values
  ('Bencana Alam', 'bencana-alam', 'donasi'),
  ('Kesehatan', 'kesehatan', 'donasi'),
  ('Pendidikan', 'pendidikan', 'donasi'),
  ('Kemanusiaan', 'kemanusiaan', 'donasi'),
  ('Lingkungan', 'lingkungan', 'donasi'),
  ('Difabel', 'difabel', 'donasi'),
  ('Hewan & Lingkungan', 'hewan', 'donasi');

insert into zakat_types (name, slug, description) values
  ('Zakat Maal', 'maal', 'Zakat atas harta yang telah mencapai nisab dan haul'),
  ('Zakat Fitrah', 'fitrah', 'Zakat wajib menjelang Idul Fitri'),
  ('Zakat Penghasilan', 'penghasilan', 'Zakat dari penghasilan/profesi'),
  ('Zakat Perdagangan', 'perdagangan', 'Zakat atas aset dagang');
