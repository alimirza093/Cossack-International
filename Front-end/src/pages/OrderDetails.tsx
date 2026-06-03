import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Footer, Navbar } from '../components/src_components_index';
import Toast from '../components/ui/Toast';
import { getOrderById, getOrderErrorMessage } from '../api/orderService';
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

function resolveOrderItemImage(baseImage: string | null | undefined, variants: ProductVariant[] | undefined, variantId: string | undefined): string {
  if (variants && variantId) {
    const variant = variants.find((item) => item.id === variantId);
    const variantImage = variant?.images?.[0]?.image_url;
    if (variantImage) return variantImage;
  }
  return baseImage ?? '';
}

const OrderDetailsSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-1/3 mb-3" />
      <div className="h-3 bg-zinc-100 rounded w-1/2" />
    </div>
    <div className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-1/2 mb-3" />
      <div className="h-3 bg-zinc-100 rounded w-2/3" />
    </div>
  </div>
);

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAuthenticatedEffect(
    (isActive) => {
      if (!id) return;
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getOrderById(id);
          if (isActive()) setOrder(data);
        } catch (err) {
          if (isActive()) setError(getOrderErrorMessage(err));
        } finally {
          if (isActive()) setLoading(false);
        }
      })();
    },
    [id]
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter">
              Order Details
            </h1>
            <Link to="/orders" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
              Back To Orders
            </Link>
          </div>

          {loading ? (
            <OrderDetailsSkeleton />
          ) : !order ? (
            <div className="bg-white border border-zinc-100 rounded-sm py-12 px-6 text-center">
              <p className="text-sm text-zinc-500">Order not found.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <section className="bg-white border border-zinc-100 rounded-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Order ID</p>
                    <p className="text-sm font-bold text-[#0B0B0B] break-all">{order.id}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Date</p>
                    <p className="text-sm font-medium text-[#0B0B0B]">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Total Price</p>
                    <p className="text-sm font-black text-[#0B0B0B]">
                      Rs. {toNumber(order.total_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                {order.items.map((item) => (
                  <article key={item.id} className="bg-white border border-zinc-100 rounded-sm p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                      <img
                        src={resolveOrderItemImage(item.product?.base_image, item.product?.variants, item.variant?.id)}
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
                          Unit Price
                        </p>
                        <p className="font-black text-[#0B0B0B] text-sm mb-3">
                          Rs. {toNumber(item.final_price).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Item Total
                        </p>
                        <p className="font-black text-[#0B0B0B] text-base">
                          Rs. {toNumber(item.item_total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
};

export default OrderDetails;
