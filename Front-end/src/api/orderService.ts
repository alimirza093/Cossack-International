import type { ApiError, Order } from '../types/api';
import { apiFetch } from './client';

export interface CreateOrderPayload {
  cart_item_ids: string[];
}

export function createOrder(cartItemIds: string[]): Promise<Order> {
  return apiFetch<Order>(
    '/orders',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_item_ids: cartItemIds } satisfies CreateOrderPayload),
    },
    { auth: true }
  );
}

export function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/my', undefined, { auth: true });
}

export function getOrderById(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${orderId}`, undefined, { auth: true });
}

export function getOrderErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) {
    return 'Please sign in to access your orders.';
  }
  return error.message ?? 'Order request failed. Please try again.';
}
