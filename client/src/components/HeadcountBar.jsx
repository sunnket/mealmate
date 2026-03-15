import { Users } from 'lucide-react';

export default function HeadcountBar({ eating, skipping, total }) {
  const pct = total > 0 ? Math.round((eating / total) * 100) : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/40">
          <Users size={11} className="text-white/25" />
          <span>{total} responses</span>
        </div>
        <span className="text-[12px] font-semibold text-primary">{pct}% eating</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #22C55E, #4ADE80)',
            boxShadow: pct > 0 ? '0 0 8px rgba(34,197,94,0.4)' : 'none',
          }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/30 font-medium">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          {eating} eating
        </span>
        <span>{skipping} skipping</span>
      </div>
    </div>
  );
}
