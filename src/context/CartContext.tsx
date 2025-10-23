"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";

interface CartItem {
  id: string;
  name: string;
  image_url: string;
  price: number;
  final_price: number;
  quantity: number;
  stock: number;
  selectedVariants: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variants: Record<string, string>) => void;
  updateQuantity: (id: string, variants: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const initialized = useRef(false);

  // Load cart from localStorage on mount - only once
  useEffect(() => {
    if (!initialized.current) {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error loading cart:", error);
          localStorage.removeItem("cart");
        }
      }
      initialized.current = true;
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item with same id and variants already exists
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(newItem.selectedVariants)
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item, but don't exceed stock
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        const newQuantity = Math.min(
          currentItem.quantity + newItem.quantity,
          currentItem.stock
        );
        updatedItems[existingItemIndex].quantity = newQuantity;
        return updatedItems;
      } else {
        // Add new item, ensuring quantity doesn't exceed stock
        return [...prevItems, { ...newItem, quantity: Math.min(newItem.quantity, newItem.stock) }];
      }
    });
  };

  const removeFromCart = (id: string, variants: Record<string, string>) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.id === id && JSON.stringify(item.selectedVariants) === JSON.stringify(variants))
      )
    );
  };

  const updateQuantity = (id: string, variants: Record<string, string>, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, variants);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.final_price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
