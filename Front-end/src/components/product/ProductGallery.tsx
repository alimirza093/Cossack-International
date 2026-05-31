import React from 'react';
import type { ProductImage } from '../../types/api';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  activeIndex,
  onSelect,
}) => {
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-zinc-50 rounded-sm overflow-hidden border border-zinc-100">
        {active && (
          <img
            src={active.image_url}
            alt={productName}
            className="w-full h-full object-cover"
            loading="eager"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSelect(index)}
              className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden border-2 transition-all ${
                index === activeIndex
                  ? 'border-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.35)]'
                  : 'border-zinc-200 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGallery);
