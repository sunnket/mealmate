import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MealCard from '../components/MealCard';
import useSocket from '../hooks/useSocket';
import api from '../utils/api';
import { Utensils, SkipForward, Target, Leaf, CheckSquare, Square, Trophy, Activity } from 'lucide-react';

const TABS = ["Today's Meals", 'My Stats', 'Menu Vote'];

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'student')) navigate('/login');
  }, [user, authLoading, navigate]);

  const fetchMeals = useCallback(async () => {
    try {
      const { data } = await api.get('/meals/today');
      setMeals(data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  // Real-time vote updates
  useSocket({
    'vote:updated': (payload) => {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === payload.mealId
            ? { ...m, headcount: { eating: payload.eating, skipping: payload.skipping, total: payload.eating + payload.skipping } }
            : m
        )
      );
    },
  });

  const handleVote = async (mealId, vote) => {
    try {
      const { data } = await api.post(`/votes/${mealId}`, { vote });
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId
            ? { ...m, userVote: { vote }, headcount: { eating: data.eating, skipping: data.skipping, total: data.total } }
            : m
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Vote failed');
    }
  };

  const handleJoinQueue = async (mealId) => {
    try {
      const { data } = await api.post('/entry/leftover-queue/join', { mealId });
      alert(`Joined queue at position #${data.position}`);
      setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, inQueue: true } : m)));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join queue');
    }
  };

  const handleRate = async (mealId, stars, comment) => {
    try {
      await api.post('/ratings', { mealId, stars, comment });
    } catch (err) {
      alert(err.response?.data?.error || 'Rating failed');
    }
  };

  const stats = {
    eaten: 42, skipped: 18, accuracy: 87, wastePrevented: 12.4,
    history: [
      { day: 'Mon', status: 'ate' }, { day: 'Tue', status: 'ate' }, { day: 'Wed', status: 'skip' },
      { day: 'Thu', status: 'ate' }, { day: 'Fri', status: 'ate' }, { day: 'Sat', status: 'skip' },
      { day: 'Sun', status: 'ate' },
    ],
    badges: ['🎯 Accurate Voter', '🔥 7-Day Streak', '🌿 Eco Warrior'],
  };

  const [upcomingDishes] = useState([
    'Paneer Butter Masala', 'Chole Bhature', 'Biryani', 'Rajma Chawal', 'Dosa Sambar', 'Pasta Alfredo',
  ]);
  const [menuVotes, setMenuVotes] = useState([]);

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-7 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="section-label mb-1">Student Dashboard</p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight">
              {greet()}, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] w-fit">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            <span className="text-[11.5px] font-medium text-white/36">Live updates</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl glass-card-sm w-fit">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                tab === i
                  ? 'bg-primary text-dark shadow-glow'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tab 0: Today's Meals ── */}
        {tab === 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-[13px] text-white/30">Loading meals...</p>
                </div>
              </div>
            ) : meals.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <Utensils size={20} className="text-white/25" />
                </div>
                <p className="text-[13px] text-white/35">No meals scheduled for today</p>
              </div>
            ) : (
              meals.map((meal, idx) => (
                <div key={meal.id} className="animate-slide-up" style={{ animationDelay: `${idx * 80}ms` }}>
                  <MealCard
                    meal={meal}
                    userVote={meal.userVote}
                    onVote={(vote) => handleVote(meal.id, vote)}
                    inQueue={meal.inQueue}
                    onJoinQueue={handleJoinQueue}
                    onRate={handleRate}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tab 1: My Stats ── */}
        {tab === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { val: stats.eaten, label: 'Meals Eaten', Icon: Utensils, color: 'text-primary', tint: 'bg-primary/10 border-primary/15' },
                { val: stats.skipped, label: 'Meals Skipped', Icon: SkipForward, color: 'text-danger', tint: 'bg-danger/8 border-danger/12' },
                { val: `${stats.accuracy}%`, label: 'Vote Accuracy', Icon: Target, color: 'text-warning', tint: 'bg-warning/8 border-warning/12' },
                { val: `${stats.wastePrevented}kg`, label: 'Waste Prevented', Icon: Leaf, color: 'text-accent', tint: 'bg-accent/10 border-accent/15' },
              ].map(({ val, label, Icon, color, tint }) => (
                <div key={label} className="glass-card p-5 hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-8 h-8 rounded-xl border ${tint} flex items-center justify-center mb-3`}>
                    <Icon size={14} className={color} strokeWidth={1.75} />
                  </div>
                  <p className={`text-[26px] font-semibold tracking-tight ${color}`}>{val}</p>
                  <p className="text-[12px] text-white/32 mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* 7-day history */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-white/30" />
                <h4 className="text-[13px] font-semibold text-white/55">7-Day Voting History</h4>
              </div>
              <div className="flex gap-2.5">
                {stats.history.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${
                      h.status === 'ate' ? 'bg-primary/12 border border-primary/20' : 'bg-white/[0.03] border border-white/[0.06]'
                    }`}>
                      {h.status === 'ate'
                        ? <CheckSquare size={15} className="text-primary" strokeWidth={1.75} />
                        : <Square size={15} className="text-white/20" strokeWidth={1.75} />
                      }
                    </div>
                    <p className="text-[10px] text-white/25 font-medium">{h.day}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-warning/70" />
                <h4 className="text-[13px] font-semibold text-white/55">Achievements</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((b) => (
                  <span key={b} className="px-3.5 py-1.5 rounded-full text-[12px] font-medium bg-primary/[0.07] text-primary/80 border border-primary/15 hover:-translate-y-0.5 transition-transform cursor-default">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Menu Vote ── */}
        {tab === 2 && (
          <div className="max-w-2xl space-y-4 animate-slide-up">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">Vote for next week</h3>
              <p className="text-[13px] text-white/35 mt-1">Pick your preferred dishes — top voted items make it to the menu.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {upcomingDishes.map((dish) => {
                const voted = menuVotes.includes(dish);
                return (
                  <button
                    key={dish}
                    onClick={() => setMenuVotes((prev) => voted ? prev.filter((d) => d !== dish) : [...prev, dish])}
                    className={`py-3.5 px-4 rounded-xl text-[13px] font-medium text-left flex items-center gap-3 transition-all duration-200 border ${
                      voted
                        ? 'bg-primary/[0.09] border-primary/25 text-primary/90 shadow-glow'
                        : 'bg-white/[0.02] border-white/[0.07] text-white/45 hover:bg-white/[0.04] hover:text-white/70 hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${voted ? 'bg-primary/20 border-primary/35' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                      {voted && <CheckSquare size={12} className="text-primary" strokeWidth={2} />}
                    </div>
                    {dish}
                  </button>
                );
              })}
            </div>
            <button
              className="btn-primary px-6 py-2.5 text-[13px] disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={menuVotes.length === 0}
              onClick={() => alert(`Voted for: ${menuVotes.join(', ')}`)}
            >
              Submit {menuVotes.length > 0 ? `${menuVotes.length} ` : ''}Vote{menuVotes.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

