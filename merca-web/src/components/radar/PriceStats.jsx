import { formatPrice } from '../../utils/format';

export default function PriceStats({ history }) {
  if (!history || history.length === 0) return null;

  const prices = history.map((r) => Number(r.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
  const latest = prices[prices.length - 1];

  const stats = [
    { label: 'Minimo', value: formatPrice(min), accent: 'text-green-400' },
    { label: 'Promedio', value: formatPrice(avg), accent: 'text-slate-200' },
    { label: 'Maximo', value: formatPrice(max), accent: 'text-red-400' },
    { label: 'Actual', value: formatPrice(latest), accent: 'text-merca-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">{s.label}</p>
          <p className={`text-lg font-bold ${s.accent}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
