import type { ApiError, Order, OrderStatus } from '../types/api';
import { apiFetch } from './client';

export function getAllOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/admin/order/', undefined, { auth: true });
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orders = await getAllOrders();
  return orders.find((order) => order.id === orderId) ?? null;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export function updateOrderStatus(orderId: string, input: UpdateOrderStatusInput): Promise<Order> {
  return apiFetch<Order>(
    `/admin/order/${orderId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    { auth: true }
  );
}

export function getAdminOrderErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) return 'Please sign in to manage orders.';
  if (error.status === 403) return 'Admin privileges are required.';
  return error.message ?? 'Order request failed.';
}

