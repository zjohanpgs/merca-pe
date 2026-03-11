import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'alertas@merca.pe';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
  console.error('Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or RESEND_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('Checking price alerts...');

  const { data: alerts, error } = await supabase.rpc('get_triggered_alerts');

  if (error) {
    console.error('Error fetching alerts:', error.message);
    process.exit(1);
  }

  console.log(`Found ${alerts.length} triggered alerts`);

  for (const alert of alerts) {
    const subject = `Merca.pe: ${alert.product_name} bajo a ${formatPrice(alert.current_price)}`;
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#0ea5e9">Merca.pe — Alerta de Precio</h2>
        <p><strong>${alert.product_name}</strong> en <strong>${alert.store_name}</strong> 
           bajo a <strong style="color:#16a34a">S/ ${Number(alert.current_price).toFixed(2)}</strong></p>
        <p>Tu umbral: S/ ${Number(alert.threshold_price).toFixed(2)}</p>
        ${alert.link ? `<p><a href="${alert.link}" style="color:#0ea5e9">Ver producto en ${alert.store_name}</a></p>` : ''}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
        <p style="color:#94a3b8;font-size:12px">Recibiste este email porque configuraste una alerta en Merca.pe</p>
      </div>
    `;

    try {
      await sendEmail(alert.email, subject, html);
      console.log(`  Sent to ${alert.email} for "${alert.product_name}"`);

      // Mark as notified
      await supabase
        .from('price_alerts')
        .update({ last_notified_at: new Date().toISOString() })
        .eq('id', alert.alert_id);
    } catch (err) {
      console.error(`  Failed to send to ${alert.email}: ${err.message}`);
    }
  }

  console.log('Done!');
}

function formatPrice(price) {
  return `S/ ${Number(price).toFixed(2)}`;
}

main().catch((err) => {
  console.error('Alert sender failed:', err);
  process.exit(1);
});
