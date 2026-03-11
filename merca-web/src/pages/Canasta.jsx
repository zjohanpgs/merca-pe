import { Link } from 'react-router-dom';
import { useCanasta } from '../hooks/useCanasta';
import CanastaItem from '../components/canasta/CanastaItem';
import CanastaResumen from '../components/canasta/CanastaResumen';
import SEOHead from '../components/shared/SEOHead';

export default function Canasta() {
  const { items, removeItem, updateQty, clearCanasta } = useCanasta();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEOHead title="Mi Canasta" description="Tu lista de compras con los mejores precios de supermercados." />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mi Canasta</h1>
        {items.length > 0 && (
          <button
            onClick={clearCanasta}
            className="text-sm text-slate-500 hover:text-red-400 transition-colors"
          >
            Vaciar canasta
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-slate-500 mb-4">Tu canasta esta vacia</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-merca-400 text-slate-900 font-semibold hover:bg-merca-300 transition-colors"
          >
            Buscar productos
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-3">
            {items.map((item) => (
              <CanastaItem
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQty={updateQty}
              />
            ))}
          </div>
          <div className="lg:sticky lg:top-20 self-start">
            <CanastaResumen items={items} />
          </div>
        </div>
      )}
    </div>
  );
}
