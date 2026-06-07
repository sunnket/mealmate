import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QRScanner from '../components/QRScanner';
import api from '../utils/api';
import { ScanLine, CheckCircle, XCircle, ArrowRight, Camera, Users, AlertTriangle, Zap } from 'lucide-react';

export default function GateScanner() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [log, setLog] = useState([]);

  // Fetch today's meals for the dropdown - use admin endpoint with gate workaround
  // We'll re-use the same data flow
  const fetchMeals = useCallback(async () => {
    try {
      // Gate staff can see meals via a simplified call
      const { data } = await api.get('/admin/dashboard');
      setMeals(data.meals || []);
      if (data.meals?.length > 0) {
        // Select active or first meal
        const now = new Date();
        const active = data.meals.find(
          (m) => new Date(m.mainStartTime) <= now && now <= new Date(m.leftoverEndTime)
        );
        setSelectedMeal((active || data.meals[0]).id);
      }
    } catch {
      // If gate can't access admin endpoint, that's fine
    }
  }, []);

  useEffect(() => { fetchMeals(); }, [fetchMeals]);

  const handleScan = async (qrCodeHash) => {
    if (!selectedMeal) {
      setResult({ status: 'error', message: 'Select a meal first' });
      return;
    }
    try {
      const { data } = await api.post('/entry/scan', { qrCodeHash, mealId: selectedMeal });
      setResult(data);
      setLog((prev) => [{ ...data, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 49)]);
    } catch (err) {
      setResult({ status: 'error', message: err.response?.data?.error || 'Scan failed' });
    }
  };

  const statusConfig = {
    allowed: { label: 'Allowed', Icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', border: 'border-l-primary' },
    redirect: { label: 'Redirect to Queue', Icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-l-danger' },
    leftover_allowed: { label: 'Leftover Entry', Icon: Zap, color: 'text-accent', bg: 'bg-accent/10', border: 'border-l-accent' },
    error: { label: 'Error', Icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10', border: 'border-l-danger' },
  };

  const entryCount = log.filter((l) => l.status === 'allowed' || l.status === 'leftover_allowed').length;
  const redirectCount = log.filter((l) => l.status === 'redirect').length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-7 space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label mb-1">Gate Operations</p>
            <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight">Entry Scanner</h1>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <ScanLine size={12} className="text-primary" />
            <span className="text-[11.5px] font-medium text-white/40">Gate active</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Scanner */}
          <div className="lg:col-span-2 space-y-5">
            {/* Meal selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/30 uppercase tracking-wider pl-1">Active Meal</label>
              <select
                value={selectedMeal}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm text-white outline-none appearance-none cursor-pointer"
              >
                <option value="">Select meal...</option>
                {meals.map((m) => (
                  <option key={m.id} value={m.id} className="bg-dark">
                    {m.mealType.charAt(0).toUpperCase() + m.mealType.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* QR Scanner */}
            <QRScanner onScan={handleScan} />

            {/* Scan Next */}
            {result && (
              <button
                onClick={() => setResult(null)}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                <ArrowRight size={14} />
                Scan Next Student
              </button>
            )}
          </div>

          {/* Right: Result + Log */}
          <div className="lg:col-span-3 space-y-5">
            {/* Result Card */}
            {result ? (() => {
              const cfg = statusConfig[result.status] || statusConfig.error;
              return (
                <div className={`glass-card p-6 border-l-4 space-y-3 animate-slide-up ${cfg.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <cfg.Icon size={18} className={cfg.color} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-[14.5px]">{cfg.label}</p>
                      {result.studentName && (
                        <p className="text-[12px] text-white/40 flex items-center gap-1 mt-0.5">
                          <Users size={10} className="text-white/25" />
                          {result.studentName}
                        </p>
                      )}
                    </div>
                  </div>
                  {result.room && <p className="text-[12px] text-white/30 pl-[56px]">Room {result.room}</p>}
                  {result.message && <p className="text-[12px] text-warning/80 pl-[56px]">{result.message}</p>}
                </div>
              );
            })() : (
              <div className="glass-card p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Camera size={22} className="text-white/20" />
                </div>
                <p className="text-white/30 text-[13px]">Scan a student QR code to see results here</p>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card-sm p-4 text-center">
                <p className="text-2xl font-bold text-primary">{entryCount}</p>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Entries</p>
              </div>
              <div className="glass-card-sm p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{redirectCount}</p>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Redirected</p>
              </div>
              <div className="glass-card-sm p-4 text-center">
                <p className="text-2xl font-bold text-white/50">{log.length}</p>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Total Scans</p>
              </div>
            </div>

            {/* Daily log */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white/50">Entry Log</h3>
              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {log.length === 0 ? (
                  <p className="text-xs text-white/20 py-4 text-center">No entries recorded yet</p>
                ) : (
                  log.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          entry.status === 'allowed' ? 'bg-primary' :
                          entry.status === 'leftover_allowed' ? 'bg-sky-500' : 'bg-red-500'
                        }`} />
                        <span className="text-white/60 font-medium">{entry.studentName || '—'}</span>
                      </div>
                      <span className="text-white/25">{entry.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
