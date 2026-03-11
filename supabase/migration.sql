-- ============================================
-- Merca.pe — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 0. Enable extensions FIRST
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Stores (reference table)
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  logo_url TEXT,
  color TEXT
);

INSERT INTO stores (id, name, base_url, color) VALUES
  ('metro',    'Metro',     'https://www.metro.pe',          '#dc2626'),
  ('plazavea', 'Plaza Vea', 'https://www.plazavea.com.pe',   '#16a34a'),
  ('wong',     'Wong',      'https://www.wong.pe',            '#7c3aed')
ON CONFLICT (id) DO NOTHING;

-- 2. Products (deduplicated master catalog)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  category_slug TEXT,
  image_url TEXT,
  unit TEXT DEFAULT 'un',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_normalized_key ON products (normalized_key);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products (category_slug);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- 3. Product-Store prices (current price per product per store)
CREATE TABLE IF NOT EXISTS product_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price NUMERIC(10,2),
  list_price NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  sku TEXT,
  link TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_product_stores_product ON product_stores (product_id);
CREATE INDEX IF NOT EXISTS idx_product_stores_store ON product_stores (store_id);
CREATE INDEX IF NOT EXISTS idx_product_stores_price ON product_stores (price);

-- 4. Price history (append-only, inserted by scraper)
CREATE TABLE IF NOT EXISTS price_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  list_price NUMERIC(10,2),
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product_store ON price_history (product_id, store_id, recorded_at DESC);

-- 5. Price alerts (no-login, email-based)
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id TEXT REFERENCES stores(id),
  threshold_price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_price_alerts_product ON price_alerts (product_id);

-- ============================================
-- Enable trigram extension (for fuzzy text search)
-- ============================================

-- ============================================
-- RPCs
-- ============================================

-- Search products with current prices from all stores
CREATE OR REPLACE FUNCTION search_products(term TEXT, result_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  product_id UUID,
  name TEXT,
  brand TEXT,
  category TEXT,
  category_slug TEXT,
  image_url TEXT,
  unit TEXT,
  stores JSONB
) LANGUAGE sql STABLE AS $$
  SELECT
    p.id AS product_id,
    p.name,
    p.brand,
    p.category,
    p.category_slug,
    p.image_url,
    p.unit,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'store_id', ps.store_id,
          'price', ps.price,
          'list_price', ps.list_price,
          'stock', ps.stock,
          'link', ps.link,
          'last_seen_at', ps.last_seen_at
        )
      ) FILTER (WHERE ps.store_id IS NOT NULL),
      '[]'::jsonb
    ) AS stores
  FROM products p
  LEFT JOIN product_stores ps ON ps.product_id = p.id
  WHERE p.name ILIKE '%' || term || '%'
     OR p.brand ILIKE '%' || term || '%'
  GROUP BY p.id
  ORDER BY similarity(p.name, term) DESC
  LIMIT result_limit;
$$;

-- Get price history for a product (for Radar chart)
CREATE OR REPLACE FUNCTION get_price_history(p_product_id UUID, days INTEGER DEFAULT 90)
RETURNS TABLE (
  store_id TEXT,
  price NUMERIC,
  list_price NUMERIC,
  recorded_at TIMESTAMPTZ
) LANGUAGE sql STABLE AS $$
  SELECT
    ph.store_id,
    ph.price,
    ph.list_price,
    ph.recorded_at
  FROM price_history ph
  WHERE ph.product_id = p_product_id
    AND ph.recorded_at >= now() - make_interval(days => days)
  ORDER BY ph.recorded_at ASC;
$$;

-- Get active alerts for products whose price dropped below threshold
CREATE OR REPLACE FUNCTION get_triggered_alerts()
RETURNS TABLE (
  alert_id UUID,
  email TEXT,
  product_name TEXT,
  store_name TEXT,
  current_price NUMERIC,
  threshold_price NUMERIC,
  link TEXT
) LANGUAGE sql STABLE AS $$
  SELECT
    a.id AS alert_id,
    a.email,
    p.name AS product_name,
    s.name AS store_name,
    ps.price AS current_price,
    a.threshold_price,
    ps.link
  FROM price_alerts a
  JOIN products p ON p.id = a.product_id
  JOIN product_stores ps ON ps.product_id = a.product_id
  JOIN stores s ON s.id = ps.store_id
  WHERE a.is_active = true
    AND ps.price <= a.threshold_price
    AND (a.store_id IS NULL OR ps.store_id = a.store_id)
    AND (a.last_notified_at IS NULL OR a.last_notified_at < now() - interval '24 hours');
$$;

-- ============================================
-- Row Level Security (public read, restricted write)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_stores" ON product_stores FOR SELECT USING (true);
CREATE POLICY "Public read price_history" ON price_history FOR SELECT USING (true);

-- Alerts: anyone can create, read own
CREATE POLICY "Anyone can create alerts" ON price_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read alerts" ON price_alerts FOR SELECT USING (true);
