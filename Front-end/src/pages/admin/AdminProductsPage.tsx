import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTableSkeleton } from '../../components/admin/AdminTableSkeleton';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { EmptyState, ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import {
  getAdminProductErrorMessage,
  listAdminProducts,
  softDeleteProduct,
} from '../../api/adminProductService';
import type { Product } from '../../types/api';
import { formatAdminDate, formatPrice, getProductThumbnail } from '../../utils/admin';

type ToastState = { message: string; type: ToastType } | null;

const PAGE_SIZE = 8;

type SortKey = 'name' | 'base_price' | 'created';
type SortDir = 'asc' | 'desc';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listAdminProducts(false);
      setProducts(items);
    } catch {
      setError('Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = products;
    if (q) {
      items = items.filter((p) => {
        const cat = p.category?.name ?? '';
        return (
          p.name.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          String(p.id).toLowerCase().includes(q)
        );
      });
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    items = [...items].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'base_price') return (toNumber(a.base_price) - toNumber(b.base_price)) * dir;
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return (aDate - bDate) * dir;
    });

    return items;
  }, [products, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir]);

  const pagedItems = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, pageClamped]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await softDeleteProduct(deleteTarget.id);
      setToast({ message: 'Product deleted successfully.', type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setToast({ message: getAdminProductErrorMessage(err), type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title mb-2">Products</h1>
            <p className="text-sm text-zinc-500">Manage products, variants, configs and soft delete</p>
          </div>
          <Link to="/admin/products/create" className="btn-primary inline-flex items-center justify-center text-sm">
            <span className="material-icons-round mr-2">add</span> Create Product
          </Link>
        </div>

        <div className="bg-white border border-zinc-100 rounded-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 justify-between">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                placeholder="Search by name, category, or id…"
              />
            </div>
            <div className="flex gap-3">
              <div className="min-w-[180px]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Sort</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                >
                  <option value="name">Name</option>
                  <option value="base_price">Base Price</option>
                  <option value="created">Created Date</option>
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                  Direction
                </label>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as SortDir)}
                  className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <AdminTableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filteredSorted.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your search filters." />
        ) : (
          <div>
            <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Image
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Category
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Base Price
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Created
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedItems.map((p) => {
                      const thumb = getProductThumbnail(p.base_image, p.variants);
                      return (
                        <tr key={p.id} className="border-b border-zinc-100">
                          <td className="px-4 py-4">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-sm bg-zinc-50 border border-zinc-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-sm bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                <span className="material-icons-round text-zinc-400 text-sm">image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-bold text-[#0B0B0B]">{p.name}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-zinc-600">{p.category?.name ?? '—'}</td>
                          <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">{formatPrice(p.base_price)}</td>
                          <td className="px-4 py-4 text-sm text-zinc-600">{formatAdminDate(p.created_at)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/admin/products/${p.id}/edit`}
                                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] border border-zinc-200 rounded-sm transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(p)}
                                className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 border border-red-200 rounded-sm transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-5">
              <p className="text-xs text-zinc-500">
                Showing {Math.min((pageClamped - 1) * PAGE_SIZE + 1, filteredSorted.length)}-
                {Math.min(pageClamped * PAGE_SIZE, filteredSorted.length)} of {filteredSorted.length}
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
          </div>
        )}

        <ConfirmModal
          open={!!deleteTarget}
          title="Delete Product?"
          description="This will soft-delete the product. It will no longer appear in the storefront."
          confirmText="Delete"
          cancelText="Cancel"
          confirmTone="danger"
          isConfirming={deleteLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
