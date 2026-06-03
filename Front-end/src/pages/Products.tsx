import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer, Navbar, ProductCard } from '../components/src_components_index';
import { ErrorState, EmptyState } from '../components/home/AsyncState';
import { ProductGridSkeleton } from '../components/home/skeletons';
import QuickViewModal from '../components/home/QuickViewModal';
import type { Category, Product } from '../types/api';
import { fetchCategories } from '../api/categories';
import { fetchProducts } from '../api/products';
import { toProductCardModel } from '../utils/product';

const ALL_CATEGORY = 'all';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('category') ?? ALL_CATEGORY;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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

  const filteredProducts = useMemo(() => {
    if (selectedCategoryId === ALL_CATEGORY) return products;
    return products.filter(
      (p) => p.category_id === selectedCategoryId || p.category?.id === selectedCategoryId
    );
  }, [products, selectedCategoryId]);

  const items = useMemo(
    () => filteredProducts.map((p, i) => toProductCardModel(p, i)),
    [filteredProducts]
  );

  const activeCategoryName = useMemo(() => {
    if (selectedCategoryId === ALL_CATEGORY) return 'All Products';
    return categories.find((c) => c.id === selectedCategoryId)?.name ?? 'Products';
  }, [categories, selectedCategoryId]);

  const setCategory = (categoryId: string) => {
    if (categoryId === ALL_CATEGORY) {
      setSearchParams({});
      return;
    }
    setSearchParams({ category: categoryId });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter mb-2">
              Shop
            </h1>
            <p className="text-sm text-zinc-500">
              Browse our catalog — currently viewing <span className="font-bold text-[#0B0B0B]">{activeCategoryName}</span>
            </p>
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
            <EmptyState
              title="No products in this category"
              description="Try selecting a different category or view all products."
            />
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
