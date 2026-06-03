import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '../../components/admin/orderStatus';
import { ErrorState, EmptyState } from '../../components/home/AsyncState';
import { getAllOrders } from '../../api/adminOrderService';
import { listAdminProducts } from '../../api/adminProductService';
import { getCategories } from '../../api/adminCategoryService';
import type { Order, Product } from '../../types/api';
import { formatPrice, getProductThumbnail, shortId, toNumber } from '../../utils/admin';

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

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

      setRecentOrders(
        [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
      );
      setRecentProducts(
        [...products]
          .sort((a, b) => {
            const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bDate - aDate;
          })
          .slice(0, 5)
      );
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
    ],
    [totalProducts, totalCategories, totalOrders, pendingOrders]
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
            <AdminTableSkeleton rows={4} />
            <AdminTableSkeleton rows={4} />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
              {headlineStats.map((s) => (
                <div key={s.label} className="bg-white border border-zinc-100 rounded-sm p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{s.label}</p>
                  <p className="text-3xl font-black text-[#0B0B0B]">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#0B0B0B] font-black uppercase tracking-widest text-sm">Recent Orders</h2>
                  <Link
                    to="/admin/orders"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
                  >
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
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Order
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Status
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map((o) => (
                            <tr key={o.id} className="border-b border-zinc-100">
                              <td className="px-4 py-4">
                                <Link
                                  to={`/admin/orders/${o.id}`}
                                  className="text-sm font-bold text-[#0B0B0B] hover:text-[#39FF14] transition-colors"
                                >
                                  {shortId(o.id, 10)}
                                </Link>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex w-fit px-2.5 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest ${ORDER_STATUS_BADGE[o.status]}`}
                                >
                                  {ORDER_STATUS_LABEL[o.status]}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">
                                Rs. {toNumber(o.total_price).toFixed(2)}
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
                  <Link
                    to="/admin/products"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
                  >
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
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Product
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Category
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Base Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProducts.map((p) => {
                            const thumb = getProductThumbnail(p.base_image, p.variants);
                            return (
                              <tr key={p.id} className="border-b border-zinc-100">
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    {thumb ? (
                                      <img
                                        src={thumb}
                                        alt={p.name}
                                        className="w-10 h-10 object-cover rounded-sm border border-zinc-100"
                                      />
                                    ) : null}
                                    <Link
                                      to={`/admin/products/${p.id}/edit`}
                                      className="text-sm font-bold text-[#0B0B0B] hover:text-[#39FF14] transition-colors"
                                    >
                                      {p.name}
                                    </Link>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-zinc-600">{p.category?.name ?? '—'}</td>
                                <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">Rs. {formatPrice(p.base_price)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
