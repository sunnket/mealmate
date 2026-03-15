const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protectAdmin, protectStudent, verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/ratings
router.post('/ratings', protectStudent, async (req, res) => {
  try {
    const { mealId, stars, comment } = req.body;
    const studentId = req.user.id;

    if (!mealId || !stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Valid mealId and stars (1-5) required' });
    }

    const entry = await prisma.entry.findFirst({ where: { studentId, mealId } });
    if (!entry) {
      return res.status(400).json({ error: 'You can only rate meals you attended' });
    }

    await prisma.mealRating.upsert({
      where: { studentId_mealId: { studentId, mealId } },
      update: { stars, comment, submittedAt: new Date() },
      create: { studentId, mealId, stars, comment },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Rating failed' });
  }
});

// GET /api/admin/dashboard (accessible by admin and gate)
router.get('/admin/dashboard', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gate') {
    return res.status(403).json({ error: 'Admin or Gate access only' });
  }
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const meals = await prisma.meal.findMany({
      where: { date: { gte: startOfDay, lt: endOfDay } },
      orderBy: { mainStartTime: 'asc' },
    });

    const mealsWithCounts = await Promise.all(
      meals.map(async (meal) => {
        const eating = await prisma.vote.count({ where: { mealId: meal.id, vote: 'eat' } });
        const skipping = await prisma.vote.count({ where: { mealId: meal.id, vote: 'skip' } });
        const entries = await prisma.entry.count({ where: { mealId: meal.id } });
        return { ...meal, headcount: { eating, skipping, total: eating + skipping }, entries };
      })
    );

    // Last 7 days waste data
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const wasteLogs = await prisma.wasteLog.findMany({
      where: { meal: { date: { gte: weekAgo } } },
      include: { meal: { select: { date: true, mealType: true } } },
      orderBy: { meal: { date: 'asc' } },
    });

    const noShowCount = await prisma.noShow.count({
      where: { loggedAt: { gte: startOfDay, lt: endOfDay } },
    });

    res.json({ meals: mealsWithCounts, wasteLogs, noShowCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Dashboard failed' });
  }
});

// GET /api/analytics/waste
router.get('/analytics/waste', protectAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const wasteLogs = await prisma.wasteLog.findMany({
      where: { meal: { date: { gte: start, lte: end } } },
      include: { meal: { select: { date: true, mealType: true } } },
      orderBy: { meal: { date: 'asc' } },
    });

    // Aggregate by day
    const dailyData = {};
    for (const log of wasteLogs) {
      const day = log.meal.date.toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { day, saved: 0, wasted: 0 };
      const saved = (log.estimatedServings - log.actualServed) * 0.3; // ~300g per serving
      dailyData[day].saved += Math.max(0, saved);
      dailyData[day].wasted += log.wastedKg;
    }

    res.json(Object.values(dailyData));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analytics failed' });
  }
});

module.exports = router;
