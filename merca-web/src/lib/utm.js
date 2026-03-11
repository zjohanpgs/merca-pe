/**
 * Append UTM tracking params to a store URL.
 */
export function withUtm(url, { source = 'merca', medium = 'referral', campaign = '' } = {}) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    if (campaign) u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch {
    return url;
  }
}
