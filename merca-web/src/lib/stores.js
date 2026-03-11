export const STORES = [
  {
    id: 'metro',
    name: 'Metro',
    baseUrl: 'https://www.metro.pe',
    color: '#dc2626',
    colorClass: 'bg-metro',
    textClass: 'text-metro',
  },
  {
    id: 'plazavea',
    name: 'Plaza Vea',
    baseUrl: 'https://www.plazavea.com.pe',
    color: '#16a34a',
    colorClass: 'bg-plazavea',
    textClass: 'text-plazavea',
  },
];

export const STORE_MAP = Object.fromEntries(STORES.map((s) => [s.id, s]));
