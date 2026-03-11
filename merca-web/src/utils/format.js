/** Format a price in Peruvian Soles. */
export function formatPrice(price) {
  if (price == null) return '—';
  return `S/ ${price.toFixed(2)}`;
}

/** Calculate discount percentage between list and sale price. */
export function formatDiscount(listPrice, price) {
  if (!listPrice || !price || listPrice <= price) return 0;
  return Math.round((1 - price / listPrice) * 100);
}
