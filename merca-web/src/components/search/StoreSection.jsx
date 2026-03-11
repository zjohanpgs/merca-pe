import StoreBadge from '../shared/StoreBadge';
import ProductCard from './ProductCard';

export default function StoreSection({ storeId, storeName, products }) {
  if (!products.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-t-xl border-b-2 border-slate-700">
        <StoreBadge storeId={storeId} />
        <span className="ml-auto text-sm text-slate-500">{products.length} productos</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-px bg-slate-700 rounded-b-xl overflow-hidden">
        {products.map((p, i) => (
          <ProductCard key={`${p.sku}-${i}`} product={p} storeId={storeId} storeName={storeName} />
        ))}
      </div>
    </section>
  );
}
