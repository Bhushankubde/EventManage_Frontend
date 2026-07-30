import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getCart();
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
    }
  };

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (!fetchedRef.current) {
        fetchedRef.current = true;
        fetchCart();
      }
    } else {
      fetchedRef.current = false;
      setCart([]);
    }
  }, [isAuthenticated]);

  // Listen to WebSocket inventory updates dynamically to sync cart item stocks
  useEffect(() => {
    const handleInventoryUpdate = (e) => {
      const { itemId, availableQuantity } = e.detail;
      setCart(prevCart => 
        prevCart.map(ci => {
          if (ci.item && ci.item.id === itemId) {
            const updatedItem = { ...ci.item, stock: availableQuantity };
            const updatedQty = Math.min(ci.quantity, availableQuantity > 0 ? availableQuantity : 1);
            return { ...ci, item: updatedItem, quantity: updatedQty };
          }
          return ci;
        })
      );
    };

    window.addEventListener('inventory-update', handleInventoryUpdate);
    return () => window.removeEventListener('inventory-update', handleInventoryUpdate);
  }, []);

  const addToCart = async (item, quantity = 1, eventDate = null, selectedPackage = null, notes = null) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your booking cart.');
      navigate('/login');
      return;
    }

    try {
      const requestData = {
        itemId: item.id,
        quantity,
        eventDate,
        selectedPackage,
        notes
      };
      await api.addToCart(requestData);
      toast.success(`${item.name} added to booking cart!`);
      await fetchCart();
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.removeCartItem(cartItemId);
      toast.success('Item removed from cart');
      await fetchCart();
    } catch (error) {
      toast.error(error.message || 'Failed to remove item from cart');
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.updateCartItemQuantity(cartItemId, newQuantity);
      await fetchCart();
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart([]);
    } catch (error) {
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
