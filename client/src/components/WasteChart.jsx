import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown } from 'lucide-react';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="glass-card-sm px-4 py-3 space-y-0.5">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wide">{label}</p>
        <p className="text-primary font-semibold text-[14px]">{val.toFixed(1)} kg saved</p>
        <p className="text-white/35 text-[12px]">₹{(val * 80).toFixed(0)} prevented</p>
      </div>
    );
  }
  return null;
}

export default function WasteChart({ data }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">Waste Prevented</h3>
          <p className="text-[12px] text-white/35 mt-0.5">Last 7 days</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
          <TrendingDown size={15} className="text-primary" strokeWidth={1.75} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }} barCategoryGap="35%">
          <XAxis 
            dataKey="day" 
            tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11, fontWeight: 500, fontFamily: 'Inter' }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 500, fontFamily: 'Inter' }} 
            axisLine={false} 
            tickLine={false}
            unit="kg"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)', radius: 4 }} />
          <Bar dataKey="saved" radius={[6, 6, 0, 0]}>
            {(data || []).map((_, i) => (
              <Cell key={i} fill={`url(#greenGradient)`} />
            ))}
          </Bar>
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0.6} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
