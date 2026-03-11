import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import ComparisonTable from '../components/search/ComparisonTable';
import StoreSection from '../components/search/StoreSection';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import SEOHead from '../components/shared/SEOHead';
import AdSlot from '../components/shared/AdSlot';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data, loading, error } = useSearch(query);

  const totalProducts = data?.results?.reduce((sum, r) => sum + r.products.length, 0) ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title={query ? `${query} — Comparar precios` : 'Buscar productos'}
        description={query ? `Compara precios de "${query}" en Metro, Plaza Vea y Wong.` : undefined}
      />

      {loading && <LoadingSpinner />}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {data && !loading && (
        <>
          {totalProducts === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-slate-500">No se encontraron productos para "{query}"</p>
            </div>
          ) : (
            <>
              <p className="text-center mb-8">
                Se encontraron <strong className="text-merca-400">{totalProducts} productos</strong> para "{query}"
              </p>

              <ComparisonTable results={data.results} />

              <AdSlot size="banner" className="my-6" />

              {data.results.map((r) => (
                <StoreSection
                  key={r.store}
                  storeId={r.store}
                  storeName={r.storeName}
                  products={r.products}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
