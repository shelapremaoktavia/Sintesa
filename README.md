# Sintesa — Platform Pembelajaran 3D & AR

Project final ini mempertahankan struktur dua folder: `edu-ar-frontend` dan `edu-ar-backend`.

## Fitur yang sudah dirapikan
- HOME profesional bertema gamifikasi + AR (hero + preview 3D interaktif)
- Katalog AR per pelajaran: 6 model tematik SD–SMA (tata surya, metamorfosis, sel, katrol, molekul, anatomi)
- Komponen AR tangguh (`ViewerAR`): loading, fallback model, tombol AR khusus perangkat mendukung
- Sistem gamifikasi stabil: materi +100, dilihat +10, TUGAS = poin guru (sekali per tugas), arsip 0 XP; 6 level, 6 badge, leaderboard live
- Halaman TUGAS (/tugas) terpisah: siswa kumpulkan per tugas guru, guru nilai + feedback per file
- Halaman LIBRARY (/library) khusus arsip mandiri tanpa XP: gambar, PDF, Word, PPT, Excel, TXT, CSV, ZIP, MP4/MP3
- Halaman MISI AR (/ar) sendiri: 6 misi + materi & soal latihan per misi + Kelasku (gabung kelas & materi guru)
- Drawer hamburger kiri: profil + foto + XP/level siswa di atas, menu Dashboard/Tugas/Library/Misi AR
- Animasi selebrasi: layar sukses "Horey!" + centang memantul saat tugas terkirim & misi selesai, dan koin badge raksasa ala lempar-koin + kilau + konfeti saat badge baru didapat
- Daftar Kelas Saya & Tugas Saya di drawer: otomatis minimize (tampilkan 1 + tombol sisanya) bila lebih dari 1
- Foto profil: unggah gambar (PNG/JPG/WEBP/GIF, maks 2 MB) via tombol 📷 di drawer
- Preview inline gambar & PDF, unduh file, nilai tugas 0–100 + feedback guru
- Login & register Guru/Siswa
- Redirect otomatis sesuai role
- Dashboard Siswa khusus gamifikasi (XP, badge, leaderboard); materi & kelas di /ar
- Dashboard Guru: leaderboard + statistik gamifikasi + kelola kelas & tugas
- Pembuatan kelas + kode kelas unik (guru), gabung kelas (siswa di /ar)
- Pengelolaan kelas Guru dan assign materi dari Library
- Halaman detail materi dengan viewer 3D/AR + panduan + tugas terkait
- Progress siswa: materi dilihat dan ditandai selesai
- Validasi backend untuk kepemilikan kelas dan keanggotaan siswa
- API URL frontend bisa diatur lewat `.env.local`
- `npm run lint` bersih (0 error) dan `npm run build` lolos

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

1. Buka HOME `/` — jelajahi hero gamifikasi, katalog AR, leaderboard, dan info Tugas vs Library.
2. Daftar sebagai **Guru**, login, lalu buat kelas dari dashboard.
3. Catat kode kelas + buat 1 tugas dengan poin mis. **150 XP**.
4. Daftar sebagai **Siswa**, login, buka `/ar` → gabung kelas dengan kode.
5. Buka materi kelas di `/ar` → **Tandai Selesai** (+100 XP), baca tab Materi, kerjakan tab Soal (latihan).
6. Buka `/tugas` → pilih tugas guru → unggah file → toast **“+150 XP masuk”**, XP dashboard +150.
7. Upload file kedua di tugas yang sama → XP tetap (anti-farming, revisi boleh).
8. Buka `/library` → simpan 1 arsip bebas → 0 XP (murni penyimpanan).
9. Login sebagai Guru → `/tugas` → beri nilai + feedback.
10. Cek XP/level/badge + leaderboard di dashboard (khusus gamifikasi).
11. Buka garis-3 → ganti foto profil via tombol 📷, buka-tutup daftar Kelas/Tugas bila isinya banyak.

## Aturan XP (stabil)

- Materi selesai +100 · dilihat +10
- Tugas guru: +`assignment.points` SEKALI per tugas (upload revisi tidak nambah)
- Arsip Library mandiri: +0 XP (tanpa XP)
- Kuis di /ar: latihan, tanpa XP

## Struktur terstruktur

```text
edu-ar-frontend/src/
  app/            → routing (/, /login, /register, /guru, /siswa, /ar, /tugas, /library, /kelas, /siswa/materi)
  components/
    home/         → HeroGamifikasi, GamifikasiFeatures, ARShowcase, LeaderboardSection, HowAndLibrary, CTAFooter
    ARViewer/     → ViewerAR (satu komponen 3D/AR untuk semua halaman)
    library/      → LibraryUploader, LibraryExplorer
    ui/           → AppHeader, badges (XPBadge, SectionHeading)
  lib/            → api, arCatalog, gamification, library (satu sumber kebenaran)

edu-ar-backend/
  server.js       → entry point + static /uploads + 404 JSON + error handler
  routes/         → auth, classes, materials, assignments, library, gamification
  controllers/    → logika tiap domain + validasi role/kepemilikan
  middleware/     → authMiddleware (JWT), upload (multer 15 MB library + avatar 2 MB khusus gambar)
  prisma/         → schema.prisma + seed.js (6 materi AR per pelajaran)
  uploads/        → penyimpanan file Library + avatars/ foto profil
```

## Catatan

## Catatan
Project ini meniru pola pengalaman penggunaan Assemblr EDU: fokus pada kelas, kumpulan materi berbentuk kartu, dan pengalaman belajar 3D/AR. Tampilan dibuat sebagai implementasi project sendiri, bukan salinan aset atau kode dari Assemblr.
