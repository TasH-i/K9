// components/Cart/CartItemCard.tsx
'use client';

import { useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/slices/cartSlice';
import { useCart } from '@/lib/hooks/useCart';
import Image from 'next/image';

interface CartItemCardProps {
  item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeFromCart(item._id);
    }, 300);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && (!item.stock || newQuantity <= item.stock)) {
      updateQuantity(item._id, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div
      className={`flex gap-4 p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 ${
        isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Product Image */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-full object-contain p-2"
        />
        {item.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Name and Brand */}
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
            {item.name}
          </h3>
          {item.brand && (
            <p className="text-xs text-gray-500">{item.brand.name}</p>
          )}
          {item.category && (
            <p className="text-xs text-gray-400">{item.category.name}</p>
          )}
        </div>

        {/* Option Display */}
        {item.selectedOption && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600 font-medium">Option:</span>
            <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded border border-pink-200">
              {item.selectedOption}
            </span>
          </div>
        )}

        {/* Price and Quantity Row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </span>
            <span className="text-xs text-gray-500">
              {formatPrice(item.price)} each
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1 || item.stock === 0}
                className="p-1 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Decrease quantity"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>

              <span className="w-8 text-center font-semibold text-sm">
                {item.quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={
                  !item.stock ||
                  item.quantity >= item.stock ||
                  item.stock === 0
                }
                className="p-1 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}