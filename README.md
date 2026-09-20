# SIRKUL.AI — Barang Bekas, Manfaat Baru

Platform tukar-menukar/donasi barang bekas mahasiswa. Frontend React + Vite, backend **Supabase**
(Database, Auth, Storage, Realtime) + **Supabase Edge Function** untuk chat AI ke Claude API.

## Kenapa Supabase?

Versi sebelumnya menyimpan data di `localStorage` browser, jadi tiap orang punya "dunia" sendiri-sendiri.
Dengan Supabase, katalog barang, klaim, kebutuhan, poin, dan chat sekarang **beneran dibagikan** ke semua
pengguna secara real-time, dan tidak perlu lagi menjalankan server Node sendiri untuk fitur Chat AI.

## Alur arsitektur

- **React app (browser)** — satu-satunya yang perlu dijalankan/dideploy sebagai frontend
- **Supabase Auth** — login anonim otomatis saat app dibuka pertama kali, tiap pengunjung dapat id tetap
- **Supabase Database (Postgres)** — tabel `items`, `needs`, `messages`, `profiles`, dilindungi Row Level Security
- **Supabase Storage** — bucket `item-photos` untuk foto barang dari kamera/upload
- **Supabase Realtime** — perubahan katalog & pesan chat langsung muncul di semua browser yang terbuka
- **Supabase Edge Function `chat-ai`** — menyimpan API key Claude sebagai secret, meneruskan pertanyaan ke Claude API

## Setup — 6 langkah

### 1. Buat project Supabase
Daftar/login di [supabase.com](https://supabase.com) → **New project** → catat **Project URL** dan **anon public key** (Settings → API).

### 2. Jalankan schema database
Buka **SQL Editor** di dashboard Supabase → tempel isi `supabase/schema.sql` → **Run**.
Ini membuat semua tabel, kebijakan keamanan (RLS), fungsi poin, dan bucket foto.

### 3. Aktifkan login anonim
Di dashboard: **Authentication → Providers → Anonymous Sign-Ins** → aktifkan.

### 4. Deploy Edge Function untuk Chat AI
```bash
npm install -g supabase
supabase login
supabase link --project-ref xxxxxxxxxxxx   # project ref ada di URL dashboard
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
supabase functions deploy chat-ai
```

### 5. Konfigurasi frontend
```bash
cp .env.example .env
```
Isi `.env` dengan Project URL dan anon key dari langkah 1.

### 6. Jalankan
```bash
npm install
npm run dev
```
Buka `http://localhost:5173`. Cukup satu perintah — tidak ada server backend terpisah yang perlu dijalankan manual lagi.

## Struktur folder

```
sirkul-ai/
├─ src/
│  ├─ App.jsx, main.jsx, styles.css
│  ├─ lib/supabaseClient.js   # koneksi Supabase + login anonim otomatis
│  ├─ data/constants.js        # kategori, status, estimasi dampak
│  ├─ utils/                   # helper format & Cocokkan AI
│  └─ components/               # TopBar, Home, Browse, ItemCard, DonateForm,
│                                 NeedForm, CameraUpload, ChatModal, AIChat, Impact, Toast
├─ supabase/
│  ├─ schema.sql                # tabel, RLS, fungsi poin, bucket storage
│  └─ functions/chat-ai/        # Edge Function proxy ke Claude API
└─ .env.example
```

## Build untuk production

```bash
npm run build
```
Hasil di `dist/`, siap di-hosting di static hosting mana pun (Vercel, Netlify, Cloudflare Pages).
Set environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di dashboard hosting-nya.

## Catatan desain & batasan

- **Chat antar mahasiswa bersifat terbuka per barang** (siapa pun yang login bisa baca thread-nya), bukan
  pesan privat satu-satu — pilihan ini menyederhanakan aturan keamanan (RLS) untuk versi prototipe ini.
  Untuk chat privat sungguhan, perlu tabel percakapan terpisah dengan daftar partisipan.
- **Pendeteksi kategori** di form donasi adalah pencocokan kata kunci teks sederhana, bukan pengenalan
  gambar sungguhan — foto yang diunggah hanya disimpan dan ditampilkan, belum dianalisis oleh AI.
- **Poin** ditambah lewat fungsi database `add_points` (bukan langsung dari client) supaya tidak mudah dimanipulasi.
- Login bersifat **anonim** (tanpa email/password) supaya prototipe langsung bisa dipakai. Untuk versi
  produksi, ganti dengan email/SSO kampus lewat Supabase Auth provider lain.
