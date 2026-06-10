import type { ApiError, Order, OrderStatus } from '../types/api';
import { apiFetch } from './client';

export async function getAllOrders(): Promise<Order[]> {
  const response = await apiFetch<{ data: Order[] }>('/admin/order', undefined, { auth: true });
  return response.data;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orders = await getAllOrders();
  return orders.find((order) => order.id === orderId) ?? null;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export async function updateOrderStatus(orderId: string, input: UpdateOrderStatusInput): Promise<Order> {
  const response = await apiFetch<{ data: Order }>(
    `/admin/order/${orderId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    { auth: true }
  );
  return response.data;
}

export function getAdminOrderErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) return 'Please sign in to manage orders.';
  if (error.status === 403) return 'Admin privileges are required.';
  return error.message ?? 'Order request failed.';
}

