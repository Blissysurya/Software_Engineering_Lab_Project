import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], shop: null });

  const fetchCart = async () => {
    if (!user || user.role !== 'student') return;
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    setCart(data);
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await api.put('/cart/update', { productId, quantity });
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [], shop: null });
  };

  const total = cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const count = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, addToCart, updateItem, clearCart, total, count, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
