import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'merca_canasta';

function loadCanasta() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCanasta(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Broadcast changes across components via custom event
function dispatch() {
  window.dispatchEvent(new Event('canasta-change'));
}

export function useCanasta() {
  const [items, setItems] = useState(loadCanasta);

  useEffect(() => {
    function onchange() {
      setItems(loadCanasta());
    }
    window.addEventListener('canasta-change', onchange);
    window.addEventListener('storage', onchange);
    return () => {
      window.removeEventListener('canasta-change', onchange);
      window.removeEventListener('storage', onchange);
    };
  }, []);

  const addItem = useCallback((product, storeId, storeName) => {
    const current = loadCanasta();
    // Avoid duplicate: same sku + same store
    const exists = current.some((i) => i.sku === product.sku && i.storeId === storeId);
    if (exists) return;

    const item = {
      id: `${storeId}-${product.sku}`,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      price: product.price,
      listPrice: product.listPrice,
      image: product.image,
      link: product.link,
      storeId,
      storeName,
      qty: 1,
      addedAt: Date.now(),
    };
    const next = [...current, item];
    saveCanasta(next);
    setItems(next);
    dispatch();
  }, []);

  const removeItem = useCallback((itemId) => {
    const next = loadCanasta().filter((i) => i.id !== itemId);
    saveCanasta(next);
    setItems(next);
    dispatch();
  }, []);

  const updateQty = useCallback((itemId, qty) => {
    const next = loadCanasta().map((i) =>
      i.id === itemId ? { ...i, qty: Math.max(1, qty) } : i
    );
    saveCanasta(next);
    setItems(next);
    dispatch();
  }, []);

  const clearCanasta = useCallback(() => {
    saveCanasta([]);
    setItems([]);
    dispatch();
  }, []);

  const isInCanasta = useCallback((sku, storeId) => {
    return loadCanasta().some((i) => i.sku === sku && i.storeId === storeId);
  }, []);

  return { items, addItem, removeItem, updateQty, clearCanasta, isInCanasta };
}
