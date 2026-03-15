const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, rollNumber, email, password, room, block } = req.body;
    if (!name || !rollNumber || !email || !password || !room || !block) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await prisma.student.findFirst({
      where: { OR: [{ rollNumber }, { email }] },
    });
    if (existing) {
      return res.status(409).json({ error: 'Student already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const qrCodeHash = uuidv4();

    const student = await prisma.student.create({
      data: { name, rollNumber, email, password: hashedPassword, room, block, qrCodeHash },
    });

    const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      student: { id: student.id, name: student.name, rollNumber: student.rollNumber, email: student.email, room: student.room, block: student.block, qrCodeHash: student.qrCodeHash },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { rollNumber, password, role } = req.body;

    // Admin / gate hardcoded credentials
    if (role === 'admin' && rollNumber === 'admin' && password === 'admin1234') {
      const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: 'admin', role: 'admin', name: 'Admin' } });
    }
    if (role === 'gate' && rollNumber === 'gate' && password === 'gate1234') {
      const token = jwt.sign({ id: 'gate', role: 'gate' }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: 'gate', role: 'gate', name: 'Gate Staff' } });
    }

    if (!rollNumber || !password) {
      return res.status(400).json({ error: 'Roll number and password required' });
    }

    const student = await prisma.student.findUnique({ where: { rollNumber } });
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: student.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: student.id, name: student.name, rollNumber: student.rollNumber, email: student.email, room: student.room, block: student.block, qrCodeHash: student.qrCodeHash, role: 'student' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
