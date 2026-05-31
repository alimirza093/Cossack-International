import React from 'react';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.map((cat) => (
            <CategoryCard key={cat.id} title={cat.title} image={cat.image} />
          ))}
        </div>
      )}
    </div>
  </section>
);

export default React.memo(CategorySection);
