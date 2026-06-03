import type { ApiError } from '../types/api';
import type { AuthUser } from '../types/auth';
import { apiFetch } from './client';

export interface ProfileUpdateInput {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}

export function getProfile(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/users/profile', undefined, { auth: true });
}

export function updateProfile(input: ProfileUpdateInput): Promise<AuthUser> {
  return apiFetch<AuthUser>(
    '/users/profile',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    { auth: true }
  );
}

export function getProfileErrorMessage(err: unknown): string {
  const error = err as ApiError;
  if (error.status === 401) return 'Please sign in to access your profile.';
  return error.message ?? 'Profile request failed. Please try again.';
}

