
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MV = 'https://modelviewer.dev/shared-assets/models';
const KH = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0';

// Setiap pelajaran dipetakan ke model 3D/AR yang relevan secara tematik.
// Semua URL memakai CDN bercors-enabled agar <model-viewer> bisa memuatnya.
const CATALOG = [
  {
    title: 'Sistem Tata Surya',
    jenjang: 'SD',
    subjectName: 'IPA',
    description:
      'Jelajahi planet, orbit, dan skala tata surya dalam 3D. Putar model, zoom, lalu aktifkan mode AR untuk menghadirkan luar angkasa ke meja belajarmu. Misi: identifikasi 3 planet dan raih 100 XP.',
    asset: {
      name: 'Model AR — Astronot & Luar Angkasa',
      glbUrl: `${MV}/Astronaut.glb`,
      usdzUrl: `${MV}/Astronaut.usdz`,
      hasAnimation: true,
      isInteractive: true,
    },
  },
  {
    title: 'Daur Hidup Kupu-Kupu (Metamorfosis)',
    jenjang: 'SD',
    subjectName: 'IPA',
    description:
      'Amati tahapan metamorfosis hewan lewat model 3D interaktif. Cocok untuk misi observasi: urutkan fase telur–larva–pupa–dewasa dan kumpulkan badge Langkah Pertama.',
    asset: {
      name: 'Model AR — Hewan (Siklus Hidup)',
      glbUrl: `${KH}/Duck/glTF-Binary/Duck.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Struktur Sel Hewan dan Tumbuhan',
    jenjang: 'SMP',
    subjectName: 'Biologi',
    description:
      'Bedah struktur sel organik dalam 3D: dinding sel, membran, dan bagian dalamnya. Putar dan perbesar untuk melihat detail yang sulit dipahami dari buku. Misi lab virtual +100 XP.',
    asset: {
      name: 'Model AR — Struktur Organik Sel',
      glbUrl: `${KH}/Avocado/glTF-Binary/Avocado.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Sistem Kerja Katrol',
    jenjang: 'SMP',
    subjectName: 'Fisika',
    description:
      'Pahami pesawat sederhana dan sistem mekanik lewat model mesin 3D. Eksperimen sudut pandang, analisis bagian bergerak, dan selesaikan tantangan fisika untuk naik level.',
    asset: {
      name: 'Model AR — Sistem Mekanik',
      glbUrl: `${MV}/RobotExpressive.glb`,
      usdzUrl: null,
      hasAnimation: true,
      isInteractive: true,
    },
  },
  {
    title: 'Struktur Molekul dan Ikatan Kimia',
    jenjang: 'SMA',
    subjectName: 'Kimia',
    description:
      'Visualisasikan molekul H2O dan struktur materi dalam 3D. Putar model untuk memahami ikatan kimia, bentuk molekul, dan skala partikel. Misi kimia +100 XP.',
    asset: {
      name: 'Model AR — Molekul H2O',
      glbUrl: `${KH}/WaterBottle/glTF-Binary/WaterBottle.glb`,
      usdzUrl: null,
      hasAnimation: false,
      isInteractive: true,
    },
  },
  {
    title: 'Anatomi Jantung Manusia',
    jenjang: 'SMA',
    subjectName: 'Biologi Lanjutan',
    description:
      'Eksplorasi anatomi tubuh manusia dalam 3D/AR. Perbesar, putar, dan pelajari sistem organ dari berbagai sisi seperti praktikum virtual. Selesaikan dan klaim badge Master Materi.',
    asset: {
      name: 'Model AR — Anatomi Manusia',
      glbUrl: `${KH}/BrainStem/glTF-Binary/BrainStem.glb`,
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

  console.log('✅ Seed selesai! 6 materi + model AR per pelajaran berhasil disiapkan.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
