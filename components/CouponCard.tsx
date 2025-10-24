// components/CouponCard-updated.tsx
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { toast } from "sonner";

interface CouponCardProps {
    name: string;
    image: string;
    price: string;
    oldPrice: string;
    categoryName: string;
    slug?: string;
    _id?: string; // Product ID for add to cart
    productData?: {
        _id: string;
        name: string;
        price: number;
        thumbnail: string;
        brand?: { name: string };
        category?: { name: string };
        stock?: number;
    };
}

export default function CouponCard({
    name,
    image,
    price,
    oldPrice,
    categoryName,
    slug,
    _id,
    productData,
}: CouponCardProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const handleView = () => {
        router.push(`/shop/${categoryName}/${slug}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Use productData if provided, otherwise construct from props
        const cartItem = productData || {
            _id: _id || "",
            name,
            price: parseFloat(price.replace(/[^0-9.]/g, "")),
            thumbnail: image,
            brand: { name: categoryName },
        };

        if (!cartItem._id) {
            toast.error("Unable to add item to cart");
            return;
        }

        try {
            addToCart(cartItem, 1);
            // toast.success(`${name} added to cart!`, {
            //     icon: <ShoppingCart className="w-4 h-4" />,
            // });
        } catch (error) {
            toast.error("Failed to add item to cart");
        }
    };

    return (
        <div className="group h-[298px] bg-white rounded shadow-md relative overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Name */}
            <h3 className="absolute left-4 top-4 font-noto-kr text-sm w-[calc(100%-32px)] sm:w-[208px] leading-tight z-10">
                {name}
            </h3>

            {/* Product Image - Constrained */}
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-[60px] sm:translate-x-0 top-[60px] w-32 h-32 flex items-center justify-center">
                <Image
                    src={image}
                    alt={name}
                    width={120}
                    height={120}
                    className="object-contain max-w-full max-h-full transition-transform duration-500 ease-in-out group-hover:scale-115"
                />
            </div>

            {/* Price Section - Fixed Position */}
            <div className="absolute left-4 top-[204px] flex items-center gap-2 z-20">
                <span className="text-base font-medium">{price}</span>
                <span className="text-[10px] font-medium text-[#9299A5] line-through">{oldPrice}</span>
            </div>

            {/* Buttons Section */}
            <div className="absolute left-4 right-4 sm:right-auto bottom-6 flex items-center gap-4 sm:w-[208px] text-white hover:text-black z-20">
                <button
                    onClick={handleView}
                    className="flex-1 h-6 bg-[#FF4D6D] cursor-pointer rounded flex items-center justify-center hover:bg-pink-700 transition-colors"
                >
                    <span className="text-[10px] font-medium uppercase">View</span>
                </button>
                <button
                    onClick={handleAddToCart}
                    className="hidden lg:flex flex-1 h-6 cursor-pointer border border-[#FF4D6D] rounded flex items-center justify-center text-[#FF4D6D] hover:bg-[#FF4D6D] hover:text-white transition-colors"
                >
                    <span className="text-[10px] font-medium uppercase">Add to cart</span>
                </button>
                <button
                    onClick={handleAddToCart}
                    className="lg:hidden flex-1 h-6 cursor-pointer rounded flex items-center justify-end text-[#FF4D6D] hover:text-black transition-colors"
                    title="Add to cart"
                >
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}