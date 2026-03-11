// Cloudflare Pages Function — get price history for a product
// This is an alternative to calling Supabase RPC directly from frontend

export async function onRequestGet(context) {
  const productId = context.params.productId;
  const url = new URL(context.request.url);
  const days = parseInt(url.searchParams.get('days') || '90', 10);

  const SUPABASE_URL = context.env.SUPABASE_URL;
  const SUPABASE_KEY = context.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return Response.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_price_history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ p_product_id: productId, days }),
  });

  const data = await res.json();
  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=1800' },
  });
}
