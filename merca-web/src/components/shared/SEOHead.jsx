import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://merca.pe';
const DEFAULT_TITLE = 'Merca.pe — Compara precios de supermercados en Peru';
const DEFAULT_DESC = 'Compara precios de Metro y Plaza Vea al instante. Encuentra las mejores ofertas en alimentos y productos de supermercado.';

export default function SEOHead({ title, description, jsonLd }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | Merca.pe` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const canonical = `${BASE_URL}${pathname}`;

  useEffect(() => {
    document.title = fullTitle;

    setMeta('description', desc);
    setMeta('og:title', fullTitle);
    setMeta('og:description', desc);
    setMeta('og:url', canonical);
    setMeta('og:type', 'website');
    setMeta('og:site_name', 'Merca.pe');
    setLink('canonical', canonical);

    // JSON-LD
    let scriptEl = document.getElementById('merca-jsonld');
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'merca-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [fullTitle, desc, canonical, jsonLd]);

  return null;
}

function setMeta(name, content) {
  const attr = name.startsWith('og:') ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}
