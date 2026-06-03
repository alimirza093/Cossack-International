import { getStoredToken } from './tokenStorage';

/** In-memory token mirror — updated by AuthContext so API calls never race localStorage. */
let sessionToken: string | null = getStoredToken();

export function setSessionToken(token: string | null): void {
  sessionToken = token;
}

export function getAuthToken(): string | null {
  if (sessionToken) return sessionToken;
  const stored = getStoredToken();
  if (stored) sessionToken = stored;
  return stored;
}
