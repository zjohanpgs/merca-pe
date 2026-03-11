import { formatPrice, formatDiscount } from '../../utils/format';
import { withUtm } from '../../lib/utm';
import AddToCanasta from '../canasta/AddToCanasta';

export default function ProductCard({ product, storeId, storeName }) {
  const discount = formatDiscount(product.listPrice, product.price);

  return (
    <div className="bg-slate-800 p-4 flex flex-col gap-2 hover:bg-slate-750 transition-colors">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-36 object-contain rounded-lg bg-white"
        />
      )}
      <h3 className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</h3>
      <p className="text-xs text-slate-500">{product.brand}</p>

      {discount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 line-through">{formatPrice(product.listPrice)}</span>
          <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-xs font-bold">
            -{discount}%
          </span>
        </div>
      )}

      <p className="text-xl font-extrabold text-merca-400">{formatPrice(product.price)}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <a
          href={withUtm(product.link, { campaign: 'search' })}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-merca-400 hover:underline"
        >
          Ver en {storeName} &rarr;
        </a>
        <AddToCanasta product={product} storeId={storeId} storeName={storeName} />
      </div>
    </div>
  );
}
