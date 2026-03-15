import { ChefHat } from 'lucide-react';

const INGREDIENTS = [
  { name: 'Rice', emoji: '🍚', perPerson: 180 },
  { name: 'Dal', emoji: '🫘', perPerson: 200 },
  { name: 'Roti', emoji: '🫓', perPerson: 3, unit: 'pcs' },
  { name: 'Sabzi', emoji: '🥘', perPerson: 150 },
  { name: 'Curd', emoji: '🥛', perPerson: 100 },
];

const BUFFER = 1.05;

export default function CookingGuide({ headcount }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">Cooking Guide</h3>
          <p className="text-[12px] text-white/35 mt-0.5">{headcount} confirmed eaters · +5% buffer</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
          <ChefHat size={15} className="text-white/40" strokeWidth={1.75} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-2.5 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Ingredient</th>
              <th className="text-right py-2.5 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Per Person</th>
              <th className="text-right py-2.5 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {INGREDIENTS.map((ing, idx) => {
              const isRoti = ing.unit === 'pcs';
              const total = headcount * ing.perPerson * BUFFER;
              const rotiTotal = isRoti ? Math.ceil(headcount * ing.perPerson * BUFFER) : null;
              const display = isRoti ? `${rotiTotal} pcs` : `${(total / 1000).toFixed(1)} kg`;
              const perDisplay = isRoti ? `${ing.perPerson} pcs` : `${ing.perPerson}g`;

              return (
                <tr key={ing.name} className={`${idx !== INGREDIENTS.length - 1 ? 'border-b border-white/[0.04]' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="py-3 text-[13px] text-white/70 font-medium">{ing.emoji} {ing.name}</td>
                  <td className="text-right text-[12px] text-white/30 font-medium">{perDisplay}</td>
                  <td className="text-right text-[13px] font-semibold text-primary">{display}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
