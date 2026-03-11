const STORES = [
  { id: 'metro',     name: 'Metro',     base: 'https://www.metro.pe' },
  { id: 'plazavea',  name: 'Plaza Vea', base: 'https://www.plazavea.com.pe' },
];

const PAGE_SIZE = 50;
const MAX_PRODUCTS = 200;

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

async function fetchAllPages(store, query) {
  const allProducts = [];
  let from = 0;

  while (from < MAX_PRODUCTS) {
    const to = from + PAGE_SIZE - 1;
    const vtexUrl = `${store.base}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=${from}&_to=${to}`;
    try {
      const r = await fetch(vtexUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!r.ok) break;
      const data = await r.json();
      if (!data.length) break;
      allProducts.push(...parseProducts(data, store));
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    } catch {
      break;
    }
  }

  return allProducts;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') || '').trim();

  if (!q) {
    return Response.json({ results: [] });
  }

  const storeFilter = (url.searchParams.get('store') || '').trim();
  const storesToSearch = storeFilter
    ? STORES.filter(s => s.id === storeFilter)
    : STORES;

  const promises = storesToSearch.map(async (store) => {
    try {
      const products = await fetchAllPages(store, q);
      return { store: store.id, storeName: store.name, products };
    } catch (err) {
      return { store: store.id, storeName: store.name, products: [], error: err.message };
    }
  });

  const results = await Promise.all(promises);
  return Response.json({ query: q, results }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
