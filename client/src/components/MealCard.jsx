import HeadcountBar from './HeadcountBar';
import VoteButton from './VoteButton';
import { useState } from 'react';
import { Clock, Sunrise, Sun, Moon, Star, Utensils, Sparkles } from 'lucide-react';

const mealConfig = {
  breakfast: { label: 'Breakfast', Icon: Sunrise, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/15' },
  lunch:     { label: 'Lunch',     Icon: Sun,     color: 'text-sky-400',   bg: 'bg-sky-500/10',   border: 'border-sky-500/15'   },
  dinner:    { label: 'Dinner',    Icon: Moon,    color: 'text-violet-400',bg: 'bg-violet-500/10',border: 'border-violet-500/15' },
};

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function MealCard({ meal, userVote, onVote, inQueue, onJoinQueue, onRate }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showRate, setShowRate] = useState(false);

  const now = new Date();
  const deadlinePassed = new Date(meal.voteDeadline) < now;
  const mealActive = new Date(meal.mainStartTime) <= now && now <= new Date(meal.mainEndTime);
  const mainEnded = now > new Date(meal.mainEndTime);
  const mealClosed = now > new Date(meal.leftoverEndTime);
  const currentVote = userVote?.vote;

  const config = mealConfig[meal.mealType] || { label: 'Meal', Icon: Utensils, color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10' };
  const { label, Icon, color, bg, border } = config;

  let menuItems = [];
  try {
    menuItems = typeof meal.menuItems === 'string'
      ? JSON.parse(meal.menuItems)
      : Array.isArray(meal.menuItems)
      ? meal.menuItems
      : Object.values(meal.menuItems || {}).flat();
  } catch { menuItems = []; }

  return (
    <div className={`glass-card p-5 space-y-4 hover:-translate-y-0.5 transition-all duration-300 ${mealActive ? 'border-primary/20' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
            <Icon size={17} className={color} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-semibold text-[14px] tracking-tight">{label}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={10} className="text-white/22" />
              <p className="text-[11px] text-white/32 font-medium">
                {formatTime(meal.mainStartTime)} – {formatTime(meal.mainEndTime)}
              </p>
            </div>
          </div>
        </div>
        {mealActive && (
          <span className="flex items-center gap-1.5 badge badge-green shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-70" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Live
          </span>
        )}
        {deadlinePassed && !mealActive && !mealClosed && (
          <span className="badge badge-yellow shrink-0">Locked</span>
        )}
        {mealClosed && (
          <span className="shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/25">Ended</span>
        )}
      </div>

      {/* Menu items as rounded pill tags */}
      {menuItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {menuItems.map((item, i) => (
            <span key={i} className="tag">{item}</span>
          ))}
        </div>
      )}

      {/* Live headcount progress bar */}
      <HeadcountBar
        eating={meal.headcount?.eating || 0}
        skipping={meal.headcount?.skipping || 0}
        total={meal.headcount?.total || 0}
      />

      {/* Vote buttons */}
      {!deadlinePassed && (
        <div className="flex gap-2">
          <VoteButton type="eat" active={currentVote === 'eat'} disabled={false} onClick={onVote} />
          <VoteButton type="skip" active={currentVote === 'skip'} disabled={false} onClick={onVote} />
        </div>
      )}

      {/* Leftover queue */}
      {deadlinePassed && currentVote === 'skip' && mainEnded && !mealClosed && !inQueue && (
        <button
          onClick={() => onJoinQueue(meal.id)}
          className="w-full py-2.5 rounded-xl text-[13px] font-medium bg-warning/[0.07] text-warning/80 border border-warning/15 hover:bg-warning/[0.12] transition-all duration-200"
        >
          Join Leftover Queue
        </button>
      )}
      {inQueue && (
        <div className="text-[12px] text-primary/70 text-center py-2 rounded-xl bg-primary/[0.06] border border-primary/12">
          You're in the leftover queue
        </div>
      )}

      {/* Rate meal — glowing gradient CTA */}
      {mealClosed && !showRate && (
        <button
          onClick={() => setShowRate(true)}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(34,197,94,0.2)',
            color: '#4ADE80',
            boxShadow: '0 0 20px rgba(34,197,94,0.12), 0 0 40px rgba(34,197,94,0.04)',
          }}
        >
          <Sparkles size={14} />
          Rate this meal
        </button>
      )}

      {mealClosed && showRate && (
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          <p className="text-[12px] font-semibold text-white/40">How was it?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className={`transition-transform hover:scale-110 ${s <= rating ? 'text-warning' : 'text-white/18'}`}
              >
                <Star size={20} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any feedback? (optional)"
            className="glass-input w-full px-3.5 py-2.5 text-[13px] outline-none"
          />
          <button
            onClick={() => { onRate(meal.id, rating, comment); setShowRate(false); }}
            disabled={rating === 0}
            className="btn-primary w-full py-2.5 text-[13px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Submit Rating
          </button>
        </div>
      )}
    </div>
  );
}

