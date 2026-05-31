import type { Product } from '../types/api';
import { apiFetch } from './client';

export function fetchProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/user/products/');
}

export function fetchProductById(productId: string): Promise<Product> {
  return apiFetch<Product>(`/user/products/${productId}`);
}
