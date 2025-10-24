// lib/slices/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  thumbnail: string;
  quantity: number;
  selectedOption?: string;
  slug?: string;
  brand?: {
    name: string;
  };
  category?: {
    name: string;
  };
  stock?: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: number;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  lastUpdated: Date.now(),
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (
      state,
      action: PayloadAction<{
        product: Omit<CartItem, "quantity">;
        quantity?: number;
        selectedOption?: string;
      }>
    ) => {
      const { product, quantity = 1, selectedOption } = action.payload;

      const existingItem = state.items.find(
        (item) =>
          item._id === product._id &&
          (!selectedOption || item.selectedOption === selectedOption)
      );

      if (existingItem) {
        // Increase quantity if item already exists
        existingItem.quantity += quantity;
        // Cap at available stock
        if (existingItem.stock && existingItem.quantity > existingItem.stock) {
          existingItem.quantity = existingItem.stock;
        }
      } else {
        // Add new item
        state.items.push({
          ...product,
          quantity,
          selectedOption,
        });
      }

      // Update totals and timestamp
      const { totalItems, totalPrice } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      state.lastUpdated = Date.now();
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);

      const { totalItems, totalPrice } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      state.lastUpdated = Date.now();
    },

    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item._id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((item) => item._id !== productId);
        } else {
          // Cap at available stock
          if (item.stock && quantity > item.stock) {
            item.quantity = item.stock;
          } else {
            item.quantity = quantity;
          }
        }
      }

      const { totalItems, totalPrice } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      state.lastUpdated = Date.now();
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.lastUpdated = Date.now();
    },

    // Sync cart from localStorage (for when user logs in)
    syncCart: (state, action: PayloadAction<CartState>) => {
      const receivedCart = action.payload;
      const timeDiff = Date.now() - receivedCart.lastUpdated;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // Only restore if cart is less than 24 hours old
      if (timeDiff < twentyFourHours) {
        state.items = receivedCart.items;
        state.totalItems = receivedCart.totalItems;
        state.totalPrice = receivedCart.totalPrice;
        state.lastUpdated = receivedCart.lastUpdated;
      } else {
        // Clear old cart
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.lastUpdated = Date.now();
      }
    },

    // Initialize cart (called on app load)
    initializeCart: (state, action: PayloadAction<CartState | null>) => {
      if (action.payload) {
        const receivedCart = action.payload;
        const timeDiff = Date.now() - receivedCart.lastUpdated;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (timeDiff < twentyFourHours) {
          state.items = receivedCart.items;
          state.totalItems = receivedCart.totalItems;
          state.totalPrice = receivedCart.totalPrice;
          state.lastUpdated = receivedCart.lastUpdated;
        }
      }
    },

    // Batch update cart items (useful for syncing from server)
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      const { totalItems, totalPrice } = calculateTotals(state.items);
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
      state.lastUpdated = Date.now();
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  syncCart,
  initializeCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;