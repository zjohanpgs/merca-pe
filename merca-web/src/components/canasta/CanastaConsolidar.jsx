import { useState } from 'react';
import { STORES, STORE_MAP } from '../../lib/stores';
import { normalize } from '../../lib/normalize';
import { formatPrice } from '../../utils/format';
import { withUtm } from '../../lib/utm';

const NOISE = new Set([
  'bolsa', 'paquete', 'pack', 'caja', 'botella', 'lata', 'sobre',
  'bandeja', 'frasco', 'doypack', 'tetrapack', 'sixpack',
  'de', 'el', 'la', 'los', 'las', 'en', 'con', 'para', 'por', 'un', 'una',
  'x', 'und', 'unid', 'unidades',
]);

function tokenize(str) {
  return normalize(str).split(' ').filter((w) => w.length > 1 && !NOISE.has(w));
}

function similarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap++;
  return overlap / Math.max(setA.size, setB.size);
}

function findBestMatch(itemName, candidates) {
  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    const score = similarity(itemName, c.name);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore >= 0.4 ? best : null;
}

export default function CanastaConsolidar({ items }) {
  const [targetStore, setTargetStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  if (!items.length) return null;

  async function handleConsolidate(storeId) {
    setTargetStore(storeId);
    setLoading(true);
    setResults(null);

    const found = [];
    const notFound = [];

    // Deduplicate by product name (ignore store)
    const uniqueNames = [];
    const seen = new Set();
    for (const item of items) {
      const key = normalize(item.name);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNames.push(item);
      }
    }

    for (const item of uniqueNames) {
      try {
        const query = item.brand
          ? item.brand + ' ' + item.name.replace(new RegExp(item.brand, 'i'), '').trim()
          : item.name;
        const res = await fetch('/api/search?' + new URLSearchParams({ q: query.slice(0, 60), store: storeId }));
        if (!res.ok) continue;
        const data = await res.json();
        const candidates = data.products || [];
        const match = findBestMatch(item.name, candidates);
        if (match) {
          found.push({ original: item, match, qty: item.qty });
        } else {
          notFound.push(item);
        }
      } catch {
        notFound.push(item);
      }
    }

    setResults({ found, notFound });
    setLoading(false);
  }

  function buildConsolidatedCartUrl(storeId, foundItems) {
    const store = STORE_MAP[storeId];
    if (!store) return null;
    const params = new URLSearchParams();
    for (const f of foundItems) {
      if (f.match.sku) {
        params.append('sku', f.match.sku);
        params.append('qty', String(f.qty));
        params.append('seller', '1');
      }
    }
    if (!params.toString()) return null;
    params.set('redirect', 'true');
    return withUtm(
      store.baseUrl + '/checkout/cart/add?' + params.toString(),
      { campaign: 'canasta_consolidar' }
    );
  }

  const storeName = targetStore ? (STORE_MAP[targetStore]?.name || targetStore) : '';
  const cartUrl = results ? buildConsolidatedCartUrl(targetStore, results.found) : null;
  const totalFound = results ? results.found.reduce((s, f) => s + f.match.price * f.qty, 0) : 0;

  const bgMap = { metro: 'bg-metro', plazavea: 'bg-plazavea', wong: 'bg-wong' };
  const borderMap = { metro: 'border-metro', plazavea: 'border-plazavea', wong: 'border-wong' };

  return (
    <div className="bg-slate-800 rounded-xl p-6 mt-4">
      <h3 className="text-lg font-bold mb-2">Comprar todo en una tienda</h3>
      <p className="text-xs text-slate-500 mb-4">
        Buscamos equivalentes de todos tus productos en la tienda que elijas
      </p>

      <div className="flex gap-2 mb-4">
        {STORES.map((store) => (
          <button
            key={store.id}
            onClick={() => handleConsolidate(store.id)}
            disabled={loading}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              targetStore === store.id
                ? bgMap[store.id] + ' text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            } disabled:opacity-50`}
          >
            {store.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-merca-400 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-slate-400">Buscando productos en {storeName}...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-3">
          {results.found.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-green-400 mb-2">
                {results.found.length} producto{results.found.length !== 1 ? 's' : ''} encontrado{results.found.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-1">
                {results.found.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/50">
                    <span className="text-slate-300 truncate mr-2">
                      {f.qty > 1 ? f.qty + 'x ' : ''}{f.match.name}
                    </span>
                    <span className="text-slate-200 shrink-0">{formatPrice(f.match.price * f.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.notFound.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-orange-400 mb-2">
                {results.notFound.length} no encontrado{results.notFound.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-1">
                {results.notFound.map((item, i) => (
                  <p key={i} className="text-xs text-slate-500 truncate">{item.name}</p>
                ))}
              </div>
            </div>
          )}

          {results.found.length > 0 && (
            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 text-sm">Total en {storeName}</span>
                <span className="text-lg font-bold text-merca-400">{formatPrice(totalFound)}</span>
              </div>
              {cartUrl && (
                <a
                  href={cartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3 text-center text-sm font-bold text-white rounded-lg ${bgMap[targetStore] || 'bg-slate-600'} hover:opacity-90 transition-opacity`}
                >
                  Armar carrito en {storeName} &rarr;
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
