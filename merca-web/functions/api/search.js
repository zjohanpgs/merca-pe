// Cloudflare Pages Function — proxies VTEX search for 3 stores in parallel
const STORES = [
  { id: 'metro',     name: 'Metro',     base: 'https://www.metro.pe' },
  { id: 'plazavea',  name: 'Plaza Vea', base: 'https://www.plazavea.com.pe' },
  { id: 'wong',      name: 'Wong',      base: 'https://www.wong.pe' },
];

function parseProducts(data, store) {
  return data
    .map((p) => {
      const item = p.items?.[0];
      const seller = item?.sellers?.[0];
      const offer = seller?.commertialOffer;
      return {
        name: p.productName || p.productTitle,
        brand: p.brand,
        price: offer?.Price ?? null,
        listPrice: offer?.ListPrice ?? null,
        stock: offer?.AvailableQuantity ?? 0,
        image: item?.images?.[0]?.imageUrl || '',
        category: p.categories?.[0] || '',
        unit: item?.measurementUnit || 'un',
        unitMultiplier: item?.unitMultiplier || 1,
        sku: item?.itemId || '',
        link: `${store.base}/${p.linkText}/p`,
      };
    })
    .filter((p) => p.price && p.price > 0 && p.stock > 0);
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return Response.json({ results: [] });
  }

  const promises = STORES.map(async (store) => {
    const vtexUrl = `${store.base}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`;
    try {
      const r = await fetch(vtexUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!r.ok) return { store: store.id, storeName: store.name, products: [], error: r.status };
      const data = await r.json();
      return { store: store.id, storeName: store.name, products: parseProducts(data, store) };
    } catch (err) {
      return { store: store.id, storeName: store.name, products: [], error: err.message };
    }
  });

  const results = await Promise.all(promises);
  return Response.json({ query: q, results }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
