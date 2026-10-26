# Deploy Sintesa API ke Vercel

Struktur repo memakai dua aplikasi. Buat satu Vercel Project untuk frontend yang sudah ada, lalu buat project kedua untuk Express API di `edu-ar-backend`. Keduanya dapat memakai repository GitHub yang sama dengan Root Directory berbeda.

## 1. Siapkan project backend

1. Di Vercel, pilih **Add New → Project**, import repository Sintesa, lalu atur **Root Directory** ke `edu-ar-backend`.
2. Gunakan Node.js dan build command `npm run build`. Build hanya menjalankan Prisma Client generation; migrasi database dijalankan satu kali secara terpisah.
3. Deploy project. Express API dan auth berjalan sebagai Vercel Function. Server tidak menyimpan file pada disk lokal.

## 2. Hubungkan Blob dan environment backend

Di project backend, buat Vercel Blob store dengan akses **Public** dan hubungkan ke Production serta Preview. Integrasi menambahkan `BLOB_READ_WRITE_TOKEN` ke environment backend.

Isi environment berikut untuk Production:

| Variabel | Nilai |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL/Neon yang dipakai sekarang |
| `JWT_SECRET` | Secret acak baru, minimal 32 karakter |
| `CORS_ORIGINS` | Origin frontend, misalnya `https://sintesa-chi.vercel.app` tanpa `/` di akhir |
| `BLOB_READ_WRITE_TOKEN` | Dibuat Vercel saat Blob store dihubungkan |
| `ADMIN_EMAIL` | Hanya diperlukan bila database belum punya admin |
| `ADMIN_PASSWORD` | Password kuat untuk admin pertama, bila perlu membuatnya |

Masukkan setiap origin frontend yang memang digunakan, dipisah koma. Untuk Preview, tambahkan origin frontend Preview yang akan mengakses API. Jangan menaruh `BLOB_READ_WRITE_TOKEN`, `DATABASE_URL`, atau `JWT_SECRET` di variabel `NEXT_PUBLIC_*`.

## 3. Jalankan migrasi database sekali

Database tetap berada di PostgreSQL/Neon; data user dan tabel tidak dipindah. Dari folder backend yang sudah ditautkan ke project Vercel, tarik environment Production secara lokal, lalu jalankan:

```bash
cd edu-ar-backend
vercel link
vercel env pull .env
npm run migrate:deploy
```

Pastikan perintah ini memakai `DATABASE_URL` Production. Jangan jalankan seed ke database Production kecuali memang perlu menambahkan materi dan admin pertama. Jika menjalankan seed, atur `ADMIN_EMAIL` serta `ADMIN_PASSWORD`; tidak ada lagi kredensial bawaan.

## 4. Sambungkan frontend

Pada Vercel Project frontend, atur **Root Directory** ke `edu-ar-frontend`, kemudian set:

```text
NEXT_PUBLIC_API_URL=https://<domain-backend-vercel>/api
```

Jika ada file lama yang masih diakses lewat path `/uploads/...`, tambahkan sementara:

```text
NEXT_PUBLIC_LEGACY_UPLOADS_URL=https://<domain-railway-lama>
```

Setelah asset lama berhasil dipindahkan ke Blob dan URL di database diperbarui, hapus variabel legacy tersebut.

## 5. File lama dan upload baru

Upload foto, lampiran tugas, dan library yang baru masuk langsung dari browser ke Vercel Blob. API hanya mengeluarkan token upload terbatas, memeriksa pemilik, tipe, dan ukuran file, lalu menyimpan metadata ke PostgreSQL. Ini juga menghindari batas payload Vercel Function untuk upload file besar. Lihat [Vercel Blob client uploads](https://vercel.com/docs/vercel-blob/client-upload) dan [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).

File yang sudah tersimpan di filesystem Railway **tidak dipindahkan otomatis**. Sebelum menonaktifkan Railway, salin asset lama ke Blob dan perbarui URL di database, atau pertahankan Railway sementara melalui `NEXT_PUBLIC_LEGACY_UPLOADS_URL`. Jangan anggap file lokal pada Vercel Function sebagai penyimpanan persisten.

Blob disetel Public agar tautan langsung dan preview aplikasi tetap berfungsi. Siapa pun yang memiliki URL file publik dapat membukanya; gunakan penyimpanan private dengan endpoint baca yang terautentikasi bila file siswa perlu dirahasiakan.

## Keamanan kredensial

Repository sebelumnya memuat kredensial database dan secret JWT di contoh environment yang dapat dibaca publik. Mengganti contoh pada branch ini tidak menghapus nilai dari riwayat Git. Rotasi password/credential Neon, `JWT_SECRET`, dan password admin yang terdampak sebelum Production dialihkan. Mengganti `JWT_SECRET` akan mengakhiri semua sesi login yang tokennya ditandatangani dengan secret lama.
