const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protectStudent, protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/meals/today
router.get('/today', protectStudent, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const meals = await prisma.meal.findMany({
      where: { date: { gte: startOfDay, lt: endOfDay } },
      orderBy: { mainStartTime: 'asc' },
      include: {
        votes: { where: { studentId: req.user.id } },
        _count: { select: { entries: true } },
      },
    });

    const mealsWithCounts = await Promise.all(
      meals.map(async (meal) => {
        const eating = await prisma.vote.count({ where: { mealId: meal.id, vote: 'eat' } });
        const skipping = await prisma.vote.count({ where: { mealId: meal.id, vote: 'skip' } });
        const queueEntry = await prisma.leftoverQueue.findFirst({
          where: { mealId: meal.id, studentId: req.user.id },
        });
        return {
          ...meal,
          userVote: meal.votes[0] || null,
          headcount: { eating, skipping, total: eating + skipping },
          inQueue: !!queueEntry,
          votes: undefined,
        };
      })
    );

    res.json(mealsWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// GET /api/meals/:mealId/headcount
router.get('/:mealId/headcount', protectAdmin, async (req, res) => {
  try {
    const { mealId } = req.params;
    const eating = await prisma.vote.count({ where: { mealId, vote: 'eat' } });
    const skipping = await prisma.vote.count({ where: { mealId, vote: 'skip' } });
    res.json({ eating, skipping, total: eating + skipping });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch headcount' });
  }
});

module.exports = router;
