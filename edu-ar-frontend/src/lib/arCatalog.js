// lib/arCatalog.js
// Katalog AR: fokus Kelas 10 SMK jurusan RPL — satu sumber kebenaran untuk
// HOME, halaman /ar, dashboard, dan halaman materi.
// URL model selaras dengan prisma/seed.js backend.
// Setiap misi membawa: materi pembelajaran + soal latihan (kuis).
const MV = 'https://modelviewer.dev/shared-assets/models';
const KH = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0';

export const KELAS_FOKUS = 'Kelas 10 RPL';

export const AR_CATALOG = [
  {
    slug: 'sistem-komputer',
    title: 'Sistem Komputer & Cara Kerja',
    jenjang: 'SMK',
    kelas: KELAS_FOKUS,
    subject: 'Sistem Komputer',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed 55%,#db2777)',
    glb: `${MV}/RobotExpressive.glb`,
    usdz: null,
    mission: 'Jelaskan input–proses–output & raih 100 XP',
    xp: 100,
    skills: ['Sistem Komputer', 'CPU & Memori'],
    instruction: 'Putar model robot, amati bagian mekaniknya, lalu kaitkan: sensor = input, CPU = proses, gerakan = output.',
    materi: [
      { judul: 'Komputer = Sistem', isi: 'Komputer adalah sistem yang menerima data (input), mengolahnya lewat CPU dibantu memori, lalu menghasilkan informasi (output). Seperti robot yang menerima perintah lalu bergerak.' },
      { judul: 'Komponen Utama', isi: 'CPU sebagai otak, RAM sebagai meja kerja sementara, storage (SSD/HDD) sebagai lemari arsip, dan motherboard sebagai papan penghubung semuanya.' },
      { judul: 'Perangkat Lunak', isi: 'Tanpa software, hardware hanyalah besi. Sistem operasi (Windows/Linux) mengatur sumber daya, aplikasi (VS Code, browser) membantu pekerjaan RPL.' },
    ],
    quiz: [
      { q: 'Urutan alur kerja sistem komputer yang benar adalah …', options: ['Output – proses – input', 'Input – proses – output', 'Proses – input – output', 'Input – output – proses'], answer: 1, explain: 'Data masuk (input) → diolah CPU (proses) → menjadi informasi (output).' },
      { q: 'Komponen yang disebut "otak komputer" adalah …', options: ['RAM', 'SSD', 'CPU', 'Motherboard'], answer: 2, explain: 'CPU (processor) mengeksekusi semua instruksi program.' },
      { q: 'Contoh sistem operasi adalah …', options: ['VS Code', 'Linux', 'Chrome', 'MySQL'], answer: 1, explain: 'Linux adalah sistem operasi; VS Code & Chrome aplikasi, MySQL basis data.' },
    ],
  },
  {
    slug: 'jaringan-komputer',
    title: 'Jaringan Komputer & Internet',
    jenjang: 'SMK',
    kelas: KELAS_FOKUS,
    subject: 'Komputer & Jaringan',
    emoji: '🛰️',
    gradient: 'linear-gradient(135deg,#0284c7,#6366f1 55%,#a855f7)',
    glb: `${MV}/Astronaut.glb`,
    usdz: `${MV}/Astronaut.usdz`,
    mission: 'Sebutkan 3 topologi jaringan & raih 100 XP',
    xp: 100,
    skills: ['Topologi', 'IP Address'],
    instruction: 'Arahkan kamera ke meja kosong, ketuk “Lihat dalam AR”, dan bayangkan satelit ini sebagai simpul raksasa jaringan internet.',
    materi: [
      { judul: 'Apa itu Jaringan?', isi: 'Jaringan komputer adalah dua atau lebih perangkat yang saling terhubung untuk berbagi data & sumber daya — via kabel (LAN) atau nirkabel (WiFi) hingga satelit.' },
      { judul: 'Topologi Populer', isi: 'Star (semua ke switch/hub pusat — paling umum di lab RPL), bus (satu jalur backbone), dan ring (melingkar). Star paling mudah dikelola dan diperbaiki.' },
      { judul: 'Alamat IP', isi: 'Setiap perangkat punya alamat IP unik, mis. 192.168.1.10. IP ibarat alamat rumah agar paket data sampai ke tujuan yang benar.' },
    ],
    quiz: [
      { q: 'Topologi yang semua perangkatnya terhubung ke satu titik pusat adalah …', options: ['Bus', 'Ring', 'Star', 'Mesh penuh'], answer: 2, explain: 'Topologi star memakai switch/hub pusat; paling umum di lab komputer.' },
      { q: 'Contoh alamat IP yang valid adalah …', options: ['192.168.1.10', '999.1.1.1', 'HTTP://lab', 'lab-komputer'], answer: 0, explain: 'Oktet IP 0–255; 192.168.1.10 adalah IP privat yang valid.' },
      { q: 'Perangkat yang menghubungkan banyak komputer dalam satu jaringan lokal adalah …', options: ['Printer', 'Switch', 'Speaker', 'Webcam'], answer: 1, explain: 'Switch meneruskan paket data ke perangkat tujuan di LAN.' },
    ],
  },
  {
    slug: 'perangkat-keras',
    title: 'Perangkat Keras: Input–Output',
    jenjang: 'SMK',
    kelas: KELAS_FOKUS,
    subject: 'Sistem Komputer',
    emoji: '🔊',
    gradient: 'linear-gradient(135deg,#059669,#0ea5e9 60%,#6366f1)',
    glb: `${KH}/BoomBox/glTF-Binary/BoomBox.glb`,
    usdz: null,
    mission: 'Golongkan 6 perangkat & raih 100 XP',
    xp: 100,
    skills: ['Hardware', 'Klasifikasi'],
    instruction: 'Putar model speaker — ia contoh perangkat output. Lalu golongkan perangkat di labmu ke input, proses, output, dan penyimpanan.',
    materi: [
      { judul: 'Empat Golongan Hardware', isi: 'Input (keyboard, mouse, scanner), proses (CPU, GPU, motherboard), output (monitor, printer, speaker), dan penyimpanan (SSD, HDD, flashdisk).' },
      { judul: 'Contoh di Lab RPL', isi: 'Mengetik kode di keyboard (input) → dikompilasi CPU (proses) → hasil tampil di monitor (output) → project disimpan di SSD (penyimpanan).' },
      { judul: 'Merawat Perangkat', isi: 'Bersihkan debu, hindari panas berlebih, eject flashdisk dengan aman, dan backup data penting secara rutin.' },
    ],
    quiz: [
      { q: 'Yang termasuk perangkat output adalah …', options: ['Keyboard', 'Mouse', 'Speaker', 'Scanner'], answer: 2, explain: 'Speaker mengeluarkan suara (output); keyboard/mouse/scanner memasukkan data (input).' },
      { q: 'CPU termasuk golongan perangkat …', options: ['Input', 'Proses', 'Output', 'Penyimpanan'], answer: 1, explain: 'CPU mengolah data sehingga masuk golongan proses.' },
      { q: 'Contoh media penyimpanan adalah …', options: ['Monitor', 'SSD', 'Printer', 'Proyektor'], answer: 1, explain: 'SSD menyimpan data permanen; monitor/printer/proyektor adalah output.' },
    ],
  },
  {
    slug: 'mikrokontroler',
    title: 'Elektronika & Mikrokontroler',
    jenjang: 'SMK',
    kelas: KELAS_FOKUS,
    subject: 'Informatika',
    emoji: '💡',
    gradient: 'linear-gradient(135deg,#ea580c,#f59e0b 55%,#eab308)',
    glb: `${KH}/Lantern/glTF-Binary/Lantern.glb`,
    usdz: null,
    mission: 'Jelaskan sensor–proses–aktuator & raih 100 XP',
    xp: 100,
    skills: ['Rangkaian Listrik', 'Arduino & IoT'],
    instruction: 'Amati model lampu: seperti lampu menyala saat ada arus, aktuator bekerja saat mikrokontroler memberi sinyal.',
    materi: [
      { judul: 'Rangkaian Dasar', isi: 'Arus mengalir dari sumber (baterai) melalui kabel ke beban (lampu) dan kembali. Saklar memutus/menyambung aliran — konsep yang sama dipakai di semua elektronika.' },
      { judul: 'Sensor – Proses – Aktuator', isi: 'Sensor membaca dunia (suhu, cahaya, jarak) → mikrokontroler (Arduino) memproses → aktuator bertindak (LED menyala, motor berputar, buzzer berbunyi).' },
      { judul: 'IoT di Sekitar Kita', isi: 'Lampu otomatis, absensi sidik jari, dan smart home adalah IoT: perangkat fisik + internet + program. Bekal wajib anak RPL sebelum ke pemrograman lanjut.' },
    ],
    quiz: [
      { q: 'Urutan alur sistem tertanam (embedded) yang benar adalah …', options: ['Aktuator – sensor – proses', 'Sensor – proses – aktuator', 'Proses – aktuator – sensor', 'Sensor – aktuator – proses'], answer: 1, explain: 'Sensor membaca → mikrokontroler memproses → aktuator bertindak.' },
      { q: 'Contoh aktuator adalah …', options: ['Sensor suhu', 'LED', 'Kabel', 'Baterai'], answer: 1, explain: 'LED (aktuator) menghasilkan keluaran fisik; sensor suhu justru membaca.' },
      { q: 'Arduino termasuk …', options: ['Sistem operasi', 'Mikrokontroler', 'Bahasa pemrograman', 'Topologi jaringan'], answer: 1, explain: 'Arduino adalah papan mikrokontroler untuk proyek elektronika & IoT.' },
    ],
  },
  {
    slug: 'algoritma',
    title: 'Algoritma, Flowchart & Pemrograman Dasar',
    jenjang: 'SMK',
    kelas: KELAS_FOKUS,
    subject: 'Informatika',
    emoji: '🦆',
    gradient: 'linear-gradient(135deg,#0d9488,#22c55e 55%,#84cc16)',
    glb: `${KH}/Duck/glTF-Binary/Duck.glb`,
    usdz: null,
    mission: 'Susun algoritma & baca flowchart, raih 100 XP',
    xp: 100,
    skills: ['Berpikir Komputasional', 'Flowchart'],
    instruction: 'Seperti langkah berurutan yang tidak boleh dilompat, algoritma adalah urutan langkah pasti untuk menyelesaikan masalah.',
    materi: [
      { judul: 'Algoritma = Resep', isi: 'Algoritma adalah urutan langkah logis dan pasti: mis. resep mie instan atau langkah login (input username → cek password → tampilkan dashboard).' },
      { judul: 'Simbol Flowchart', isi: 'Oval = mulai/selesai, persegi = proses, belah ketupat = keputusan/percabangan (ya/tidak), jajar genjang = input/output.' },
      { judul: 'Variabel & Percabangan', isi: 'Variabel adalah wadah bernama untuk data (nama = "Budi", nilai = 90). Percabangan (if–else) membuat program memilih jalan, mis. lulus jika nilai ≥ 75.' },
    ],
    quiz: [
      { q: 'Simbol belah ketupat pada flowchart berarti …', options: ['Proses', 'Mulai/selesai', 'Keputusan/percabangan', 'Input/output'], answer: 2, explain: 'Belah ketupat = decision (ya/tidak), mis. "nilai ≥ 75?".' },
      { q: 'Ciri algoritma yang baik adalah …', options: ['Langkah acak dan ambigu', 'Urutan langkah jelas dan berhingga', 'Sebanyak mungkin langkah', 'Tanpa input maupun output'], answer: 1, explain: 'Algoritma harus jelas, tepat, dan berhenti (berhingga).' },
      { q: 'Untuk menyimpan nama siswa dalam program dipakai …', options: ['Konstanta gravitasi', 'Variabel string', 'Kabel LAN', 'Flowchart'], answer: 1, explain: 'Variabel bertipe string menyimpan teks seperti nama.' },
    ],
  },
  {
    slug: 'keamanan-data',
    title: 'Keamanan Data & Proteksi',
    jenjang: 'SMK',
    kelas: KELAS_FOKUS,
    subject: 'Informatika',
    emoji: '🪖',
    gradient: 'linear-gradient(135deg,#e11d48,#f43f5e 55%,#fb7185)',
    glb: `${KH}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`,
    usdz: null,
    mission: 'Sebutkan 3 praktik keamanan & raih 100 XP',
    xp: 100,
    skills: ['Password Aman', 'Anti Phishing'],
    instruction: 'Seperti helm melindungi kepala, proteksi berlapis melindungi datamu: password, verifikasi, dan backup.',
    materi: [
      { judul: 'Password yang Kuat', isi: 'Minimal 8 karakter campuran huruf besar–kecil, angka, dan simbol. Jangan pakai tanggal lahir/NIS, bedakan password tiap akun, aktifkan verifikasi 2 langkah.' },
      { judul: 'Ancaman Umum', isi: 'Phishing (link palsu pencuri akun), malware/virus dari file bajakan, dan wifi publik tanpa VPN. Cek alamat link sebelum klik dan login.' },
      { judul: 'Backup & Etika', isi: 'Backup tugas penting di 2 tempat (laptop + cloud). Hormati privasi: jangan sebar data teman, jangan bobol akun orang — itu melanggar hukum (UU ITE).' },
    ],
    quiz: [
      { q: 'Password paling kuat di bawah ini adalah …', options: ['budi123', '17agustus', 'Rpl#10_Sintesa!', 'password'], answer: 2, explain: 'Campuran huruf besar–kecil, angka, dan simbol paling sulit ditebak.' },
      { q: 'Phishing adalah …', options: ['Lagu populer', 'Penipuan link palsu pencuri akun', 'Jenis kabel jaringan', 'Antivirus gratis'], answer: 1, explain: 'Phishing memancing korban lewat situs/pesan palsu yang mirip aslinya.' },
      { q: 'Kebiasaan backup yang benar adalah …', options: ['Satu salinan di HP saja', 'Dua tempat: perangkat + cloud', 'Hafalkan semua data', 'Tidak pernah backup'], answer: 1, explain: 'Aturan 3-2-1: minimal 2 salinan di media berbeda.' },
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

/** Daftar mapel unik untuk filter halaman /ar & HOME. */
export function arSubjects() {
  return [...new Set(AR_CATALOG.map((a) => a.subject))];
}

const FALLBACK_MATERI = [
  { judul: 'Eksplorasi Model', isi: 'Putar, perbesar, dan amati model 3D dari berbagai sisi. Catat bagian-bagian penting yang kamu temukan.' },
  { judul: 'Hubungkan dengan Teori', isi: 'Bandingkan hasil pengamatanmu dengan penjelasan di buku/modul pelajaran, lalu diskusikan bersama kelompok.' },
  { judul: 'Presentasikan Temuan', isi: 'Susun kesimpulan singkat dan presentasikan di depan kelas seperti teknisi muda RPL.' },
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
