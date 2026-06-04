import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';
import Toast, { type ToastType } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, getOrderErrorMessage } from '../api/orderService';
import { formatPaymentMethod, PAYMENT_METHOD_COD } from '../lib/orderConstants';

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

type CheckoutLocationState = {
  cartItemIds?: string[];
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, isCartLoading, refreshCart } = useCart();

  const cartItemIds = useMemo(
    () => (location.state as CheckoutLocationState | null)?.cartItemIds ?? [],
    [location.state]
  );
  const [address, setAddress] = useState('');
  const [addressTouched, setAddressTouched] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (user?.address?.trim()) {
      setAddress(user.address.trim());
    }
  }, [user?.address]);

  useEffect(() => {
    if (!isCartLoading && cartItemIds.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItemIds.length, isCartLoading, navigate]);

  const selectedItems = useMemo(() => {
    const items = cart?.items ?? [];
    return items.filter((item) => cartItemIds.includes(item.id));
  }, [cart?.items, cartItemIds]);

  const orderTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + toNumber(item.item_total), 0),
    [selectedItems]
  );

  const trimmedAddress = address.trim();
  const addressError =
    addressTouched && !trimmedAddress ? 'Delivery address is required.' : null;
  const canPlaceOrder =
    trimmedAddress.length > 0 && selectedItems.length > 0 && !isPlacingOrder;

  const handlePlaceOrder = async () => {
    setAddressTouched(true);
    if (!trimmedAddress) {
      setToast({ message: 'Delivery address is required.', type: 'error' });
      return;
    }
    if (cartItemIds.length === 0) {
      setToast({ message: 'No items selected for checkout.', type: 'error' });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await createOrder(cartItemIds, trimmedAddress);
      await refreshCart();
      navigate('/order-success', { state: { orderId: order.id }, replace: true });
    } catch (err) {
      setToast({ message: getOrderErrorMessage(err), type: 'error' });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] font-sans">
        <Navbar />
        <main className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-zinc-100 rounded animate-pulse mb-8" />
          <div className="h-64 bg-white border border-zinc-100 rounded-sm animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter">
              Checkout
            </h1>
            <Link
              to="/cart"
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
            >
              Back To Cart
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-10">
            <section className="space-y-6">
              <div className="bg-white border border-zinc-100 rounded-sm p-5 sm:p-6">
                <h2 className="text-[#0B0B0B] font-black text-sm uppercase tracking-widest mb-4">
                  Delivery Address
                </h2>
                <label
                  htmlFor="checkout-address"
                  className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2"
                >
                  Full delivery address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => setAddressTouched(true)}
                  rows={4}
                  required
                  placeholder="Street, city, postal code, country"
                  className={`w-full px-4 py-3.5 bg-[#F9F9F9] border rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:ring-1 transition-colors resize-none ${
                    addressError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-zinc-200 focus:border-[#39FF14] focus:ring-[#39FF14]/40'
                  }`}
                />
                {addressError && (
                  <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                    {addressError}
                  </p>
                )}
              </div>

              <div className="bg-white border border-zinc-100 rounded-sm p-5 sm:p-6">
                <h2 className="text-[#0B0B0B] font-black text-sm uppercase tracking-widest mb-3">
                  Payment
                </h2>
                <p className="text-sm text-zinc-600">
                  <span className="font-bold text-[#0B0B0B]">Payment Method:</span>{' '}
                  {formatPaymentMethod(PAYMENT_METHOD_COD)}
                </p>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Pay in cash when your order is delivered. No online payment is required.
                </p>
              </div>

              <div className="bg-white border border-zinc-100 rounded-sm p-5 sm:p-6">
                <h2 className="text-[#0B0B0B] font-black text-sm uppercase tracking-widest mb-4">
                  Order Items ({selectedItems.length})
                </h2>
                <ul className="space-y-3">
                  {selectedItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4 text-sm border-b border-zinc-50 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-[#0B0B0B] font-medium min-w-0">
                        {item.product.name}{' '}
                        <span className="text-zinc-400 font-normal">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-[#0B0B0B] shrink-0">
                        Rs. {toNumber(item.item_total).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <aside className="bg-white border border-zinc-100 rounded-sm p-5 h-fit sticky top-24">
              <h2 className="text-[#0B0B0B] font-black text-lg uppercase tracking-tight mb-5">
                Order Summary
              </h2>

              <div className="mb-4 p-3 bg-zinc-50 border border-zinc-100 rounded-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  Delivery Address
                </p>
                <p className="text-sm text-[#0B0B0B] whitespace-pre-wrap break-words min-h-[1.25rem]">
                  {trimmedAddress || (
                    <span className="text-zinc-400 italic">Enter address above</span>
                  )}
                </p>
              </div>

              <div className="mb-4 p-3 bg-zinc-50 border border-zinc-100 rounded-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  Payment
                </p>
                <p className="text-sm font-bold text-[#0B0B0B]">
                  {formatPaymentMethod(PAYMENT_METHOD_COD)}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mb-6">
                <span className="font-black text-xs uppercase tracking-widest text-[#0B0B0B]">
                  Total
                </span>
                <span className="font-black text-xl text-[#0B0B0B]">
                  Rs. {orderTotal.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                className="btn-primary w-full inline-flex justify-center text-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPlacingOrder ? 'Placing Order…' : 'Place Order'}
              </button>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Checkout;
