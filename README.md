# Portal Berita Sekolah — Supabase

Website portal berita sekolah dengan landing page responsif, daftar berita, pencarian/filter kategori, detail artikel, pengumuman, login admin/petugas, dashboard CRUD, dan halaman cetak.

## Teknologi
- HTML5, CSS3, JavaScript ES Modules
- Supabase PostgreSQL + Supabase Authentication + Row Level Security (RLS)
- Tidak memerlukan PHP/XAMPP. Jalankan melalui local web server atau hosting static.

## Struktur folder
```text
portal-berita-sekolah/
├── index.html
├── detail.html
├── login.html
├── admin.html
├── css/style.css
├── js/
│   ├── supabase.js
│   ├── home.js
│   ├── detail.js
│   ├── login.js
│   └── admin.js
└── sql/schema.sql
```

## 1. Buat project Supabase
1. Buka https://supabase.com lalu buat project baru.
2. Catat database password project Anda (simpan secara pribadi).
3. Buka **Project Settings → API**.
4. Salin **Project URL** dan **anon/public key**.
5. Buka `js/supabase.js`, ganti:
   - `https://YOUR_PROJECT_ID.supabase.co`
   - `YOUR_SUPABASE_ANON_KEY`
6. Jangan pernah menaruh `service_role` key di file frontend. Gunakan hanya anon/public key; RLS melindungi tabel.

## 2. Buat tabel database
1. Buka **SQL Editor → New query** di Supabase.
2. Salin seluruh isi `sql/schema.sql`, lalu klik **Run**.
3. Script membuat tabel `profiles`, `news`, `announcements`, index, trigger, dan RLS policies.

## 3. Buat akun admin pertama
1. Buka **Authentication → Users → Add user**.
2. Masukkan email admin dan password yang kuat. Aktifkan email confirmed bila tersedia untuk project latihan.
3. Salin UUID user dari daftar Authentication → Users.
4. Jalankan SQL berikut (ganti UUID):
```sql
update public.profiles
set role = 'admin', full_name = 'Administrator Sekolah'
where id = 'UUID-USER-ANDA';
```
5. Akun petugas berikutnya dapat dibuat melalui Authentication → Users; role default adalah `petugas`. Untuk promosi/demosi role, ubah melalui SQL Editor sebagai pemilik project.

## 4. Jalankan website di komputer
Jangan membuka file dengan `file://`, karena browser membatasi ES Modules. Gunakan salah satu cara:
- VS Code: pasang ekstensi **Live Server**, klik kanan `index.html` → Open with Live Server.
- Python: buka terminal pada folder project lalu jalankan `python -m http.server 5500`, kemudian buka `http://localhost:5500`.
- Hosting: unggah semua file/folder ke hosting static atau web hosting pada document root.

## 5. Fitur yang tersedia
- Landing page responsif dengan hero, statistik, berita, pengumuman, dan profil portal.
- Daftar berita dari Supabase, pencarian teks, filter kategori.
- Detail artikel berdasarkan ID, tombol **Cetak Berita**.
- Login menggunakan Supabase Auth.
- Dashboard admin/petugas: tambah, edit, dan terbitkan/draft berita; tambah/edit/nonaktifkan pengumuman.
- Hapus konten hanya untuk role `admin`.
- Cetak daftar berita dan pengumuman menggunakan dialog print browser (Print / Save as PDF).

## 6. Cara cetak / printout
- Detail berita → klik **Cetak Berita** → pilih printer atau **Save as PDF**.
- Dashboard → tombol **Cetak daftar** pada bagian tabel → pilih printer atau **Save as PDF**.
- Untuk hasil rapi, gunakan ukuran kertas A4, Scale 100%, dan aktifkan/ nonaktifkan background graphics sesuai kebutuhan.

## 7. Catatan keamanan dan pengembangan
- RLS aktif. Pengunjung hanya membaca berita terbit dan pengumuman aktif.
- Admin/petugas harus login untuk menambah dan mengubah konten. Hanya admin yang dapat menghapus.
- Jangan pernah memasukkan `service_role` key ke frontend atau membagikannya.
- Gunakan URL gambar HTTPS yang dapat diakses publik. Untuk produksi, pertimbangkan Supabase Storage dengan bucket dan policy khusus.
- Tambahkan CAPTCHA/rate limiting dan kebijakan backup sebelum portal dipakai secara publik.
- Untuk mengganti nama sekolah, ubah teks di `index.html`, `detail.html`, `admin.html`, dan `login.html`.
- Ini merupakan starter project siap dikembangkan; domain, logo resmi, konten sekolah, serta konfigurasi Supabase harus diisi oleh pengelola.
