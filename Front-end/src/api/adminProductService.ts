import type { ApiError, Product } from '../types/api';
import { apiFetch } from './client';

export interface AdminStaticConfigInput {
  key: string;
  value: string;
}

export type AdminConfigType = 'size' | 'custom';

export interface AdminConfigOptionInput {
  value: string;
  price_modifier: string | number;
}

export interface AdminDynamicConfigInput {
  name: string;
  type: AdminConfigType;
  options: AdminConfigOptionInput[];
}

export interface AdminVariantImageInput {
  image_url: string | null;
  is_primary: boolean;
  file?: File | null;
}

export interface AdminVariantInput {
  color: string;
  stock: number;
  price_modifier: string | number;
  images: AdminVariantImageInput[];
}

export interface AdminProductFullInput {
  name: string;
  description: string;
  base_price: string | number;
  category_id: string;
  base_image: string | null;
  base_image_file?: File | null;
  static_configs: AdminStaticConfigInput[];
  dynamic_configs: AdminDynamicConfigInput[];
  variants: AdminVariantInput[];
}

function hasAnyUpload(input: AdminProductFullInput): boolean {
  if (input.base_image_file) return true;
  for (const v of input.variants) {
    for (const img of v.images) {
      if (img.file) return true;
    }
  }
  return false;
}

function toProductFullCreatePayload(input: AdminProductFullInput): unknown {
  // Backend expects `selected` image_url=null when uploading.
  const payload = {
    name: input.name,
    description: input.description,
    base_price: input.base_price,
    category_id: input.category_id,
    base_image: input.base_image,
    static_configs: input.static_configs,
    dynamic_configs: input.dynamic_configs,
    variants: input.variants.map((variant) => ({
      color: variant.color,
      stock: variant.stock,
      price_modifier: variant.price_modifier,
      images: variant.images
        .filter((img) => Boolean(img.file) || Boolean(img.image_url))
        .map((img) => ({
          image_url: img.file ? null : img.image_url,
          is_primary: img.is_primary,
        })),
    })),
  };
  return payload;
}

function toMultipartBody(input: AdminProductFullInput): FormData {
  const form = new FormData();

  const payload = toProductFullCreatePayload(input);
  form.append('data', JSON.stringify(payload));

  if (input.base_image_file) {
    form.append('base_image', input.base_image_file);
  }

  // Files must be in the same order the backend consumes them:
  // iterate variants in the payload order, then images within each variant.
  for (const variant of input.variants) {
    for (const img of variant.images) {
      if (img.file) {
        form.append('variant_images', img.file);
      }
    }
  }

  return form;
}

export function listAdminProducts(isDeleted = false): Promise<Product[]> {
  const query = `?is_deleted=${encodeURIComponent(String(isDeleted))}`;
  return apiFetch<Product[]>(`/admin/products/${query}`, undefined, { auth: true });
}

export function createProductFull(input: AdminProductFullInput): Promise<Product> {
  const body = hasAnyUpload(input) ? toMultipartBody(input) : JSON.stringify(toProductFullCreatePayload(input));
  const init: RequestInit = hasAnyUpload(input)
    ? { method: 'POST', body }
    : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      };
  return apiFetch<Product>('/admin/products/full', init, { auth: true });
}

export function updateProductFull(productId: string, input: AdminProductFullInput): Promise<Product> {
  const body = hasAnyUpload(input) ? toMultipartBody(input) : JSON.stringify(toProductFullCreatePayload(input));
  const init: RequestInit = hasAnyUpload(input)
    ? { method: 'PUT', body }
    : {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      };
  return apiFetch<Product>(`/admin/products/${productId}`, init, { auth: true });
}

export function softDeleteProduct(productId: string): Promise<{ detail: string }> {
  return apiFetch<{ detail: string }>(`/admin/products/${productId}`, { method: 'DELETE' }, { auth: true });
}

export function restoreProduct(productId: string): Promise<Product> {
  return apiFetch<Product>(`/admin/products/${productId}/restore`, { method: 'POST' }, { auth: true });
}

export function getAdminProductErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) return 'Please sign in to manage products.';
  return error.message ?? 'Product request failed.';
}

