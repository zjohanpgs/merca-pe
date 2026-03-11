import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { formatPrice, formatDiscount } from '../utils/format';
import { STORE_MAP } from '../lib/stores';
import { withUtm } from '../lib/utm';
import StoreBadge from '../components/shared/StoreBadge';
import SEOHead from '../components/shared/SEOHead';
import AdSlot from '../components/shared/AdSlot';
import { productJsonLd, breadcrumbJsonLd } from '../utils/seo';
import PriceChart from '../components/radar/PriceChart';
import PriceBadge from '../components/radar/PriceBadge';
import PriceStats from '../components/radar/PriceStats';
import AlertForm from '../components/radar/AlertForm';
import AddToCanasta from '../components/canasta/AddToCanasta';

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: history, loading: histLoading } = usePriceHistory(id);

  useEffect(() => {
    if (!id || !supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('products')
      .select('*, product_stores(*)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error) setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400">
        Cargando producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-5xl mb-4 text-slate-700">?</p>
        <p className="text-slate-500">Producto no encontrado. Los datos aparecen despues de correr el scraper.</p>
      </div>
    );
  }

  const stores = product.product_stores || [];
  const cheapest = stores.length ? stores.reduce((a, b) => (Number(a.price) < Number(b.price) ? a : b)) : null;

  const seoStores = stores.map((ps) => ({
    price: Number(ps.price),
    storeName: STORE_MAP[ps.store_id]?.name || ps.store_id,
    stock: 1,
    link: ps.link,
  }));

  const jsonLd = [
    productJsonLd(
      { name: product.name, brand: product.brand, image: product.image_url },
      seoStores
    ),
    breadcrumbJsonLd([
      { name: 'Inicio', url: '/' },
      ...(product.category_slug ? [{ name: product.category || product.category_slug, url: `/categoria/${product.category_slug}` }] : []),
      { name: product.name },
    ]),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <SEOHead
        title={`${product.name} — Precio en supermercados`}
        description={`${product.name} desde ${cheapest ? formatPrice(Number(cheapest.price)) : ''} — compara precios en Metro, Plaza Vea y Wong.`}
        jsonLd={jsonLd}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-48 h-48 object-contain rounded-xl bg-white shrink-0"
          />
        )}
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-1">{product.brand}</p>
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          {cheapest && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-extrabold text-merca-400">
                {formatPrice(Number(cheapest.price))}
              </span>
              {history && <PriceBadge currentPrice={Number(cheapest.price)} history={history} />}
            </div>
          )}

          {/* Prices by store */}
          <div className="space-y-2">
            {stores
              .sort((a, b) => Number(a.price) - Number(b.price))
              .map((ps) => {
                const store = STORE_MAP[ps.store_id];
                const discount = formatDiscount(Number(ps.list_price), Number(ps.price));
                const isCheapest = cheapest && ps.store_id === cheapest.store_id && stores.length > 1;
                return (
                  <div
                    key={ps.store_id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${isCheapest ? 'bg-green-500/5 border border-green-500/20' : 'bg-slate-800'}`}
                  >
                    <StoreBadge storeId={ps.store_id} />
                    <span className={`font-bold ${isCheapest ? 'text-green-400' : ''}`}>
                      {formatPrice(Number(ps.price))}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs text-green-400 font-medium">-{discount}%</span>
                    )}
                    {isCheapest && stores.length > 1 && (
                      <span className="text-xs text-green-400">Mas barato</span>
                    )}
                    <a
                      href={withUtm(ps.link, { campaign: 'product' })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-sm text-merca-400 hover:underline"
                    >
                      Ver en {store?.name} &rarr;
                    </a>
                    <AddToCanasta
                      product={{
                        sku: ps.sku,
                        name: product.name,
                        brand: product.brand,
                        price: Number(ps.price),
                        listPrice: Number(ps.list_price),
                        image: product.image_url,
                        link: ps.link,
                      }}
                      storeId={ps.store_id}
                      storeName={store?.name}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <AdSlot size="banner" className="my-2" />

      {/* Price Chart */}
      <div>
        <h2 className="text-xl font-bold mb-4">Historial de precios (90 dias)</h2>
        {histLoading ? (
          <div className="h-64 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
            Cargando historial...
          </div>
        ) : (
          <PriceChart history={history} />
        )}
      </div>

      {/* Stats */}
      {history && history.length > 0 && <PriceStats history={history} />}

      {/* Alert Form */}
      {cheapest && <AlertForm productId={id} currentPrice={Number(cheapest.price)} />}
    </div>
  );
}
