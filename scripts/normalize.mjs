/** Normalize a string for dedup: lowercase, strip accents, keep alphanumeric + spaces. */
export function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build a normalized key for product dedup: brand + name */
export function normalizedKey(brand, name) {
  return normalize((brand || '') + ' ' + (name || ''));
}

/** Convert a category string to a URL slug */
export function toSlug(category) {
  return normalize(category)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
