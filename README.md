# 🍽️ MealMate — Hostel Mess Food Waste Control System

A full-stack web app that reduces food waste in hostel messes through smart voting, QR-based entry, real-time headcounts, and data-driven cooking.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + Tailwind CSS (Vite) |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (Bearer tokens) |
| Real-time | Socket.io |
| Charts | Recharts |
| QR | qrcode + camera scan |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (port 5432)
- npm or yarn

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

**Environment Variables:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string: `postgresql://user:password@localhost:5432/mealmate` |
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `PORT` | Backend port (default: 5000) |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |
| `FIREBASE_SERVER_KEY` | Firebase Cloud Messaging key (optional, for push notifications) |

### 3. Setup Database

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed Sample Data

```bash
cd server
node seed.js
```

### 5. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | `21CS101` | `test1234` |
| Student | `21CS102` | `test1234` |
| Student | `21CS103` | `test1234` |
| Student | `21CS104` | `test1234` |
| Student | `21CS105` | `test1234` |
| Admin | `admin` | `admin1234` |
| Gate Staff | `gate` | `gate1234` |

---

## API Endpoints

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ name, rollNumber, email, password, room, block }` | Register student |
| POST | `/api/auth/login` | `{ rollNumber, password, role }` | Login (any role) |

### Meals
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/meals/today` | Student | Today's 3 meals with user's vote & headcount |
| GET | `/api/meals/:mealId/headcount` | Admin | Real-time headcount for a meal |

### Votes
| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| POST | `/api/votes/:mealId` | Student | `{ vote: "eat" \| "skip" }` | Cast/update vote |

### Entry (Gate)
| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| POST | `/api/entry/scan` | Gate | `{ qrCodeHash, mealId }` | Scan QR at gate |
| POST | `/api/entry/leftover-queue/join` | Student | `{ mealId }` | Join leftover queue |

### Ratings & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ratings` | Student | Rate a meal (1-5 stars + comment) |
| GET | `/api/admin/dashboard` | Admin | Today's meals, waste data, no-shows |
| GET | `/api/analytics/waste?startDate=&endDate=` | Admin | Daily waste logs |

---

## How It Works

### Voting + Gate Entry Flow

1. **Meals are posted** for the day (breakfast, lunch, dinner) with a vote deadline
2. **Students vote** "I'll Eat" or "Skip" before the deadline
3. **Admin sees live headcount** and the **Cooking Guide** auto-calculates ingredient quantities
4. **At meal time**, students scan their QR code at the gate:
   - Voted **Eat** → ✅ Entry allowed
   - Voted **Skip** → 🔴 Redirected to leftover queue
   - In **Leftover Queue** + leftover window open → 🔵 Leftover entry allowed
5. **After the meal**, students can rate the food
6. **Waste logs** track estimated vs actual servings → calculates kg saved, cost saved, CO₂ prevented

### Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `vote:updated` | Server → All | `{ mealId, eating, skipping }` |
| `entry:scanned` | Server → Gate | `{ studentName, status, timestamp }` |
| `queue:joined` | Server → Admin | `{ mealId, queueLength }` |

---

## Project Structure

```
mealmate/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Login, StudentDashboard, AdminDashboard, GateScanner
│   │   ├── components/      # MealCard, HeadcountBar, CookingGuide, QRScanner, WasteChart, etc.
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useSocket
│   │   └── utils/           # api.js (axios instance)
├── server/                  # Node.js backend
│   ├── routes/              # auth, meals, votes, entry, analytics
│   ├── middleware/           # JWT auth middleware
│   ├── socket/              # Socket.io handler
│   ├── prisma/              # schema.prisma
│   ├── seed.js              # Sample data seeder
│   └── server.js            # Express + Socket.io entry point
└── README.md
```

---

## License

MIT
