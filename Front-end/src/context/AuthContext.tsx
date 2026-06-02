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
import { getStoredToken } from '../lib/tokenStorage';
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth';
import type { ApiError } from '../types/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    const current = await authService.getCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch (err) {
        // Only clear stored auth when we are confident the token is invalid.
        // Otherwise keep token (prevents "login then instantly cleared" if backend hiccups).
        const error = err as ApiError;
        if (error.status === 401) {
          authService.logout();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    await authService.login(input);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (input: RegisterInput) => {
    const registeredUser = await authService.register(input);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
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
