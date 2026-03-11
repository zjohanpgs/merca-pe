# Merca.pe

Comparador de precios de supermercados en Peru (Metro, Plaza Vea, Wong).

## Stack
- Frontend: Vite + React 19 + Tailwind CSS 3 + react-router-dom 7
- Backend: Supabase (futuro) + Cloudflare Pages Functions
- Deploy: Cloudflare Pages

## Desarrollo
```bash
cd merca-web
npm install
npm run dev       # http://localhost:3500
npm run build     # Produccion
```

## Estructura
- `merca-web/src/pages/` — paginas (Home, Search, Product, Canasta, Category)
- `merca-web/src/components/` — componentes (layout/, search/, canasta/, radar/, shared/)
- `merca-web/src/hooks/` — custom hooks (useSearch, useCanasta, etc.)
- `merca-web/src/lib/` — config y utilidades (stores, normalize, constants, supabase)
- `merca-web/src/utils/` — helpers puros (comparison, format, seo)
- `merca-web/functions/` — Cloudflare Pages Functions (proxy VTEX)
- `scripts/` — scraper de precios (GitHub Actions)

## Convenciones
- Dark theme (bg-slate-950, text-slate-200)
- Colores de tiendas: Metro (#dc2626), Plaza Vea (#16a34a), Wong (#7c3aed)
- Color primario: merca-400 (#38bdf8)
- Componentes funcionales con hooks
- Imports con rutas relativas desde src/
