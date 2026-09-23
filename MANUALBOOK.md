# 📘 MANUAL BOOK — SINTESA
### Platform Pembelajaran 3D & Augmented Reality untuk Kelas 10 SMK Jurusan RPL

| Keterangan | Isi |
|---|---|
| Nama aplikasi | **Sintesa** — Pembelajaran 3D & AR |
| Versi dokumen | 1.0 |
| Fokus pengguna | Murid Kelas 10 SMK jurusan RPL, Guru, Admin |
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| Backend | Express.js + Prisma + PostgreSQL (Neon) |
| Bahasa dokumen | Indonesia |

---

## DAFTAR ISI

1. [Tentang Sintesa](#1-tentang-sintesa)
2. [Peran Pengguna](#2-peran-pengguna)
3. [Kebutuhan Sistem](#3-kebutuhan-sistem)
4. [Instalasi & Menjalankan di Laptop](#4-instalasi--menjalankan-di-laptop)
5. [Panduan Murid](#5-panduan-murid)
6. [Panduan Guru](#6-panduan-guru)
7. [Panduan Admin](#7-panduan-admin)
8. [Sistem Gamifikasi (XP, Level, Badge)](#8-sistem-gamifikasi-xp-level-badge)
9. [Misi AR Kelas 10 RPL](#9-misi-ar-kelas-10-rpl)
10. [Tugas, Library & Kelas](#10-tugas-library--kelas)
11. [Profil & Foto](#11-profil--foto)
12. [Deploy Online](#12-deploy-online)
13. [Troubleshooting](#13-troubleshooting)
14. [Lampiran A — Akun Bawaan](#lampiran-a--akun-bawaan)
15. [Lampiran B — Daftar Endpoint API](#lampiran-b--daftar-endpoint-api)
16. [Lampiran C — Daftar Gambar & Prompt](#lampiran-c--daftar-gambar--prompt)

---

## 1. Tentang Sintesa

**Sintesa** adalah platform pembelajaran interaktif yang menggabungkan:

- 🧊 **Augmented Reality (3D)** — 6 misi AR khusus Kelas 10 RPL, tiap misi berisi model 3D, materi ringkas, dan kuis latihan.
- 🎮 **Gamifikasi** — XP, 3 level (Level 3 = MAX tanpa batas), 6 badge, dan leaderboard.
- 📌 **Tugas digital** — guru membuat tugas ber-XP (poin s.d. 10.000) + file lampiran; murid mengumpulkan file; guru menilai + memberi feedback.
- 🗂️ **Library arsip** — penyimpanan file bebas (tanpa XP, tanpa nilai).
- 🏫 **Kelas berkode** — gabung kelas dengan kode unik, halaman dalam kelas ala forum kelas.

> ![Ilustrasi konsep Sintesa](docs/img/cover-konsep.png)
> *Gambar 1 — Ilustrasi konsep: murid SMK memainkan model 3D + XP. Lihat prompt di [Lampiran C](#lampiran-c--daftar-gambar--prompt).*

---

## 2. Peran Pengguna

| Peran | Cara dapat akun | Bisa apa saja |
|---|---|---|
| 🧑‍🎓 **Murid** | Daftar sendiri di halaman Register (otomatis jadi murid) | Main misi AR, kumpulkan tugas, isi library, lihat XP/badge/leaderboard, gabung kelas, atur profil & foto |
| 👩‍🏫 **Guru** | Dibuatkan oleh **admin** di `/admin` | Buat kelas + kode, tugaskan materi AR, buat tugas (+lampiran, poin s.d. 10.000), nilai + feedback, pantau leaderboard |
| 🛡️ **Admin** | Dibuat oleh `npm run seed` (1 akun awal) | Membuat akun guru, melihat daftar seluruh pengguna |

---

## 3. Kebutuhan Sistem

**Untuk menjalankan di laptop (development):**

| Kebutuhan | Minimal |
|---|---|
| Node.js | v20 ke atas |
| NPM | bawaan Node.js |
| Database | PostgreSQL (disarankan Neon — gratis, sudah terisi project ini) |
| Browser | Chrome / Edge terbaru (untuk AR penuh: Chrome Android / Safari iOS) |
| Koneksi internet | Ya (database cloud + model 3D dari CDN) |

**Untuk murid memakai (online):** cukup HP + browser, tanpa instal aplikasi.

---

## 4. Instalasi & Menjalankan di Laptop

### 4.1. Persiapan awal

```bash
cd edu-ar-project-final
```

### 4.2. Backend

```bash
cd edu-ar-backend
npm install
```

Buat file `.env` (contoh ada di `.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="isi-string-acak-panjang-minimal-32-karakter"
PORT=5000
# Opsional — akun admin awal:
ADMIN_EMAIL="admin@sintesa.id"
ADMIN_PASSWORD="ganti-segera-setelah-login"
```

Lalu siapkan database + data awal:

```bash
npm run generate   # generate Prisma Client
npm run migrate    # terapkan migrasi (pertama kali)
npm run seed       # isi 6 materi RPL + buat akun admin bila belum ada
npm run dev        # jalan di http://localhost:5000
```

Tes backend: buka `http://localhost:5000/` → harus tampil *"Backend Sintesa berjalan! 🚀"*.

### 4.3. Frontend

```bash
cd edu-ar-frontend
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Jalankan:

```bash
npm run dev     # http://localhost:3000
npm run lint    # cek error (harus 0 error)
npm run build   # cek build production (harus sukses 13 route)
```

> ⚠️ Jangan jalankan `npm run dev` dua kali (port bentrok). Satu terminal untuk backend, satu untuk frontend.

---

## 5. Panduan Murid

### 5.1. Daftar & masuk

1. Buka halaman utama → klik **Daftar** (atau tombol **Login** di layar sambutan).
2. Isi nama, email, password → **Daftar sebagai Murid**. *(Pendaftaran selalu menjadi murid; tidak ada pilihan guru.)*
3. Login dengan email + password → otomatis masuk **Dashboard** (isi: XP, badge, leaderboard).

> ![Screenshot halaman daftar](docs/img/screenshot-register.png)
> ![Screenshot layar sambutan](docs/img/screenshot-splash.png)

### 5.2. Gabung kelas (3 cara, hasilnya sama)

- **A.** Menu garis-3 (☰ kiri atas) → seksi **Kelas Saya** → **＋ Gabung Kelas Lain** → masukkan kode (contoh: `KELAS-X9K2A`) → **Gabung**.
- **B.** Halaman **Misi AR** → deretan shortcut kelas → kartu **＋ Gabung Kelas** → mengarah ke form gabung.
- **C.** Halaman **Misi AR** → seksi **Kelasku** → form **Gabung Kelas Baru**.

### 5.3. Memainkan misi AR

1. Buka **Misi AR** (menu garis-3) → pilih misi (mis. *Sistem Komputer & Cara Kerja*).
2. Putar/zoom model 3D. Di HP yang mendukung: ketuk **📱 Lihat dalam AR**.
3. Buka tab **📖 Materi** (3 artikel) lalu tab **📝 Soal** (3 soal pilihan ganda + pembahasan).
4. Buka materi dari gurumu → klik **⚡ Tandai Selesai (+100 XP)** → muncul animasi **"Misi Selesai!"** 🎉.

### 5.4. Mengumpulkan tugas

1. Buka **📌 Tugas** → pilih **shortcut kartu kelas** yang ada tugasnya (atau semua kelas).
2. Baca deskripsi + buka **📎 lampiran guru** bila ada.
3. Pilih file (maks 15 MB) → **Kumpulkan (+N XP)** → muncul animasi **"Horey! Tugas telah terkirim"**.
4. Kumpulkan revisi kapan saja (XP hanya dihitung **sekali** per tugas).
5. Nilai + feedback guru bisa dilihat di kartu tugas dan file-nya (tombol **👁️ Preview** untuk gambar/PDF).

### 5.5. Melihat progres (Dashboard)

Dashboard murid **khusus gamifikasi**: total XP, kartu level, koleksi badge (6), leaderboard, rincian XP tugas vs materi, dan kartu jalan pintas ke Misi AR / Tugas / Arsip.

### 5.6. Halaman dalam kelas

Klik nama kelas (di drawer / halaman AR) → terbuka halaman kelas berisi:

- **Banner** nama kelas + progres misi.
- Tab **Forum**: kartu **📌 Mendatang** (tenggat terdekat) + linimasa tugas & materi.
- Tab **Tugas Kelas**: kumpulkan langsung di situ.
- Tab **Misi AR**: materi kelas dari guru.

---

## 6. Panduan Guru

### 6.1. Mendapat akun

Minta admin membuatkan akun di `/admin`. Lalu login → masuk **Dashboard Guru**.

### 6.2. Membuat kelas

- Dashboard → **＋ Buat Kelas Baru** (isi nama + deskripsi) → dapat **kode unik** (contoh: `KELAS-X9K2A`) → bagikan ke murid.
- Atau buka kelas → tugaskan **materi AR** dari Library Materi (tombol **+ Tugaskan**).

### 6.3. Membuat tugas (+lampiran)

- Dashboard (**🎯 Buat Tugas**) atau halaman detail kelas (**🎯 Buat Tugas Kelas**):
  1. Pilih kelas, isi judul + deskripsi.
  2. Isi **Poin XP (boleh s.d. 10.000)** dan tenggat.
  3. *(Opsional)* Klik **📎 lampirkan file** (PDF/video/gambar/Word/PPT, maks 15 MB) untuk memperjelas tugas.
  4. **＋ Buat Tugas**.

### 6.4. Menilai pengumpulan

1. Buka **📌 Tugas** (atau **Nilai di Tugas** dari dashboard).
2. Pilih shortcut kelas → buka tugasnya. **Setiap pengumpulan tampil sebagai kartu terpisah** (nama murid, tanggal, ukuran file).
3. Klik **👁️ Preview** untuk memeriksa isi → **★ Beri Nilai** (0–100 + feedback) → **💾 Simpan**.
4. Tombol **🗑️ Hapus** untuk menghapus file yang tidak valid (dengan konfirmasi).

### 6.5. Memantau gamifikasi

Dashboard guru menampilkan **pemuncak leaderboard**, **total XP**, **jumlah tugas**, dan **top 5 leaderboard** — dipakai untuk memotivasi kelas (mis. umumkan pemuncak tiap pekan).

---

## 7. Panduan Admin

Login dengan akun admin → otomatis ke **`/admin`**.

- **Statistik**: jumlah akun murid / guru / admin.
- **＋ Buat Akun Guru**: isi nama + email + password awal (min. 6 karakter).
- **Daftar Pengguna**: filter Semua/Guru/Murid/Admin; tiap baris menampilkan jumlah kelas & file.
- Pendaftaran publik **tidak bisa** membuat guru/admin (selalu murid) — satu-satunya jalan via halaman ini.

---

## 8. Sistem Gamifikasi (XP, Level, Badge)

### 8.1. Aturan XP

| Aksi | XP |
|---|---|
| Selesaikan 1 materi AR | **+100** |
| Melihat materi (belum selesai) | +10 |
| Mengumpulkan 1 tugas guru | **+poin tugas** (ditentukan guru, maks 10.000), dihitung **sekali** per tugas |
| Upload revisi tugas yang sama | +0 (tetap boleh) |
| Arsip Library mandiri | +0 (murni penyimpanan) |
| Kuis latihan di /ar | +0 (latihan) |

### 8.2. Level (hanya 3, Level 3 = MAX)

| Level | Nama | Syarat | Berikutnya |
|---|---|---|---|
| 1 | 🌱 Penjelajah Baru | 0 XP | 500 XP |
| 2 | 🚀 Penjelajah Aktif | 500 XP | 1.500 XP |
| 3 | 🏆 Master Sintesa (**MAX**) | 1.500 XP | — (XP terus bertambah **tanpa batas**) |

> Desainnya: sejak Level 3, murid berlomba mengumpulkan XP sebesar-besarnya (mis. lewat tugas 1.000–10.000 poin) tanpa plafon.

### 8.3. Badge (6)

| Badge | Ikon | Cara dapat |
|---|---|---|
| Langkah Pertama | 🌱 | Selesaikan 1 materi |
| Penjelajah 3D | 🧊 | Selesaikan 3 materi |
| Master Materi | 🏆 | Selesaikan 5 materi |
| Pengumpul Tugas | 📚 | Kumpulkan 1 tugas guru |
| Pejuang Tugas | 🗂️ | Kumpulkan 3 tugas guru |
| Bintang AR | ⭐ | Capai 500 XP |

Saat badge baru didapat → muncul animasi **koin raksasa dilempar + kilau + konfeti** 🎉.

---

## 9. Misi AR Kelas 10 RPL

| # | Misi | Mapel | Model 3D |
|---|---|---|---|
| 1 | 🤖 Sistem Komputer & Cara Kerja | Sistem Komputer | Robot |
| 2 | 🛰️ Jaringan Komputer & Internet | Komputer & Jaringan | Astronot/Satelit |
| 3 | 🔊 Perangkat Keras: Input–Output | Sistem Komputer | Speaker |
| 4 | 💡 Elektronika & Mikrokontroler | Informatika | Lampu IoT |
| 5 | 🦆 Algoritma, Flowchart & Pemrograman Dasar | Informatika | Bebek langkah |
| 6 | 🪖 Keamanan Data & Proteksi | Informatika | Helm |

Setiap misi = **1 model 3D/AR + 3 artikel materi + 3 soal pilihan ganda berpembahasan**.

> Tips AR: gunakan Chrome Android / Safari iOS, beri izin kamera, arahkan ke meja kosong, ketuk *Lihat dalam AR*. Di laptop: putar + zoom dengan mouse.

---

## 10. Tugas, Library & Kelas

- **Tugas (`/tugas`)** — terikat tugas guru, ber-XP, bisa dinilai. Shortcut kartu kelas di atas untuk memilih kelas yang sedang ada tugasnya; tugas dikelompokkan per kelas.
- **Library (`/library`)** — arsip pribadi bebas (gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4/MP3, maks 15 MB per file). 0 XP, tanpa nilai.
- **Kelas** — gabung dengan kode (murid), buat + kelola (guru). Halaman dalam kelas berisi Forum, Tugas Kelas, dan Misi AR.

---

## 11. Profil & Foto

- Tekan **nama/foto di menu garis-3** → halaman **`/profil`**: foto besar + tombol 📷, nama, peran, email, statistik (XP/Level/Badge untuk murid; Kelas/Tugas/Murid untuk guru), menu lipat (Edit Profil, Kelas Saya, Tugas, Library, Keluar).
- **Ganti foto**: PNG/JPG/WEBP/GIF, maks 2 MB. Foto lama otomatis dihapus server.
- **Edit profil**: ubah nama; ganti password wajib memasukkan password lama.

---

## 12. Deploy Online

| Lapisan | Hosting | Catatan |
|---|---|---|
| Frontend | Vercel dan/atau Netlify | Env `NEXT_PUBLIC_API_URL` = URL backend + `/api` |
| Backend | Railway | Env `DATABASE_URL`, `JWT_SECRET`, `PORT`; migrasi jalan otomatis via script `build` |
| Database | Neon PostgreSQL | Sama untuk lokal & online |

Alur rilis: `git add -A` → `git commit -m "..."` → `git push origin main` → Railway + Vercel/Netlify deploy otomatis. File `netlify.toml` dan `edu-ar-frontend/vercel.json` sudah disiapkan di repo.

> ⚠️ **Catatan jaringan Indonesia**: domain `*.vercel.app` kadang diblokir operator. Solusi gratis: pindah frontend ke Netlify (`*.netlify.app`), atau pasang domain sendiri, atau buka via DNS `one.one.one.one` / aplikasi WARP.

---

## 13. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| `Tidak bisa terhubung ke server` | Backend mati / URL salah | Nyalakan backend; cek `NEXT_PUBLIC_API_URL` + `/api` di ujung |
| Login gagal padahal akun benar | `JWT_SECRET` beda/kosong di backend | Isi `JWT_SECRET` (min. 32 karakter acak), restart backend |
| `next: command not found` (Vercel) | Install Command salah | Isi `npm install`; Framework = Next.js; Root = `edu-ar-frontend` |
| 404 di Vercel/Netlify | Root Directory salah | Root = `edu-ar-frontend`; publish biarkan default/kosong |
| `DATABASE_URL not found` (Railway) | Variabel belum masuk deployment | Tambah variabel → tunggu redeploy selesai |
| Model 3D tidak muncul | Jaringan / WebGL | Gunakan Chrome terbaru, koneksi stabil; coba mode 3D biasa dulu |
| Upload ditolak | Tipe/ukuran file | Samakan dengan whitelist: gambar, PDF, Word, PPT, Excel, TXT, CSV, ZIP, MP4/MP3; maks 15 MB (foto profil 2 MB) |
| XP tugas tidak masuk | Revisi file yang sama | XP dihitung sekali per tugas; file pertama yang memberi XP |
| Halaman knight error `X is not defined` (dev) | Import hook kurang | Tambahkan ke `import {...} from 'react'`; jalankan `npm run lint` |

---

## Lampiran A — Akun Bawaan

| Akun | Email | Password | Dibuat oleh |
|---|---|---|---|
| Admin awal | `admin@sintesa.id` | `Admin12345` | `npm run seed` (**segera ganti!**) |
| Guru | — | — | Dibuat admin di `/admin` |
| Murid | — | — | Daftar sendiri di `/register` |

Ubah kredensial admin via `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `.env` sebelum seed, atau buat admin baru lalu hapus yang lama.

---

## Lampiran B — Daftar Endpoint API

Basis: `http://localhost:5000/api` (lokal) — semua kecuali register/login butuh header `Authorization: Bearer <token>`.

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| POST | `/auth/register` | Publik | Daftar (selalu murid) |
| POST | `/auth/login` | Publik | Masuk |
| GET | `/auth/me` | Login | Profil sendiri |
| PATCH | `/auth/me` | Login | Ubah nama/password |
| POST | `/auth/avatar` | Login | Unggah foto (multipart `avatar`, 2 MB) |
| GET | `/admin/users` | ADMIN | Daftar pengguna |
| POST | `/admin/teachers` | ADMIN | Buat akun guru |
| POST | `/classes` | GURU | Buat kelas (+kode) |
| GET | `/classes/my-classes` | GURU | Kelas milik guru |
| POST | `/classes/join` | SISWA | Gabung `{code}` |
| GET | `/classes/student-classes` | SISWA | Kelas + progres |
| GET | `/classes/:id` | Anggota | Detail kelas |
| GET | `/materials` | Publik | Daftar materi |
| GET | `/materials/:id` | Publik | Detail materi |
| PATCH | `/materials/:id/assign` | GURU | Tugaskan ke kelas |
| PATCH | `/materials/:id/progress` | SISWA | Tandai dilihat/selesai |
| POST | `/assignments` | GURU | Buat tugas (+lampiran `attachment`) |
| GET | `/assignments/my` | Login | Tugas saya |
| GET | `/assignments/class/:classId` | Anggota | Tugas per kelas |
| DELETE | `/assignments/:id` | GURU | Hapus tugas |
| POST | `/library/upload` | SISWA | Kumpul/arsip file |
| GET | `/library` | Login | Daftar file |
| GET | `/library/stats` | Login | Statistik file |
| DELETE | `/library/:id` | Pemilik/Guru | Hapus file |
| PATCH | `/library/:id/grade` | GURU | Nilai + feedback |
| GET | `/gamification/me` | SISWA | XP/level/badge saya |
| GET | `/gamification/leaderboard` | Publik | Top 10 |

---

## Lampiran C — Daftar Gambar & Prompt

> **Aturan simpan gambar:** seluruh gambar manual ini disimpan di folder **`docs/img/`** di root project
> (`edu-ar-project-final/docs/img/...`), lalu dirujuk dari dokumen ini dengan path relatif
> `docs/img/nama-file.png`. Buat foldernya bila belum ada: `mkdir docs/img`.
>
> **Jenis gambar:**
> - **Ilustrasi AI** → generate memakai prompt di bawah (Rasio 16:9, gaya flat modern).
> - **Screenshot** → ambil dari aplikasi berjalan (tulis keterangannya), simpan dengan nama yang ditentukan.

### C.1. Ilustrasi AI (digenerate)

**1. `cover-konsep.png`** — dipakai di [Bagian 1](#1-tentang-sintesa).
Prompt:
> "Flat vector illustration, Indonesian vocational high school students in uniform (one wearing hijab) gathered around a floating glowing 3D robot hologram above a desk, XP coins and trophy badges floating in the air, laptop and network cables on desk, bright blue and yellow color scheme, modern clean minimal style, 16:9, no text"

**2. `konsep-ar.png`** — dipakai di Bagian 9 (opsional, letakkan setelah tabel misi).
Prompt:
> "Isometric flat illustration of augmented reality learning: smartphone screen projecting 3D holograms of computer hardware, satellite, speaker and lamp icons, a student tapping the screen, blue violet gradient background, clean modern educational style, 16:9, no text"

**3. `konsep-gamifikasi.png`** — dipakai di Bagian 8 (opsional, letakkan setelah tabel level).
Prompt:
> "Flat vector illustration of game leaderboard podium with gold silver bronze trophies, big XP coin spinning in the center, confetti, three student avatars celebrating, blue and gold colors, playful educational style, 16:9, no text"

### C.2. Screenshot (diambil manual dari aplikasi)

| Nama file (`docs/img/...`) | Cara ambil | Dipakai di |
|---|---|---|
| `screenshot-splash.png` | Buka `/` tanpa login (layar sambutan) | Bagian 5.1 |
| `screenshot-register.png` | Buka `/register` | Bagian 5.1 |
| `screenshot-dashboard-murid.png` | Login murid → `/siswa` | Bagian 5.5 |
| `screenshot-misi-ar.png` | `/ar` → buka 1 misi + tab Soal | Bagian 5.3 |
| `screenshot-kumpul-tugas.png` | `/tugas` → kartu tugas + tombol Kumpulkan | Bagian 5.4 |
| `screenshot-horey.png` | Kumpulkan tugas → saat animasi "Horey!" muncul, screenshot cepat | Bagian 5.4 |
| `screenshot-badge.png` | Saat animasi koin badge muncul | Bagian 8.3 |
| `screenshot-dashboard-guru.png` | Login guru → `/guru` | Bagian 6 |
| `screenshot-nilai.png` | `/tugas` sebagai guru → kartu pengumpulan + modal nilai | Bagian 6.4 |
| `screenshot-admin.png` | Login admin → `/admin` | Bagian 7 |
| `screenshot-kelas.png` | `/kelas/<id>` tab Forum | Bagian 5.6 |
| `screenshot-profil.png` | `/profil` | Bagian 11 |

> Setelah file screenshot tersedia, ganti baris `> ![...]` yang relevan menjadi gambar aktif (formatnya sudah disiapkan, tinggal pastikan nama file sama).
