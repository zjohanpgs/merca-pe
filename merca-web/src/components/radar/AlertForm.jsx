import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/format';

export default function AlertForm({ productId, currentPrice }) {
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState(currentPrice ? (currentPrice * 0.9).toFixed(2) : '');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !threshold || !supabase) return;

    setSubmitting(true);
    setStatus(null);

    const { error } = await supabase.from('price_alerts').insert({
      email,
      product_id: productId,
      threshold_price: parseFloat(threshold),
    });

    setSubmitting(false);
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
    }
  }

  if (!supabase) return null;

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-1">Alerta de precio</h3>
      <p className="text-sm text-slate-500 mb-4">
        Te avisamos por email cuando baje de tu precio objetivo.
      </p>

      {status === 'success' ? (
        <div className="text-green-400 text-sm bg-green-500/10 rounded-lg p-4">
          Alerta creada. Te notificaremos cuando el precio baje de {formatPrice(parseFloat(threshold))}.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-merca-400 text-sm"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">S/</span>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 focus:outline-none focus:border-merca-400 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-merca-400 text-slate-900 font-semibold text-sm hover:bg-merca-300 transition-colors disabled:opacity-50"
            >
              {submitting ? '...' : 'Crear alerta'}
            </button>
          </div>
          {status === 'error' && (
            <p className="text-red-400 text-xs">Error al crear la alerta. Intenta de nuevo.</p>
          )}
        </form>
      )}
    </div>
  );
}
