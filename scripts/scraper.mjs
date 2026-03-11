import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from './categories.mjs';
import { normalizedKey, toSlug } from './normalize.mjs';

// --- Config ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const STORES = [
  { id: 'metro',    name: 'Metro',     base: 'https://www.metro.pe' },
  { id: 'plazavea', name: 'Plaza Vea', base: 'https://www.plazavea.com.pe' },
  { id: 'wong',     name: 'Wong',      base: 'https://www.wong.pe' },
];

const PRODUCTS_PER_QUERY = 50;
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchVTEX(store, query) {
  const url = `${store.base}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=0&_to=${PRODUCTS_PER_QUERY - 1}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (!res.ok) {
      console.warn(`  [${store.id}] HTTP ${res.status} for "${query}"`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn(`  [${store.id}] Error for "${query}": ${err.message}`);
    return [];
  }
}

function parseProduct(raw, store) {
  const item = raw.items?.[0];
  const seller = item?.sellers?.[0];
  const offer = seller?.commertialOffer;
  const price = offer?.Price ?? null;
  const listPrice = offer?.ListPrice ?? null;
  const stock = offer?.AvailableQuantity ?? 0;

  if (!price || price <= 0 || stock <= 0) return null;

  const name = raw.productName || raw.productTitle;
  const brand = raw.brand || '';
  const category = raw.categories?.[0] || '';

  return {
    name,
    brand,
    category,
    categorySlug: toSlug(category.split('/').filter(Boolean).pop() || ''),
    imageUrl: item?.images?.[0]?.imageUrl || '',
    unit: item?.measurementUnit || 'un',
    normalizedKey: normalizedKey(brand, name),
    price,
    listPrice,
    stock,
    sku: item?.itemId || '',
    link: `${store.base}/${raw.linkText}/p`,
    storeId: store.id,
  };
}

async function upsertProduct(p) {
  // Upsert into products table
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .upsert(
      {
        normalized_key: p.normalizedKey,
        name: p.name,
        brand: p.brand,
        category: p.category,
        category_slug: p.categorySlug,
        image_url: p.imageUrl,
        unit: p.unit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'normalized_key' }
    )
    .select('id')
    .single();

  if (prodErr) {
    console.warn(`  upsert product error: ${prodErr.message}`);
    return null;
  }

  const productId = product.id;

  // Upsert into product_stores
  const { error: psErr } = await supabase.from('product_stores').upsert(
    {
      product_id: productId,
      store_id: p.storeId,
      price: p.price,
      list_price: p.listPrice,
      stock: p.stock,
      sku: p.sku,
      link: p.link,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'product_id,store_id' }
  );

  if (psErr) {
    console.warn(`  upsert product_store error: ${psErr.message}`);
  }

  // Insert into price_history (append-only)
  const { error: phErr } = await supabase.from('price_history').insert({
    product_id: productId,
    store_id: p.storeId,
    price: p.price,
    list_price: p.listPrice,
  });

  if (phErr) {
    console.warn(`  insert price_history error: ${phErr.message}`);
  }

  return productId;
}

// --- Main ---
async function main() {
  console.log(`Merca Scraper starting at ${new Date().toISOString()}`);
  console.log(`Categories: ${CATEGORIES.length}, Stores: ${STORES.length}`);

  let totalProducts = 0;
  let totalUpserted = 0;

  for (const query of CATEGORIES) {
    console.log(`\nScraping "${query}"...`);

    for (const store of STORES) {
      const rawProducts = await fetchVTEX(store, query);
      console.log(`  [${store.id}] ${rawProducts.length} raw products`);

      for (const raw of rawProducts) {
        const parsed = parseProduct(raw, store);
        if (!parsed) continue;

        totalProducts++;
        const id = await upsertProduct(parsed);
        if (id) totalUpserted++;
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone! ${totalProducts} products found, ${totalUpserted} upserted.`);
}

main().catch((err) => {
  console.error('Scraper failed:', err);
  process.exit(1);
});
