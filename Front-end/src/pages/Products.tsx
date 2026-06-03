import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer, Navbar, ProductCard } from '../components/src_components_index';
import { ProductSearchInput } from '../components/ui/ProductSearchInput';
import { ErrorState, EmptyState } from '../components/home/AsyncState';
import { ProductGridSkeleton } from '../components/home/skeletons';
import QuickViewModal from '../components/home/QuickViewModal';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Category, Product } from '../types/api';
import { fetchCategories } from '../api/categories';
import { fetchProducts } from '../api/products';
import { filterProductsBySearch } from '../utils/productSearch';
import { toProductCardModel } from '../utils/product';

const ALL_CATEGORY = 'all';
const SEARCH_PARAM = 'search';
const CATEGORY_PARAM = 'category';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get(CATEGORY_PARAM) ?? ALL_CATEGORY;
  const searchFromUrl = searchParams.get(SEARCH_PARAM) ?? '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const current = searchFromUrl.trim();
    if (trimmed === current) return;

    const next = new URLSearchParams(searchParams);
    if (trimmed) {
      next.set(SEARCH_PARAM, trimmed);
    } else {
      next.delete(SEARCH_PARAM);
    }
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, searchFromUrl, searchParams, setSearchParams]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, categoryData] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(productData);
      setCategories(categoryData);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? 'Failed to load products.');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateParams = useCallback(
    (updates: { category?: string; search?: string }) => {
      const next = new URLSearchParams(searchParams);

      if (updates.category !== undefined) {
        if (updates.category === ALL_CATEGORY) {
          next.delete(CATEGORY_PARAM);
        } else {
          next.set(CATEGORY_PARAM, updates.category);
        }
      }

      if (updates.search !== undefined) {
        const trimmed = updates.search.trim();
        if (trimmed) {
          next.set(SEARCH_PARAM, trimmed);
        } else {
          next.delete(SEARCH_PARAM);
        }
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategoryId !== ALL_CATEGORY) {
      list = list.filter(
        (p) => p.category_id === selectedCategoryId || p.category?.id === selectedCategoryId
      );
    }
    return filterProductsBySearch(list, searchFromUrl);
  }, [products, selectedCategoryId, searchFromUrl]);

  const items = useMemo(
    () => filteredProducts.map((p, i) => toProductCardModel(p, i)),
    [filteredProducts]
  );

  const activeCategoryName = useMemo(() => {
    if (selectedCategoryId === ALL_CATEGORY) return 'All Products';
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Products';
  }, [categories, selectedCategoryId]);

  const setCategory = (categoryId: string) => {
    updateParams({ category: categoryId });
  };

  const emptyTitle = useMemo(() => {
    if (searchFromUrl.trim()) return 'No products found';
    return 'No products in this category';
  }, [searchFromUrl]);

  const emptyDescription = useMemo(() => {
    if (searchFromUrl.trim() && selectedCategoryId !== ALL_CATEGORY) {
      return `No results for "${searchFromUrl}" in ${activeCategoryName}. Try another search or category.`;
    }
    if (searchFromUrl.trim()) {
      return `No results for "${searchFromUrl}". Try a different keyword.`;
    }
    return 'Try selecting a different category or view all products.';
  }, [searchFromUrl, selectedCategoryId, activeCategoryName]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter mb-2">
              Shop
            </h1>
            <p className="text-sm text-zinc-500">
              Browse our catalog — currently viewing{' '}
              <span className="font-bold text-[#0B0B0B]">{activeCategoryName}</span>
              {searchFromUrl.trim() ? (
                <>
                  {' '}
                  matching <span className="font-bold text-[#0B0B0B]">&quot;{searchFromUrl}&quot;</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="mb-8">
            <ProductSearchInput
              value={searchInput}
              onChange={setSearchInput}
              variant="light"
              className="max-w-xl"
              placeholder="Search by name or description…"
            />
          </div>

          <div className="mb-8 overflow-x-auto pb-1">
            <div className="flex flex-wrap gap-2 min-w-max sm:min-w-0">
              <button
                type="button"
                onClick={() => setCategory(ALL_CATEGORY)}
                className={`px-4 py-2.5 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-colors ${
                  selectedCategoryId === ALL_CATEGORY
                    ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#0B0B0B]'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => {
                const isActive = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategory(category.id)}
                    className={`px-4 py-2.5 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#0B0B0B]'
                        : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : items.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  productId={item.id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  categoryName={item.categoryName}
                  badge={item.badge}
                  colors={item.colors}
                  configOptionsCount={item.configOptionsCount}
                  onQuickView={() => setQuickViewProduct(item.product)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};

export default Products;
