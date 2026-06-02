import type { ApiError } from '../types/api';
import { apiFetch } from './client';
import type { Cart } from '../types/api';

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

export interface UpdateQuantityPayload {
  quantity: number;
}

export interface UpdateQuantityResponse {
  message: string;
  cart_item_id: string;
  quantity: number;
  item_total: string | number;
  grand_total: string | number;
}

export interface RemoveItemResponse {
  message: string;
  grand_total: string | number;
}

export interface ClearCartResponse {
  message: string;
  grand_total: string | number;
}

export function getCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart', undefined, { auth: true });
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

export function updateQuantity(
  itemId: string,
  payload: UpdateQuantityPayload
): Promise<UpdateQuantityResponse> {
  return apiFetch<UpdateQuantityResponse>(
    `/cart/items/${itemId}/quantity`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { auth: true }
  );
}

export function removeItem(itemId: string): Promise<RemoveItemResponse> {
  return apiFetch<RemoveItemResponse>(
    `/cart/items/${itemId}`,
    { method: 'DELETE' },
    { auth: true }
  );
}

export function clearCart(): Promise<ClearCartResponse> {
  return apiFetch<ClearCartResponse>(
    '/cart/clear',
    { method: 'DELETE' },
    { auth: true }
  );
}

export function getCartErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) {
    return 'Please sign in to manage your cart.';
  }
  return error.message ?? 'Could not add to cart. Please try again.';
}
