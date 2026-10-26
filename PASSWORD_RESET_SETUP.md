# Mengaktifkan fitur lupa sandi

Halaman lupa sandi sudah ada, tetapi tautan baru bisa dikirim setelah pengirim email dikonfigurasi. Proyek ini memakai API Resend.

## Yang perlu disiapkan

1. Buat API key Resend dan siapkan alamat pengirim yang sudah diverifikasi di Resend.
2. Buka project backend sintesa-backend di Vercel, lalu Settings → Environment Variables.
3. Tambahkan variabel berikut untuk Production:
   - RESEND_API_KEY: API key dari Resend. Jangan masukkan ke GitHub atau chat.
   - RESEND_FROM: alamat pengirim yang diverifikasi, misalnya Sintesa <no-reply@domainmu.com>.
   - FRONTEND_URL: https://sintesa-chi.vercel.app.
4. Simpan variabel lalu deploy ulang backend di Vercel.

Jika variabel belum diisi, halaman akan memberi tahu bahwa fitur reset belum aktif. Setelah aktif, permintaan reset memakai tautan bertanda tangan yang berlaku 15 menit dan hanya dapat dipakai sekali.
