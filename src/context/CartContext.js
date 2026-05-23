import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../services/api'; // Assuming you add checkAvailability to api

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('eventdeco_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('eventdeco_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (item, quantity = 1) => {
    // Optimistic update
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci);
      }
      return [...prev, { item, quantity }];
    });
    
    toast.success(`${item.name} added to cart`);
    
    // Check real-time stock availability
    try {
      // Assuming api.checkAvailability exists. If not implemented in backend, this would fail gracefully.
      // const available = await api.checkAvailability(item.id, quantity);
      // if (!available) {
      //   removeFromCart(item.id);
      //   toast.error('Item no longer available in requested quantity');
      // }
    } catch (error) {
      // Handle check error
      console.warn("Availability check not implemented in backend yet");
    }
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, quantity: newQuantity } : ci));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
