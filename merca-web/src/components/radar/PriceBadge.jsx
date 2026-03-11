/**
 * Analyzes current price vs history and shows a badge:
 * - "Precio mas bajo" (green) — at or below historical min
 * - "Buen precio" (blue) — below average
 * - "Sobre el promedio" (amber) — above average
 */
export default function PriceBadge({ currentPrice, history }) {
  if (!history || history.length < 2 || currentPrice == null) return null;

  const prices = history.map((r) => Number(r.price));
  const min = Math.min(...prices);
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;

  let label, color;
  if (currentPrice <= min) {
    label = 'Precio mas bajo';
    color = 'bg-green-500/15 text-green-400 border-green-500/30';
  } else if (currentPrice < avg) {
    label = 'Buen precio';
    color = 'bg-merca-400/15 text-merca-400 border-merca-400/30';
  } else {
    label = 'Sobre el promedio';
    color = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${color}`}>
      {label}
    </span>
  );
}
