import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductForm } from '../../components/admin/ProductForm';
import { ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import {
  getAdminProduct,
  getAdminProductErrorMessage,
  updateProductFull,
} from '../../api/adminProductService';
import { getCategories } from '../../api/adminCategoryService';
import type { AdminProductFormInput } from '../../api/adminProductService';
import type { Category, Product } from '../../types/api';
import { productToForm } from '../../utils/productForm';

type ToastState = { message: string; type: ToastType } | null;

const AdminProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Product not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [productData, categoryData] = await Promise.all([getAdminProduct(id), getCategories()]);
      setProduct(productData);
      setCategories(categoryData);
    } catch {
      setError('Unable to load product.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const initialForm = useMemo(
    () => (product ? productToForm(product) : null),
    [product]
  );

  const handleSubmit = async (form: AdminProductFormInput) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await updateProductFull(id, form);
      setToast({ message: 'Product updated successfully.', type: 'success' });
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
          <h1 className="section-title mb-2">Edit Product</h1>
          <p className="text-sm text-zinc-500">{product?.name ?? 'Loading…'}</p>
        </div>

        {loading ? (
          <div className="bg-white border border-zinc-100 rounded-sm p-8 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded w-1/3 mb-4" />
            <div className="h-32 bg-zinc-100 rounded w-full" />
          </div>
        ) : error || !initialForm ? (
          <ErrorState message={error ?? 'Product not found.'} onRetry={load} />
        ) : (
          <ProductForm
            mode="edit"
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

export default AdminProductEditPage;
