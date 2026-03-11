import { buildComparison } from '../../utils/comparison';
import { formatPrice } from '../../utils/format';

export default function ComparisonTable({ results }) {
  const rows = buildComparison(results);
  if (!rows.length) return null;

  const storeIds = ['metro', 'plazavea', 'wong'];
  const storeNames = { metro: 'Metro', plazavea: 'Plaza Vea', wong: 'Wong' };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-merca-400 mb-4">Comparacion rapida</h2>
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full border-collapse bg-slate-800">
          <thead>
            <tr className="bg-slate-700">
              <th className="px-4 py-3 text-left text-sm text-slate-400 font-medium">Producto</th>
              {storeIds.map((s) => (
                <th key={s} className="px-4 py-3 text-left text-sm text-slate-400 font-medium">
                  {storeNames[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const prices = storeIds.map((s) => row[s]?.price).filter(Boolean);
              const minPrice = Math.min(...prices);

              return (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-850'}>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {(row.metro || row.plazavea || row.wong)?.image && (
                        <img
                          src={(row.metro || row.plazavea || row.wong).image}
                          alt=""
                          className="w-10 h-10 object-contain rounded bg-white shrink-0"
                        />
                      )}
                      <span className="line-clamp-2">{row.label}</span>
                    </div>
                  </td>
                  {storeIds.map((s) => (
                    <td key={s} className="px-4 py-3 text-sm">
                      {row[s] ? (
                        <span className={row[s].price === minPrice && prices.length > 1 ? 'text-green-400 font-bold' : ''}>
                          {formatPrice(row[s].price)}
                          {row[s].price === minPrice && prices.length > 1 && ' \u2713'}
                        </span>
                      ) : (
                        <span className="text-slate-600">&mdash;</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
