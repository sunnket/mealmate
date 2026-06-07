// ─── FULL MOCK API — no backend needed ───────────────────────────────────────
// All calls return dummy data instantly. Safe to deploy on Vercel as pure static.

const today = new Date();
const y = today.getFullYear();
const mo = today.getMonth();
const d = today.getDate();

const DUMMY_MEALS = [
  {
    id: 'meal-breakfast',
    mealType: 'breakfast',
    menuItems: JSON.stringify(['Poha', 'Upma', 'Bread & Butter', 'Boiled Eggs', 'Milk', 'Tea/Coffee']),
    date: today.toISOString(),
    voteDeadline: new Date(y, mo, d, 7, 0).toISOString(),
    mainStartTime: new Date(y, mo, d, 7, 30).toISOString(),
    mainEndTime: new Date(y, mo, d, 9, 0).toISOString(),
    leftoverEndTime: new Date(y, mo, d, 9, 30).toISOString(),
    status: 'closed',
    headcount: { eating: 68, skipping: 12, total: 80 },
    entries: 65,
  },
  {
    id: 'meal-lunch',
    mealType: 'lunch',
    menuItems: JSON.stringify(['Rice', 'Dal Tadka', 'Aloo Gobi', 'Roti', 'Raita', 'Salad', 'Pickle']),
    date: today.toISOString(),
    voteDeadline: new Date(y, mo, d, 11, 30).toISOString(),
    mainStartTime: new Date(y, mo, d, 12, 0).toISOString(),
    mainEndTime: new Date(y, mo, d, 13, 30).toISOString(),
    leftoverEndTime: new Date(y, mo, d, 14, 0).toISOString(),
    status: 'active',
    headcount: { eating: 74, skipping: 6, total: 80 },
    entries: 42,
  },
  {
    id: 'meal-dinner',
    mealType: 'dinner',
    menuItems: JSON.stringify(['Jeera Rice', 'Paneer Butter Masala', 'Roti', 'Mixed Veg', 'Curd', 'Gulab Jamun']),
    date: today.toISOString(),
    voteDeadline: new Date(y, mo, d, 18, 30).toISOString(),
    mainStartTime: new Date(y, mo, d, 19, 0).toISOString(),
    mainEndTime: new Date(y, mo, d, 20, 30).toISOString(),
    leftoverEndTime: new Date(y, mo, d, 21, 0).toISOString(),
    status: 'upcoming',
    headcount: { eating: 58, skipping: 22, total: 80 },
    entries: 0,
  },
];

const DUMMY_WASTE = [
  { day: '2026-06-01', saved: 12.4, wasted: 1.2 },
  { day: '2026-06-02', saved: 9.8,  wasted: 2.1 },
  { day: '2026-06-03', saved: 14.1, wasted: 0.8 },
  { day: '2026-06-04', saved: 11.3, wasted: 1.5 },
  { day: '2026-06-05', saved: 15.6, wasted: 0.6 },
  { day: '2026-06-06', saved: 10.2, wasted: 1.9 },
  { day: '2026-06-07', saved: 13.7, wasted: 0.9 },
];

const DUMMY_USERS = {
  student: {
    id: 'student-1',
    name: 'Aryan Sharma',
    rollNumber: '21CS101',
    email: 'aryan@hostel.edu',
    room: '204',
    block: 'A',
    qrCodeHash: 'demo-qr-hash',
    role: 'student',
  },
  admin: { id: 'admin', name: 'Admin', role: 'admin' },
  gate:  { id: 'gate',  name: 'Gate Staff', role: 'gate' },
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const VOTES = {};

const mock = {
  post: async (url, body = {}) => {
    await delay();

    if (url.includes('/auth/login')) {
      const { rollNumber, password, role } = body;
      const validStudent = role === 'student' && password === '12345';
      const validAdmin   = role === 'admin'   && rollNumber === '12345' && password === '12345';
      const validGate    = role === 'gate'    && rollNumber === '12345' && password === '12345';

      if (!validStudent && !validAdmin && !validGate) {
        const err = new Error('Invalid credentials');
        err.response = { data: { error: 'Invalid credentials' } };
        throw err;
      }

      const user = role === 'student' ? DUMMY_USERS.student : DUMMY_USERS[role];
      return { data: { token: `dummy-token-${role}`, user } };
    }

    if (url.includes('/votes/')) {
      const mealId = url.split('/votes/')[1];
      VOTES[mealId] = body.vote;
      const meal = DUMMY_MEALS.find((m) => m.id === mealId) || DUMMY_MEALS[1];
      return { data: { eating: meal.headcount.eating, skipping: meal.headcount.skipping, total: meal.headcount.total } };
    }

    if (url.includes('/entry/leftover-queue/join')) {
      return { data: { position: Math.floor(Math.random() * 10) + 1 } };
    }

    if (url.includes('/entry/scan')) {
      const names = ['Aryan Sharma', 'Priya Patel', 'Rahul Singh', 'Sneha Gupta', 'Vikram Reddy'];
      const name = names[Math.floor(Math.random() * names.length)];
      return { data: { status: 'allowed', studentName: name, room: '204' } };
    }

    if (url.includes('/ratings')) {
      return { data: { success: true } };
    }

    return { data: {} };
  },

  get: async (url) => {
    await delay();

    if (url.includes('/meals/today')) {
      const mealsWithVotes = DUMMY_MEALS.map((m) => ({
        ...m,
        userVote: VOTES[m.id] ? { vote: VOTES[m.id] } : null,
        inQueue: false,
      }));
      return { data: mealsWithVotes };
    }

    if (url.includes('/admin/dashboard')) {
      return { data: { meals: DUMMY_MEALS, wasteLogs: [], noShowCount: 3 } };
    }

    if (url.includes('/analytics/waste')) {
      return { data: DUMMY_WASTE };
    }

    return { data: {} };
  },
};

export default mock;
