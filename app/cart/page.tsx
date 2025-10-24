// app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingCart, ArrowLeft, Trash2, Heart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import CartItemCard from '@/components/cart/CartItemCard';
import BackButton from '@/components/ui/BackButton';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const estimateShipping = () => {
    return 500; // LKR
  };

  const tax = totalPrice * 0.05; // 5% tax
  const shipping = estimateShipping();
  const finalTotal = totalPrice + tax + shipping;

  const handleCheckout = () => {
    if (!session) {
      toast.error('Please log in to proceed with checkout');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    // TODO: Implement checkout flow
    toast.success('Proceeding to checkout...');
    setTimeout(() => {
      setIsCheckingOut(false);
      router.push('/checkout');
    }, 1000);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-brand-pink" />
              Shopping Cart
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Clear Cart</span>
            </button>
          )}
        </div>

        {/* Empty Cart State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-center">
              Looks like you haven't added any items yet. Start shopping to fill up your cart!
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="px-8 py-3 bg-gradient-to-r from-brand-pink to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cart Items ({totalItems})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItemCard key={item._id} item={item} />
                  ))}
                </div>
              </div>

              {/* Continue Shopping Button */}
              <button
                onClick={() => router.push('/shop')}
                className="w-full px-4 py-3 border-2 border-brand-pink text-brand-pink rounded-lg font-semibold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </button>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-20 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

                {/* Summary Details */}
                <div className="space-y-3 border-b border-gray-200 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(tax)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-brand-pink">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-brand-pink to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                {/* Login Prompt */}
                {!session && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Sign in to checkout</span>
                      <br />
                      Log in to complete your purchase and track your orders.
                    </p>
                    <button
                      onClick={() => router.push('/login')}
                      className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <p>✓ Free returns within 30 days</p>
                  <p>✓ Secure checkout</p>
                  <p>✓ Fast delivery</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}