import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar, Footer, ProductCard } from '../components/src_components_index';
import ProductDetailSkeleton from '../components/product/ProductDetailSkeleton';
import ProductGallery from '../components/product/ProductGallery';
import { ErrorState } from '../components/home/AsyncState';
import Toast, { type ToastType } from '../components/ui/Toast';
import { getCartErrorMessage } from '../api/cartService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProduct } from '../hooks/useProduct';
import { useRelatedProducts } from '../hooks/useRelatedProducts';
import type { ProductVariant } from '../types/api';
import { parsePrice } from '../utils/product';
import {
  findVariantByColor,
  getInitialSelections,
  getVariantImages,
} from '../utils/productDetail';
import {
  calculateUnitPrice,
  formatModifier,
  getStockStatus,
  STOCK_LABELS,
  type SelectedOptionRef,
} from '../utils/pricing';
import SectionHeader from '../components/home/SectionHeader';
import { ProductGridSkeleton } from '../components/home/skeletons';

function colorToSwatchStyle(color: string): React.CSSProperties {
  const trimmed = color.trim();
  return { backgroundColor: trimmed };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthReady, isLoading: isAuthLoading } = useAuth();
  const { addItem } = useCart();
  const { product, loading, error, refetch } = useProduct(id);
  const { items: relatedItems, loading: relatedLoading } = useRelatedProducts(
    product?.category_id ?? product?.category?.id,
    product?.id
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [configSelections, setConfigSelections] = useState<Record<string, string>>({});
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!product) return;
    const initial = getInitialSelections(product);
    setSelectedVariant(initial.variant);
    setConfigSelections(initial.configSelections);
    setImageIndex(0);
    setQuantity(1);
  }, [product]);

  const galleryImages = useMemo(
    () => (product ? getVariantImages(selectedVariant, product) : []),
    [product, selectedVariant]
  );

  useEffect(() => {
    setImageIndex(0);
  }, [selectedVariant?.id]);

  const selectedOptions: SelectedOptionRef[] = useMemo(() => {
    if (!product) return [];
    return product.configs
      .map((config) => {
        const optionId = configSelections[config.id];
        const option = config.options.find((o) => o.id === optionId);
        if (!option) return null;
        return {
          configId: config.id,
          optionId: option.id,
          configName: config.name,
          optionValue: option.value,
          priceModifier: parsePrice(option.price_modifier),
        };
      })
      .filter((o): o is SelectedOptionRef => o !== null);
  }, [product, configSelections]);

  const basePrice = product ? parsePrice(product.base_price) : 0;
  const priceBreakdown = useMemo(
    () => calculateUnitPrice(basePrice, selectedVariant, selectedOptions),
    [basePrice, selectedVariant, selectedOptions]
  );

  const stock = selectedVariant?.stock ?? 0;
  const stockStatus = getStockStatus(stock);
  const stockInfo = STOCK_LABELS[stockStatus];

  const requiresVariant = (product?.variants.length ?? 0) > 0;
  const canAddToCart =
    !!product &&
    (!requiresVariant || !!selectedVariant) &&
    stockStatus !== 'out_of_stock' &&
    product.configs.every((c) => !c.options.length || configSelections[c.id]);

  const clampQuantity = useCallback(
    (value: number) => {
      const min = 1;
      const max = Math.max(stock, 1);
      return Math.min(Math.max(value, min), max);
    },
    [stock]
  );

  useEffect(() => {
    setQuantity((q) => clampQuantity(q));
  }, [stock, clampQuantity]);

  const handleColorSelect = (color: string) => {
    if (!product) return;
    const variant = findVariantByColor(product, color);
    if (variant) setSelectedVariant(variant);
  };

  const handleConfigSelect = (configId: string, optionId: string) => {
    setConfigSelections((prev) => ({ ...prev, [configId]: optionId }));
  };

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  const handleAddToCart = async () => {
    if (!product || !canAddToCart) return;

    if (!isAuthReady || isAuthLoading) {
      showToast('Checking your session…', 'error');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }

    if (user?.role === 'admin') {
      showToast('Admin accounts cannot add items to the cart. Use a customer account to shop.', 'error');
      return;
    }

    if (requiresVariant && !selectedVariant) {
      showToast('Please select a color.', 'error');
      return;
    }

    const variantId = selectedVariant?.id ?? product.variants[0]?.id;
    if (!variantId) {
      showToast('This product has no available variants.', 'error');
      return;
    }

    setAdding(true);
    try {
      await addItem({
        product_id: product.id,
        variant_id: variantId,
        selected_options: selectedOptions.map((o) => ({
          config_id: o.configId,
          option_id: o.optionId,
        })),
        quantity,
      });
      showToast('Added to cart successfully.', 'success');
    } catch (err) {
      showToast(getCartErrorMessage(err), 'error');
    } finally {
      setAdding(false);
    }
  };

  const uniqueColors = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    return product.variants.filter((v) => {
      const key = v.color.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [product]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />

      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {loading ? (
          <ProductDetailSkeleton />
        ) : error || !product ? (
          <div className="max-w-xl mx-auto">
            <ErrorState
              message={error?.message ?? 'Product not found.'}
              onRetry={refetch}
            />
            <div className="text-center mt-6">
              <Link to="/" className="btn-primary inline-block text-sm">
                Back to Shop
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-7xl mx-auto mb-6">
              <Link
                to="/"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors inline-flex items-center gap-1"
              >
                <span className="material-icons-round text-sm">arrow_back</span>
                Back to shop
              </Link>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
              <ProductGallery
                images={galleryImages}
                productName={product.name}
                activeIndex={imageIndex}
                onSelect={setImageIndex}
              />

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  {product.category?.name ?? 'Cossack'}
                </p>
                <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter mb-4">
                  {product.name}
                </h1>

                <p className={`text-xs font-black uppercase tracking-widest mb-4 ${stockInfo.className}`}>
                  {stockInfo.label}
                  {stockStatus !== 'out_of_stock' && (
                    <span className="text-zinc-400 font-bold ml-2">({stock} available)</span>
                  )}
                </p>

                <div className="mb-6 p-4 bg-white border border-zinc-100 rounded-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Base Price</span>
                    <span className="font-bold text-[#0B0B0B]">Rs. {priceBreakdown.basePrice.toFixed(2)}</span>
                  </div>
                  {selectedVariant && priceBreakdown.variantModifier !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">{selectedVariant.color} Variant</span>
                      <span className="font-bold text-[#0B0B0B]">
                        Rs. {formatModifier(priceBreakdown.variantModifier)}
                      </span>
                    </div>
                  )}
                  {selectedOptions.map((opt) => (
                    <div key={opt.optionId} className="flex justify-between text-sm">
                      <span className="text-zinc-500">
                        {opt.configName}: {opt.optionValue}
                      </span>
                      <span className="font-bold text-[#0B0B0B]">
                        Rs. {formatModifier(opt.priceModifier)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-zinc-100">
                    <span className="font-black text-[#0B0B0B] uppercase text-xs tracking-widest">
                      Unit Price
                    </span>
                    <span className="font-black text-xl text-[#0B0B0B]">
                      Rs. {priceBreakdown.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Total ({quantity} items)</span>
                      <span className="font-black text-[#0B0B0B]">
                        Rs. {(priceBreakdown.unitPrice * quantity).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {product.description && (
                  <p className="text-zinc-600 text-sm leading-relaxed mb-6">{product.description}</p>
                )}

                {product.static_configs.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Specifications
                    </p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.static_configs.map((cfg) => (
                        <div
                          key={cfg.id}
                          className="px-3 py-2 bg-white border border-zinc-100 rounded-sm text-xs"
                        >
                          <dt className="font-bold text-zinc-400 uppercase tracking-wider">{cfg.key}</dt>
                          <dd className="text-[#0B0B0B] font-medium mt-0.5">{cfg.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {uniqueColors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                      Color
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((v) => {
                        const isActive = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleColorSelect(v.color)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-[10px] font-black uppercase tracking-wider transition-all ${
                              isActive
                                ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#0B0B0B]'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-zinc-200 shrink-0"
                              style={colorToSwatchStyle(v.color)}
                            />
                            {v.color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {product.configs.map((config) => (
                  <div key={config.id} className="mb-6">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                      {config.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {config.options.map((option) => {
                        const isActive = configSelections[config.id] === option.id;
                        const mod = parsePrice(option.price_modifier);
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleConfigSelect(config.id, option.id)}
                            className={`px-4 py-2.5 rounded-sm border text-[10px] font-black uppercase tracking-wider transition-all ${
                              isActive
                                ? 'border-[#0B0B0B] bg-[#0B0B0B] text-white'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:border-[#39FF14]'
                            }`}
                          >
                            {option.value}
                            {mod !== 0 && (
                              <span className="ml-1 opacity-80">Rs. {formatModifier(mod)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mb-6">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                    Quantity
                  </p>
                  <div className="inline-flex items-center border border-zinc-200 rounded-sm bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => clampQuantity(q - 1))}
                      disabled={quantity <= 1 || stockStatus === 'out_of_stock'}
                      className="w-11 h-11 flex items-center justify-center text-[#0B0B0B] hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <span className="material-icons-round">remove</span>
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={stock || 1}
                      value={quantity}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        if (Number.isNaN(parsed)) return;
                        setQuantity(clampQuantity(parsed));
                      }}
                      className="w-14 h-11 text-center text-sm font-bold border-x border-zinc-200 focus:outline-none"
                      aria-label="Quantity"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => clampQuantity(q + 1))}
                      disabled={quantity >= stock || stockStatus === 'out_of_stock'}
                      className="w-11 h-11 flex items-center justify-center text-[#0B0B0B] hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <span className="material-icons-round">add</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || adding || isAuthLoading}
                  className="w-full bg-[#0B0B0B] text-white py-4 rounded-sm font-black text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest transition-all duration-300 hover:bg-[#39FF14] hover:text-[#0B0B0B] hover:shadow-[0_0_25px_rgba(57,255,20,0.45)] disabled:opacity-50 disabled:hover:bg-[#0B0B0B] disabled:hover:text-white"
                >
                  <span className="material-icons-round text-base">
                    {adding || isAuthLoading ? 'hourglass_empty' : 'add_shopping_cart'}
                  </span>
                  {adding
                    ? 'Adding…'
                    : isAuthLoading
                      ? 'Loading…'
                      : stockStatus === 'out_of_stock'
                        ? 'Out Of Stock'
                        : 'Add to Cart'}
                </button>
              </div>
            </div>

            <section className="max-w-7xl mx-auto mt-20 md:mt-28 pt-16 border-t border-zinc-200">
              <SectionHeader title="Related Products" />
              {relatedLoading ? (
                <ProductGridSkeleton count={4} />
              ) : relatedItems.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No related products in this category.</p>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {relatedItems.map((item) => (
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
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ProductDetail;
