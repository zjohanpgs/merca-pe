import { STORE_MAP } from '../../lib/stores';

const CHART_W = 700;
const CHART_H = 280;
const PAD = { top: 20, right: 20, bottom: 40, left: 60 };

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

export default function PriceChart({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800 rounded-xl text-slate-500">
        Sin datos de historial. Aparecera cuando el scraper corra.
      </div>
    );
  }

  // Group by store
  const byStore = {};
  for (const row of history) {
    if (!byStore[row.store_id]) byStore[row.store_id] = [];
    byStore[row.store_id].push({ price: Number(row.price), date: new Date(row.recorded_at) });
  }

  // Compute bounds
  const allPrices = history.map((r) => Number(r.price));
  const allDates = history.map((r) => new Date(r.recorded_at).getTime());
  const minPrice = Math.min(...allPrices) * 0.95;
  const maxPrice = Math.max(...allPrices) * 1.05;
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const dateRange = maxDate - minDate || 1;
  const priceRange = maxPrice - minPrice || 1;

  const w = CHART_W - PAD.left - PAD.right;
  const h = CHART_H - PAD.top - PAD.bottom;

  function x(date) {
    return PAD.left + ((date.getTime() - minDate) / dateRange) * w;
  }
  function y(price) {
    return PAD.top + h - ((price - minPrice) / priceRange) * h;
  }

  // Y-axis ticks (5 levels)
  const yTicks = Array.from({ length: 5 }, (_, i) => minPrice + (priceRange * i) / 4);

  // X-axis ticks (up to 6)
  const xTicks = Array.from({ length: 6 }, (_, i) => new Date(minDate + (dateRange * i) / 5));

  return (
    <div className="bg-slate-800 rounded-xl p-4 overflow-x-auto">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto min-w-[500px]">
        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={y(tick)} x2={CHART_W - PAD.right} y2={y(tick)} stroke="#334155" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fill="#64748b" fontSize={11}>
              S/{tick.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick, i) => (
          <text key={i} x={x(tick)} y={CHART_H - 8} textAnchor="middle" fill="#64748b" fontSize={11}>
            {formatDate(tick)}
          </text>
        ))}

        {/* Lines per store */}
        {Object.entries(byStore).map(([storeId, points]) => {
          const store = STORE_MAP[storeId];
          const color = store?.color || '#94a3b8';
          const sorted = points.sort((a, b) => a.date - b.date);
          const d = sorted.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.date).toFixed(1)},${y(p.price).toFixed(1)}`).join(' ');

          return (
            <g key={storeId}>
              <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {sorted.map((p, i) => (
                <circle key={i} cx={x(p.date)} cy={y(p.price)} r={3} fill={color} />
              ))}
            </g>
          );
        })}

        {/* Legend */}
        {Object.keys(byStore).map((storeId, i) => {
          const store = STORE_MAP[storeId];
          return (
            <g key={storeId} transform={`translate(${PAD.left + i * 120}, ${CHART_H - 24})`}>
              <rect width={12} height={12} rx={3} fill={store?.color || '#94a3b8'} />
              <text x={16} y={10} fill="#94a3b8" fontSize={11}>{store?.name || storeId}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
