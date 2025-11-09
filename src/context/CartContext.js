import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cartItems');
      if (cartData) {
        setCartItems(JSON.parse(cartData));
      }
    } catch (error) {
      console.log('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
      setCartItems(items);
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const productId = product.id || product.productId || product._id;
      const existingItemIndex = cartItems.findIndex(
        (item) => (item.id || item.productId || item._id) === productId
      );

      let updatedCart;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        const cartItem = {
          ...product,
          id: productId,
          quantity: quantity,
          addedAt: new Date().toISOString(),
        };
        updatedCart = [...cartItems, cartItem];
      }

      await saveCart(updatedCart);
      return { success: true, message: 'Product added to cart' };
    } catch (error) {
      console.log('Error adding to cart:', error);
      return { success: false, message: 'Failed to add product to cart' };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter(
        (item) => (item.id || item.productId || item._id) !== productId
      );
      await saveCart(updatedCart);
      return { success: true, message: 'Product removed from cart' };
    } catch (error) {
      console.log('Error removing from cart:', error);
      return { success: false, message: 'Failed to remove product from cart' };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return await removeFromCart(productId);
      }

      const updatedCart = cartItems.map((item) => {
        if ((item.id || item.productId || item._id) === productId) {
          return { ...item, quantity };
        }
        return item;
      });

      await saveCart(updatedCart);
      return { success: true, message: 'Quantity updated' };
    } catch (error) {
      console.log('Error updating quantity:', error);
      return { success: false, message: 'Failed to update quantity' };
    }
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem('cartItems');
      setCartItems([]);
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      console.log('Error clearing cart:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  const parsePrice = (price) => {
    if (typeof price === 'number') {
      return isNaN(price) ? 0 : price;
    }
    if (typeof price === 'string') {
      // Remove currency symbols, commas, and other non-numeric characters except decimal point
      const cleaned = price.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parsePrice(item.price || item.pricePerUnit || 0);
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.length;
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

