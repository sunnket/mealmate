import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Utensils } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="glass-nav sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[54px] flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:bg-primary/22 transition-colors duration-200">
            <Utensils size={15} className="text-primary" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">MealMate</span>
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[12px] font-medium text-white/50">{user.name || user.role}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-white/40 hover:text-danger hover:bg-danger/[0.07] border border-transparent hover:border-danger/15 transition-all duration-200"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
