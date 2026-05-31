import type { ApiError } from '../types/api';
import type { AuthUser, LoginInput, LoginResponse, RegisterInput, RegisterResponse } from '../types/auth';
import { apiFetch } from './client';
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/tokenStorage';

export function getToken(): string | null {
  return getStoredToken();
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const payload = {
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    email: input.email.trim(),
    password: input.password,
  };

  await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  await login({ email: input.email, password: input.password });

  const phone = input.phone_number?.trim();
  const address = input.address?.trim();

  if (phone || address) {
    await updateProfile({
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone_number: phone ?? '',
      address: address ?? '',
    });
  }

  return getCurrentUser();
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
    }),
  });

  setStoredToken(response.access_token);
  return response;
}

export function logout(): void {
  clearStoredToken();
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me', undefined, { auth: true });
}

export async function updateProfile(data: {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
}): Promise<AuthUser> {
  return apiFetch<AuthUser>(
    '/users/profile',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    { auth: true }
  );
}

export function mapAuthError(err: unknown): ApiError {
  const error = err as ApiError;
  if (error.status === 401) {
    return { message: 'Your session has expired. Please sign in again.', status: 401 };
  }
  if (error.status === 400 && error.message.toLowerCase().includes('email')) {
    return { message: 'This email is already registered.', status: 400 };
  }
  if (error.status === 400 && error.message.toLowerCase().includes('credential')) {
    return { message: 'Invalid email or password.', status: 400 };
  }
  return error;
}
