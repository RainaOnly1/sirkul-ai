-- SIRKUL.AI — schema Supabase
-- Jalankan file ini di SQL Editor project Supabase kamu (Project > SQL Editor > New query > Run)

-- 1. Profil pengguna (dibuat otomatis saat login anonim)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Mahasiswa',
  points int not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Barang yang didonasikan/ditukar/dijual murah
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  cat text not null,
  status text not null check (status in ('gratis','tukar','murah')),
  price int not null default 0,
  cond text not null default 'Kondisi baik',
  loc text not null default 'Belum diisi',
  img_url text,
  claimed_by uuid references profiles(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 3. Kebutuhan yang diajukan mahasiswa
create table if not exists needs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  keyword text not null,
  cat text not null,
  loc text,
  created_at timestamptz not null default now()
);

-- 4. Pesan chat per barang (antar mahasiswa)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table items enable row level security;
alter table needs enable row level security;
alter table messages enable row level security;

-- Semua pengguna login (termasuk anonim) boleh baca semua data komunitas
create policy "profiles: baca semua" on profiles for select using (true);
create policy "items: baca semua" on items for select using (true);
create policy "needs: baca semua" on needs for select using (true);
create policy "messages: baca semua pesan (thread per barang bersifat terbuka)" on messages for select using (true);

-- Tulis data: hanya untuk baris milik sendiri
create policy "profiles: ubah profil sendiri" on profiles for update using (auth.uid() = id);
create policy "items: tambah barang sendiri" on items for insert with check (auth.uid() = owner_id);
create policy "items: pemilik boleh ubah" on items for update using (auth.uid() = owner_id);
-- Klaim barang: siapapun boleh isi claimed_by selama barang belum diklaim
create policy "items: siapapun boleh klaim barang kosong" on items
  for update using (claimed_by is null) with check (claimed_by = auth.uid());
create policy "needs: tambah kebutuhan sendiri" on needs for insert with check (auth.uid() = owner_id);
create policy "messages: kirim pesan sendiri" on messages for insert with check (auth.uid() = sender_id);

-- Fungsi aman untuk menambah poin (dipanggil lewat rpc, tidak bisa dimanipulasi dari client)
create or replace function add_points(delta int)
returns void
language plpgsql
security definer
as $$
begin
  update profiles set points = points + delta where id = auth.uid();
end;
$$;

-- Bucket untuk foto barang
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

create policy "item-photos: baca publik" on storage.objects
  for select using (bucket_id = 'item-photos');
create policy "item-photos: upload oleh pengguna login" on storage.objects
  for insert with check (bucket_id = 'item-photos' and auth.role() = 'authenticated');

-- Aktifkan realtime untuk tabel yang perlu update instan
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table messages;
