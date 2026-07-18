import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Coupon } from '../services/db';
import { getCoupons } from '../services/db';

export interface CartItem {
  product: Product;
  size: string;
  price: number;
  quantity: number;
  isSubscription?: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, price: number, quantity?: number, isSubscription?: boolean) => void;
  removeFromCart: (productId: string, size: string, isSubscription?: boolean) => void;
  updateQuantity: (productId: string, size: string, quantity: number, isSubscription?: boolean) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const freeShippingThreshold = 999;

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('amritbhoomi_cart');
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
  }, []);

  // Sync cart with LocalStorage on change
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('amritbhoomi_cart', JSON.stringify(items));
  };

  const addToCart = (product: Product, size: string, price: number, quantity = 1, isSubscription = false) => {
    const existingIdx = cartItems.findIndex(
      item => item.product.id === product.id && item.size === size && !!item.isSubscription === isSubscription
    );

    if (existingIdx !== -1) {
      const updated = [...cartItems];
      updated[existingIdx].quantity += quantity;
      saveCart(updated);
    } else {
      saveCart([...cartItems, { product, size, price, quantity, isSubscription }]);
    }
  };

  const removeFromCart = (productId: string, size: string, isSubscription = false) => {
    const updated = cartItems.filter(
      item => !(item.product.id === productId && item.size === size && !!item.isSubscription === isSubscription)
    );
    saveCart(updated);
  };

  const updateQuantity = (productId: string, size: string, quantity: number, isSubscription = false) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, isSubscription);
      return;
    }
    const updated = cartItems.map(item => {
      if (item.product.id === productId && item.size === size && !!item.isSubscription === isSubscription) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
  };

  // Coupon Logic
  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const coupons = await getCoupons();
      const match = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
      
      if (!match) {
        return { success: false, message: "Invalid or inactive coupon code." };
      }

      if (subtotal < match.minPurchase) {
        return { 
          success: false, 
          message: `Minimum purchase of ₹${match.minPurchase} required for this coupon.` 
        };
      }

      setCoupon(match);
      return { success: true, message: "Coupon applied successfully!" };
    } catch (e) {
      return { success: false, message: "Error validating coupon." };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Re-evaluate coupon if subtotal falls below minPurchase
  useEffect(() => {
    if (coupon && subtotal < coupon.minPurchase) {
      setCoupon(null);
    }
  }, [subtotal, coupon]);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.value / 100));
    } else {
      discountAmount = coupon.value;
    }
  }

  const shippingFee = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 99;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      coupon,
      applyCouponCode,
      removeCoupon,
      cartCount,
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      freeShippingThreshold
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
