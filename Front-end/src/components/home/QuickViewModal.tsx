import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/api';
import { getConfigOptionsCount, getProductImage, getVariantColors, parsePrice } from '../../utils/product';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const colors = getVariantColors(product);
  const optionsCount = getConfigOptionsCount(product);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0B0B0B]/80 backdrop-blur-sm"
        aria-label="Close quick view"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-sm overflow-hidden border border-zinc-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center bg-[#0B0B0B] text-white rounded-sm hover:bg-[#39FF14] hover:text-[#0B0B0B] transition-colors"
          aria-label="Close"
        >
          <span className="material-icons-round">close</span>
        </button>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-zinc-50">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="p-6 sm:p-8 flex flex-col">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
              {product.category?.name ?? 'Cossack'}
            </p>
            <h2 id="quick-view-title" className="text-xl font-black text-[#0B0B0B] italic uppercase tracking-tight mb-3">
              {product.name}
            </h2>
            <p className="text-[#0B0B0B] font-black text-2xl mb-4">
              Rs. {parsePrice(product.base_price).toFixed(2)}
            </p>
            {product.description && (
              <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-4">{product.description}</p>
            )}
            {colors.length > 0 && (
              <p className="text-xs text-zinc-500 mb-4">
                <span className="font-bold text-[#0B0B0B]">{colors.length}</span> color
                {colors.length === 1 ? '' : 's'}: {colors.join(', ')}
              </p>
            )}
            {optionsCount > 0 && (
              <p className="text-xs text-zinc-500 mb-6">
                <span className="font-bold text-[#0B0B0B]">{optionsCount}</span> size/option
                {optionsCount === 1 ? '' : 's'} available
              </p>
            )}
            <Link
              to={`/products/${product.id}`}
              className="btn-primary mt-auto w-full text-sm text-center"
              onClick={onClose}
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuickViewModal);
