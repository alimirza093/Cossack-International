import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_OPTIONS,
} from '../../components/admin/orderStatus';
import { ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import {
  getAdminOrderErrorMessage,
  getOrderById,
  updateOrderStatus,
} from '../../api/adminOrderService';
import type { Order, OrderStatus } from '../../types/api';
import { formatPrice, shortId, toNumber } from '../../utils/admin';

type ToastState = { message: string; type: ToastType } | null;

function resolveItemImage(item: Order['items'][number]): string {
  const productImage = item.product?.base_image;
  const variants = item.product?.variants ?? [];
  const variantId = item.variant?.id;
  if (variants.length > 0 && variantId) {
    const variant = variants.find((v) => v.id === variantId);
    const imgUrl = variant?.images?.[0]?.image_url;
    if (imgUrl) return imgUrl;
  }
  return productImage ?? '';
}

const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Order not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(id);
      if (!data) {
        setError('Order not found.');
        setOrder(null);
        return;
      }
      setOrder(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(getAdminOrderErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const canUpdate = order?.status !== 'delivered';

  const handleUpdateStatus = async () => {
    if (!order || !canUpdate) return;
    setUpdating(true);
    setToast(null);
    try {
      const updated = await updateOrderStatus(order.id, { status: selectedStatus });
      setOrder(updated);
      setSelectedStatus(updated.status);
      setToast({ message: 'Order status updated successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: getAdminOrderErrorMessage(err), type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors mb-4"
        >
          <span className="material-icons-round text-sm">arrow_back</span>
          Back to orders
        </Link>

        {loading ? (
          <div className="bg-white border border-zinc-100 rounded-sm p-8 animate-pulse space-y-4">
            <div className="h-6 bg-zinc-100 rounded w-1/2" />
            <div className="h-24 bg-zinc-100 rounded w-full" />
            <div className="h-32 bg-zinc-100 rounded w-full" />
          </div>
        ) : error || !order ? (
          <ErrorState message={error ?? 'Order not found.'} onRetry={load} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="section-title mb-2">Order Details</h1>
              <p className="text-sm text-zinc-500 break-all">{order.id}</p>
              <p className="text-xs text-zinc-400 mt-1">
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <section className="bg-white border border-zinc-100 rounded-sm p-6 mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                Customer Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Customer ID</p>
                  <p className="text-sm font-bold text-[#0B0B0B] break-all">{order.user_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Order ID</p>
                  <p className="text-sm font-bold text-[#0B0B0B]">{shortId(order.id, 12)}</p>
                </div>
              </div>
            </section>

            <section className="bg-[#F9F9F9] border border-zinc-200 rounded-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <span
                  className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${ORDER_STATUS_BADGE[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                      Update Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                      disabled={!canUpdate}
                      className="w-full sm:w-56 px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors disabled:opacity-40"
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={!canUpdate || updating}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {updating ? 'Updating…' : 'Save Status'}
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm font-black text-[#0B0B0B]">
                Total: Rs. {formatPrice(order.total_price)}
              </p>
            </section>

            <section className="bg-white border border-zinc-100 rounded-sm p-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Products</h2>
              {order.items.length === 0 ? (
                <p className="text-sm text-zinc-500">No items in this order.</p>
              ) : (
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="border border-zinc-100 rounded-sm p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {resolveItemImage(item) ? (
                          <img
                            src={resolveItemImage(item)}
                            alt={item.product?.name ?? 'Product'}
                            className="w-20 h-20 object-cover rounded-sm bg-zinc-50 border border-zinc-100"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-sm bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                            <span className="material-icons-round text-zinc-400">image</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-[#0B0B0B] mb-1">
                            {item.product?.name ?? 'Deleted Product'}
                          </h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                            Variant: {item.variant?.color ?? 'Default'}
                          </p>
                          {item.selected_options.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.selected_options.map((opt) => (
                                <span
                                  key={opt.option_id}
                                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-sm text-zinc-500"
                                >
                                  {opt.config_name}: {opt.option_value}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Qty: {item.quantity} · Unit: Rs. {formatPrice(item.final_price)} · Line:{' '}
                            Rs. {formatPrice(item.item_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
                <p className="text-lg font-black text-[#0B0B0B]">
                  Order Total: Rs. {toNumber(order.total_price).toFixed(2)}
                </p>
              </div>
            </section>
          </>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;
