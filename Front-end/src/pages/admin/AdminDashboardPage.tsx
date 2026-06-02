import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ErrorState, EmptyState } from '../../components/home/AsyncState';
import Toast from '../../components/ui/Toast';
import { getAllOrders } from '../../api/adminOrderService';
import { listAdminProducts } from '../../api/adminProductService';
import { getCategories } from '../../api/adminCategoryService';
import type { Order, OrderStatus, Product } from '../../types/api';

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

const OrdersTableSkeleton: React.FC = () => (
  <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
    <div className="p-5 space-y-4 animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-1/4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 bg-zinc-100 rounded w-full" />
      ))}
    </div>
  </div>
);

const ProductsTableSkeleton: React.FC = () => (
  <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
    <div className="p-5 space-y-4 animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-1/4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 bg-zinc-100 rounded w-full" />
      ))}
    </div>
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orders, products, categories] = await Promise.all([
        getAllOrders(),
        listAdminProducts(false),
        getCategories(),
      ]);

      setTotalProducts(products.length);
      setTotalCategories(categories.length);
      setTotalOrders(orders.length);
      setPendingOrders(orders.filter((o) => o.status === 'pending').length);
      setCompletedOrders(orders.filter((o) => o.status === 'delivered').length);

      setRecentOrders(
        [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
      );
      setRecentProducts(products.slice(0, 5));
    } catch {
      setError('Unable to load admin dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const headlineStats = useMemo(
    () => [
      { label: 'Total Products', value: totalProducts },
      { label: 'Total Categories', value: totalCategories },
      { label: 'Total Orders', value: totalOrders },
      { label: 'Pending Orders', value: pendingOrders },
      { label: 'Completed Orders', value: completedOrders },
    ],
    [totalProducts, totalCategories, totalOrders, pendingOrders, completedOrders]
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="section-title mb-2">Admin Dashboard</h1>
          <p className="text-sm text-zinc-500">Overview of your store activity</p>
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {headlineStats.map((s) => (
                <div key={s.label} className="bg-white border border-zinc-100 rounded-sm p-5 animate-pulse">
                  <div className="h-4 bg-zinc-100 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-zinc-100 rounded w-1/3" />
                </div>
              ))}
            </div>
            <OrdersTableSkeleton />
            <ProductsTableSkeleton />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
              {headlineStats.map((s) => (
                <div key={s.label} className="bg-white border border-zinc-100 rounded-sm p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    {s.label}
                  </p>
                  <p className="text-3xl font-black text-[#0B0B0B]">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#0B0B0B] font-black uppercase tracking-widest text-sm">Recent Orders</h2>
                  <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                    View all
                  </Link>
                </div>
                {recentOrders.length === 0 ? (
                  <EmptyState title="No orders found" description="Your admin orders list will appear here." />
                ) : (
                  <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Order</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((o) => (
                            <tr key={o.id} className="border-b border-zinc-100">
                              <td className="px-4 py-4 text-sm font-bold text-[#0B0B0B] break-all">{o.id}</td>
                              <td className="px-4 py-4 text-sm text-zinc-600 break-all">{o.user_id}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${STATUS_BADGE[o.status]}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">
                                ${toNumber(o.total_price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#0B0B0B] font-black uppercase tracking-widest text-sm">Recent Products</h2>
                  <Link to="/admin/products" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                    Manage
                  </Link>
                </div>
                {recentProducts.length === 0 ? (
                  <EmptyState title="No products found" description="Add products to start selling." />
                ) : (
                  <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Product</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Variants</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Base Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProducts.map((p) => (
                            <tr key={p.id} className="border-b border-zinc-100">
                              <td className="px-4 py-4 text-sm font-bold text-[#0B0B0B] break-all">{p.name}</td>
                              <td className="px-4 py-4 text-sm text-zinc-600">{p.category?.name ?? '—'}</td>
                              <td className="px-4 py-4 text-sm text-zinc-600">{p.variants.length}</td>
                              <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">
                                ${toNumber(p.base_price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
        {toast && <Toast message={toast.message} type="success" onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

