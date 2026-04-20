import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { CartItem, Product } from '../types';
import { api } from './api';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Initial load
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const data = await api.get(`/cart/${user.id}`);
          setItems(data.items || []);
        } catch (error) {
          console.error("Error loading cart from API:", error);
        }
      } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setItems(JSON.parse(localCart));
        }
      }
    };
    loadCart();
  }, [user]);

  // Sync with storage
  const syncCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    if (user) {
      try {
        await api.post(`/cart/${user.id}`, { items: newItems });
      } catch (error) {
        console.error("Error syncing cart to API:", error);
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const addItem = (product: Product, quantity: number = 1, size?: string) => {
    const existingItem = items.find(item => item.productId === product.id && item.size === size);
    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map(item =>
        (item.productId === product.id && item.size === size)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...items, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        quantity,
        size
      }];
    }
    syncCart(newItems);
  };

  const removeItem = (productId: number) => {
    const newItems = items.filter(item => item.productId !== productId);
    syncCart(newItems);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const newItems = items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    syncCart(newItems);
  };

  const clearCart = () => {
    syncCart([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
