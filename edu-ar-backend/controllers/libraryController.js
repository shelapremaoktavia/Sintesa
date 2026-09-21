// controllers/libraryController.js
// Library: simpan & kelola hasil tugas siswa dalam bentuk file apapun
// (gambar, PDF, Word, PPT, Excel, TXT, ZIP, MP4, MP3).
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const { UPLOAD_DIR } = require('../middleware/upload');

function toPublicUrl(req, fileName) {
  return `/uploads/${fileName}`;
}

function fullUrl(req, fileName) {
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${fileName}`;
}

// POST /api/library/upload  (SISWA, multipart: file + assignmentId? + classId? + materialId? + description?)
exports.uploadSubmission = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File wajib diunggah' });

    const { assignmentId, classId, materialId, description } = req.body;

    let resolvedClassId = classId || null;
    let resolvedMaterialId = materialId || null;

    if (assignmentId) {
      const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
      if (!assignment) {
        fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
        return res.status(404).json({ message: 'Tugas tidak ditemukan' });
      }
      // Pastikan siswa anggota kelas tugas tersebut
      const enrollment = await prisma.classEnrollment.findUnique({
        where: { studentId_classId: { studentId: req.user.userId, classId: assignment.classId } },
      });
      if (!enrollment) {
        fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
        return res.status(403).json({ message: 'Kamu bukan anggota kelas tugas ini' });
      }
      resolvedClassId = assignment.classId;
      resolvedMaterialId = assignment.materialId || resolvedMaterialId;
    } else if (resolvedClassId) {
      const enrollment = await prisma.classEnrollment.findUnique({
        where: { studentId_classId: { studentId: req.user.userId, classId: resolvedClassId } },
      });
      if (!enrollment) {
        fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
        return res.status(403).json({ message: 'Kamu bukan anggota kelas ini' });
      }
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId: assignmentId || null,
        studentId: req.user.userId,
        classId: resolvedClassId,
        materialId: resolvedMaterialId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeKb: Math.max(1, Math.round(req.file.size / 1024)),
        fileUrl: toPublicUrl(req, req.file.filename),
        description: description?.trim() || null,
      },
      include: {
        assignment: { select: { id: true, title: true, points: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // Arsip mandiri (tanpa tugas): +0 XP. Tugas guru: +poin tugas.
    const earnedXp = submission.assignment ? (submission.assignment.points || 100) : 0;

    res.status(201).json({ ...submission, fileAbsoluteUrl: fullUrl(req, req.file.filename), earnedXp });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengunggah file', error: error.message });
  }
};

// GET /api/library  -> daftar file library (siswa: milik sendiri, guru: submission di kelasnya)
exports.getLibrary = async (req, res) => {
  try {
    const { search, type, classId, assignmentId } = req.query;

    let where = {};
    if (req.user.role === 'SISWA') {
      where.studentId = req.user.userId;
    } else if (req.user.role === 'GURU') {
      const myClasses = await prisma.class.findMany({
        where: { teacherId: req.user.userId },
        select: { id: true },
      });
      const myClassIds = myClasses.map((c) => c.id);
      const myAssignments = await prisma.assignment.findMany({
        where: { teacherId: req.user.userId },
        select: { id: true },
      });
      const myAssignmentIds = myAssignments.map((a) => a.id);
      where.OR = [
        { assignmentId: { in: myAssignmentIds.length ? myAssignmentIds : ['__none__'] } },
        { classId: { in: myClassIds.length ? myClassIds : ['__none__'] } },
      ];
    }

    if (classId) where.classId = classId;
    if (assignmentId) where.assignmentId = assignmentId;
    if (search?.trim()) {
      where.originalName = { contains: search.trim(), mode: 'insensitive' };
    }
    if (type && type !== 'semua') {
      if (type === 'gambar') where.mimeType = { startsWith: 'image/' };
      else if (type === 'pdf') where.mimeType = 'application/pdf';
      else if (type === 'dokumen') {
        where.mimeType = {
          in: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
          ],
        };
      } else if (type === 'video') where.mimeType = { startsWith: 'video/' };
      else if (type === 'arsip') where.mimeType = { contains: 'zip' };
    }

    const rows = await prisma.submission.findMany({
      where,
      include: {
        assignment: { select: { id: true, title: true, points: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil library', error: error.message });
  }
};

// GET /api/library/stats -> ringkasan arsip (arsip = penyimpanan murni, +0 XP)
exports.getLibraryStats = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'SISWA') where.studentId = req.user.userId;
    else if (req.user.role === 'GURU') {
      // Guru: hanya hitung file di kelas/tugas miliknya agar statistik relevan.
      const myClasses = await prisma.class.findMany({
        where: { teacherId: req.user.userId },
        select: { id: true },
      });
      const myAssignments = await prisma.assignment.findMany({
        where: { teacherId: req.user.userId },
        select: { id: true },
      });
      const myClassIds = myClasses.map((c) => c.id);
      const myAssignmentIds = myAssignments.map((a) => a.id);
      where.OR = [
        { assignmentId: { in: myAssignmentIds.length ? myAssignmentIds : ['__none__'] } },
        { classId: { in: myClassIds.length ? myClassIds : ['__none__'] } },
      ];
    }

    const rows = await prisma.submission.findMany({ where, select: { mimeType: true, sizeKb: true, assignmentId: true } });
    const taskFiles = rows.filter((r) => r.assignmentId).length;
    const archiveFiles = rows.length - taskFiles;
    const stats = {
      total: rows.length,
      taskFiles,
      archiveFiles,
      totalSizeKb: rows.reduce((a, r) => a + (r.sizeKb || 0), 0),
      gambar: rows.filter((r) => r.mimeType.startsWith('image/')).length,
      pdf: rows.filter((r) => r.mimeType === 'application/pdf').length,
      dokumen: rows.filter((r) => /word|powerpoint|excel|sheet|presentation|text|csv|msword/i.test(r.mimeType)).length,
      lainnya: 0,
    };
    stats.lainnya = Math.max(0, stats.total - stats.gambar - stats.pdf - stats.dokumen);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik library', error: error.message });
  }
};

// DELETE /api/library/:id
exports.deleteSubmission = async (req, res) => {
  try {
    const row = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { assignment: { select: { teacherId: true } } },
    });
    if (!row) return res.status(404).json({ message: 'File tidak ditemukan' });

    const isOwner = row.studentId === req.user.userId;
    const isTeacher = req.user.role === 'GURU' && row.assignment?.teacherId === req.user.userId;
    if (!isOwner && !isTeacher) {
      return res.status(403).json({ message: 'Kamu tidak berhak menghapus file ini' });
    }

    await prisma.submission.delete({ where: { id: req.params.id } });
    fs.unlink(path.join(UPLOAD_DIR, row.fileName), () => {});
    res.json({ message: 'File dihapus dari library' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus file', error: error.message });
  }
};

// PATCH /api/library/:id/grade  (GURU memberi nilai & feedback)
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const row = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { assignment: true },
    });
    if (!row) return res.status(404).json({ message: 'File tidak ditemukan' });
    if (!row.assignment || row.assignment.teacherId !== req.user.userId) {
      return res.status(403).json({ message: 'Hanya guru pemilik tugas yang boleh menilai' });
    }

    const numeric = grade === null || grade === undefined || grade === '' ? null : Number(grade);
    if (numeric !== null && (!Number.isFinite(numeric) || numeric < 0 || numeric > 100)) {
      return res.status(400).json({ message: 'Nilai harus 0–100' });
    }

    const updated = await prisma.submission.update({
      where: { id: req.params.id },
      data: { grade: numeric, feedback: feedback?.trim() || null },
      include: { student: { select: { id: true, name: true } }, assignment: { select: { id: true, title: true } } },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan nilai', error: error.message });
  }
};
