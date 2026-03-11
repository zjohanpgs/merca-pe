import { STORE_MAP } from '../../lib/stores';

const colorMap = {
  metro: 'bg-metro',
  plazavea: 'bg-plazavea',
  wong: 'bg-wong',
};

export default function StoreBadge({ storeId, className = '' }) {
  const store = STORE_MAP[storeId];
  if (!store) return null;

  return (
    <span className={`inline-block px-3 py-1 rounded-lg text-white text-sm font-bold ${colorMap[storeId]} ${className}`}>
      {store.name}
    </span>
  );
}
