import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { EmptyState, ErrorState } from '../../components/home/AsyncState';
import Toast, { type ToastType } from '../../components/ui/Toast';
import {
  createProductFull,
  getAdminProductErrorMessage,
  listAdminProducts,
  softDeleteProduct,
  updateProductFull,
  type AdminConfigType,
  type AdminProductFullInput,
} from '../../api/adminProductService';
import { getCategories } from '../../api/adminCategoryService';
import type { Category, Product } from '../../types/api';

type ToastState = { message: string; type: ToastType } | null;

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

const PAGE_SIZE = 8;

type SortKey = 'name' | 'base_price' | 'variants';
type SortDir = 'asc' | 'desc';

function formatPrice(value: string | number): string {
  return `$${toNumber(value).toFixed(2)}`;
}

function normalizeAdminConfigType(type: string): AdminConfigType {
  if (type === 'size') return 'size';
  return 'custom';
}

interface ProductFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ open, mode, product, categories, onClose, onSaved }) => {
  const [toast, setToast] = useState<ToastState>(null);

  const initialState = useMemo<AdminProductFullInput>(() => {
    if (mode === 'edit' && product) {
      return {
        name: product.name ?? '',
        description: product.description ?? '',
        base_price: product.base_price ?? 0,
        category_id: product.category_id ?? '',
        base_image: product.base_image ?? null,
        base_image_file: null,
        static_configs: product.static_configs.map((s) => ({ key: s.key, value: s.value })),
        dynamic_configs: product.configs.map((c) => ({
          name: c.name,
          type: normalizeAdminConfigType(c.type),
          options: c.options.map((o) => ({ value: o.value, price_modifier: o.price_modifier })),
        })),
        variants: product.variants.map((v) => ({
          color: v.color,
          stock: v.stock,
          price_modifier: v.price_modifier,
          images: v.images.map((img) => ({ image_url: img.image_url, is_primary: img.is_primary, file: null })),
        })),
      };
    }
    return {
      name: '',
      description: '',
      base_price: 0,
      category_id: categories[0]?.id ?? '',
      base_image: null,
      base_image_file: null,
      static_configs: [],
      dynamic_configs: [],
      variants: [
        {
          color: '',
          stock: 0,
          price_modifier: 0,
          images: [{ image_url: null, is_primary: true, file: null }],
        },
      ],
    };
  }, [mode, product, categories]);

  const [form, setForm] = useState<AdminProductFullInput>(initialState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  const updateStatic = (idx: number, patch: Partial<{ key: string; value: string }>) => {
    setForm((prev) => {
      const next = [...prev.static_configs];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, static_configs: next };
    });
  };

  const addStatic = () => {
    setForm((prev) => ({ ...prev, static_configs: [...prev.static_configs, { key: '', value: '' }] }));
  };

  const removeStatic = (idx: number) => {
    setForm((prev) => ({ ...prev, static_configs: prev.static_configs.filter((_, i) => i !== idx) }));
  };

  const updateDynamic = (idx: number, patch: Partial<{ name: string; type: AdminConfigType }>) => {
    setForm((prev) => {
      const next = [...prev.dynamic_configs];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, dynamic_configs: next };
    });
  };

  const addDynamic = () => {
    setForm((prev) => ({
      ...prev,
      dynamic_configs: [
        ...prev.dynamic_configs,
        { name: '', type: 'size', options: [{ value: '', price_modifier: 0 }] },
      ],
    }));
  };

  const removeDynamic = (idx: number) => {
    setForm((prev) => ({ ...prev, dynamic_configs: prev.dynamic_configs.filter((_, i) => i !== idx) }));
  };

  const updateDynamicOption = (
    cfgIdx: number,
    optIdx: number,
    patch: Partial<{ value: string; price_modifier: string | number }>
  ) => {
    setForm((prev) => {
      const next = [...prev.dynamic_configs];
      const cfg = next[cfgIdx];
      const opts = [...cfg.options];
      opts[optIdx] = { ...opts[optIdx], ...patch };
      next[cfgIdx] = { ...cfg, options: opts };
      return { ...prev, dynamic_configs: next };
    });
  };

  const addDynamicOption = (cfgIdx: number) => {
    setForm((prev) => {
      const next = [...prev.dynamic_configs];
      next[cfgIdx] = { ...next[cfgIdx], options: [...next[cfgIdx].options, { value: '', price_modifier: 0 }] };
      return { ...prev, dynamic_configs: next };
    });
  };

  const removeDynamicOption = (cfgIdx: number, optIdx: number) => {
    setForm((prev) => {
      const next = [...prev.dynamic_configs];
      next[cfgIdx] = { ...next[cfgIdx], options: next[cfgIdx].options.filter((_, i) => i !== optIdx) };
      return { ...prev, dynamic_configs: next };
    });
  };

  const updateVariant = (idx: number, patch: Partial<{ color: string; stock: number; price_modifier: string | number }>) => {
    setForm((prev) => {
      const next = [...prev.variants];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, variants: next };
    });
  };

  const removeVariant = (idx: number) => {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { color: '', stock: 0, price_modifier: 0, images: [{ image_url: null, is_primary: true, file: null }] },
      ],
    }));
  };

  const updateVariantImage = (
    vIdx: number,
    imgIdx: number,
    patch: Partial<{ image_url: string | null; is_primary: boolean; file: File | null }>
  ) => {
    setForm((prev) => {
      const next = [...prev.variants];
      const variant = next[vIdx];
      const imgs = [...variant.images];
      const current = imgs[imgIdx];
      imgs[imgIdx] = { ...current, ...patch };
      next[vIdx] = { ...variant, images: imgs };
      return { ...prev, variants: next };
    });
  };

  const removeVariantImage = (vIdx: number, imgIdx: number) => {
    setForm((prev) => {
      const next = [...prev.variants];
      next[vIdx] = { ...next[vIdx], images: next[vIdx].images.filter((_, i) => i !== imgIdx) };
      return { ...prev, variants: next };
    });
  };

  const addVariantImage = (vIdx: number) => {
    setForm((prev) => {
      const next = [...prev.variants];
      next[vIdx] = {
        ...next[vIdx],
        images: [...next[vIdx].images, { image_url: null, is_primary: false, file: null }],
      };
      return { ...prev, variants: next };
    });
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.category_id.trim()) {
      setToast({ message: 'Please fill required fields (name, description, category).', type: 'error' });
      return;
    }
    const invalidVariant = form.variants.some((v) => {
      const hasImage = v.images.some((img) => Boolean(img.file) || Boolean(img.image_url));
      return !v.color.trim() || v.stock < 0 || !hasImage;
    });
    if (invalidVariant) {
      setToast({ message: 'Each variant must have a color, non-negative stock, and at least one image.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setToast(null);
    try {
      if (mode === 'create') {
        await createProductFull(form);
      } else {
        if (!product?.id) throw new Error('Missing product id');
        await updateProductFull(product.id, form);
      }
      onClose();
      onSaved();
    } catch (err) {
      setToast({ message: getAdminProductErrorMessage(err), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between gap-3">
          <h3 className="text-[#0B0B0B] font-black uppercase tracking-tight text-lg">
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </h3>
          <button type="button" onClick={onClose} className="material-icons-round text-zinc-500 hover:text-[#0B0B0B]">
            close
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Base Price</label>
              <input
                type="number"
                value={form.base_price}
                onChange={(e) => setForm((p) => ({ ...p, base_price: Number(e.target.value) }))}
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Images</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Base Image URL</label>
                  <input
                    value={form.base_image ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, base_image: e.target.value.trim() ? e.target.value : null }))}
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Base Image Upload (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm((p) => ({ ...p, base_image_file: file }));
                    }}
                    className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-8">
            <section>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Static Configs</h4>
              {form.static_configs.length === 0 ? (
                <p className="text-sm text-zinc-500 mb-3">No static configs.</p>
              ) : (
                <div className="space-y-3">
                  {form.static_configs.map((cfg, idx) => (
                    <div key={`${cfg.key}-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={cfg.key}
                        onChange={(e) => updateStatic(idx, { key: e.target.value })}
                        placeholder="Key"
                        className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          value={cfg.value}
                          onChange={(e) => updateStatic(idx, { value: e.target.value })}
                          placeholder="Value"
                          className="flex-1 px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeStatic(idx)}
                          className="material-icons-round text-zinc-400 hover:text-red-500"
                          aria-label="Remove static config"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={addStatic} className="mt-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                + Add Static Config
              </button>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dynamic Configs</h4>
                <button type="button" onClick={addDynamic} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                  + Add Config
                </button>
              </div>
              {form.dynamic_configs.length === 0 ? (
                <p className="text-sm text-zinc-500 mb-3">No dynamic configs.</p>
              ) : (
                <div className="space-y-5">
                  {form.dynamic_configs.map((cfg, cfgIdx) => (
                    <div key={`${cfg.name}-${cfgIdx}`} className="border border-zinc-200 rounded-sm p-4 bg-[#F9F9F9]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Config Name</label>
                          <input
                            value={cfg.name}
                            onChange={(e) => updateDynamic(cfgIdx, { name: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Type</label>
                            <select
                              value={cfg.type}
                              onChange={(e) => updateDynamic(cfgIdx, { type: e.target.value as AdminConfigType })}
                              className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                            >
                              <option value="size">size</option>
                              <option value="custom">custom</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDynamic(cfgIdx)}
                            className="material-icons-round text-zinc-400 hover:text-red-500"
                            aria-label="Remove dynamic config"
                          >
                            delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Options</h5>
                          <button type="button" onClick={() => addDynamicOption(cfgIdx)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                            + Add Option
                          </button>
                        </div>
                        {cfg.options.map((opt, optIdx) => (
                          <div key={`${opt.value}-${optIdx}`} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Value</label>
                              <input
                                value={opt.value}
                                onChange={(e) => updateDynamicOption(cfgIdx, optIdx, { value: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                              />
                            </div>
                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Price Modifier</label>
                              <input
                                type="number"
                                value={opt.price_modifier}
                                onChange={(e) => updateDynamicOption(cfgIdx, optIdx, { price_modifier: Number(e.target.value) })}
                                className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDynamicOption(cfgIdx, optIdx)}
                              className="material-icons-round text-zinc-400 hover:text-red-500"
                              aria-label="Remove option"
                            >
                              delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Variants</h4>
                <button type="button" onClick={addVariant} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                  + Add Variant
                </button>
              </div>
              <div className="space-y-5">
                {form.variants.map((variant, vIdx) => (
                  <div key={`${variant.color}-${vIdx}`} className="border border-zinc-200 rounded-sm p-4 bg-[#F9F9F9]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Color</label>
                        <input
                          value={variant.color}
                          onChange={(e) => updateVariant(vIdx, { color: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(vIdx, { stock: Number(e.target.value) })}
                          className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Price Modifier</label>
                          <input
                            type="number"
                            value={variant.price_modifier}
                            onChange={(e) => updateVariant(vIdx, { price_modifier: Number(e.target.value) })}
                            className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariant(vIdx)}
                          className="material-icons-round text-zinc-400 hover:text-red-500"
                          aria-label="Remove variant"
                        >
                          delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Images</h5>
                        <button type="button" onClick={() => addVariantImage(vIdx)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors">
                          + Add Image
                        </button>
                      </div>
                      {variant.images.map((img, imgIdx) => (
                        <div key={`${imgIdx}-${String(img.image_url ?? '')}`} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Image URL</label>
                            <input
                              value={img.image_url ?? ''}
                              onChange={(e) => updateVariantImage(vIdx, imgIdx, { image_url: e.target.value.trim() ? e.target.value : null, file: null })}
                              className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                              placeholder="Optional (or upload)"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Upload</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                // If uploading, backend will replace image_url with uploaded file.
                                updateVariantImage(vIdx, imgIdx, { file, image_url: file ? null : img.image_url });
                              }}
                              className="w-full px-3 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Primary</label>
                              <input
                                type="checkbox"
                                checked={img.is_primary}
                                onChange={(e) => updateVariantImage(vIdx, imgIdx, { is_primary: e.target.checked })}
                                className="accent-[#39FF14]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariantImage(vIdx, imgIdx)}
                              className="material-icons-round text-zinc-400 hover:text-red-500"
                              aria-label="Remove image"
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#0B0B0B]"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {submitting ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductFormModalMemo = React.memo(ProductFormModal);

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, cats] = await Promise.all([listAdminProducts(false), getCategories()]);
      setProducts(items);
      setCategories(cats);
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
      return (a.variants.length - b.variants.length) * dir;
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
          <button type="button" onClick={() => setCreateOpen(true)} className="btn-primary inline-flex items-center justify-center text-sm">
            <span className="material-icons-round mr-2">add</span> Create Product
          </button>
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
                  <option value="variants">Variants</option>
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Direction</label>
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
        ) : filteredSorted.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting your search filters." />
        ) : (
          <div>
            <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Product</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Variants</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Base Price</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedItems.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-100">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#0B0B0B]">{p.name}</p>
                          <p className="text-xs text-zinc-500 break-all">{p.id}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-600">{p.category?.name ?? '—'}</td>
                        <td className="px-4 py-4 text-sm text-zinc-600">{p.variants.length}</td>
                        <td className="px-4 py-4 text-sm font-black text-[#0B0B0B]">{formatPrice(p.base_price)}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditing(p)}
                              className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] border border-zinc-200 rounded-sm transition-colors"
                            >
                              Edit
                            </button>
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
                    ))}
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
          </div>
        )}

        <ProductFormModalMemo
          open={createOpen}
          mode="create"
          categories={categories}
          onClose={() => setCreateOpen(false)}
          onSaved={load}
        />
        <ProductFormModalMemo
          open={!!editing}
          mode="edit"
          product={editing ?? undefined}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={load}
        />

        <ConfirmModal
          open={!!deleteTarget}
          title="Delete Product?"
          description="This will soft-delete the product. You can manage it later via restore if needed."
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

