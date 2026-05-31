import React from 'react';

const ProductDetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div className="aspect-square bg-zinc-200 rounded-sm" />
      <div className="space-y-4">
        <div className="h-3 w-24 bg-zinc-200 rounded" />
        <div className="h-8 w-3/4 bg-zinc-200 rounded" />
        <div className="h-6 w-32 bg-zinc-200 rounded" />
        <div className="h-20 w-full bg-zinc-200 rounded" />
        <div className="h-10 w-full bg-zinc-200 rounded-sm" />
        <div className="h-12 w-full bg-zinc-200 rounded-sm" />
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
