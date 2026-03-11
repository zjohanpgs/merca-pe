import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../utils/format';
import { STORE_MAP } from '../lib/stores';
import StoreBadge from '../components/shared/StoreBadge';
import SEOHead from '../components/shared/SEOHead';
import { breadcrumbJsonLd } from '../utils/seo';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = slug?.replace(/-/g, ' ') || '';

  useEffect(() => {
    if (!slug || !supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('products')
      .select('*, product_stores(*)')
      .eq('category_slug', slug)
      .order('name')
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoading(false);
      });
  }, [slug]);

  const jsonLd = breadcrumbJsonLd([
    { name: 'Inicio', url: '/' },
    { name: categoryName },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title={`${categoryName} — Precios de supermercados`}
        description={`Compara precios de ${categoryName} en Metro y Plaza Vea. Encuentra el mejor precio.`}
        jsonLd={jsonLd}
      />

      <h1 className="text-2xl font-bold mb-6 capitalize">{categoryName}</h1>

      {loading && <LoadingSpinner />}

      {!loading && products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">
            No hay productos en esta categoria. Los datos aparecen despues de correr el scraper.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-merca-400 text-slate-900 font-semibold hover:bg-merca-300 transition-colors"
          >
            Buscar productos
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {products.map((product) => {
            const stores = product.product_stores || [];
            const cheapest = stores.length
              ? stores.reduce((a, b) => (Number(a.price) < Number(b.price) ? a : b))
              : null;

            return (
              <Link
                key={product.id}
                to={`/producto/${product.id}`}
                className="bg-slate-800 p-4 rounded-xl hover:bg-slate-750 transition-colors flex flex-col gap-2"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-36 object-contain rounded-lg bg-white"
                  />
                )}
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</h3>
                <p className="text-xs text-slate-500">{product.brand}</p>

                {cheapest && (
                  <div className="mt-auto pt-2 flex items-center gap-2">
                    <span className="text-lg font-extrabold text-merca-400">
                      {formatPrice(Number(cheapest.price))}
                    </span>
                    <StoreBadge storeId={cheapest.store_id} />
                  </div>
                )}

                {stores.length > 1 && (
                  <p className="text-xs text-slate-500">
                    En {stores.length} tiendas
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
