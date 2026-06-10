import type { ApiError } from '../types/api';
import { getAuthToken } from '../lib/authSession';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

export interface ApiFetchOptions {
  auth?: boolean;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiFetchOptions
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (options?.auth) {
    const token = getAuthToken();
    if (!token) {
      const error: ApiError = {
        message: 'Please sign in to continue.',
        status: 401,
      };
      throw error;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch {
    const error: ApiError = {
      message: 'Unable to reach the server. Check that the API is running.',
    };
    throw error;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as {
        detail?: string | { msg?: string }[];
        message?: string;
        errors?: Record<string, string | string[]>;
      };
      if (typeof body.detail === 'string') {
        message = body.detail;
      } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
        message = body.detail[0].msg;
      } else if (body.errors && typeof body.errors === 'object') {
        const firstErrorKey = Object.keys(body.errors)[0];
        if (firstErrorKey) {
          const firstErrorVal = body.errors[firstErrorKey];
          if (Array.isArray(firstErrorVal) && firstErrorVal[0]) {
            message = firstErrorVal[0];
          } else if (typeof firstErrorVal === 'string') {
            message = firstErrorVal;
          }
        }
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      /* use default message */
    }

    // IMPORTANT:
    // Do NOT clear the token on every 401 automatically.
    // A 401 can be caused by transient backend issues, clock skew, proxy misrouting,
    // or an endpoint mismatch. Clearing storage immediately can create "login then instantly logout".
    if (response.status === 401 && options?.auth) {
      message = 'Your session has expired. Please sign in again.';
    }

    const error: ApiError = { message, status: response.status };
    throw error;
  }

  return response.json() as Promise<T>;
}
