import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCategories } from '../api/categories';
import { fetchProducts } from '../api/products';
import type { ApiError, Category, Product } from '../types/api';
import {
  getCategoryImage,
  selectFeaturedProducts,
  selectNewArrivals,
  toProductCardModel,
} from '../utils/product';

export interface HomeCatalogState {
  categories: Category[];
  products: Product[];
  categoryCards: Array<{ id: string; title: string; image: string }>;
  featured: ReturnType<typeof toProductCardModel>[];
  newArrivals: ReturnType<typeof toProductCardModel>[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useHomeCatalog(): HomeCatalogState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err as ApiError);
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryCards = useMemo(
    () =>
      categories.map((cat, index) => ({
        id: cat.id,
        title: cat.name,
        image: getCategoryImage(cat, products, index),
      })),
    [categories, products]
  );

  const featured = useMemo(
    () => selectFeaturedProducts(products).map((p, i) => toProductCardModel(p, i)),
    [products]
  );

  const newArrivals = useMemo(
    () => selectNewArrivals(products).map((p, i) => toProductCardModel(p, i)),
    [products]
  );

  return {
    categories,
    products,
    categoryCards,
    featured,
    newArrivals,
    loading,
    error,
    refetch: load,
  };
}
