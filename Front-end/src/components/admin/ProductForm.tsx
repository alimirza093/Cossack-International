import React, { useEffect, useState } from 'react';
import Toast, { type ToastType } from '../ui/Toast';
import type {
  AdminConfigType,
  AdminProductFormInput,
} from '../../api/adminProductService';
import type { Category } from '../../types/api';

type ToastState = { message: string; type: ToastType } | null;

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialForm: AdminProductFormInput;
  categories: Category[];
  submitting: boolean;
  onSubmit: (form: AdminProductFormInput) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  initialForm,
  categories,
  submitting,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<AdminProductFormInput>(initialForm);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

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

  const updateVariant = (
    idx: number,
    patch: Partial<{ color: string; stock: number; price_modifier: string | number }>
  ) => {
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
      imgs[imgIdx] = { ...imgs[imgIdx], ...patch };
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

  const handleSubmit = () => {
    if (!form.name.trim() || !form.description.trim() || !form.category_id.trim()) {
      setToast({ message: 'Please fill required fields (name, description, category).', type: 'error' });
      return;
    }
    const invalidVariant = form.variants.some((v) => {
      const hasImage = v.images.some((img) => Boolean(img.file) || Boolean(img.image_url));
      return !v.color.trim() || v.stock < 0 || !hasImage;
    });
    if (invalidVariant) {
      setToast({
        message: 'Each variant must have a color, non-negative stock, and at least one image.',
        type: 'error',
      });
      return;
    }
    onSubmit(form);
  };

  const inputClass =
    'w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors';

  return (
    <div className="bg-white border border-zinc-100 rounded-sm overflow-hidden">
      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                Base Price
              </label>
              <input
                type="number"
                value={form.base_price}
                onChange={(e) => setForm((p) => ({ ...p, base_price: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                className={inputClass}
              >
                {categories.length === 0 ? (
                  <option value="">No categories</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Base Image</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    Image URL
                  </label>
                  <input
                    value={form.base_image ?? ''}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, base_image: e.target.value.trim() ? e.target.value : null }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    Upload (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((p) => ({ ...p, base_image_file: e.target.files?.[0] ?? null }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Static Configs</h2>
          {form.static_configs.length === 0 ? (
            <p className="text-sm text-zinc-500 mb-3">No static configs.</p>
          ) : (
            <div className="space-y-3">
              {form.static_configs.map((cfg, idx) => (
                <div key={`static-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={cfg.key}
                    onChange={(e) => updateStatic(idx, { key: e.target.value })}
                    placeholder="Key"
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <input
                      value={cfg.value}
                      onChange={(e) => updateStatic(idx, { value: e.target.value })}
                      placeholder="Value"
                      className={`flex-1 ${inputClass}`}
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
          <button
            type="button"
            onClick={addStatic}
            className="mt-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
          >
            + Add Static Config
          </button>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Dynamic Configs</h2>
            <button
              type="button"
              onClick={addDynamic}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
            >
              + Add Config
            </button>
          </div>
          {form.dynamic_configs.length === 0 ? (
            <p className="text-sm text-zinc-500">No dynamic configs.</p>
          ) : (
            <div className="space-y-5">
              {form.dynamic_configs.map((cfg, cfgIdx) => (
                <div key={`dynamic-${cfgIdx}`} className="border border-zinc-200 rounded-sm p-4 bg-[#F9F9F9]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                        Config Name
                      </label>
                      <input
                        value={cfg.name}
                        onChange={(e) => updateDynamic(cfgIdx, { name: e.target.value })}
                        className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                          Type
                        </label>
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
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Options</h3>
                      <button
                        type="button"
                        onClick={() => addDynamicOption(cfgIdx)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
                      >
                        + Add Option
                      </button>
                    </div>
                    {cfg.options.map((opt, optIdx) => (
                      <div key={`opt-${cfgIdx}-${optIdx}`} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                            Value
                          </label>
                          <input
                            value={opt.value}
                            onChange={(e) => updateDynamicOption(cfgIdx, optIdx, { value: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                            Price Modifier
                          </label>
                          <input
                            type="number"
                            value={opt.price_modifier}
                            onChange={(e) =>
                              updateDynamicOption(cfgIdx, optIdx, { price_modifier: Number(e.target.value) })
                            }
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
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
            >
              + Add Variant
            </button>
          </div>
          <div className="space-y-5">
            {form.variants.map((variant, vIdx) => (
              <div key={`variant-${vIdx}`} className="border border-zinc-200 rounded-sm p-4 bg-[#F9F9F9]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                      Color
                    </label>
                    <input
                      value={variant.color}
                      onChange={(e) => updateVariant(vIdx, { color: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(vIdx, { stock: Number(e.target.value) })}
                      className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                        Price Modifier
                      </label>
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
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Images</h3>
                    <button
                      type="button"
                      onClick={() => addVariantImage(vIdx)}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#39FF14] transition-colors"
                    >
                      + Add Image
                    </button>
                  </div>
                  {variant.images.map((img, imgIdx) => (
                    <div
                      key={`img-${vIdx}-${imgIdx}`}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                          Image URL
                        </label>
                        <input
                          value={img.image_url ?? ''}
                          onChange={(e) =>
                            updateVariantImage(vIdx, imgIdx, {
                              image_url: e.target.value.trim() ? e.target.value : null,
                              file: null,
                            })
                          }
                          className="w-full px-4 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                          placeholder="Optional (or upload)"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                          Upload
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            updateVariantImage(vIdx, imgIdx, { file, image_url: file ? null : img.image_url });
                          }}
                          className="w-full px-3 py-3.5 bg-white border border-zinc-200 rounded-sm text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                            Primary
                          </label>
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

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#0B0B0B] disabled:opacity-40"
        >
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm disabled:opacity-50">
          {submitting ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
