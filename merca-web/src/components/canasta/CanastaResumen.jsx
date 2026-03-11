import { formatPrice } from '../../utils/format';
import { STORE_MAP } from '../../lib/stores';

export default function CanastaResumen({ items }) {
  if (!items.length) return null;

  // Group items by store and calculate totals
  const storeTotals = {};
  for (const item of items) {
    if (!storeTotals[item.storeId]) {
      storeTotals[item.storeId] = { total: 0, count: 0 };
    }
    storeTotals[item.storeId].total += item.price * item.qty;
    storeTotals[item.storeId].count += item.qty;
  }

  const entries = Object.entries(storeTotals).sort((a, b) => a[1].total - b[1].total);
  const cheapestStore = entries[0]?.[0];
  const cheapestTotal = entries[0]?.[1].total;
  const totalAll = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const colorMap = { metro: 'border-metro', plazavea: 'border-plazavea', wong: 'border-wong' };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Resumen por tienda</h3>

      <div className="space-y-3 mb-6">
        {entries.map(([storeId, { total, count }]) => {
          const store = STORE_MAP[storeId];
          const isCheapest = storeId === cheapestStore && entries.length > 1;
          return (
            <div key={storeId} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${colorMap[storeId] || 'border-slate-600'} bg-slate-750`}>
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
          );
        })}
      </div>

      {entries.length > 1 && (
        <div className="border-t border-slate-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total combinado</span>
            <span className="text-xl font-bold text-merca-400">{formatPrice(totalAll)}</span>
          </div>
          {cheapestTotal < totalAll && entries.length > 1 && (
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
