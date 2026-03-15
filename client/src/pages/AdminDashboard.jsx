import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CookingGuide from '../components/CookingGuide';
import WasteChart from '../components/WasteChart';
import HeadcountBar from '../components/HeadcountBar';
import useSocket from '../hooks/useSocket';
import api from '../utils/api';
import { Sunrise, Sun, Moon, Leaf, DollarSign, Utensils, Wind, AlertTriangle, BarChart2 } from 'lucide-react';

const TABS = ['Live Count', 'Cooking Guide', 'Waste Stats'];

const mealConfig = {
  breakfast: { label: 'Breakfast', Icon: Sunrise, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/15' },
  lunch:     { label: 'Lunch',     Icon: Sun,     color: 'text-sky-400',   bg: 'bg-sky-500/10 border-sky-500/15'   },
  dinner:    { label: 'Dinner',    Icon: Moon,    color: 'text-violet-400',bg: 'bg-violet-500/10 border-violet-500/15' },
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [wasteData, setWasteData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) navigate('/login');
  }, [user, authLoading, navigate]);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashboard(data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWaste = useCallback(async () => {
    try {
      const { data } = await api.get('/analytics/waste');
      setWasteData(data);
    } catch {
      // handled
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchWaste();
  }, [fetchDashboard, fetchWaste]);

  // Real-time updates
  useSocket({
    'vote:updated': (payload) => {
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          meals: prev.meals.map((m) =>
            m.id === payload.mealId
              ? { ...m, headcount: { eating: payload.eating, skipping: payload.skipping, total: payload.eating + payload.skipping } }
              : m
          ),
        };
      });
    },
    'queue:joined': () => {
      fetchDashboard();
    },
  });

  const meals = dashboard?.meals || [];
  const now = new Date();

  // Active meal for cooking guide
  const nextMeal = meals.find((m) => new Date(m.mainStartTime) > now) || meals[meals.length - 1];
  const nextHeadcount = nextMeal?.headcount?.eating || 0;

  // Waste KPIs
  const totalSaved = wasteData.reduce((s, d) => s + d.saved, 0);
  const costSaved = totalSaved * 80;
  const mealsNotWasted = Math.round(totalSaved / 0.3);
  const co2Prevented = totalSaved * 2;

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-7 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="section-label mb-1">Admin Control</p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight">Operations Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {dashboard?.noShowCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/[0.07] border border-danger/15">
                <AlertTriangle size={11} className="text-danger/80" />
                <span className="text-[12px] font-medium text-danger/80">{dashboard.noShowCount} no-shows</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[11.5px] font-medium text-white/36">Real-time</span>
            </div>
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

        {/* ── Tab 0: Live Count ── */}
        {tab === 0 && (
          <div className="space-y-4 animate-slide-up">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-[13px] text-white/30">Loading dashboard...</p>
                </div>
              </div>
            ) : meals.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <BarChart2 size={20} className="text-white/25" />
                </div>
                <p className="text-[13px] text-white/35">No meals scheduled for today</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {meals.map((meal, idx) => {
                  const isActive = new Date(meal.mainStartTime) <= now && now <= new Date(meal.mainEndTime);
                  const eating = meal.headcount?.eating || 0;
                  const skipping = meal.headcount?.skipping || 0;
                  const total = eating + skipping;
                  const cfg = mealConfig[meal.mealType] || { label: meal.mealType, Icon: Utensils, color: 'text-white/50', bg: 'bg-white/5 border-white/10' };

                  return (
                    <div
                      key={meal.id}
                      className={`glass-card p-5 space-y-4 transition-all duration-300 ${isActive ? 'border-primary/20 shadow-glow' : ''}`}
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl ${cfg.bg} border flex items-center justify-center shrink-0`}>
                            <cfg.Icon size={15} className={cfg.color} strokeWidth={1.75} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[14px] capitalize tracking-tight">{cfg.label}</h3>
                            <p className="text-[11px] text-white/30 font-medium">Today's service</p>
                          </div>
                        </div>
                        {isActive && (
                          <span className="badge badge-green">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-70" />
                              <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
                            </span>
                            Live
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-primary/[0.07] border border-primary/12 text-center">
                          <p className="text-[22px] font-semibold text-primary">{eating}</p>
                          <p className="text-[10px] text-primary/55 font-semibold uppercase tracking-wider">Eating</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                          <p className="text-[22px] font-semibold text-white/40">{skipping}</p>
                          <p className="text-[10px] text-white/22 font-semibold uppercase tracking-wider">Skipping</p>
                        </div>
                      </div>

                      <HeadcountBar eating={eating} skipping={skipping} total={total} />

                      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.05]">
                        <span className="text-[11px] text-white/25 font-medium">Gate entries</span>
                        <span className="text-[13px] font-semibold text-white/55">{meal.entries || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 1: Cooking Guide ── */}
        {tab === 1 && (
          <div className="animate-slide-up">
            <CookingGuide headcount={nextHeadcount} />
          </div>
        )}

        {/* ── Tab 2: Waste Stats ── */}
        {tab === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { val: `${totalSaved.toFixed(1)} kg`, label: 'Total Saved', Icon: Leaf, color: 'text-primary', tint: 'bg-primary/10 border-primary/15' },
                { val: `₹${costSaved.toFixed(0)}`, label: 'Cost Prevented', Icon: DollarSign, color: 'text-warning', tint: 'bg-warning/8 border-warning/12' },
                { val: mealsNotWasted, label: 'Meals Saved', Icon: Utensils, color: 'text-accent', tint: 'bg-accent/10 border-accent/15' },
                { val: `${co2Prevented.toFixed(1)} kg`, label: 'CO₂ Prevented', Icon: Wind, color: 'text-sky-400', tint: 'bg-sky-500/10 border-sky-500/15' },
              ].map(({ val, label, Icon, color, tint }) => (
                <div key={label} className="glass-card p-5 hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-8 h-8 rounded-xl border ${tint} flex items-center justify-center mb-3`}>
                    <Icon size={14} className={color} strokeWidth={1.75} />
                  </div>
                  <p className={`text-[22px] font-semibold tracking-tight ${color}`}>{val}</p>
                  <p className="text-[12px] text-white/32 mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
            <WasteChart data={wasteData} />
          </div>
        )}

      </div>
    </div>
  );
}
