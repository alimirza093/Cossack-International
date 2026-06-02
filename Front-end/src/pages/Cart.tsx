import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';
import Toast, { type ToastType } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { getCartErrorMessage } from '../api/cartService';
import { createOrder, getOrderErrorMessage } from '../api/orderService';

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const CartRowSkeleton: React.FC = () => (
  <div className="bg-white border border-zinc-100 rounded-sm p-4 sm:p-5 animate-pulse">
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-zinc-100 rounded-sm shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-zinc-100 rounded w-1/2" />
        <div className="h-3 bg-zinc-100 rounded w-1/3" />
        <div className="h-3 bg-zinc-100 rounded w-2/3" />
      </div>
      <div className="w-16 h-8 bg-zinc-100 rounded" />
    </div>
  </div>
);

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, isCartLoading, updateItemQuantity, removeCartItem, clearCart, refreshCart } = useCart();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const items = cart?.items ?? [];

  const subtotal = items.reduce((sum, item) => sum + toNumber(item.item_total), 0);
  const selectedItems = items.filter((item) => selectedItemIds.includes(item.id));
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + toNumber(item.item_total), 0);

  const allSelected = items.length > 0 && selectedItemIds.length === items.length;

  const toggleAllItems = () => {
    if (allSelected) {
      setSelectedItemIds([]);
      return;
    }
    setSelectedItemIds(items.map((item) => item.id));
  };

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleQuantityChange = async (
    itemId: string,
    nextQuantity: number,
    min: number,
    max: number
  ) => {
    if (nextQuantity < min || nextQuantity > max || pendingItemId) return;
    setPendingItemId(itemId);
    try {
      await updateItemQuantity(itemId, nextQuantity);
    } catch (err) {
      setToast({ message: getCartErrorMessage(err), type: 'error' });
    } finally {
      setPendingItemId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (pendingItemId) return;
    setPendingItemId(itemId);
    try {
      await removeCartItem(itemId);
      setToast({ message: 'Item removed from cart.', type: 'success' });
    } catch (err) {
      setToast({ message: getCartErrorMessage(err), type: 'error' });
    } finally {
      setPendingItemId(null);
    }
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      setToast({ message: 'Cart cleared successfully.', type: 'success' });
      setConfirmClearOpen(false);
    } catch (err) {
      setToast({ message: getCartErrorMessage(err), type: 'error' });
    } finally {
      setIsClearing(false);
    }
    setSelectedItemIds([]);
  };

  const handleCheckout = async () => {
    if (selectedItemIds.length === 0) {
      setToast({ message: 'Please select at least one cart item.', type: 'error' });
      return;
    }
    setIsCheckingOut(true);
    try {
      const order = await createOrder(selectedItemIds);
      await refreshCart();
      setSelectedItemIds([]);
      navigate('/order-success', { state: { orderId: order.id } });
    } catch (err) {
      setToast({ message: getOrderErrorMessage(err), type: 'error' });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar logo="COSSACK" />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter">
              Your Cart
            </h1>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {isCartLoading ? (
            <div className="space-y-4">
              <CartRowSkeleton />
              <CartRowSkeleton />
              <CartRowSkeleton />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-zinc-100 rounded-sm py-16 px-6 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-5">
                <span className="material-icons-round text-4xl text-zinc-400">shopping_cart</span>
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-[#0B0B0B] mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm text-zinc-500 mb-7">Looks like you have not added anything yet.</p>
              <Link to="/" className="btn-primary inline-block text-sm">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-10">
              <section className="space-y-4">
                <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllItems}
                    className="accent-[#0B0B0B]"
                  />
                  Select All
                </label>
                {items.map((item) => {
                  const maxStock = Math.max(item.variant?.stock ?? 1, 1);
                  const itemPending = pendingItemId === item.id;
                  const image =
                    item.variant?.id
                      ? item.product.variants.find((variant) => variant.id === item.variant?.id)?.images[0]?.image_url
                      : null;

                  return (
                    <article
                      key={item.id}
                      className="bg-white border border-zinc-100 rounded-sm p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        <label className="pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="accent-[#0B0B0B]"
                            aria-label={`Select ${item.product.name}`}
                          />
                        </label>
                        <img
                          src={image ?? item.product.base_image ?? ''}
                          alt={item.product.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm bg-zinc-50 border border-zinc-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-[#0B0B0B] mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                            Variant: {item.variant?.color ?? 'Default'}
                          </p>
                          {item.selected_options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.selected_options.map((option) => (
                                <span
                                  key={option.option_id}
                                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-sm text-zinc-500"
                                >
                                  {option.config_name}: {option.option_value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="inline-flex items-center border border-zinc-200 rounded-sm bg-white">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1, 1, maxStock)}
                                disabled={item.quantity <= 1 || itemPending}
                                className="w-9 h-9 flex items-center justify-center text-[#0B0B0B] hover:bg-zinc-50 disabled:opacity-40"
                                aria-label="Decrease quantity"
                              >
                                <span className="material-icons-round text-base">remove</span>
                              </button>
                              <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1, 1, maxStock)}
                                disabled={item.quantity >= maxStock || itemPending}
                                className="w-9 h-9 flex items-center justify-center text-[#0B0B0B] hover:bg-zinc-50 disabled:opacity-40"
                                aria-label="Increase quantity"
                              >
                                <span className="material-icons-round text-base">add</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              disabled={itemPending}
                              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 disabled:opacity-40 transition-colors"
                            >
                              {itemPending ? 'Removing...' : 'Remove'}
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Stock: {maxStock}
                            </span>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Unit Price
                          </p>
                          <p className="font-black text-[#0B0B0B] text-sm mb-3">
                            ${toNumber(item.final_price).toFixed(2)}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Item Total
                          </p>
                          <p className="font-black text-[#0B0B0B] text-base">
                            ${toNumber(item.item_total).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <aside className="bg-white border border-zinc-100 rounded-sm p-5 h-fit sticky top-24">
                <h2 className="text-[#0B0B0B] font-black text-lg uppercase tracking-tight mb-5">Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Total Items</span>
                    <span className="font-bold text-[#0B0B0B]">{cartCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-bold text-[#0B0B0B]">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-widest text-[#0B0B0B]">Grand Total</span>
                    <span className="font-black text-xl text-[#0B0B0B]">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-zinc-50 border border-zinc-100 rounded-sm space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Selected Items</span>
                    <span className="font-bold text-[#0B0B0B]">{selectedCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Selected Total</span>
                    <span className="font-black text-[#0B0B0B]">${selectedSubtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || selectedItemIds.length === 0}
                  className="btn-primary w-full inline-flex justify-center mt-6 text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isCheckingOut ? 'Processing...' : 'Proceed To Checkout'}
                </button>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {confirmClearOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-sm border border-zinc-200 p-6">
            <h3 className="text-[#0B0B0B] font-black text-lg uppercase tracking-tight mb-2">
              Clear cart?
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              This will remove all items from your cart.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#0B0B0B]"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearCart}
                disabled={isClearing}
                className="px-4 py-2 bg-[#0B0B0B] text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Cart;
