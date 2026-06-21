"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  storeId: string;
  storeName: string;
  itemId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (storeId: string, itemId: string) => void;
  updateQty: (storeId: string, itemId: string, qty: number) => void;
  clearCart: () => void;
  clearStore: (storeId: string) => void;
  totalItems: number;
  totalPrice: number;
  storeCount: number;
  getStoreItems: (storeId: string) => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((c) => c.storeId === item.storeId && c.itemId === item.itemId);
      if (existing) {
        return prev.map((c) =>
          c.storeId === item.storeId && c.itemId === item.itemId
            ? { ...c, qty: c.qty + 1 }
            : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((storeId: string, itemId: string) => {
    setItems((prev) => {
      const existing = prev.find((c) => c.storeId === storeId && c.itemId === itemId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter((c) => !(c.storeId === storeId && c.itemId === itemId));
      return prev.map((c) =>
        c.storeId === storeId && c.itemId === itemId ? { ...c, qty: c.qty - 1 } : c
      );
    });
  }, []);

  const updateQty = useCallback((storeId: string, itemId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((c) => !(c.storeId === storeId && c.itemId === itemId)));
      return;
    }
    setItems((prev) =>
      prev.map((c) =>
        c.storeId === storeId && c.itemId === itemId ? { ...c, qty } : c
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const clearStore = useCallback((storeId: string) => {
    setItems((prev) => prev.filter((c) => c.storeId !== storeId));
  }, []);

  const totalItems = items.reduce((sum, c) => sum + c.qty, 0);
  const totalPrice = items.reduce((sum, c) => sum + c.price * c.qty, 0);
  const storeCount = new Set(items.map((c) => c.storeId)).size;
  const getStoreItems = (storeId: string) => items.filter((c) => c.storeId === storeId);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        clearStore,
        totalItems,
        totalPrice,
        storeCount,
        getStoreItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
