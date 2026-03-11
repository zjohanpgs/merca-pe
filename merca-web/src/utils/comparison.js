import { normalize } from '../lib/normalize';

/**
 * Build a comparison table from search results across multiple stores.
 * Returns products found in 2+ stores, sorted alphabetically, max 20 rows.
 */
export function buildComparison(results) {
  const map = {};

  for (const r of results) {
    for (const p of r.products) {
      const key = normalize(p.brand + ' ' + p.name);
      if (!map[key]) {
        map[key] = { label: p.name, metro: null, plazavea: null, wong: null };
      }
      if (!map[key][r.store] || p.price < map[key][r.store].price) {
        map[key][r.store] = { price: p.price, image: p.image };
      }
    }
  }

  return Object.values(map)
    .filter((row) => [row.metro, row.plazavea, row.wong].filter(Boolean).length >= 2)
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 20);
}
