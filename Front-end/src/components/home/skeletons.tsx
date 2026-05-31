import React from 'react';

export const ProductCardSkeleton: React.FC = () => (
  <article className="bg-white rounded-sm overflow-hidden border border-zinc-100 animate-pulse">
    <div className="aspect-square bg-zinc-200" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="h-2 w-16 bg-zinc-200 rounded" />
      <div className="h-4 w-full bg-zinc-200 rounded" />
      <div className="h-4 w-2/3 bg-zinc-200 rounded" />
      <div className="h-6 w-20 bg-zinc-200 rounded" />
      <div className="h-10 w-full bg-zinc-200 rounded-sm" />
      <div className="h-10 w-full bg-zinc-200 rounded-sm" />
    </div>
  </article>
);

export const CategoryCardSkeleton: React.FC = () => (
  <article className="relative overflow-hidden rounded-sm aspect-[4/5] sm:aspect-[16/10] bg-zinc-200 animate-pulse border border-zinc-100" />
);

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CategoryCardSkeleton key={i} />
    ))}
  </div>
);
