require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const { setupSocket } = require('./socket/socketHandler');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const voteRoutes = require('./routes/votes');
const entryRoutes = require('./routes/entry');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);
setupSocket(io);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/entry', entryRoutes);
app.use('/api', analyticsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`MealMate server running on http://localhost:${PORT}`);
});
