import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryCard } from '../src_components_index';
import SectionHeader from './SectionHeader';
import { EmptyState } from './AsyncState';
import { CategoryGridSkeleton } from './skeletons';

interface CategorySectionProps {
  items: Array<{ id: string; title: string; image: string }>;
  loading: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ items, loading }) => (
  <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto">
      <SectionHeader title="Shop by Category" />
      {loading ? (
        <CategoryGridSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState title="No categories yet" description="Categories from the store will show up here." />
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:hidden snap-x snap-mandatory">
            {items.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="shrink-0 w-24 snap-start flex flex-col items-center gap-2 text-center"
              >
                <span className="w-20 h-20 rounded-full overflow-hidden border border-zinc-100 bg-[#0B0B0B] shadow-sm">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0B0B0B] leading-tight line-clamp-2">
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {items.map((cat) => (
              <CategoryCard key={cat.id} id={cat.id} title={cat.title} image={cat.image} />
            ))}
          </div>
        </>
      )}
    </div>
  </section>
);

export default React.memo(CategorySection);
