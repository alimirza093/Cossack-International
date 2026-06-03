import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';
import Toast, { type ToastType } from '../components/ui/Toast';
import { getMyOrders, getOrderErrorMessage } from '../api/orderService';
import { useAuthenticatedEffect } from '../hooks/useAuthenticatedEffect';
import type { Order, OrderStatus, ProductVariant } from '../types/api';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

function resolveOrderItemImage(
  baseImage: string | null | undefined,
  variants: ProductVariant[] | undefined,
  variantId: string | undefined
): string {
  if (variants && variantId) {
    const variant = variants.find((item) => item.id === variantId);
    const variantImage = variant?.images?.[0]?.image_url;
    if (variantImage) return variantImage;
  }
  return baseImage ?? '';
}

const OrdersSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
        <div className="h-4 bg-zinc-100 rounded w-1/3 mb-3" />
        <div className="h-3 bg-zinc-100 rounded w-1/2 mb-2" />
        <div className="h-3 bg-zinc-100 rounded w-1/4" />
      </div>
    ))}
  </div>
);

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useAuthenticatedEffect((isActive) => {
    void (async () => {
      setLoading(true);
      try {
        const data = await getMyOrders();
        if (isActive()) setOrders(data);
      } catch (err) {
        if (isActive()) setToast({ message: getOrderErrorMessage(err), type: 'error' });
      } finally {
        if (isActive()) setLoading(false);
      }
    })();
  }, []);

  const toggle = useCallback((id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const openCount = useMemo(() => Object.values(open).filter(Boolean).length, [open]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter">
              My Orders
            </h1>
            {!loading && orders.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {orders.length} order{orders.length === 1 ? '' : 's'}
                {openCount > 0 ? ` • ${openCount} open` : ''}
              </p>
            )}
          </div>

          {loading ? (
            <OrdersSkeleton />
          ) : orders.length === 0 ? (
            <div className="bg-white border border-zinc-100 rounded-sm py-16 px-6 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-5">
                <span className="material-icons-round text-4xl text-zinc-400">inventory_2</span>
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-[#0B0B0B] mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-zinc-500 mb-7">Start shopping to place your first order.</p>
              <Link to="/" className="btn-primary inline-block text-sm">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(order.id)}
                    className="w-full text-left p-5 hover:bg-zinc-50 transition-colors"
                    aria-expanded={!!open[order.id]}
                  >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Order ID
                      </p>
                      <p className="text-sm font-bold text-[#0B0B0B] break-all">{order.id}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Date</p>
                      <p className="text-sm font-medium text-[#0B0B0B]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Items</p>
                      <p className="text-sm font-medium text-[#0B0B0B]">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Price</p>
                      <p className="text-sm font-black text-[#0B0B0B]">${toNumber(order.total_price).toFixed(2)}</p>
                    </div>
                  </div>
                  </button>

                  {open[order.id] && (
                    <div className="border-t border-zinc-100 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Items
                        </p>
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
                        >
                          Full details →
                        </Link>
                      </div>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <article
                            key={item.id}
                            className="bg-white border border-zinc-100 rounded-sm p-4 sm:p-5"
                          >
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                              <img
                                src={resolveOrderItemImage(
                                  item.product?.base_image,
                                  item.product?.variants,
                                  item.variant?.id
                                )}
                                alt={item.product?.name ?? 'Product'}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm bg-zinc-50 border border-zinc-100"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-bold text-[#0B0B0B] mb-1">
                                  {item.product?.name ?? 'Deleted Product'}
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
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <div className="sm:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                  Item Total
                                </p>
                                <p className="font-black text-[#0B0B0B] text-base">
                                  ${toNumber(item.item_total).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Orders;
