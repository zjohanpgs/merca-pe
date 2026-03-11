const BASE_URL = 'https://merca.pe';

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Merca.pe',
    url: BASE_URL,
    description: 'Comparador de precios de supermercados en Peru',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/buscar?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productJsonLd(product, stores) {
  const offers = stores.map((ps) => ({
    '@type': 'Offer',
    price: ps.price,
    priceCurrency: 'PEN',
    availability: ps.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: { '@type': 'Organization', name: ps.storeName },
    url: ps.link,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    image: product.image,
    offers: offers.length === 1 ? offers[0] : { '@type': 'AggregateOffer', lowPrice: Math.min(...stores.map((s) => s.price)), highPrice: Math.max(...stores.map((s) => s.price)), priceCurrency: 'PEN', offerCount: offers.length, offers },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  };
}
