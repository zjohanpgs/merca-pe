import { useCanasta } from '../../hooks/useCanasta';

export default function AddToCanasta({ product, storeId, storeName }) {
  const { addItem, isInCanasta } = useCanasta();
  const added = isInCanasta(product.sku, storeId);

  if (added) {
    return (
      <span className="text-xs text-green-400 font-medium">
        En canasta
      </span>
    );
  }

  return (
    <button
      onClick={() => addItem(product, storeId, storeName)}
      className="text-xs px-3 py-1 rounded-lg border border-slate-600 text-slate-400 hover:border-merca-400 hover:text-merca-400 transition-colors"
    >
      + Canasta
    </button>
  );
}
