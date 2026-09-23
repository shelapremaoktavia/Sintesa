# 🎓 DRAF SLIDE PRESENTASI — SINTESA
### Platform Pembelajaran 3D & Augmented Reality untuk Kelas 10 SMK Jurusan RPL

> **Cara pakai file ini:** tiap `---` adalah 1 slide (total 15 slide, ±15 menit).
> Format: **Judul** → isi tayang → 🎙️ *naskah bicara* → 🖼️ *saran visual*.
> Ilustrasi: pakai `docs/img/cover-konsep.png` dkk. (prompt di `MANUALBOOK.md` Lampiran C).

---

## Slide 1 — Judul

# SINTESA
### Platform Pembelajaran 3D & Augmented Reality Berbasis Gamifikasi untuk Kelas 10 SMK Jurusan RPL

Nama · Kelas · Sekolah · Tahun

🎙️ *"Selamat pagi/siang. Perkenalkan, saya [nama]. Hari ini saya mempresentasikan project berjudul Sintesa, platform pembelajaran interaktif untuk murid Kelas 10 jurusan RPL."*

🖼️ Full-screen: `docs/img/cover-konsep.png` + logo ✦ Sintesa.

---

## Slide 2 — Latar Belakang

- Pembelajaran RPL (sistem komputer, jaringan, hardware) bersifat **abstrak** — sulit dipahami hanya dari buku.
- Minat belajar turun pada materi teori; tugas menumpuk di chat dan **hilang**.
- Solusi: gabungkan **visual 3D/AR** + **mekanik game** dalam satu platform web (tanpa instal aplikasi).

🎙️ *"Masalahnya ada dua: materi kejuruan yang abstrak, dan pengelolaan tugas yang berantakan. Sintesa menjawab keduanya sekaligus."*

🖼️ Kiri: ikon buku membosankan 📕 → Kanan: ikon 3D + XP 🎮.

---

## Slide 3 — Tujuan & Batasan

**Tujuan:**
1. Memvisualkan materi RPL lewat model 3D/AR.
2. Meningkatkan motivasi lewat XP, level, badge, leaderboard.
3. Merapikan alur tugas guru ↔ murid.

**Batasan:**
- Fokus **1 kelas**: Kelas 10 SMK jurusan **RPL**.
- 6 misi AR mapel: Sistem Komputer, Komputer & Jaringan, Informatika.
- 3 peran: Murid, Guru, Admin.

🎙️ *"Agar fokus, project ini dibatasi untuk satu kelas, yaitu Kelas 10 RPL, dengan tiga peran pengguna."*

---

## Slide 4 — Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, Plus Jakarta Sans |
| Backend | Express.js, Prisma ORM, JWT, Multer |
| Database | PostgreSQL (Neon, cloud) |
| 3D/AR | `<model-viewer>` (WebXR / Scene Viewer / Quick Look) |
| Hosting | Vercel/Netlify (frontend), Railway (backend) |

🎙️ *"Arsitekturnya client-server modern: frontend Next.js, backend Express + PostgreSQL cloud, dan model 3D memakai standar web agar jalan di HP tanpa aplikasi tambahan."*

🖼️ Diagram: HP/Laptop → Frontend → API → Backend → Database (bisa digambar cepat 4 kotak panah).

---

## Slide 5 — Fitur per Peran

- 🧑‍🎓 **Murid**: misi AR + kuis, kumpulkan tugas, arsip library, XP/badge/leaderboard, gabung kelas, profil + foto.
- 👩‍🏫 **Guru**: buat kelas + kode, tugaskan materi AR, buat tugas (poin s.d. 10.000 + lampiran file), nilai + feedback per pengumpulan.
- 🛡️ **Admin**: membuat akun guru, melihat seluruh pengguna.

🎙️ *"Pendaftaran umum otomatis menjadi murid — akun guru hanya bisa dibuat admin, sehingga datanya terkendali."*

---

## Slide 6 — DEMO 1: Misi AR (buka live `/ar`)

- Tampilkan: pilih misi → putar model 3D → tab Materi → tab Soal.
- Sebutkan 6 misi RPL dalam 1 kalimat.

🎙️ *"Ini halaman Misi AR. Saya pilih misi Jaringan Komputer — modelnya bisa diputar, ada materi ringkas, dan ada kuis berpembahasan. Di HP berkamera, modelnya bisa dimunculkan ke meja lewat AR."*

🖼️ LIVE DEMO (siapkan 1 misi favorit).

---

## Slide 7 — DEMO 2: Tugas & Animasi (buka live `/tugas`)

- Guru: buat tugas + lampiran → Murid: kumpulkan file → animasi **"Horey!"** + XP masuk.
- Guru menilai → pengumpulan tampil kartu terpisah + preview file.

🎙️ *"Alur tugasnya dua arah dan hidup: murid mengumpulkan dan langsung dirayakan animasi, guru menilai per kartu pengumpulan."*

🖼️ LIVE DEMO (siapkan akun guru + murid demo).

---

## Slide 8 — Sistem Gamifikasi

| Aturan | Nilai |
|---|---|
| Materi selesai / dilihat | +100 / +10 XP |
| Tugas guru | +poin guru (s.d. 10.000), sekali per tugas |
| Level | 1 → 2 (500 XP) → **3 MAX** (1.500 XP, tanpa batas) |
| Badge | 6 (3 materi + 2 tugas + 1 XP) |
| Arsip & kuis | 0 XP (latihan/penyimpanan) |

🎙️ *"Level dirancang hanya tiga, dengan Level 3 sebagai MAX tanpa plafon — murid berlomba mengumpulkan XP sebesar-besarnya lewat tugas berbobot."*

🖼️ `docs/img/konsep-gamifikasi.png` + screenshot animasi badge.

---

## Slide 9 — Arsitektur & Alur Data (singkat)

- Frontend ↔ REST API (JWT) ↔ Express ↔ Prisma ↔ PostgreSQL.
- File (tugas/arsip/foto/lampiran) → disk `uploads/` tersegmentasi + validasi tipe & ukuran.
- Satu sumber kebenaran XP di backend; frontend hanya menampilkan.

🎙️ *"Semua hitungan XP terpusat di backend agar konsisten antara dashboard, leaderboard, dan halaman materi."*

---

## Slide 10 — Pengujian Fungsional (ringkas)

| # | Skenario | Hasil |
|---|---|---|
| 1 | Daftar → otomatis murid (coba role=guru) | ✅ Tetap murid |
| 2 | Admin buat guru → guru login | ✅ Berhasil |
| 3 | Buat tugas 5.000 poin → murid kumpulkan | ✅ +5.000 XP sekali |
| 4 | Upload revisi tugas sama | ✅ XP tidak nambah |
| 5 | Lampiran PDF/video di tugas | ✅ Tersimpan & bisa dibuka |
| 6 | XP ≥ 1.500 | ✅ Lv.3 MAX, XP jalan terus |
| 7 | `npm run lint` + `npm run build` | ✅ 0 error, 13 route |

🎙️ *"Tujuh pengujian utama semuanya lolos, termasuk pengaman role dan anti-farming XP."*

---

## Slide 11 — Kendala & Solusi

| Kendala | Solusi |
|---|---|
| Materi dinamis sulit di hosting statis | Tetap memakai SSR (Vercel/Netlify), bukan static export |
| Domain `vercel.app` diblokir operator ID | Alternatif Netlify + opsi domain sendiri |
| File upload menumpuk | Nama file unik + hapus otomatis saat data dihapus |
| Keterbatasan model 3D gratis | Pilih 6 model tervalidasi + framing materi yang jujur |

🎙️ *"Setiap kendala teknis dicatat solusinya — misalnya domain yang diblokir operator diatasi dengan hosting alternatif."*

---

## Slide 12 — Kesimpulan

1. Sintesa berhasil menggabungkan AR, gamifikasi, dan manajemen tugas dalam satu platform untuk Kelas 10 RPL.
2. Mekanik game (XP/level/badge/leaderboard) berjalan stabil dan terpusat.
3. Alur guru–murid–admin terdigitalisasi penuh: kelas berkode, tugas berlampiran, penilaian ber-feedback.

🎙️ *"Kesimpulannya: tiga tujuan tercapai — visualisasi materi, motivasi lewat game, dan ketertiban tugas."*

---

## Slide 13 — Saran Pengembangan

1. Bank soal + nilai kuis otomatis masuk XP.
2. Penyimpanan file object storage (S3/Cloudinary) agar tahan redeploy.
3. Notifikasi tenggat tugas (email/push).
4. Mode offline materi AR + aplikasi Android/iOS native.
5. Analitik belajar guru (grafik progres per murid).

🎙️ *"Ke depan, prioritasnya adalah nilai kuis otomatis dan penyimpanan file yang lebih skalabel."*

---

## Slide 14 — Demo Penutup (live 1 menit)

- Tunjukkan leaderboard bergerak + profil berfoto + halaman kelas ala forum.
- Akhiri di halaman utama.

🎙️ *"Sebagai penutup, ini leaderboard live-nya — datanya nyata dari database. Sekian, terima kasih."*

---

## Slide 15 — Terima Kasih

# Terima kasih 🙏
### Sesi tanya jawab dibuka

*(Siapkan jawaban untuk: "Kenapa level cuma 3?", "Kenapa arsip 0 XP?", "Bagaimana keamanan akun guru?", "Apakah jalan offline?" — jawabannya ada di MANUALBOOK.md)*
