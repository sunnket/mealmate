const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protectGate, protectStudent } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/entry/scan
router.post('/scan', protectGate, async (req, res) => {
  try {
    const { qrCodeHash, mealId } = req.body;
    if (!qrCodeHash || !mealId) {
      return res.status(400).json({ error: 'qrCodeHash and mealId required' });
    }

    const student = await prisma.student.findUnique({ where: { qrCodeHash } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    const vote = await prisma.vote.findUnique({
      where: { studentId_mealId: { studentId: student.id, mealId } },
    });

    const now = new Date();

    // Student voted eat -> main entry
    if (vote && vote.vote === 'eat') {
      await prisma.entry.create({
        data: { studentId: student.id, mealId, entryType: 'main' },
      });

      const io = req.app.get('io');
      if (io) io.emit('entry:scanned', { studentName: student.name, status: 'allowed', timestamp: now });

      return res.json({ status: 'allowed', studentName: student.name, room: student.room });
    }

    // Student voted skip - check leftover queue
    const queueEntry = await prisma.leftoverQueue.findFirst({
      where: { studentId: student.id, mealId, entered: false },
    });

    if (!queueEntry) {
      return res.json({ status: 'redirect', message: 'Voted skip - send to leftover queue', studentName: student.name, room: student.room });
    }

    // In queue and leftover window active
    if (now <= new Date(meal.leftoverEndTime)) {
      await prisma.entry.create({
        data: { studentId: student.id, mealId, entryType: 'leftover' },
      });
      await prisma.leftoverQueue.update({
        where: { id: queueEntry.id },
        data: { entered: true, enteredAt: now },
      });

      const io = req.app.get('io');
      if (io) io.emit('entry:scanned', { studentName: student.name, status: 'leftover_allowed', timestamp: now });

      return res.json({ status: 'leftover_allowed', studentName: student.name, room: student.room });
    }

    return res.json({ status: 'redirect', message: 'Leftover window has closed', studentName: student.name, room: student.room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

// POST /api/leftover-queue/join
router.post('/leftover-queue/join', protectStudent, async (req, res) => {
  try {
    const { mealId } = req.body;
    const studentId = req.user.id;

    const vote = await prisma.vote.findUnique({
      where: { studentId_mealId: { studentId, mealId } },
    });

    if (!vote || vote.vote !== 'skip') {
      return res.status(400).json({ error: 'You can only join leftover queue if you voted skip' });
    }

    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    if (new Date() < new Date(meal.mainEndTime)) {
      return res.status(400).json({ error: 'Main meal shift has not ended yet' });
    }

    const existing = await prisma.leftoverQueue.findFirst({
      where: { studentId, mealId },
    });
    if (existing) {
      return res.status(400).json({ error: 'Already in queue' });
    }

    await prisma.leftoverQueue.create({ data: { studentId, mealId } });

    const queueLength = await prisma.leftoverQueue.count({ where: { mealId } });

    const io = req.app.get('io');
    if (io) io.emit('queue:joined', { mealId, queueLength });

    res.json({ position: queueLength });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

module.exports = router;
