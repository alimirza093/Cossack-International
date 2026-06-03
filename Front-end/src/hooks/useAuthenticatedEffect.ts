import { useEffect, type DependencyList } from 'react';
import { getAuthToken } from '../lib/authSession';
import { useAuth } from '../context/AuthContext';

/**
 * Runs an effect only after auth bootstrap completes and a valid session exists.
 */
export function useAuthenticatedEffect(
  effect: (isActive: () => boolean) => void | (() => void),
  deps: DependencyList
): void {
  const { isAuthReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated || !getAuthToken()) {
      return;
    }

    let active = true;
    const isActive = () => active;
    const cleanup = effect(isActive);

    return () => {
      active = false;
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps supplied by caller
  }, [isAuthReady, isAuthenticated, ...deps]);
}
