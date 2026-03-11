import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function usePriceHistory(productId, days = 90) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId || !supabase) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .rpc('get_price_history', { p_product_id: productId, days })
      .then(({ data: rows, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
        } else {
          setData(rows || []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [productId, days]);

  return { data, loading, error };
}
