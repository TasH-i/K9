// lib/hooks/useCart.ts
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  CartItem,
} from "@/lib/slices/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartState = useSelector((state: RootState) => state.cart);

  return {
    // State
    items: cartState.items,
    totalItems: cartState.totalItems,
    totalPrice: cartState.totalPrice,
    lastUpdated: cartState.lastUpdated,

    // Actions
    addToCart: (
      product: Omit<CartItem, "quantity">,
      quantity?: number,
      selectedOption?: string
    ) => {
      dispatch(addToCart({ product, quantity, selectedOption }));
    },

    removeFromCart: (productId: string) => {
      dispatch(removeFromCart(productId));
    },

    updateQuantity: (productId: string, quantity: number) => {
      dispatch(updateQuantity({ productId, quantity }));
    },

    clearCart: () => {
      dispatch(clearCart());
    },
  };
};