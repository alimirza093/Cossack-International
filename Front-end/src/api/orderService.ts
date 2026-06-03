import type { ApiError, Order } from '../types/api';
import { apiFetch } from './client';

export interface CreateOrderPayload {
  cart_item_ids: string[];
}

export function createOrder(cartItemIds: string[]): Promise<Order> {
  return apiFetch<Order>(
    '/order/',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_item_ids: cartItemIds } satisfies CreateOrderPayload),
    },
    { auth: true }
  );
}

export function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/order/my', undefined, { auth: true });
}

export function getOrderById(orderId: string): Promise<Order> {
  return apiFetch<Order>(`/order/${orderId}`, undefined, { auth: true });
}

export function getOrderErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) {
    return error.message && !error.message.startsWith('Request failed')
      ? error.message
      : 'Please sign in to access your orders.';
  }
  if (error.status === 403) {
    const msg = error.message.toLowerCase();
    if (msg.includes('admin')) {
      return 'Admin accounts cannot use customer orders. Sign in with a customer account.';
    }
    return error.message;
  }
  return error.message ?? 'Order request failed. Please try again.';
}
