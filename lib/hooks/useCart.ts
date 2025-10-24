// lib/hooks/useCart.ts
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState, AppDispatch } from "@/lib/store";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  CartItem,
} from "@/lib/slices/cartSlice";
import { useState } from "react";
import { toast } from "sonner"; // ✨ NEW: Import toast for notifications

// Custom event to broadcast cart updates to all listeners
const dispatchCartUpdate = (totalItems: number) => {
  const event = new CustomEvent("cart-updated", {
    detail: { totalItems },
  });
  window.dispatchEvent(event);
};

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartState = useSelector((state: RootState) => state.cart);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Add to cart with database/localStorage support
  const addToCartHandler = async (
    product: Omit<CartItem, "quantity">,
    quantity?: number,
    selectedOption?: string
  ) => {
    const qty = quantity || 1;

    if (session?.user) {
      // Logged in user - save to database
      try {
        setIsLoading(true);
        const response = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product._id,
            quantity: qty,
            selectedOption,
          }),
        });

        const data = await response.json();

        // ✨ NEW: Handle duplicate item response
        if (data.isDuplicate) {
          // Show toast notification for duplicate item
          toast.info("You already added that item to cart", {
            description: "Update the quantity in your cart instead",
            duration: 4000,
          });
          return; // Exit early, don't update Redux or dispatch event
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to add to cart");
        }

        // Also update Redux for immediate UI update
        dispatch(addToCart({ product, quantity: qty, selectedOption }));

        // Dispatch custom event to update cart badge
        const newTotalItems = cartState.totalItems + qty;
        dispatchCartUpdate(newTotalItems);

        // Show success toast
        toast.success(`${product.name} added to cart!`, {
          duration: 3000,
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to add item to cart");
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest user - save to localStorage (with 24 hour expiry)
      try {
        const guestCart = getGuestCart();

        // ✨ NEW: Check if item already exists in guest cart
        const existingItem = guestCart.items.find(
          (item: CartItem) =>
            item._id === product._id &&
            (!selectedOption || item.selectedOption === selectedOption)
        );

        if (existingItem) {
          // ✨ NEW: Show toast notification for duplicate item
          toast.info("You already added that item to cart", {
            description: "Update the quantity in your cart instead",
            duration: 4000,
          });
          return; // Exit early, don't add item
        }

        // Item doesn't exist, add it to cart
        guestCart.items.push({
          ...product,
          quantity: qty,
          selectedOption,
        });

        // Save to localStorage with timestamp
        localStorage.setItem(
          "guest_cart",
          JSON.stringify({
            items: guestCart.items,
            timestamp: Date.now(),
          })
        );

        // Update Redux
        dispatch(addToCart({ product, quantity: qty, selectedOption }));

        // Dispatch custom event to update cart badge
        const newTotalItems = cartState.totalItems + qty;
        dispatchCartUpdate(newTotalItems);

        // Show success toast
        toast.success(`${product.name} added to cart!`, {
          duration: 3000,
        });
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        toast.error("Failed to add item to cart");
        throw error;
      }
    }
  };

  // Remove from cart with database/localStorage support
  const removeFromCartHandler = async (productId: string) => {
    const itemToRemove = cartState.items.find((item) => item._id === productId);
    const removedQuantity = itemToRemove?.quantity || 0;

    if (session?.user) {
      // Logged in user - remove from database
      try {
        setIsLoading(true);

        // Find cart item ID from current state
        const cartItem = cartState.items.find((item) => item._id === productId);
        if (!cartItem) return;

        const response = await fetch("/api/cart/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId: productId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to remove from cart");
        }

        // Update Redux
        dispatch(removeFromCart(productId));

        // Dispatch custom event to update cart badge
        const newTotalItems = cartState.totalItems - removedQuantity;
        dispatchCartUpdate(newTotalItems);
      } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest user - remove from localStorage
      const guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter((item: CartItem) => item._id !== productId);

      localStorage.setItem(
        "guest_cart",
        JSON.stringify({
          items: guestCart.items,
          timestamp: Date.now(),
        })
      );

      // Update Redux
      dispatch(removeFromCart(productId));

      // Dispatch custom event to update cart badge
      const newTotalItems = cartState.totalItems - removedQuantity;
      dispatchCartUpdate(newTotalItems);
    }
  };

  // Update quantity with database/localStorage support
  const updateQuantityHandler = async (
    productId: string,
    quantity: number
  ) => {
    const itemToUpdate = cartState.items.find((item) => item._id === productId);
    const oldQuantity = itemToUpdate?.quantity || 0;
    const quantityDifference = quantity - oldQuantity;

    if (session?.user) {
      // Logged in user - update in database
      try {
        setIsLoading(true);

        const response = await fetch("/api/cart/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItemId: productId,
            quantity,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to update quantity");
        }

        // Update Redux
        dispatch(updateQuantity({ productId, quantity }));

        // Dispatch custom event to update cart badge
        const newTotalItems = cartState.totalItems + quantityDifference;
        dispatchCartUpdate(newTotalItems);
      } catch (error) {
        console.error("Error updating quantity:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest user - update in localStorage
      const guestCart = getGuestCart();
      const item = guestCart.items.find((i: CartItem) => i._id === productId);

      if (item) {
        if (quantity <= 0) {
          guestCart.items = guestCart.items.filter((i: CartItem) => i._id !== productId);
        } else {
          item.quantity = quantity;
        }

        localStorage.setItem(
          "guest_cart",
          JSON.stringify({
            items: guestCart.items,
            timestamp: Date.now(),
          })
        );
      }

      // Update Redux
      dispatch(updateQuantity({ productId, quantity }));

      // Dispatch custom event to update cart badge
      const newTotalItems = cartState.totalItems + quantityDifference;
      dispatchCartUpdate(newTotalItems);
    }
  };

  // Helper function to get guest cart from localStorage
  const getGuestCart = () => {
    const stored = localStorage.getItem("guest_cart");
    if (!stored) return { items: [] };

    try {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      // Check if cart is expired
      if (parsed.timestamp && now - parsed.timestamp > twentyFourHours) {
        localStorage.removeItem("guest_cart");
        return { items: [] };
      }

      return parsed;
    } catch {
      return { items: [] };
    }
  };

  return {
    // State
    items: cartState.items,
    totalItems: cartState.totalItems,
    totalPrice: cartState.totalPrice,
    lastUpdated: cartState.lastUpdated,
    isLoading,

    // Actions
    addToCart: addToCartHandler,
    removeFromCart: removeFromCartHandler,
    updateQuantity: updateQuantityHandler,

    clearCart: () => {
      dispatch(clearCart());
      if (!session?.user) {
        localStorage.removeItem("guest_cart");
      }
      // Dispatch event for clear cart
      dispatchCartUpdate(0);
    },

    // Helper to get guest cart
    getGuestCart,
  };
};