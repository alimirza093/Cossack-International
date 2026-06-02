import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { EmptyState, ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import { createCategory, deleteCategory, getAdminCategoryErrorMessage, getCategories, updateCategory } from '../../api/adminCategoryService';
import type { Category } from '../../types/api';

type ToastState = { message: string; type: ToastType } | null;

const PAGE_SIZE = 10;

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formName, setFormName] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(getAdminCategoryErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const paged = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageClamped]);

  const openCreate = () => {
    setFormName('');
    setCreateOpen(true);
  };

  const openEdit = (cat: Category) => {
    setFormName(cat.name);
    setEditTarget(cat);
    setCreateOpen(true);
  };

  const closeModal = () => {
    setCreateOpen(false);
    setEditTarget(null);
    setFormName('');
  };

  const submit = async () => {
    if (!formName.trim()) {
      setToast({ message: 'Category name is required.', type: 'error' });
      return;
    }
    setFormSubmitting(true);
    try {
      if (editTarget) {
        await updateCategory(editTarget.id, { name: formName.trim() });
        setToast({ message: 'Category updated successfully.', type: 'success' });
      } else {
        await createCategory({ name: formName.trim() });
        setToast({ message: 'Category created successfully.', type: 'success' });
      }
      closeModal();
      await load();
    } catch (err) {
      setToast({ message: getAdminCategoryErrorMessage(err), type: 'error' });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      setToast({ message: 'Category deleted successfully.', type: 'success' });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setToast({ message: getAdminCategoryErrorMessage(err), type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title mb-2">Categories</h1>
            <p className="text-sm text-zinc-500">Manage product categories</p>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary inline-flex items-center justify-center text-sm">
            <span className="material-icons-round mr-2">add</span> Create Category
          </button>
        </div>

        <div className="bg-white border border-zinc-100 rounded-sm p-4 mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
            placeholder="Search categories…"
          />
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
        ) : filtered.length === 0 ? (
          <EmptyState title="No categories found" description="Create your first category." />
        ) : (
          <>
            <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((c) => (
                      <tr key={c.id} className="border-b border-zinc-100">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#0B0B0B]">{c.name}</p>
                          <p className="text-xs text-zinc-500 break-all">{c.id}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] border border-zinc-200 rounded-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
                              className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 border border-red-200 rounded-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-5">
              <p className="text-xs text-zinc-500">
                Showing {Math.min((pageClamped - 1) * PAGE_SIZE + 1, filtered.length)}-
                {Math.min(pageClamped * PAGE_SIZE, filtered.length)} of {filtered.length}
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

        <ConfirmModal
          open={!!deleteTarget}
          title="Delete Category?"
          description="This will permanently delete the category."
          confirmText="Delete"
          cancelText="Cancel"
          confirmTone="danger"
          isConfirming={deleteLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />

        {createOpen && (
          <div className="fixed inset-0 z-[260] bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-sm border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-[#0B0B0B] font-black uppercase tracking-tight text-lg">
                  {editTarget ? 'Edit Category' : 'Create Category'}
                </h3>
                <button type="button" onClick={closeModal} className="material-icons-round text-zinc-500 hover:text-[#0B0B0B]">
                  close
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Category Name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={formSubmitting}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#0B0B0B] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={formSubmitting}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {formSubmitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;

