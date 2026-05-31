import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import type { Product } from '../types/api';
import { toProductCardModel, type ProductCardModel } from '../utils/product';

export function useRelatedProducts(
  categoryId: string | null | undefined,
  excludeProductId: string | undefined,
  limit = 4
) {
  const [items, setItems] = useState<ProductCardModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const products = await fetchProducts();
        if (cancelled) return;
        const related = products
          .filter(
            (p: Product) =>
              p.id !== excludeProductId &&
              (p.category_id === categoryId || p.category?.id === categoryId)
          )
          .slice(0, limit)
          .map((p, i) => toProductCardModel(p, i));
        setItems(related);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [categoryId, excludeProductId, limit]);

  return { items, loading };
}
