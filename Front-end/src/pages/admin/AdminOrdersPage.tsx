import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_FILTERS,
  ORDER_STATUS_LABEL,
  type OrderStatusFilter,
} from '../../components/admin/orderStatus';
import { EmptyState, ErrorState } from '../../components/home/AsyncState';
import { getAdminOrderErrorMessage, getAllOrders } from '../../api/adminOrderService';
import { formatPrice, shortId } from '../../utils/admin';

const PAGE_SIZE = 8;

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getAllOrders>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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
        ? o.id.toLowerCase().includes(q) || o.user_id.toLowerCase().includes(q)
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="section-title mb-2">Orders</h1>
          <p className="text-sm text-zinc-500">Manage order status and review order details</p>
        </div>

        <div className="bg-white border border-zinc-100 rounded-sm p-4 mb-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
              placeholder="Search by order id or customer id…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS_FILTERS.map((f) => {
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
          <AdminTableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : sorted.length === 0 ? (
          <EmptyState title="No orders found" description="Orders will appear here when customers checkout." />
        ) : (
          <>
            <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((o) => (
                      <tr key={o.id} className="border-b border-zinc-100">
                        <td className="px-4 py-4 text-sm font-bold text-[#0B0B0B]">{shortId(o.id, 10)}</td>
                        <td className="px-4 py-4 text-sm text-zinc-600 break-all">{shortId(o.user_id, 10)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${ORDER_STATUS_BADGE[o.status]}`}
                          >
                            {ORDER_STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">{formatPrice(o.total_price)}</td>
                        <td className="px-4 py-4 text-sm text-zinc-600">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            to={`/admin/orders/${o.id}`}
                            className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] border border-zinc-200 rounded-sm transition-colors"
                          >
                            View
                          </Link>
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
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pageClamped <= 1}
                  className="px-4 py-2 border border-zinc-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs font-black text-[#0B0B0B]">{pageClamped}</span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={pageClamped >= totalPages}
                  className="px-4 py-2 border border-zinc-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
