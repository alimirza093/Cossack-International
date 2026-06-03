import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../src_components_index';
import type { Product } from '../../types/api';
import type { ProductCardModel } from '../../utils/product';
import SectionHeader from './SectionHeader';
import { EmptyState } from './AsyncState';
import { ProductGridSkeleton } from './skeletons';

interface ProductSectionProps {
  title: string;
  items: ProductCardModel[];
  loading: boolean;
  bgClassName?: string;
  showViewAll?: boolean;
  onQuickView?: (product: Product) => void;
}

const viewAllButton = (
  <Link
    to="/products"
    className="bg-[#0B0B0B] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-[#39FF14] hover:text-[#0B0B0B] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300 shrink-0"
  >
    View All
  </Link>
);

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  items,
  loading,
  bgClassName = 'bg-zinc-100',
  showViewAll = true,
  onQuickView,
}) => (
  <section className={`px-4 sm:px-6 lg:px-8 py-16 md:py-24 ${bgClassName}`}>
    <div className="max-w-7xl mx-auto">
      <SectionHeader title={title} action={showViewAll ? viewAllButton : undefined} />
      {loading ? (
        <ProductGridSkeleton />
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
              onQuickView={onQuickView ? () => onQuickView(item.product) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

export default React.memo(ProductSection);
