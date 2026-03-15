import { Users, CheckCircle, Clock } from 'lucide-react';

export default function LeftoverQueuePanel({ queue }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent/[0.08] border border-accent/15 flex items-center justify-center">
            <Users size={14} className="text-accent" strokeWidth={1.75} />
          </div>
          <h3 className="text-[14px] font-semibold tracking-tight">Leftover Queue</h3>
        </div>
        <span className="badge badge-blue">
          {queue.length} {queue.length === 1 ? 'student' : 'students'}
        </span>
      </div>
      {queue.length === 0 ? (
        <div className="py-9 text-center">
          <p className="text-[13px] text-white/25 font-medium">No one in the queue yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {queue.map((entry, i) => (
            <div key={entry.id} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors duration-200">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-white/20 w-5 tabular-nums">#{i + 1}</span>
                <span className="text-white/65 font-medium text-[13px]">{entry.student?.name || 'Student'}</span>
              </div>
              {entry.entered ? (
                <span className="badge badge-green flex items-center gap-1">
                  <CheckCircle size={10} />
                  Entered
                </span>
              ) : (
                <span className="badge badge-yellow flex items-center gap-1">
                  <Clock size={10} />
                  Waiting
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
