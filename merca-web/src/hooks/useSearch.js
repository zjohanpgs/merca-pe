import { useState, useEffect } from 'react';

export function useSearch(query) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query]);

  return { data, loading, error };
}
