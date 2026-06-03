import type { AdminConfigType, AdminProductFormInput } from '../api/adminProductService';
import type { Category, Product } from '../types/api';

export function normalizeAdminConfigType(type: string): AdminConfigType {
  if (type === 'size') return 'size';
  return 'custom';
}

export function emptyProductForm(categories: Category[]): AdminProductFormInput {
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
}

export function productToForm(product: Product): AdminProductFormInput {
  return {
    name: product.name ?? '',
    description: product.description ?? '',
    base_price: product.base_price ?? 0,
    category_id: product.category_id ?? '',
    base_image: product.base_image ?? null,
    base_image_file: null,
    static_configs: product.static_configs.map((s) => ({
      id: s.id,
      key: s.key,
      value: s.value,
    })),
    dynamic_configs: product.configs.map((c) => ({
      id: c.id,
      name: c.name,
      type: normalizeAdminConfigType(c.type),
      options: c.options.map((o) => ({
        id: o.id,
        value: o.value,
        price_modifier: o.price_modifier,
      })),
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      stock: v.stock,
      price_modifier: v.price_modifier,
      images: v.images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        file: null,
      })),
    })),
  };
}
