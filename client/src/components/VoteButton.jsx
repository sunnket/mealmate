import { Check, Minus } from 'lucide-react';

export default function VoteButton({ type, active, disabled, onClick }) {
  const isEat = type === 'eat';

  return (
    <button
      onClick={() => onClick(type)}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border
        ${
          isEat
            ? active
              ? 'bg-primary text-dark border-primary shadow-glow'
              : 'bg-primary/[0.08] text-primary/80 border-primary/20 hover:bg-primary/[0.13] hover:border-primary/35'
            : active
              ? 'bg-danger/12 text-danger/90 border-danger/30'
              : 'bg-white/[0.03] text-white/35 border-white/[0.07] hover:bg-white/[0.06] hover:text-white/55'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.97]'}`}
    >
      {isEat ? <Check size={14} strokeWidth={2.5} /> : <Minus size={14} strokeWidth={2.5} />}
      {isEat ? "I'll Eat" : 'Skip'}
    </button>
  );
}
