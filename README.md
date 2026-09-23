# Sintesa — Platform Pembelajaran 3D & AR

Project final ini mempertahankan struktur dua folder: `edu-ar-frontend` dan `edu-ar-backend`.

## Fokus: Kelas 10 SMK jurusan RPL
Seluruh AR & pembelajaran difokuskan ke 1 kelas: **Kelas 10 RPL** (mapel Sistem Komputer,
Komputer & Jaringan, Informatika). 6 misi AR: sistem komputer, jaringan, hardware,
mikrokontroler, algoritma & keamanan data — tiap misi ada materi + soal latihan.

## Fitur yang sudah dirapikan
- HOME profesional bertema gamifikasi + AR (hero + preview 3D interaktif)
- Katalog AR RPL: 6 misi Kelas 10 (sistem komputer, jaringan, hardware, mikrokontroler, algoritma, keamanan data)
- Komponen AR tangguh (`ViewerAR`): loading, fallback model, tombol AR khusus perangkat mendukung
- Level 1–3 saja (Lv.3 Master Sintesa = MAX, tanpa batas XP); poin tugas guru bisa s.d. 10.000
- Sistem gamifikasi stabil: materi +100, dilihat +10, TUGAS = poin guru (sekali per tugas), arsip 0 XP; 6 badge, leaderboard live
- Halaman TUGAS (/tugas) terpisah: tugas dikelompokkan per kelas + filter kelas, siswa kumpulkan per tugas guru, guru nilai + feedback per file
- Pengumpulan guru tampil terpisah: tiap file siswa jadi kartu sendiri (nama, tanggal, nilai, feedback)
- Tugas bisa dilampiri file penjelas guru (PDF, video, gambar, Word, PPT, maks 15 MB)
- Preview file terkumpul (gambar & PDF inline) di kartu tugas siswa & guru
- Halaman LIBRARY (/library) khusus arsip mandiri tanpa XP: gambar, PDF, Word, PPT, Excel, TXT, CSV, ZIP, MP4/MP3
- Halaman MISI AR (/ar) sendiri: 6 misi + materi & soal latihan per misi + Kelasku (gabung kelas & materi guru)
- Drawer hamburger kiri: kartu profil (foto, nama, peran, XP/level murid · jumlah kelas guru) + menu + Kelas/Tugas minimize
- Animasi selebrasi: layar sukses "Horey!" + centang memantul saat tugas terkirim & misi selesai, dan koin badge raksasa ala lempar-koin + kilau + konfeti saat badge baru didapat
- Daftar Kelas Saya & Tugas Saya di drawer: otomatis minimize (tampilkan 1 + tombol sisanya) bila lebih dari 1
- Foto profil: unggah gambar (PNG/JPG/WEBP/GIF, maks 2 MB) via tombol 📷 di drawer
- Preview inline gambar & PDF, unduh file, nilai tugas 0–100 + feedback guru
- Pendaftaran publik khusus murid (otomatis SISWA); akun guru hanya dibuat admin di /admin
- Redirect otomatis sesuai role (murid/guru/admin)
- Dashboard Siswa khusus gamifikasi (XP, badge, leaderboard); materi & kelas di /ar
- Dashboard Guru: leaderboard + statistik gamifikasi + kelola kelas & tugas
- Pembuatan kelas + kode kelas unik (guru), gabung kelas (siswa di /ar)
- Pengelolaan kelas Guru dan assign materi dari Library
- Halaman detail materi dengan viewer 3D/AR + panduan + tugas terkait
- Progress siswa: materi dilihat dan ditandai selesai
- Validasi backend untuk kepemilikan kelas dan keanggotaan siswa
- API URL frontend bisa diatur lewat `.env.local`
- `npm run lint` bersih (0 error) dan `npm run build` lolos

## Akun admin awal
Dibuat otomatis oleh `npm run seed` bila belum ada (bisa diubah via `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `.env`):
- Email: `admin@sintesa.id` · Password default: `Admin12345` (segera ganti!)

## Menjalankan backend

```bash
cd edu-ar-backend
npm install
npm run generate
npm run migrate
npm run dev
```

Buat file `.env` dari `.env.example`, lalu isi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="ganti-dengan-secret-yang-aman"
PORT=5000
```

## Menjalankan frontend

```bash
cd edu-ar-frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

Bila URL backend berbeda, salin `edu-ar-frontend/.env.local.example` menjadi `.env.local` dan sesuaikan `NEXT_PUBLIC_API_URL`.

## Alur uji project

1. Buka HOME `/` — hero RPL, katalog 6 misi AR, leaderboard, info Tugas vs Library.
2. Login sebagai **admin** (`admin@sintesa.id`) → `/admin` → buat akun guru.
3. Login sebagai **Guru** → buat kelas (mis. "Kelas 10 RPL") → buat tugas poin **1.000** + lampiran PDF.
4. Daftar sebagai **Murid** (otomatis SISWA) → login → buka `/ar` → gabung kelas.
5. Buka misi RPL di `/ar` → tab Materi & Soal, buka materi kelas → **Tandai Selesai** (+100 XP).
6. Buka `/tugas` → lihat lampiran guru → unggah file → animasi "Horey!" + XP masuk.
7. Kumpulkan hingga XP ≥ 1500 → cek Lv.3 Master Sintesa (MAX), XP terus bertambah tanpa batas.
8. Buka `/library` → simpan arsip → 0 XP. Preview file terkumpul via 👁️ di kartu tugas.
9. Login Guru → `/tugas` → tiap pengumpulan tampil kartu terpisah → beri nilai.
10. Garis-3: kartu profil (foto, XP/kelas), minimize Kelas/Tugas bila >1.

## Aturan XP & level

- Level 1 Penjelajah Baru (0+) · Level 2 Penjelajah Aktif (500+) · **Level 3 Master Sintesa (1500+, MAX, XP tanpa batas)**
- Materi selesai +100 · dilihat +10
- Tugas guru: +`assignment.points` SEKALI per tugas, poin boleh s.d. **10.000**
- Arsip Library mandiri: +0 XP (tanpa XP)
- Kuis di /ar: latihan, tanpa XP

## Struktur terstruktur

```text
edu-ar-frontend/src/
  app/            → routing (/, /login, /register, /admin, /guru, /siswa, /ar, /tugas, /library, /kelas, /siswa/materi)
  components/
    home/         → HeroGamifikasi, GamifikasiFeatures, ARShowcase, LeaderboardSection, HowAndLibrary, CTAFooter
    ARViewer/     → ViewerAR (satu komponen 3D/AR untuk semua halaman)
    library/      → LibraryUploader, LibraryExplorer
    tugas/        → AttachmentPicker, TaskAttachmentBox, FilePreview
    ui/           → AppHeader, badges (XPBadge, SectionHeading), Celebration
  lib/            → api, arCatalog (RPL), gamification, library (satu sumber kebenaran)

edu-ar-backend/
  server.js       → entry point + static /uploads + 404 JSON + error handler
  routes/         → auth, classes, materials, assignments, library, gamification, admin
  controllers/    → logika tiap domain + validasi role/kepemilikan
  middleware/     → authMiddleware (JWT), upload (multer 15 MB library/tugas + avatar 2 MB khusus gambar)
  prisma/         → schema.prisma + seed.js (6 materi RPL Kelas 10 + admin awal)
  uploads/        → penyimpanan file Library + tasks/ lampiran + avatars/ foto profil
```

## Catatan

## Catatan
Project ini meniru pola pengalaman penggunaan Assemblr EDU: fokus pada kelas, kumpulan materi berbentuk kartu, dan pengalaman belajar 3D/AR. Tampilan dibuat sebagai implementasi project sendiri, bukan salinan aset atau kode dari Assemblr.
