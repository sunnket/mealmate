const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protectStudent } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/votes/:mealId
router.post('/:mealId', protectStudent, async (req, res) => {
  try {
    const { mealId } = req.params;
    const { vote } = req.body;

    if (!['eat', 'skip'].includes(vote)) {
      return res.status(400).json({ error: 'Vote must be "eat" or "skip"' });
    }

    const meal = await prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) return res.status(404).json({ error: 'Meal not found' });

    if (new Date() > new Date(meal.voteDeadline)) {
      return res.status(400).json({ error: 'Voting deadline has passed' });
    }

    await prisma.vote.upsert({
      where: { studentId_mealId: { studentId: req.user.id, mealId } },
      update: { vote, votedAt: new Date() },
      create: { studentId: req.user.id, mealId, vote },
    });

    const eating = await prisma.vote.count({ where: { mealId, vote: 'eat' } });
    const skipping = await prisma.vote.count({ where: { mealId, vote: 'skip' } });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('vote:updated', { mealId, eating, skipping });
    }

    res.json({ eating, skipping, total: eating + skipping });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

module.exports = router;
