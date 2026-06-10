import type { ApiError, Product } from '../types/api';
import { fetchProductById } from './products';
import { apiFetch } from './client';

export interface AdminStaticConfigInput {
  id?: string;
  key: string;
  value: string;
}

export type AdminConfigType = 'size' | 'custom';

export interface AdminConfigOptionInput {
  id?: string;
  value: string;
  price_modifier: string | number;
}

export interface AdminDynamicConfigInput {
  id?: string;
  name: string;
  type: AdminConfigType;
  options: AdminConfigOptionInput[];
}

export interface AdminVariantImageInput {
  id?: string;
  image_url: string | null;
  is_primary: boolean;
  file?: File | null;
}

export interface AdminVariantInput {
  id?: string;
  color: string;
  stock: number;
  price_modifier: string | number;
  images: AdminVariantImageInput[];
}

export interface AdminProductFormInput {
  name: string;
  description: string;
  base_price: number | string;
  category_id: string;
  base_image: string | null;
  base_image_file?: File | null;
  static_configs: AdminStaticConfigInput[];
  dynamic_configs: AdminDynamicConfigInput[];
  variants: AdminVariantInput[];
}

function hasAnyUpload(input: AdminProductFormInput): boolean {
  if (input.base_image_file) return true;
  for (const v of input.variants) {
    for (const img of v.images) {
      if (img.file) return true;
    }
  }
  return false;
}

function mapVariantImages(variant: AdminVariantInput): Array<{ image_url: string | null; is_primary: boolean; id?: string }> {
  return variant.images
    .filter((img) => Boolean(img.file) || Boolean(img.image_url))
    .map((img) => ({
      id: img.id,
      image_url: img.file ? null : img.image_url,
      is_primary: img.is_primary,
    }));
}

function toProductFullCreatePayload(input: AdminProductFormInput): unknown {
  return {
    name: input.name,
    description: input.description,
    base_price: input.base_price,
    category_id: input.category_id,
    base_image: input.base_image,
    static_configs: input.static_configs.map(({ key, value }) => ({ key, value })),
    dynamic_configs: input.dynamic_configs.map((cfg) => ({
      name: cfg.name,
      type: cfg.type,
      options: cfg.options.map((opt) => ({
        value: opt.value,
        price_modifier: opt.price_modifier,
      })),
    })),
    variants: input.variants.map((variant) => ({
      color: variant.color,
      stock: variant.stock,
      price_modifier: variant.price_modifier,
      images: mapVariantImages(variant).map(({ image_url, is_primary }) => ({
        image_url,
        is_primary,
      })),
    })),
  };
}

function toProductUpdatePayload(input: AdminProductFormInput): unknown {
  return {
    name: input.name,
    description: input.description,
    base_price: input.base_price,
    category_id: input.category_id,
    base_image: input.base_image,
    static_configs: input.static_configs.map((cfg) => ({
      id: cfg.id,
      key: cfg.key,
      value: cfg.value,
    })),
    dynamic_configs: input.dynamic_configs.map((cfg) => ({
      id: cfg.id,
      name: cfg.name,
      type: cfg.type,
      options: cfg.options.map((opt) => ({
        id: opt.id,
        value: opt.value,
        price_modifier: opt.price_modifier,
      })),
    })),
    variants: input.variants.map((variant) => ({
      id: variant.id,
      color: variant.color,
      stock: variant.stock,
      price_modifier: variant.price_modifier,
      images: mapVariantImages(variant),
    })),
  };
}

function toMultipartBody(input: AdminProductFormInput, mode: 'create' | 'update'): FormData {
  const form = new FormData();
  const payload = mode === 'create' ? toProductFullCreatePayload(input) : toProductUpdatePayload(input);
  form.append('data', JSON.stringify(payload));

  if (input.base_image_file) {
    form.append('base_image', input.base_image_file);
  }

  for (const variant of input.variants) {
    for (const img of variant.images) {
      if (img.file) {
        form.append('variant_images[]', img.file);
      }
    }
  }

  return form;
}

function buildRequestInit(
  input: AdminProductFormInput,
  method: 'POST' | 'PUT',
  mode: 'create' | 'update'
): RequestInit {
  if (hasAnyUpload(input)) {
    const body = toMultipartBody(input, mode);
    if (method === 'PUT') {
      body.append('_method', 'PUT');
      return { method: 'POST', body };
    }
    return { method, body };
  }
  const body =
    mode === 'create'
      ? JSON.stringify(toProductFullCreatePayload(input))
      : JSON.stringify(toProductUpdatePayload(input));
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  };
}

export function listAdminProducts(isDeleted = false): Promise<Product[]> {
  const query = `?is_deleted=${encodeURIComponent(String(isDeleted))}`;
  return apiFetch<Product[]>(`/admin/products/${query}`, undefined, { auth: true });
}

export function getAdminProduct(productId: string): Promise<Product> {
  return fetchProductById(productId);
}

export function createProductFull(input: AdminProductFormInput): Promise<Product> {
  return apiFetch<Product>('/admin/products/full', buildRequestInit(input, 'POST', 'create'), { auth: true });
}

export function updateProductFull(productId: string, input: AdminProductFormInput): Promise<Product> {
  return apiFetch<Product>(
    `/admin/products/${productId}`,
    buildRequestInit(input, 'PUT', 'update'),
    { auth: true }
  );
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

/** @deprecated Use AdminProductFormInput */
export type AdminProductFullInput = AdminProductFormInput;
