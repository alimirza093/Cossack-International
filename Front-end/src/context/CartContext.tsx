import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addToCart,
  clearCart as clearCartApi,
  getCart,
  removeItem as removeItemApi,
  updateQuantity as updateQuantityApi,
  type AddToCartPayload,
} from '../api/cartService';
import { useAuth } from './AuthContext';
import type { Cart } from '../types/api';

interface CartContextValue {
  cart: Cart | null;
  cartCount: number;
  cartTotal: number;
  isCartLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function createEmptyCart(): Cart {
  return {
    user_id: '',
    grand_total: 0,
    items: [],
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    if (user?.role != "admin"){
        setIsCartLoading(true);
        try {
            const data = await getCart();
            setCart(data);
        } finally {
            setIsCartLoading(false);
        }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    void refreshCart();
  }, [isAuthenticated, isAuthLoading, refreshCart]);

  const addItem = useCallback(
    async (payload: AddToCartPayload) => {
      await addToCart(payload);
      await refreshCart();
    },
    [refreshCart]
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const previous = cart;
      setCart((current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  item_total: toNumber(item.final_price) * quantity,
                }
              : item
          ),
        };
      });

      try {
        await updateQuantityApi(itemId, { quantity });
        await refreshCart();
      } catch (error) {
        setCart(previous);
        throw error;
      }
    },
    [cart, refreshCart]
  );

  const removeCartItem = useCallback(
    async (itemId: string) => {
      const previous = cart;
      setCart((current) => {
        if (!current) return current;
        const nextItems = current.items.filter((item) => item.id !== itemId);
        return {
          ...current,
          items: nextItems,
          grand_total: nextItems.reduce((sum, item) => sum + toNumber(item.item_total), 0),
        };
      });

      try {
        await removeItemApi(itemId);
        await refreshCart();
      } catch (error) {
        setCart(previous);
        throw error;
      }
    },
    [cart, refreshCart]
  );

  const clearCart = useCallback(async () => {
    const previous = cart;
    setCart((current) => (current ? { ...current, grand_total: 0, items: [] } : createEmptyCart()));
    try {
      await clearCartApi();
      await refreshCart();
    } catch (error) {
      setCart(previous);
      throw error;
    }
  }, [cart, refreshCart]);

  const resolvedCart = isAuthenticated ? cart : null;
  const cartCount = useMemo(
    () => (resolvedCart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    [resolvedCart]
  );

  const cartTotal = useMemo(() => toNumber(resolvedCart?.grand_total), [resolvedCart]);

  const value = useMemo(
    () => ({
      cart: resolvedCart,
      cartCount,
      cartTotal,
      isCartLoading,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeCartItem,
      clearCart,
    }),
    [resolvedCart, cartCount, cartTotal, isCartLoading, refreshCart, addItem, updateItemQuantity, removeCartItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
