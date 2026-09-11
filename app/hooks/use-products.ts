'use client';

import { useCallback, useEffect, useState } from 'react';

export type Product = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  category: string;
  batchNumber: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  reorderLevel: number;
};

export function useProducts(q: string, category: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category && category !== 'All') params.set('category', category);
    
    setLoading(true);
    try {
      const response = await fetch(`/api/products?${params.toString()}`, { 
        cache: 'no-store' 
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`API Error (${response.status}):`, errorText);
        setProducts([]);
        return;
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [q, category]);

  useEffect(() => { 
    refresh(); 
  }, [refresh]);

  return { products, loading, refresh };
}