import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Utensils, GraduationCap, LayoutDashboard, ScanLine, Leaf, Users, Target, Wallet, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

const roles = [
  { key: 'student', label: 'Student', Icon: GraduationCap, desc: 'Vote & track meals' },
  { key: 'admin',   label: 'Admin',   Icon: LayoutDashboard, desc: 'Manage & monitor' },
  { key: 'gate',    label: 'Gate Staff', Icon: ScanLine,    desc: 'Scan entries' },
];

const stats = [
  { value: '2.4T',  label: 'Food saved',   Icon: Leaf },
  { value: '850+',  label: 'Students',      Icon: Users },
  { value: '96%',   label: 'Accuracy',      Icon: Target },
  { value: '₹1.9L', label: 'Cost saved',    Icon: Wallet },
];

export default function Login() {
  const [role, setRole] = useState('student');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { rollNumber, password, role });
      const user = data.user || data.student;
      user.role = user.role || role;
      login(data.token, user);
      if (role === 'student') navigate('/student');
      else if (role === 'admin') navigate('/admin');
      else navigate('/gate');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col">
      {/* Top nav bar */}
      <div className="glass-nav shrink-0">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[54px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <Utensils size={13} className="text-primary" strokeWidth={2} />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">MealMate</span>
          </div>
          <span className="hidden sm:block text-[12px] text-white/30 font-medium">Smart Hostel Mess Platform</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-20 items-center">

          {/* ── Left: Hero ── */}
          <div className="space-y-8 animate-fade-in">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.08] border border-primary/[0.2]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[12px] font-medium text-primary/90">Live system active</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-[46px] sm:text-[56px] lg:text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-white">
                Zero waste.<br />
                <span className="text-gradient-green">Smart meals.</span>
              </h1>
              <p className="text-[16px] text-white/42 leading-[1.6] max-w-md font-normal">
                The intelligent hostel mess system that predicts demand, eliminates food waste, and saves thousands — all through a simple daily vote.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(({ value, label, Icon: StatIcon }) => (
                <div key={label} className="glass-card-sm p-4 group hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-3">
                    <StatIcon size={13} className="text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="text-[22px] font-semibold tracking-tight text-white">{value}</p>
                  <p className="text-[11px] text-white/32 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['Real-time vote tracking', 'QR gate scanner', 'Waste analytics', 'Leftover queue'].map((f) => (
                <span key={f} className="tag text-[11.5px]">{f}</span>
              ))}
            </div>
          </div>

          {/* ── Right: Login card ── */}
          <div className="animate-slide-up">
            <div className="glass-card p-8 space-y-6">
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight">Sign in</h2>
                <p className="text-[13px] text-white/36 mt-1">Choose your role to continue</p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ key, label, Icon: RoleIcon, desc }) => (
                  <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={`py-3.5 px-2 rounded-xl text-center transition-all duration-200 border ${
                      role === key
                        ? 'bg-primary/[0.1] border-primary/30 shadow-glow'
                        : 'bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-2 ${role === key ? 'bg-primary/15 border border-primary/25' : 'bg-white/[0.04] border border-white/[0.07]'}`}>
                      <RoleIcon size={13} className={role === key ? 'text-primary' : 'text-white/35'} strokeWidth={1.75} />
                    </div>
                    <p className={`text-[12px] font-semibold ${role === key ? 'text-primary' : 'text-white/55'}`}>{label}</p>
                    <p className={`text-[10px] mt-0.5 ${role === key ? 'text-primary/60' : 'text-white/22'}`}>{desc}</p>
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/30 uppercase tracking-widest block">
                    {role === 'student' ? 'Roll Number' : 'Username'}
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. 21CS101' : role}
                    className="glass-input w-full px-4 py-3 text-[14px] outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/30 uppercase tracking-widest block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input w-full px-4 py-3 text-[14px] outline-none"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-danger/[0.08] border border-danger/20 animate-scale-in">
                    <AlertTriangle size={13} className="text-danger shrink-0" />
                    <p className="text-danger/90 text-[12.5px] font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-[14px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-white/[0.05] text-center">
                <p className="text-[11px] text-white/22">
                  Demo — {role === 'student' ? '21CS101 / 12345' : '12345 / 12345'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 py-4 text-center border-t border-white/[0.04]">
        <p className="text-[11px] text-white/20">Built for smarter hostels · reducing food waste one meal at a time</p>
      </div>
    </div>
  );
}

