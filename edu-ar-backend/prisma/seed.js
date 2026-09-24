
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Model 3D milik sendiri (folder edu-ar-frontend/public/models/).
// URL relatif satu origin dengan frontend sehingga bebas masalah CORS.
const LOCAL = '/models';

// Fokus: Kelas 10 SMK jurusan RPL — setiap misi dipetakan ke model 3D/AR
// yang relevan secara tematik. URL memakai CDN bercors-enabled agar
// <model-viewer> bisa memuatnya.
const CATALOG = [
  {
    title: 'Sistem Komputer & Cara Kerja',
    jenjang: 'SMK',
    subjectName: 'Sistem Komputer',
    description:
      'Pahami cara kerja komputer (input–proses–output) lewat model komputer desktop 3D: seperti PC menerima data lewat CPU lalu menghasilkan keluaran. Misi: jelaskan peran CPU & memori, raih 100 XP.',
    asset: {
      name: 'Model AR — Komputer Desktop (Sistem Komputer)',
      glbUrl: `${LOCAL}/komputer_desktop.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Jaringan Komputer & Internet',
    jenjang: 'SMK',
    subjectName: 'Komputer & Jaringan',
    description:
      'Pelajari jaringan komputer lewat model perangkat TIK 3D: data berpindah antar perangkat via kabel/WiFi, topologi star–bus–ring, dan alamat IP. Misi: sebutkan 3 topologi jaringan, raih 100 XP.',
    asset: {
      name: 'Model AR — Perangkat TIK (Jaringan)',
      glbUrl: `${LOCAL}/tik_komputer_kdr.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Perangkat Keras: Input–Output',
    jenjang: 'SMK',
    subjectName: 'Sistem Komputer',
    description:
      'Kenali klasifikasi perangkat keras (input, proses, output, penyimpanan) lewat model perangkat komputer 3D. Misi: golongkan 6 perangkat ke tiap kategori, raih 100 XP.',
    asset: {
      name: 'Model AR — Perangkat Komputer (Hardware)',
      glbUrl: `${LOCAL}/perangkat_komputer.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Elektronika & Mikrokontroler',
    jenjang: 'SMK',
    subjectName: 'Informatika',
    description:
      'Dasar rangkaian listrik, sensor–aktuator, dan mikrokontroler (Arduino) untuk IoT lewat model modul elektronik 3D. Misi: jelaskan alur sensor–proses–aktuator, raih 100 XP.',
    asset: {
      name: 'Model AR — Modul Elektronik (IoT)',
      glbUrl: `${LOCAL}/perangkat_komputer_-_ibnu_hakim.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Algoritma, Flowchart & Pemrograman Dasar',
    jenjang: 'SMK',
    subjectName: 'Informatika',
    description:
      'Latih berpikir komputasional: algoritma sebagai urutan langkah (seperti langkah berurutan), simbol flowchart, variabel, dan percabangan. Misi: susun algoritma & baca flowchart, raih 100 XP.',
    asset: {
      name: 'Model AR — Komputer Programmer (Algoritma)',
      glbUrl: `${LOCAL}/computer.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Keamanan Data & Proteksi',
    jenjang: 'SMK',
    subjectName: 'Informatika',
    description:
      'Lindungi datamu seperti kamera pengawas menjaga ruangan: password kuat, waspada phishing & malware, dan rutin backup. Misi: sebutkan 3 praktik keamanan data, raih 100 XP.',
    asset: {
      name: 'Model AR — Kamera Pengawas (Keamanan Data)',
      glbUrl: `${LOCAL}/computer_props_camera_base.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
];

async function ensureSubject(name, jenjang) {
  const existing = await prisma.subject.findFirst({ where: { name, jenjang } });
  if (existing) return existing;
  return prisma.subject.create({ data: { name, jenjang } });
}

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@sintesa.id';
  const password = process.env.ADMIN_PASSWORD || 'Admin12345';
  const usedDefault = !process.env.ADMIN_PASSWORD;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Admin sudah ada (${email}), dilewati.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name: 'Administrator', email, password: hashed, role: 'ADMIN' },
  });
  console.log(`✅ Admin dibuat (${email}).`);
  if (usedDefault) {
    console.log('⚠️  Memakai password default "Admin12345" — segera ganti lewat database / buat admin baru!');
  }
}

async function main() {
  for (const item of CATALOG) {
    const subject = await ensureSubject(item.subjectName, item.jenjang);

    let material = await prisma.material.findFirst({ where: { title: item.title } });
    if (!material) {
      material = await prisma.material.create({
        data: {
          title: item.title,
          description: item.description,
          jenjang: item.jenjang,
          subjectId: subject.id,
        },
      });
    } else {
      material = await prisma.material.update({
        where: { id: material.id },
        data: { description: item.description, jenjang: item.jenjang, subjectId: subject.id },
      });
    }

    const existingAsset = await prisma.asset3D.findFirst({ where: { materialId: material.id } });
    if (!existingAsset) {
      await prisma.asset3D.create({
        data: {
          name: item.asset.name,
          materialId: material.id,
          glbUrl: item.asset.glbUrl,
          usdzUrl: item.asset.usdzUrl,
          hasAnimation: item.asset.hasAnimation,
          isInteractive: item.asset.isInteractive,
        },
      });
    } else {
      await prisma.asset3D.update({
        where: { id: existingAsset.id },
        data: {
          name: item.asset.name,
          glbUrl: item.asset.glbUrl,
          usdzUrl: item.asset.usdzUrl,
          hasAnimation: item.asset.hasAnimation,
          isInteractive: item.asset.isInteractive,
        },
      });
    }
  }

  await ensureAdmin();

  console.log('✅ Seed selesai! 6 materi RPL Kelas 10 + model AR + akun admin disiapkan.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
