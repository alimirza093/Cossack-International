import React from 'react';
import {
  Navbar,
  HeroSlider,
  CategoryCard,
  ProductCard,
  WhyUsCard,
  Footer,
} from '../components/src_components_index.tsx';
import { products, categories, heroSlides, whyUsItems } from '../data/src_data_index.ts';
import heroBanner from '../assets/hero.png';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  light?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, light }) => (
  <div className="flex justify-between items-end gap-4 mb-10 md:mb-12">
    <div className="flex items-center gap-3">
      <div className="section-accent" />
      <h2 className={light ? 'text-white section-title' : 'section-title'}>{title}</h2>
    </div>
    {action}
  </div>
);

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B] overflow-x-hidden">
      <Navbar logo="COSSACK" />

      <main>
        <HeroSlider slides={heroSlides} />

        {/* Categories */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Shop by Category" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} {...cat} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-zinc-100">
          <div className="max-w-7xl mx-auto">
            <SectionHeader
              title="Featured Products"
              action={
                <button
                  type="button"
                  className="bg-[#0B0B0B] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-[#39FF14] hover:text-[#0B0B0B] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300 shrink-0"
                >
                  View All
                </button>
              }
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="bg-[#0B0B0B] py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHeader title="Why Cossack" light />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {whyUsItems.map((item, i) => (
                <WhyUsCard key={i} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative py-28 md:py-36 px-6 overflow-hidden bg-[#0B0B0B]">
          <img
            src={heroBanner}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/80 to-[#0B0B0B]/60" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <p className="text-[#39FF14] text-xs font-black uppercase tracking-[0.35em] mb-4">
              Technical Precision
            </p>
            <h2 className="text-white font-black text-3xl md:text-5xl mb-5 italic uppercase tracking-tighter">
              Built for Performance
            </h2>
            <p className="text-zinc-500 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              Crafted in high-fidelity environments with industrial-grade standards.
            </p>
            <button type="button" className="btn-primary">
              Explore Manufacturing
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
