import { normalize } from '../lib/normalize';

/**
 * Build a comparison table from search results across multiple stores.
 * Returns products found in 2+ stores, sorted alphabetically, max 20 rows.
 */
export function buildComparison(results) {
  const map = {};

  for (const r of results) {
    for (const p of r.products) {
      const key = makeKey(p.name, p.brand);
      if (!map[key]) {
        map[key] = { label: p.name, image: p.image, metro: null, plazavea: null, wong: null };
      }
      if (!map[key][r.store] || p.price < map[key][r.store].price) {
        map[key][r.store] = { price: p.price, image: p.image };
      }
      // Keep the shortest label (usually cleanest)
      if (p.name.length < map[key].label.length) {
        map[key].label = p.name;
      }
    }
  }

  return Object.values(map)
    .filter((row) => [row.metro, row.plazavea, row.wong].filter(Boolean).length >= 2)
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 20);
}

// Noise words to strip from product names
const NOISE = new Set([
  'bolsa', 'paquete', 'pack', 'caja', 'botella', 'lata', 'sobre',
  'bandeja', 'frasco', 'doypack', 'tetrapack', 'sixpack',
  'de', 'el', 'la', 'los', 'las', 'en', 'con', 'para', 'por', 'un', 'una',
  'x', 'und', 'unid', 'unidades',
]);

/**
 * Create a matching key from product name + brand.
 * Sorts words alphabetically so "Arroz Extra Costeño 5kg" and
 * "Arroz Extra COSTEÑO Bolsa 5Kg" produce the same key.
 */
function makeKey(name, brand) {
  const raw = normalize((brand || '') + ' ' + name);
  const words = raw
    .split(' ')
    .filter((w) => w.length > 0 && !NOISE.has(w));

  // Deduplicate (brand often repeats in name)
  const unique = [...new Set(words)];
  unique.sort();
  return unique.join(' ');
}
