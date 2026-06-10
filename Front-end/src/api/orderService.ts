import type { ApiError, Order } from '../types/api';
import { apiFetch } from './client';

export interface CreateOrderPayload {
  cart_item_ids: string[];
  delivery_address: string;
}

export async function createOrder(cartItemIds: string[], deliveryAddress: string): Promise<Order> {
  const response = await apiFetch<{ data: Order }>(
    '/order',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart_item_ids: cartItemIds,
        delivery_address: deliveryAddress.trim(),
      } satisfies CreateOrderPayload),
    },
    { auth: true }
  );
  return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await apiFetch<{ data: Order[] }>('/order/my', undefined, { auth: true });
  return response.data;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const response = await apiFetch<{ data: Order }>(`/order/${orderId}`, undefined, { auth: true });
  return response.data;
}

export function getOrderErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 400 || error.status === 422) {
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('delivery address')) {
      return 'Delivery address is required.';
    }
    return error.message ?? 'Could not place order. Please check your details.';
  }
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
