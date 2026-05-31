import { useCallback, useEffect, useState } from 'react';
import { fetchProductById } from '../api/products';
import type { ApiError, Product } from '../types/api';

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      setError({ message: 'Product not found.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductById(productId);
      setProduct(data);
    } catch (err) {
      setProduct(null);
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { product, loading, error, refetch: load };
}
