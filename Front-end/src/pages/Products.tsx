import React, { useEffect, useMemo, useState } from 'react';
import { Footer, Navbar, ProductCard } from '../components/src_components_index';
import { ErrorState, EmptyState } from '../components/home/AsyncState';
import { ProductGridSkeleton } from '../components/home/skeletons';
import QuickViewModal from '../components/home/QuickViewModal';
import type { Product } from '../types/api';
import { fetchProducts } from '../api/products';
import { toProductCardModel } from '../utils/product';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const items = useMemo(() => products.map((p, i) => toProductCardModel(p, i)), [products]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar logo="COSSACK" />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter mb-8">
            Products
          </h1>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : items.length === 0 ? (
            <EmptyState title="No products yet" description="Products will appear here once added to the catalog." />
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
      <Footer />

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};

export default Products;

