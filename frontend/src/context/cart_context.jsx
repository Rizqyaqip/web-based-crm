import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ketsai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ketsai_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ketsai_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to sync cart to storage:', e);
    }
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        const newQty = Math.min(product.jumlahStok, currentQty + quantity);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }
      return [...prev, { ...product, quantity: Math.min(product.jumlahStok, quantity) }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.jumlahStok) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem('ketsai_cart');
    } catch {}
  }, []);

  const recordCheckoutSuccess = useCallback((orderData) => {
    setLatestOrder(orderData);
    try {
      sessionStorage.setItem('ketsai_last_order', JSON.stringify(orderData));
    } catch {}
    clearCart();
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
  }, [clearCart]);

  const totalItems = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.harga * item.quantity, 0),
    [cartItems]
  );

  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen,
      isCheckoutModalOpen,
      setIsCheckoutModalOpen,
      latestOrder,
      recordCheckoutSuccess
    }),
    [
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      isCheckoutModalOpen,
      latestOrder,
      recordCheckoutSuccess
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
