import { formatPrice } from '../../utils/format';
import { STORE_MAP } from '../../lib/stores';
import { withUtm } from '../../lib/utm';

export default function CanastaResumen({ items }) {
  if (!items.length) return null;

  // Group items by store
  const storeGroups = {};
  for (const item of items) {
    if (!storeGroups[item.storeId]) {
      storeGroups[item.storeId] = { total: 0, count: 0, items: [] };
    }
    storeGroups[item.storeId].total += item.price * item.qty;
    storeGroups[item.storeId].count += item.qty;
    storeGroups[item.storeId].items.push(item);
  }

  const entries = Object.entries(storeGroups).sort((a, b) => a[1].total - b[1].total);
  const cheapestStore = entries[0]?.[0];
  const cheapestTotal = entries[0]?.[1].total;
  const totalAll = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const colorMap = { metro: 'border-metro', plazavea: 'border-plazavea', wong: 'border-wong' };
  const bgMap = { metro: 'bg-metro', plazavea: 'bg-plazavea', wong: 'bg-wong' };

  function openStoreLinks(storeId) {
    const storeItems = storeGroups[storeId]?.items || [];
    for (const item of storeItems) {
      if (item.link) {
        window.open(withUtm(item.link, { campaign: 'canasta' }), '_blank');
      }
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Resumen por tienda</h3>

      <div className="space-y-4 mb-6">
        {entries.map(([storeId, { total, count, items: storeItems }]) => {
          const store = STORE_MAP[storeId];
          const isCheapest = storeId === cheapestStore && entries.length > 1;
          return (
            <div key={storeId} className={`rounded-lg border-l-4 ${colorMap[storeId] || 'border-slate-600'} bg-slate-750 overflow-hidden`}>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="font-semibold">{store?.name || storeId}</p>
                  <p className="text-xs text-slate-500">{count} item{count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isCheapest ? 'text-green-400' : 'text-slate-200'}`}>
                    {formatPrice(total)}
                  </p>
                  {isCheapest && (
                    <p className="text-xs text-green-400 font-medium">Mas barato</p>
                  )}
                </div>
              </div>

              {/* Product links for this store */}
              <div className="px-3 pb-2 space-y-1">
                {storeItems.map((item) => (
                  <a
                    key={item.id}
                    href={withUtm(item.link, { campaign: 'canasta' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs text-slate-400 hover:text-merca-400 transition-colors py-0.5"
                  >
                    <span className="truncate mr-2">{item.qty > 1 ? `${item.qty}x ` : ''}{item.name}</span>
                    <span className="shrink-0">{formatPrice(item.price * item.qty)}</span>
                  </a>
                ))}
              </div>

              {/* Go to store button */}
              <button
                onClick={() => openStoreLinks(storeId)}
                className={`w-full py-2.5 text-sm font-semibold text-white ${bgMap[storeId] || 'bg-slate-600'} hover:opacity-90 transition-opacity`}
              >
                Ir a comprar en {store?.name} ({count} producto{count !== 1 ? 's' : ''})
              </button>
            </div>
          );
        })}
      </div>

      {entries.length > 1 && (
        <div className="border-t border-slate-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total combinado</span>
            <span className="text-xl font-bold text-merca-400">{formatPrice(totalAll)}</span>
          </div>
          {cheapestTotal < totalAll && (
            <p className="text-sm text-green-400 mt-1">
              Comprando todo en {STORE_MAP[cheapestStore]?.name} ahorras{' '}
              <strong>{formatPrice(totalAll - cheapestTotal)}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
