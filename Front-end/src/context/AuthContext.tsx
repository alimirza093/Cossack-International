import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authService from '../api/authService';
import { mapAuthError } from '../api/authService';
import { setSessionToken } from '../lib/authSession';
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/tokenStorage';
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth';
import type { ApiError } from '../types/api';

interface AuthContextValue {
  user: AuthUser | null;
  /** True when a user profile is loaded and a token is stored. */
  isAuthenticated: boolean;
  /** False while restoring session from storage on mount. */
  isAuthReady: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncToken = useCallback((token: string | null) => {
    setAccessToken(token);
    setSessionToken(token);
    if (token) {
      setStoredToken(token);
    } else {
      clearStoredToken();
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      syncToken(null);
      return;
    }
    syncToken(token);
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
    } catch (err) {
      const error = err as ApiError;
      if (error.status === 401) {
        authService.logout();
        setUser(null);
        syncToken(null);
      }
      throw err;
    }
  }, [syncToken]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getStoredToken();
      if (!token) {
        syncToken(null);
        setIsLoading(false);
        return;
      }
      syncToken(token);
      try {
        await refreshUser();
      } catch (err) {
        const error = err as ApiError;
        if (error.status === 401) {
          authService.logout();
          setUser(null);
          syncToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshUser, syncToken]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await authService.login(input);
      syncToken(response.access_token);
      await refreshUser();
    },
    [refreshUser, syncToken]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const registeredUser = await authService.register(input);
      syncToken(getStoredToken());
      setUser(registeredUser);
    },
    [syncToken]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    syncToken(null);
  }, [syncToken]);

  const isAuthenticated = !!user && !!accessToken;
  const isAuthReady = !isLoading;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthReady,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isAuthenticated, isAuthReady, isLoading, login, register, logout, refreshUser, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function getAuthErrorMessage(err: unknown): string {
  return mapAuthError(err as ApiError).message;
}
