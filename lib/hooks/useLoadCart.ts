// lib/hooks/useLoadCart.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState, AppDispatch } from "@/lib/store";
import { initializeCart } from "@/lib/slices/cartSlice";

/**
 * Custom hook to load cart data on page load
 * - For logged in users: fetches from database
 * - For guest users: loads from localStorage
 */
export const useLoadCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const cartState = useSelector((state: RootState) => state.cart);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);

      try {
        if (status === "authenticated" && session?.user) {
          // Logged in user - fetch from database
          const response = await fetch("/api/cart/get");

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.data.length > 0) {
              // Convert database format to cart format
              const cartItems = data.data.map((item: any) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                thumbnail: item.thumbnail,
                quantity: item.quantity,
                selectedOption: item.selectedOption,
                slug: item.slug,
                brand: item.brand,
                category: item.category,
                stock: item.stock,
              }));

              // Calculate totals
              const totalItems = cartItems.reduce(
                (sum: number, item: any) => sum + item.quantity,
                0
              );
              const totalPrice = cartItems.reduce(
                (sum: number, item: any) => sum + item.price * item.quantity,
                0
              );

              dispatch(
                initializeCart({
                  items: cartItems,
                  totalItems,
                  totalPrice,
                  lastUpdated: Date.now(),
                })
              );
            }
          }
        } else if (status === "unauthenticated") {
          // Guest user - load from localStorage
          const stored = localStorage.getItem("guest_cart");

          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const now = Date.now();
              const twentyFourHours = 24 * 60 * 60 * 1000;

              // Check if cart is expired
              if (parsed.timestamp && now - parsed.timestamp > twentyFourHours) {
                localStorage.removeItem("guest_cart");
                dispatch(initializeCart(null));
              } else {
                // Calculate totals
                const totalItems = parsed.items.reduce(
                  (sum: number, item: any) => sum + item.quantity,
                  0
                );
                const totalPrice = parsed.items.reduce(
                  (sum: number, item: any) => sum + item.price * item.quantity,
                  0
                );

                dispatch(
                  initializeCart({
                    items: parsed.items,
                    totalItems,
                    totalPrice,
                    lastUpdated: parsed.timestamp,
                  })
                );
              }
            } catch (error) {
              console.error("Error parsing guest cart:", error);
              dispatch(initializeCart(null));
            }
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== "loading") {
      loadCart();
    }
  }, [status, session, dispatch]);

  return { isLoading };
};

import React from "react";