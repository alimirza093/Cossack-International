import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { EmptyState, ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import { getAllOrders, getAdminOrderErrorMessage, updateOrderStatus, type UpdateOrderStatusInput } from '../../api/adminOrderService';
import type { Order, OrderStatus } from '../../types/api';

type ToastState = { message: string; type: ToastType } | null;

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

const PAGE_SIZE = 8;

type StatusFilter = 'all' | OrderStatus;

function statusOptions(): OrderStatus[] {
  return ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
}

interface OrderDetailsModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
  onUpdated: (updated: Order) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ open, order, onClose, onUpdated }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (open) setSelectedStatus(order.status);
  }, [open, order.status]);

  const canUpdate = order.status !== 'delivered';

  const handleUpdate = async () => {
    if (!canUpdate) return;
    setUpdating(true);
    setToast(null);
    try {
      const payload: UpdateOrderStatusInput = { status: selectedStatus };
      const updated = await updateOrderStatus(order.id, payload);
      onUpdated(updated);
      setToast({ message: 'Order status updated successfully.', type: 'success' });
      onClose();
    } catch (err) {
      setToast({ message: getAdminOrderErrorMessage(err), type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const resolveItemImage = (item: Order['items'][number]): string => {
    const productImage = item.product?.base_image;
    const variants = item.product?.variants ?? [];
    const variantId = item.variant?.id;
    if (variants.length > 0 && variantId) {
      const v = variants.find((x) => x.id === variantId);
      const imgUrl = v?.images?.[0]?.image_url;
      if (imgUrl) return imgUrl;
    }
    return productImage ?? '';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[260] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[#0B0B0B] font-black uppercase tracking-tight text-lg">Order {order.id}</h3>
            <p className="text-xs text-zinc-500 mt-1">Created: {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button type="button" onClick={onClose} className="material-icons-round text-zinc-500 hover:text-[#0B0B0B]">
            close
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <section className="bg-[#F9F9F9] border border-zinc-200 rounded-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <span
                className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[order.status]}`}
              >
                {order.status}
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
                    {statusOptions().map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={!canUpdate || updating}
                  className="btn-primary text-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {updating ? 'Updating…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Customer</p>
                <p className="text-sm font-bold text-[#0B0B0B] break-all">{order.user_id}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Price</p>
                <p className="text-sm font-black text-[#0B0B0B]">${toNumber(order.total_price).toFixed(2)}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Order Items</h4>
            {order.items.length === 0 ? (
              <p className="text-sm text-zinc-500">No items.</p>
            ) : (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="bg-white border border-zinc-100 rounded-sm p-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                      <img
                        src={resolveItemImage(item)}
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
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Unit Price</p>
                        <p className="font-black text-[#0B0B0B] text-sm mb-3">${toNumber(item.final_price).toFixed(2)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Item Total</p>
                        <p className="font-black text-[#0B0B0B] text-base">${toNumber(item.item_total).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      </div>
    </div>
  );
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(getAdminOrderErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      const matchSearch = q
        ? o.id.toLowerCase().includes(q) ||
          o.user_id.toLowerCase().includes(q)
        : true;
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const paged = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, pageClamped]);

  const openDetails = (order: Order) => {
    setDetailsTarget(order);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsTarget(null);
  };

  const onUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const filters: Array<{ key: StatusFilter; label: string; badge: OrderStatus | null }> = [
    { key: 'all', label: 'All', badge: null },
    { key: 'pending', label: 'Pending', badge: 'pending' },
    { key: 'confirmed', label: 'Confirmed', badge: 'confirmed' },
    { key: 'shipped', label: 'Shipped', badge: 'shipped' },
    { key: 'delivered', label: 'Delivered', badge: 'delivered' },
    { key: 'cancelled', label: 'Cancelled', badge: 'cancelled' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title mb-2">Orders</h1>
          <p className="text-sm text-zinc-500">Manage order status and review order details</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-sm p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                placeholder="Search by order id or customer id…"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-2 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-colors ${
                    active
                      ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#0B0B0B]'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
                <div className="h-4 bg-zinc-100 rounded w-1/3 mb-3" />
                <div className="h-8 bg-zinc-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : sorted.length === 0 ? (
          <EmptyState title="No orders found" description="Place your first order to see it here." />
        ) : (
          <>
            <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((o) => (
                      <tr key={o.id} className="border-b border-zinc-100">
                        <td className="px-4 py-4 text-sm font-bold text-[#0B0B0B] break-all">{o.id}</td>
                        <td className="px-4 py-4 text-sm text-zinc-600 break-all">{o.user_id}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">${toNumber(o.total_price).toFixed(2)}</td>
                        <td className="px-4 py-4 text-sm text-zinc-600">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => openDetails(o)}
                            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] border border-zinc-200 rounded-sm transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-5">
              <p className="text-xs text-zinc-500">
                Showing {Math.min((pageClamped - 1) * PAGE_SIZE + 1, sorted.length)}-
                {Math.min(pageClamped * PAGE_SIZE, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageClamped <= 1}
                  className="px-4 py-2 border border-zinc-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs font-black text-[#0B0B0B]">{pageClamped}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageClamped >= totalPages}
                  className="px-4 py-2 border border-zinc-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {detailsTarget && (
          <OrderDetailsModal
            open={detailsOpen}
            order={detailsTarget}
            onClose={closeDetails}
            onUpdated={onUpdated}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;

