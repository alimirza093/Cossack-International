import type { ApiError } from '../types/api';
import { apiFetch } from './client';

export interface CartSelectedOption {
  config_id: string;
  option_id: string;
}

export interface AddToCartPayload {
  product_id: string;
  variant_id: string;
  selected_options: CartSelectedOption[];
  quantity: number;
}

export interface AddToCartResponse {
  message: string;
  grand_total: string | number;
  cart_id: string;
}

export function addToCart(payload: AddToCartPayload): Promise<AddToCartResponse> {
  return apiFetch<AddToCartResponse>(
    '/cart/add',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { auth: true }
  );
}

export function getCartErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) {
    return 'Please sign in to add items to your cart.';
  }
  return error.message ?? 'Could not add to cart. Please try again.';
}
