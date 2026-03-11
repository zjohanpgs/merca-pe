import express from 'express';

const app = express();
const PORT = 3502;

const STORES = [
  { id: 'metro',     name: 'Metro',     base: 'https://www.metro.pe' },
  { id: 'plazavea',  name: 'Plaza Vea', base: 'https://www.plazavea.com.pe' },
  { id: 'wong',      name: 'Wong',      base: 'https://www.wong.pe' },
];

app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });

  try {
    const promises = STORES.map(async (store) => {
      const url = `${store.base}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(q)}&_from=0&_to=19`;
      try {
        const r = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (!r.ok) return { store: store.id, storeName: store.name, products: [], error: r.status };
        const data = await r.json();
        const products = data.map(p => {
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
        }).filter(p => p.price && p.price > 0 && p.stock > 0);

        return { store: store.id, storeName: store.name, products };
      } catch (err) {
        return { store: store.id, storeName: store.name, products: [], error: err.message };
      }
    });

    const results = await Promise.all(promises);
    res.json({ query: q, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Merca API running at http://localhost:${PORT}`);
});
