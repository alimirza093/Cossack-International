import React, { useCallback, useMemo, useState } from 'react';
import { Navbar, HeroSlider, Footer } from '../components/src_components_index.tsx';
import { heroSlides } from '../data/src_data_index.ts';
import { useHomeCatalog } from '../hooks/useHomeCatalog';
import CategorySection from '../components/home/CategorySection';
import ProductSection from '../components/home/ProductSection';
import WhyUsSection from '../components/home/WhyUsSection';
import PromoBanner from '../components/home/PromoBanner';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NewsletterSection from '../components/home/NewsletterSection';
import QuickViewModal from '../components/home/QuickViewModal';
import { CatalogErrorBanner } from '../components/home/AsyncState';
import type { Product } from '../types/api';

const Home: React.FC = () => {
  const {
    categories,
    categoryCards,
    featured,
    newArrivals,
    loading,
    error,
    refetch,
  } = useHomeCatalog();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  const footerCategoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B] overflow-x-hidden">
      <Navbar logo="COSSACK" />

      <main>
        <HeroSlider slides={heroSlides} />

        {error && (
          <div className="px-4 sm:px-6 lg:px-8 pt-8">
            <div className="max-w-7xl mx-auto">
              <CatalogErrorBanner error={error} onRetry={refetch} />
            </div>
          </div>
        )}

        <CategorySection items={categoryCards} loading={loading} />

        <ProductSection
          title="Featured Products"
          items={featured}
          loading={loading}
          bgClassName="bg-zinc-100"
          onQuickView={openQuickView}
        />

        <ProductSection
          title="New Arrivals"
          items={newArrivals}
          loading={loading}
          bgClassName="bg-white"
          onQuickView={openQuickView}
        />

        <WhyUsSection />

        <PromoBanner />

        <TestimonialsSection />

        <NewsletterSection />
      </main>

      <Footer categoryNames={footerCategoryNames} />

      <QuickViewModal product={quickViewProduct} onClose={closeQuickView} />
    </div>
  );
};

export default Home;
