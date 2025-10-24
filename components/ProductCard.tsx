// components/ProductCard-updated.tsx
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
    logo?: string;
    image: string;
    name: string;
    subtitle: string;
    price: string;
    type?: "horizontal" | "vertical";
    slug?: string;
    categoryName?: string;
    _id?: string;
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

export function ProductCardHorizontal({
    logo,
    image,
    name,
    subtitle,
    price,
    slug,
    categoryName,
    _id,
    productData,
}: ProductCardProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const handleBuyNow = () => {
        router.push(`/shop/${categoryName}/${slug}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();

        const cartItem = productData || {
            _id: _id || "",
            name,
            price: parseFloat(price.replace(/[^0-9.]/g, "")),
            thumbnail: image,
            brand: { name: categoryName || "Unknown" },
        };

        if (!cartItem._id) {
            toast.error("Unable to add item to cart");
            return;
        }

        addToCart(cartItem, 1);
        toast.success(`${name} added to cart!`, {
            icon: <ShoppingCart className="w-4 h-4" />,
        });
    };

    return (
        <div className="group w-full h-[270px] bg-white rounded shadow-md relative hover:shadow-lg transition-shadow">
            {logo && (
                <img src={logo} alt="" className="absolute left-6 top-4 h-[50px] object-contain" />
            )}

            <div className="absolute left-6 top-[82px] w-[262px]">
                <h3 className="font-noto-kr text-xl font-medium">{name}</h3>
                <p className="text-sm text-[#9299A5] mt-3.5 line-clamp-2">{subtitle}</p>
                <p className="text-lg font-medium mt-3.5">{price}</p>
            </div>

            {/* BUY NOW Button */}
            <button
                onClick={handleBuyNow}
                className="absolute cursor-pointer z-50 left-6 bottom-6 flex items-center justify-center rounded-md cursor-pointer
    bg-[#9A9A99]/40 text-white w-7 h-7 overflow-hidden transition-all duration-300 ease-in-out 
    group-hover:w-[110px] group-hover:bg-[var(--brand-pink)] hover:text-black"
            >
                <ChevronRight className="w-5 h-5 text-white transition-all duration-300 group-hover:opacity-0" />
                <span
                    className="absolute opacity-0 group-hover:opacity-100 text-xs font-medium transition-all duration-300 whitespace-nowrap"
                >
                    BUY NOW
                </span>
            </button>

            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCart}
                className="absolute right-4 top-4 w-9 h-9 rounded bg-[#FAFAFA] flex items-center justify-center p-2.5 cursor-pointer hover:bg-pink-50 transition-colors group/cart"
                title="Add to cart"
            >
                <ShoppingCart className="w-6 h-6 stroke-[#FF4D6D] group-hover/cart:fill-pink-100 transition-colors" />
            </button>

            <img
                src={image}
                alt={name}
                className="absolute right-[10px] top-[10px] md:top-[46px] w-[180px] h-[180px] object-contain"
            />
        </div>
    );
}

export function ProductCardVertical({
    logo,
    image,
    name,
    subtitle,
    price,
    slug,
    categoryName,
    _id,
    productData,
}: ProductCardProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const handleBuyNow = () => {
        router.push(`/shop/${categoryName}/${slug}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();

        const cartItem = productData || {
            _id: _id || "",
            name,
            price: parseFloat(price.replace(/[^0-9.]/g, "")),
            thumbnail: image,
            brand: { name: categoryName || "Unknown" },
        };

        if (!cartItem._id) {
            toast.error("Unable to add item to cart");
            return;
        }

        addToCart(cartItem, 1);
        toast.success(`${name} added to cart!`, {
            icon: <ShoppingCart className="w-4 h-4" />,
        });
    };

    return (
        <div className="group w-full md:w-[244px] h-[550px] bg-white rounded shadow-md relative hover:shadow-lg transition-shadow">
            {logo && (
                <img src={logo} alt="" className="absolute left-4 top-4 h-10 object-contain" />
            )}

            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCart}
                className="absolute right-4 top-4 w-9 h-9 rounded cursor-pointer bg-[#FAFAFA] flex items-center justify-center p-2.5 hover:bg-pink-50 transition-colors group/cart"
                title="Add to cart"
            >
                <ShoppingCart className="w-6 h-6 stroke-[#FF4D6D] group-hover/cart:fill-pink-100 transition-colors" />
            </button>

            <div className="absolute left-4 top-20 w-[212px]">
                <h3 className="font-noto-kr text-xl font-medium leading-8">{name}</h3>
                <p className="text-sm text-[#9299A5] mt-3.5 line-clamp-2">{subtitle}</p>
                <p className="text-lg font-medium mt-3.5">{price}</p>
            </div>

            <img src={image} alt={name} className="absolute left-[7px] top-[230px] w-[230px] h-[230px] object-contain" />

            {/* BUY NOW Button */}
            <button
                onClick={handleBuyNow}
                className="absolute left-6 bottom-6 flex cursor-pointer items-center justify-center rounded-md cursor-pointer
    bg-[#9A9A99]/40 text-white w-7 h-7 overflow-hidden transition-all duration-300 ease-in-out 
    group-hover:w-[110px] group-hover:bg-[var(--brand-pink)] hover:text-black"
            >
                <ChevronRight className="w-5 h-5 text-white transition-all duration-300 group-hover:opacity-0" />
                <span
                    className="absolute opacity-0 group-hover:opacity-100 text-xs font-medium transition-all duration-300 whitespace-nowrap"
                >
                    BUY NOW
                </span>
            </button>
        </div>
    );
}