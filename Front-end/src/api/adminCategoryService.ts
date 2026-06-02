import type { ApiError, Category } from '../types/api';
import { apiFetch } from './client';

export interface CategoryCreateInput {
  name: string;
}

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories/', undefined, { auth: true });
}

export function createCategory(input: CategoryCreateInput): Promise<{ message: string; category: Category }> {
  return apiFetch<{ message: string; category: Category }>(
    '/categories/post-category',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    { auth: true }
  );
}

export function updateCategory(categoryId: string, input: CategoryCreateInput): Promise<{ message: string; category: Category }> {
  return apiFetch<{ message: string; category: Category }>(
    `/categories/update-category/${categoryId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    { auth: true }
  );
}

export function deleteCategory(categoryId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/delete-category/${categoryId}`, { method: 'DELETE' }, { auth: true });
}

export function getAdminCategoryErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) return 'Please sign in to manage categories.';
  if (error.status === 403) return 'Admin privileges are required.';
  return error.message ?? 'Category request failed.';
}

