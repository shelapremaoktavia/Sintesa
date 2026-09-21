// lib/arCatalog.js
// Katalog AR per pelajaran: satu sumber kebenaran untuk HOME, halaman /ar,
// dashboard, dan halaman materi. URL model selaras dengan prisma/seed.js backend.
// Setiap misi membawa: materi pembelajaran + soal latihan (kuis).
const MV = 'https://modelviewer.dev/shared-assets/models';
const KH = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0';

export const AR_CATALOG = [
  {
    slug: 'tata-surya',
    title: 'Sistem Tata Surya',
    jenjang: 'SD',
    subject: 'IPA',
    emoji: '🪐',
    gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed 55%,#db2777)',
    glb: `${MV}/Astronaut.glb`,
    usdz: `${MV}/Astronaut.usdz`,
    mission: 'Identifikasi 3 planet & raih 100 XP',
    xp: 100,
    skills: ['Observasi', 'Skala & Orbit'],
    instruction: 'Arahkan kamera ke meja kosong, ketuk “Lihat dalam AR”, lalu berjalan mengelilingi luar angkasa miniaturnya.',
    materi: [
      { judul: 'Susunan Tata Surya', isi: 'Matahari di pusat, dikelilingi 8 planet: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, Neptunus. Planet dalam berbatu, planet luar raksasa gas.' },
      { judul: 'Orbit & Revolusi', isi: 'Setiap planet mengorbit Matahari. Makin jauh dari Matahari, makin lama waktu satu putarannya: Bumi 365 hari, Neptunus 165 tahun.' },
      { judul: 'Skala Ukuran', isi: 'Jupiter adalah planet terbesar (1.300 kali volume Bumi), sedangkan Merkurius terkecil. Perhatikan perbedaan skala pada model 3D.' },
    ],
    quiz: [
      { q: 'Planet terdekat dari Matahari adalah …', options: ['Venus', 'Merkurius', 'Mars', 'Bumi'], answer: 1, explain: 'Urutan planet: Merkurius paling dekat dengan Matahari.' },
      { q: 'Planet terbesar di tata surya adalah …', options: ['Saturnus', 'Bumi', 'Jupiter', 'Neptunus'], answer: 2, explain: 'Jupiter adalah raksasa gas terbesar, volumenya ±1.300 kali Bumi.' },
      { q: 'Satu kali revolusi Bumi memakan waktu …', options: ['24 jam', '30 hari', '365 hari', '12 tahun'], answer: 2, explain: 'Revolusi Bumi mengelilingi Matahari = 1 tahun (±365 hari).' },
    ],
  },
  {
    slug: 'metamorfosis',
    title: 'Daur Hidup Kupu-Kupu',
    jenjang: 'SD',
    subject: 'IPA',
    emoji: '🦋',
    gradient: 'linear-gradient(135deg,#059669,#0ea5e9 60%,#6366f1)',
    glb: `${KH}/Duck/glTF-Binary/Duck.glb`,
    usdz: null,
    mission: 'Urutkan fase metamorfosis & klaim badge 🌱',
    xp: 100,
    skills: ['Klasifikasi', 'Siklus Hidup'],
    instruction: 'Putar model hewan, zoom untuk detail, lalu diskusikan tiap fase metamorfosis bersama kelompok.',
    materi: [
      { judul: 'Apa itu Metamorfosis?', isi: 'Metamorfosis adalah perubahan bentuk tubuh hewan dari menetas hingga dewasa. Kupu-kupu mengalami metamorfosis sempurna dengan 4 tahap.' },
      { judul: '4 Tahap Kupu-Kupu', isi: 'Telur → Larva (ulat) → Pupa (kepompong) → Imago (kupu-kupu dewasa). Tahap larva fokus makan dan tumbuh, tahap pupa terjadi perubahan total.' },
      { judul: 'Mengapa Berubah?', isi: 'Setiap tahap punya peran: telur melindungi embrio, ulat makan dan tumbuh cepat, kepompong tempat transformasi, kupu-kupu dewasa berkembang biak.' },
    ],
    quiz: [
      { q: 'Urutan metamorfosis kupu-kupu yang benar adalah …', options: ['Telur – pupa – larva – imago', 'Telur – larva – pupa – imago', 'Larva – telur – imago – pupa', 'Pupa – telur – larva – imago'], answer: 1, explain: 'Urutan sempurna: telur → larva (ulat) → pupa (kepompong) → imago (dewasa).' },
      { q: 'Tahap kepompong disebut juga …', options: ['Larva', 'Pupa', 'Imago', 'Nimfa'], answer: 1, explain: 'Kepompong adalah tahap pupa, tempat tubuh ulat berubah total.' },
      { q: 'Pada tahap apa kupu-kupu paling banyak makan?', options: ['Telur', 'Larva (ulat)', 'Pupa', 'Imago'], answer: 1, explain: 'Ulat (larva) makan daun terus-menerus untuk tumbuh sebelum menjadi kepompong.' },
    ],
  },
  {
    slug: 'struktur-sel',
    title: 'Struktur Sel Hewan & Tumbuhan',
    jenjang: 'SMP',
    subject: 'Biologi',
    emoji: '🔬',
    gradient: 'linear-gradient(135deg,#0d9488,#22c55e 55%,#84cc16)',
    glb: `${KH}/Avocado/glTF-Binary/Avocado.glb`,
    usdz: null,
    mission: 'Bedah sel virtual & raih 100 XP',
    xp: 100,
    skills: ['Lab Virtual', 'Analisis Struktur'],
    instruction: 'Gunakan zoom maksimal untuk melihat lapisan organik, lalu bandingkan dengan diagram sel di modul.',
    materi: [
      { judul: 'Sel: Unit Terkecil Kehidupan', isi: 'Semua makhluk hidup tersusun dari sel. Sel hewan dan tumbuhan punya membran sel, sitoplasma, dan nukleus (inti sel) sebagai pusat kendali.' },
      { judul: 'Bedanya Sel Hewan & Tumbuhan', isi: 'Sel tumbuhan punya dinding sel dan kloroplas (fotosintesis) plus vakuola besar. Sel hewan tidak punya ketiganya, hanya vakuola kecil.' },
      { judul: 'Organel Penting', isi: 'Mitokondria penghasil energi, ribosom pembuat protein, dan membran sel pengatur keluar-masuk zat. Amati strukturnya pada model 3D.' },
    ],
    quiz: [
      { q: 'Organel yang hanya dimiliki sel tumbuhan untuk fotosintesis adalah …', options: ['Mitokondria', 'Kloroplas', 'Nukleus', 'Ribosom'], answer: 1, explain: 'Kloroplas mengandung klorofil untuk fotosintesis, hanya ada di tumbuhan.' },
      { q: 'Pusat kendali sel yang menyimpan materi genetik adalah …', options: ['Sitoplasma', 'Membran sel', 'Nukleus', 'Vakuola'], answer: 2, explain: 'Nukleus (inti sel) menyimpan DNA dan mengatur aktivitas sel.' },
      { q: 'Organel penghasil energi sel disebut …', options: ['Ribosom', 'Mitokondria', 'Dinding sel', 'Kloroplas'], answer: 1, explain: 'Mitokondria mengubah makanan menjadi energi (ATP).' },
    ],
  },
  {
    slug: 'katrol',
    title: 'Sistem Kerja Katrol',
    jenjang: 'SMP',
    subject: 'Fisika',
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg,#ea580c,#f59e0b 55%,#eab308)',
    glb: `${MV}/RobotExpressive.glb`,
    usdz: null,
    mission: 'Analisis sistem mekanik & naik level 🚀',
    xp: 100,
    skills: ['Eksperimen', 'Gaya & Gerak'],
    instruction: 'Aktifkan auto-rotate untuk melihat sisi mekanik, lalu uji pemahamanmu lewat misi fisika di kelas.',
    materi: [
      { judul: 'Katrol: Pesawat Sederhana', isi: 'Katrol adalah roda beralur dengan tali yang mengubah arah gaya. Termasuk pesawat sederhana seperti tuas dan bidang miring.' },
      { judul: 'Jenis Katrol', isi: 'Katrol tetap mengubah arah gaya tanpa menggandakan kuasa. Katrol bebas menggandakan kuasa (gaya setengahnya). Katrol majemuk menggabungkan keduanya.' },
      { judul: 'Keuntungan Mekanis', isi: 'Keuntungan mekanis = beban ÷ kuasa. Katrol bebas KM = 2, artinya gaya yang dibutuhkan hanya setengah berat beban.' },
    ],
    quiz: [
      { q: 'Fungsi utama katrol tetap adalah …', options: ['Menggandakan gaya', 'Mengubah arah gaya', 'Mengurangi beban', 'Menambah kecepatan'], answer: 1, explain: 'Katrol tetap hanya mengubah arah gaya tarik, besarnya tetap sama.' },
      { q: 'Untuk mengangkat beban 100 N dengan katrol bebas, gaya yang dibutuhkan …', options: ['100 N', '50 N', '200 N', '25 N'], answer: 1, explain: 'Katrol bebas punya KM = 2, jadi kuasa = beban ÷ 2 = 50 N.' },
      { q: 'Katrol termasuk jenis …', options: ['Pesawat rumit', 'Pesawat sederhana', 'Motor listrik', 'Rangkaian elektronik'], answer: 1, explain: 'Katrol adalah pesawat sederhana yang memudahkan usaha manusia.' },
    ],
  },
  {
    slug: 'molekul',
    title: 'Molekul & Ikatan Kimia',
    jenjang: 'SMA',
    subject: 'Kimia',
    emoji: '⚗️',
    gradient: 'linear-gradient(135deg,#0284c7,#6366f1 55%,#a855f7)',
    glb: `${KH}/WaterBottle/glTF-Binary/WaterBottle.glb`,
    usdz: null,
    mission: 'Visualisasikan H2O & kumpulkan 100 XP',
    xp: 100,
    skills: ['Model Molekul', 'Ikatan Kimia'],
    instruction: 'Putar model molekul air, amati simetrinya, lalu hubungkan dengan materi ikatan kovalen.',
    materi: [
      { judul: 'Molekul Air (H2O)', isi: 'Satu molekul air terdiri dari 2 atom hidrogen dan 1 atom oksigen yang terikat kovalen dengan sudut ±104,5°, membentuk huruf V.' },
      { judul: 'Ikatan Kovalen', isi: 'Pada ikatan kovalen, atom berbagi pasangan elektron. Oksigen berbagi satu elektron dengan tiap hidrogen sehingga semua mencapai konfigurasi stabil.' },
      { judul: 'Sifat Unik Air', isi: 'Bentuk polar membuat air pelarut universal, punya tegangan permukaan tinggi, dan titik didih lebih tinggi dari molekul seukurannya.' },
    ],
    quiz: [
      { q: 'Rumus kimia molekul air adalah …', options: ['CO2', 'H2O', 'O2', 'H2O2'], answer: 1, explain: 'Air tersusun dari 2 hidrogen + 1 oksigen: H2O.' },
      { q: 'Ikatan antara H dan O dalam air termasuk ikatan …', options: ['Ion', 'Kovalen', 'Logam', 'Hidrogen antar atom penyusunnya'], answer: 1, explain: 'H dan O berbagi elektron → ikatan kovalen (ikatan hidrogen terjadi antar molekul).' },
      { q: 'Sudut ikatan molekul air sekitar …', options: ['90°', '104,5°', '120°', '180°'], answer: 1, explain: 'Bentuk bengkok (V) air memiliki sudut ±104,5°.' },
    ],
  },
  {
    slug: 'jantung',
    title: 'Anatomi Jantung Manusia',
    jenjang: 'SMA',
    subject: 'Biologi Lanjutan',
    emoji: '🫀',
    gradient: 'linear-gradient(135deg,#e11d48,#f43f5e 55%,#fb7185)',
    glb: `${KH}/BrainStem/glTF-Binary/BrainStem.glb`,
    usdz: null,
    mission: 'Praktikum anatomi virtual & badge 🏆',
    xp: 100,
    skills: ['Anatomi', 'Praktikum Virtual'],
    instruction: 'Perbesar model anatomi, identifikasi tiap bagian, lalu presentasikan temuanmu seperti dokter muda.',
    materi: [
      { judul: 'Jantung: Pompa Ganda', isi: 'Jantung punya 4 ruang: serambi (atrium) kanan-kiri dan bilik (ventrikel) kanan-kiri. Sisi kanan memompa darah ke paru-paru, sisi kiri ke seluruh tubuh.' },
      { judul: 'Aliran Darah', isi: 'Darah kotor → serambi kanan → bilik kanan → paru-paru (ambil oksigen) → serambi kiri → bilik kiri → seluruh tubuh. Katup mencegah aliran balik.' },
      { judul: 'Menjaga Jantung', isi: 'Olahraga rutin, makanan rendah garam-lemak berlebih, cukup tidur, dan tidak merokok menjaga jantung tetap kuat memompa ±100.000 kali per hari.' },
    ],
    quiz: [
      { q: 'Ruang jantung yang memompa darah ke seluruh tubuh adalah …', options: ['Serambi kanan', 'Bilik kanan', 'Serambi kiri', 'Bilik kiri'], answer: 3, explain: 'Bilik kiri berdinding paling tebal untuk memompa darah kaya oksigen ke seluruh tubuh.' },
      { q: 'Darah kotor dari tubuh pertama kali masuk ke …', options: ['Serambi kanan', 'Bilik kiri', 'Serambi kiri', 'Aorta'], answer: 0, explain: 'Darah rendah oksigen masuk ke serambi kanan, lalu ke bilik kanan menuju paru-paru.' },
      { q: 'Fungsi katup jantung adalah …', options: ['Memompa darah', 'Mencegah aliran balik darah', 'Mengikat oksigen', 'Menyaring racun'], answer: 1, explain: 'Katup membuka-tutup agar darah mengalir satu arah dan tidak berbalik.' },
    ],
  },
];

export function findArByTitle(title = '') {
  const normalized = title.toLowerCase();
  return (
    AR_CATALOG.find(
      (item) =>
        normalized.includes(item.title.toLowerCase().split(' ')[0]) ||
        item.title.toLowerCase().includes(normalized.split(' ')[0] || '__none__')
    ) || null
  );
}

export function getArBySlug(slug = '') {
  return AR_CATALOG.find((a) => a.slug === slug) || AR_CATALOG[0];
}

const FALLBACK_MATERI = [
  { judul: 'Eksplorasi Model', isi: 'Putar, perbesar, dan amati model 3D dari berbagai sisi. Catat bagian-bagian penting yang kamu temukan.' },
  { judul: 'Hubungkan dengan Teori', isi: 'Bandingkan hasil pengamatanmu dengan penjelasan di buku/modul pelajaran, lalu diskusikan bersama kelompok.' },
  { judul: 'Presentasikan Temuan', isi: 'Susun kesimpulan singkat dan presentasikan di depan kelas seperti ilmuwan muda.' },
];

const FALLBACK_QUIZ = [
  { q: 'Apa langkah pertama saat mengeksplorasi model AR ini?', options: ['Menutup aplikasi', 'Memutar & mengamati model', 'Menghapus model', 'Mematikan kamera'], answer: 1, explain: 'Eksplorasi dimulai dengan memutar dan mengamati model dari berbagai sisi.' },
  { q: 'Setelah mengamati, apa yang sebaiknya dilakukan?', options: ['Membandingkan dengan teori di modul', 'Mengabaikan hasil', 'Menyalin jawaban teman', 'Berhenti belajar'], answer: 0, explain: 'Hubungkan pengamatan dengan teori agar pemahaman utuh.' },
  { q: 'Kegiatan penutup misi AR ini adalah …', options: ['Bermain game lain', 'Mempresentasikan temuan', 'Tidur', 'Menghapus materi'], answer: 1, explain: 'Presentasi melatih komunikasi sekaligus menguatkan pemahaman.' },
];

function withFallback(ar) {
  return {
    materi: FALLBACK_MATERI,
    quiz: FALLBACK_QUIZ,
    ...ar,
    materi: ar.materi?.length ? ar.materi : FALLBACK_MATERI,
    quiz: ar.quiz?.length ? ar.quiz : FALLBACK_QUIZ,
  };
}

export function arForMaterial(material) {
  if (!material) return withFallback(AR_CATALOG[0]);
  if (material?.assets?.[0]?.glbUrl) {
    const match = AR_CATALOG.find((a) => a.glb === material.assets[0].glbUrl);
    if (match) return withFallback(match);
    return withFallback({
      ...AR_CATALOG[0],
      title: material.title,
      glb: material.assets[0].glbUrl,
      usdz: material.assets[0].usdzUrl || null,
    });
  }
  return withFallback(findArByTitle(material.title) || AR_CATALOG[0]);
}
