import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductForm } from '../../components/admin/ProductForm';
import { ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import { createProductFull, getAdminProductErrorMessage } from '../../api/adminProductService';
import { getCategories } from '../../api/adminCategoryService';
import type { AdminProductFormInput } from '../../api/adminProductService';
import type { Category } from '../../types/api';
import { emptyProductForm } from '../../utils/productForm';

type ToastState = { message: string; type: ToastType } | null;

const AdminProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError('Unable to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const initialForm = useMemo(() => emptyProductForm(categories), [categories]);

  const handleSubmit = async (form: AdminProductFormInput) => {
    setSubmitting(true);
    try {
      await createProductFull(form);
      setToast({ message: 'Product created successfully.', type: 'success' });
      setTimeout(() => navigate('/admin/products'), 600);
    } catch (err) {
      setToast({ message: getAdminProductErrorMessage(err), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors mb-4"
          >
            <span className="material-icons-round text-sm">arrow_back</span>
            Back to products
          </Link>
          <h1 className="section-title mb-2">Create Product</h1>
          <p className="text-sm text-zinc-500">Add a new product with variants, configs, and images</p>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-100 rounded-sm p-8 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded w-1/3 mb-4" />
            <div className="h-32 bg-zinc-100 rounded w-full" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadCategories} />
        ) : categories.length === 0 ? (
          <ErrorState
            message="Create at least one category before adding products."
            onRetry={() => navigate('/admin/categories')}
          />
        ) : (
          <ProductForm
            mode="create"
            initialForm={initialForm}
            categories={categories}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/products')}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </AdminLayout>
  );
};

export default AdminProductCreatePage;
