import { formatPrice } from '../../utils/format';
import StoreBadge from '../shared/StoreBadge';

export default function CanastaItem({ item, onRemove, onUpdateQty }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl">
      {item.image && (
        <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-white shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <StoreBadge storeId={item.storeId} className="text-xs py-0.5 px-2" />
          <span className="text-xs text-slate-500">{item.brand}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onUpdateQty(item.id, item.qty - 1)}
          className="w-7 h-7 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center justify-center text-sm"
        >
          -
        </button>
        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.qty + 1)}
          className="w-7 h-7 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center justify-center text-sm"
        >
          +
        </button>
      </div>

      <div className="text-right shrink-0 w-24">
        <p className="text-merca-400 font-bold">{formatPrice(item.price * item.qty)}</p>
        {item.qty > 1 && (
          <p className="text-xs text-slate-500">{formatPrice(item.price)} c/u</p>
        )}
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="p-1 text-slate-600 hover:text-red-400 transition-colors shrink-0"
        title="Quitar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
