"use client";

import { useState, useEffect } from "react";
import { Heart, Share2, ChevronDown, Book, Star, ChevronUp, Check } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/hooks/useCart";
import { toast } from "sonner";

interface ProductAttribute {
    name: string;
    value: string;
}

interface ProductOption {
    name: string;
    values: string[];
}

interface ProductBrand {
    _id: string;
    name: string;
    image: string;
}

interface ProductCategory {
    _id: string;
    name: string;
}

interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    oldPrice: number;
    sku: string;
    stock: number;
    brand: ProductBrand;
    category: ProductCategory;
    thumbnail: string;
    images: string[];
    attributes: ProductAttribute[];
    options: ProductOption[];
    rating: number;
    reviewCount: number;
    isActive: boolean;
    isFeatured: boolean;
    isTodayDeal: boolean;
    isComingSoon: boolean;
    isCouponDeal: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Review {
    _id: string;
    rating: number;
    title?: string;
    reviewText: string;
    userName: string;
    userAvatar?: string;
    userEmail?: string;
    productVariant?: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
        profilePicture?: string;
    };
}

interface RatingBreakdown {
    stars: number;
    percentage: number;
    count: number;
}

interface ReviewData {
    reviews: Review[];
    totalReviews: number;
    averageRating: number;
    ratingBreakdown: RatingBreakdown[];
}

type Coupon = {
    code: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountPercentageValue: number;
};


// const reviews = [
//     {
//         id: 1,
//         userName: "John Tyler",
//         userAvatar:
//             "https://api.builder.io/api/v1/image/assets/TEMP/adc02b7f9a41bd15cfece7a649589c4bd40dd651?width=86",
//         rating: 5,
//         date: "June 19, 2025",
//         productVariant: "128GB",
//         reviewText:
//             "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
//     {
//         id: 2,
//         userName: "John Tyler",
//         userAvatar:
//             "https://api.builder.io/api/v1/image/assets/TEMP/adc02b7f9a41bd15cfece7a649589c4bd40dd651?width=86",
//         rating: 5,
//         date: "August 19, 2025",
//         productVariant: "64GB",
//         reviewText:
//             "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//     },
// ];

// const ratingBreakdown = [
//     { stars: 5, percentage: 60, width: "60%" },
//     { stars: 4, percentage: 20, width: "20%" },
//     { stars: 3, percentage: 10, width: "10%" },
//     { stars: 2, percentage: 5, width: "5%" },
//     { stars: 1, percentage: 5, width: "5%" },
// ];

interface ProductDetailsProps {
    product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const { data: session } = useSession();
    const { addToCart } = useCart();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedOption, setSelectedOption] = useState(product.options?.[0]?.values?.[0] || "");
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState<ReviewData | null>(null);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [reviewError, setReviewError] = useState("");
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const productImages = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
    
    const handleAddToCart = async () => {
        try {
            await addToCart(product, quantity, selectedOption);

            // The hook itself shows toast success/info for add/duplicate,
            // so you don’t need to add another success toast here.
            // Only catch errors explicitly:
        } catch (error) {
            console.error("Add to cart failed:", error);
            toast.error("Failed to add item to cart");
        }
    };

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setReviewLoading(true);
                const response = await fetch(`/api/reviews?productId=${product._id}&limit=100`);
                const data = await response.json();

                if (data.success) {
                    setReviewData(data.data);
                } else {
                    setReviewError(data.error || "Failed to load reviews");
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setReviewError("Failed to load reviews");
            } finally {
                setReviewLoading(false);
            }
        };

        fetchReviews();
    }, [product._id]);

   // Handle Apply Coupon - Validate with Backend
    const handleApplyCoupon = async () => {
        setCouponError("");
        setAppliedCoupon(null);

        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }

        setIsValidatingCoupon(true);

        try {
            // Call backend to validate coupon
            const response = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    couponCode: couponCode.toUpperCase(),
                    productId: product._id,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setCouponError(data.error || "Invalid coupon code");
                return;
            }

            // Coupon is valid and applicable
            setAppliedCoupon(data.data);
            setCouponCode("");
            toast.success("Coupon applied successfully!", { duration: 2000 });
        } catch (error) {
            console.error("Error validating coupon:", error);
            setCouponError("Failed to validate coupon");
        } finally {
            setIsValidatingCoupon(false);
        }
    };

     // Calculate discounted price
    const calculateDiscountedPrice = (): number => {
        if (!appliedCoupon) return product.price;

        if (appliedCoupon.discountType === "percentage") {
            return product.price * (1 - appliedCoupon.discountPercentageValue / 100);
        } else {
            // Fixed discount
            return Math.max(0, product.price - appliedCoupon.discountValue);
        }
    };

    // Get discount display text
    const getDiscountDisplay = (): string => {
        if (!appliedCoupon) return "";

        if (appliedCoupon.discountType === "percentage") {
            return `${appliedCoupon.discountPercentageValue}%`;
        } else {
            return `LKR ${appliedCoupon.discountValue}`;
        }
    };

    // dynamically create specifications
    const specifications =
        product.attributes && product.attributes.length > 0
            ? product.attributes.map((attr) => ({
                label: attr.name,
                value: attr.value,
                label2: "",
                value2: "",
            }))
            : [
                { label: "Brand", value: product.brand.name, label2: "Category", value2: product.category.name },
                { label: "SKU", value: product.sku, label2: "Stock", value2: product.stock.toString() },
            ];

    const handleReviewAdded = () => {
        // Refetch reviews
        const fetchReviews = async () => {
            try {
                const response = await fetch(`/api/reviews?productId=${product._id}&limit=100`);
                const data = await response.json();

                if (data.success) {
                    setReviewData(data.data);
                    setShowAllReviews(false); // Scroll to reviews
                }
            } catch (error) {
                console.error("Error refetching reviews:", error);
            }
        };

        fetchReviews();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Image Gallery and Product Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-12">
                    {/* Image Gallery */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Thumbnail Images */}
                        <div className="flex sm:flex-col gap-2 sm:gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible pb-8">
                            {productImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 border-2 rounded ${selectedImage === idx ? "border-brand-pink" : "border-gray-200"
                                        }`}
                                >
                                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover rounded" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="flex-1 order-1 sm:order-2 pb-8">
                            <img
                                src={productImages[selectedImage]}
                                alt="Main product"
                                className="w-full h-auto max-h-74 sm:max-h-80 lg:max-h-96 object-contain bg-gray-50 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6 lg:space-y-4">
                        {/* Brand and Actions */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col items-start gap-2 sm:gap-3">
                                <img src={product.brand.image} alt={product.brand.name} className="h-12 sm:h-16 " />
                                <span className="text-xs sm:text-sm text-brand-gray underline cursor-pointer mt-4">
                                    Show All {product.brand.name} products
                                </span>
                            </div>
                            <div className="flex gap-4 sm:gap-6">
                                <button className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded">
                                    <Heart className="w-6 h-6 text-brand-pink" />
                                </button>
                                <button className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded">
                                    <Share2 className="w-6 h-6 text-brand-pink" />
                                </button>
                            </div>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-2xl sm:text-3xl lg:text-3xl py-2 sm:py-4 font-semibold text-gray-900">{product.name}</h1>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {product.stock ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-brand-green flex items-center justify-center">
                                        <Check className="w-3 h-3 text-brand-green" />
                                    </div>
                                    <span className="font-noto-sans text-md lg:text-sm text-brand-green font-medium">
                                        In Stock
                                    </span>
                                </div>
                            ) : (
                                <span className="text-sm font-medium text-red-500">Out of Stock</span>
                            )}
                        </div>

                        {/* Price Section */}
                         <div className="space-y-2 border-b border-gray-300 pb-3 sm:pb-4">
                            <div className="flex items-baseline gap-3">
                                {appliedCoupon ? (
                                    <>
                                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                            {process.env.NEXT_PUBLIC_CURRENCY} {calculateDiscountedPrice().toFixed(2)}
                                        </span>
                                        <span className="text-lg sm:text-xl text-red-500 line-through font-medium">
                                            {process.env.NEXT_PUBLIC_CURRENCY} {product.price}
                                        </span>
                                        <span className="text-sm sm:text-base font-semibold text-green-600">
                                            Save {getDiscountDisplay()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">{process.env.NEXT_PUBLIC_CURRENCY} {product.price}</span>
                                        {product.oldPrice && (
                                            <span className="text-lg sm:text-xl text-red-500 line-through font-medium">
                                                {process.env.NEXT_PUBLIC_CURRENCY} {product.oldPrice}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                            {appliedCoupon && (
                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                                    <Check className="w-4 h-4" />
                                    <span className="font-medium">Coupon {appliedCoupon.code} applied - You save {getDiscountDisplay()}!</span>
                                </div>
                            )}
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(product.rating) ? "fill-brand-yellow text-brand-yellow" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-blue-600 underline hover:text-blue-700 cursor-pointer transition-colors">
                                {product.reviewCount} product reviews
                            </span>
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-start gap-2 text-xs sm:text-sm text-brand-gray">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="flex-shrink-0 mt-0.5">
                                <rect width="16" height="16" fill="url(#pattern0_1329_4609)" />
                                <defs>
                                    <pattern id="pattern0_1329_4609" patternContentUnits="objectBoundingBox" width="1" height="1">
                                        <use xlinkHref="#image0_1329_4609" transform="scale(0.00195312)" />
                                    </pattern>
                                    <image id="image0_1329_4609" width="512" height="512" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAACAKADAAQAAAABAAACAAAAAAAL+LWFAAA+nElEQVR4Ae3dB7hsRZnu8QaJkqNkDnLIGQRFclCJjuMIohLUR2ZMYEL0quNGEUHGgDKOgDJ6lHsR0FEykoMEyUg+5CA55+h939P0OXtvdujdvWqtCv96nm/H7gq/qtVdvUKtVouEAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggECXAv8fgMFaZ0hFj2MAAAAASUVORK5CYII=" />
                                </defs>
                            </svg>
                            <span>Delivery - Standard 3 To 5 Working Days</span>
                        </div>

                        {/* Coupon Code Section - Only visible if product isCoupunDeal true */}
                        {product.isCouponDeal && (
                            <div className="space-y-3 border-t border-gray-300 pt-4 sm:pt-6">
                                <label className="block text-sm font-medium text-gray-900">
                                    Enter Your Coupon Code Here
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => {
                                            setCouponCode(e.target.value.toUpperCase());
                                            setCouponError("");
                                        }}
                                        disabled={isValidatingCoupon}
                                        placeholder="ABCD1234"
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded font-medium text-sm placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink disabled:opacity-50"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isValidatingCoupon}
                                        className="px-4 py-2.5 bg-brand-pink text-white rounded font-medium text-sm hover:scale-105 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isValidatingCoupon ? "Checking..." : "Apply"}
                                    </button>
                                </div>
                                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                                {appliedCoupon && (
                                    <div className="bg-green-50 border border-green-200 rounded p-3">
                                        <p className="text-xs font-semibold text-green-700">
                                            ✓ Coupon Applied: {appliedCoupon.code}
                                        </p>
                                        <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Options and Quantity */}
                        <div className="space-y-8 md:space-y-4 pt-2 sm:pt-4">
                            {product.options && product.options.length > 0 && product.options[0]?.values?.length > 0 && (

                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Select Your Preferred Option
                                </label>
                            )}
                            <div className="flex mt-4 flex-row justify-between gap-4 ">
                                {/* Select Option */}
                                <div className="flex-1">

                                    {product.options && product.options.length > 0 && product.options[0]?.values?.length > 0 && (
                                        <div className="relative w-fit">
                                            <select
                                                value={selectedOption}
                                                onChange={(e) => setSelectedOption(e.target.value)}
                                                className="w-full cursor-pointer h-10 px-8 md:px-16 border border-black rounded font-semibold text-sm appearance-none bg-white pr-10"
                                            >
                                                {product.options[0].values.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
                                        </div>
                                    )}

                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-end sm:items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 cursor-pointer flex items-center justify-center bg-gray-100 rounded text-md font-semibold"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 h-8 flex items-center justify-center bg-brand-pink/10 rounded text-md font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 cursor-pointer flex items-center justify-center bg-brand-pink text-white rounded text-md font-semibold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button onClick={handleAddToCart} className="flex-1 h-11 cursor-pointer py-2 md:h-12 bg-white border-2 border-brand-pink text-brand-pink rounded font-medium hover:bg-pink-50 transition-colors hover:scale-105 transition-transform text-sm sm:text-base">
                                    Add to Cart
                                </button>
                                <button className="flex-1 h-11 cursor-pointer py-2 md:h-12 bg-brand-pink text-white rounded font-medium hover:scale-105 transition-transform text-sm sm:text-base">
                                    Buy now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="space-y-4 md:space-y-6 mt-18 md:mt-0">
                    {/* Tab Buttons */}
                    <div className="flex flex-row items-stretch sm:items-center gap-3 smd:gap-6">
                        <button
                            onClick={() => setActiveTab("description")}
                            className={`flex items-center cursor-pointer justify-center sm:justify-start md:gap-2 px-3 py-3 bg-black/10 rounded-md transition-colors ${activeTab === "description"
                                ? "bg-brand-pink/30"
                                : "bg-transparent"
                                }`}
                        >
                            <Book className={`w-5 h-5 ${activeTab === "description" ? "text-black" : "text-brand-gray"}`} />
                            <span className={`font-normal text-sm sm:text-base ${activeTab === "description" ? "text-black" : "text-brand-gray"}`}>
                                Products Description
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`flex items-center cursor-pointer justify-center sm:justify-start md:gap-2 px-3 py-3 bg-black/10 rounded-md transition-colors ${activeTab === "reviews"
                                ? "bg-brand-pink/30"
                                : "bg-transparent"
                                }`}
                        >
                            <Star className={`w-5 h-5 ${activeTab === "reviews" ? "text-black" : "text-brand-gray"}`} />
                            <span className={`font-normal text-sm sm:text-base ${activeTab === "reviews" ? "text-black" : "text-brand-gray"}`}>
                                Product Reviews
                            </span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white p-4 sm:p-6 lg:px-8 rounded-lg">
                        {activeTab === "description" && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="space-y-3 sm:space-y-4">
                                    {specifications.map((spec, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div className="flex gap-2">
                                                    <span className="font-medium text-gray-900 text-sm">{spec.label}:</span>
                                                    <span className="text-gray-700 text-sm">{spec.value}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="font-medium text-gray-900 text-sm">{spec.label2}:</span>
                                                    <span className="text-gray-700 text-sm">{spec.value2}</span>
                                                </div>
                                            </div>
                                            {idx < specifications.length - 1 && <div className="h-px bg-gray-200" />}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-md border border-gray-100 p-3 sm:p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 sm:gap-4 items-start">
                                        <h3 className="font-semibold text-gray-900 text-sm">Description</h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-8">
                                {reviewLoading ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">Loading reviews...</p>
                                    </div>
                                ) : reviewError ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-500">{reviewError}</p>
                                    </div>
                                ) : !reviewData || reviewData.reviews.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600 mb-4">No reviews yet</p>
                                        <button
                                            onClick={() => {
                                                if (session) {
                                                    setReviewModalOpen(true);
                                                } else {
                                                    alert("Please log in to write a review");
                                                }
                                            }}
                                            className="px-6 py-2 bg-brand-pink text-white rounded font-medium hover:bg-pink-700 transition-colors"
                                        >
                                            Be the first to review
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Rating Summary */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Left: Rating Overview */}
                                            <div className="lg:col-span-1 space-y-6">
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl font-bold">{reviewData.averageRating}</span>
                                                        <span className="text-gray-600">out of 5</span>
                                                    </div>
                                                    <div className="flex mt-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className="w-5 h-5 sm:w-6 sm:h-6 fill-brand-yellow text-brand-yellow"
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-lg font-semibold mt-2">
                                                        {reviewData.totalReviews} Reviews
                                                    </p>
                                                </div>

                                                <div className="h-px bg-gray-200" />

                                                {/* Rating Breakdown */}
                                                <div className="space-y-3">
                                                    {reviewData.ratingBreakdown.map((item) => (
                                                        <div key={item.stars} className="flex items-center gap-2 sm:gap-3">
                                                            <div className="flex items-center gap-1 sm:gap-2 min-w-[2rem]">
                                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-brand-yellow" />
                                                                <span className="text-xs">{item.stars}</span>
                                                            </div>
                                                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-orange-400 rounded-full"
                                                                    style={{ width: `${item.percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs min-w-[3rem] text-right">
                                                                {item.percentage}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => setReviewModalOpen(true)}
                                                    className="w-full h-10 mt-4 border border-brand-pink text-brand-pink rounded font-medium hover:bg-pink-50 transition-colors uppercase text-xs sm:text-sm"
                                                >
                                                    Write a review
                                                </button>
                                            </div>

                                            {/* Right: Reviews List */}
                                            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                                                {reviewData.reviews.slice(0, 2).map((review) => (
                                                    <div key={review._id} className="space-y-3 sm:space-y-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex gap-3 sm:gap-4">
                                                                <img
                                                                    src={
                                                                        review.userAvatar ||
                                                                        review.user?.profilePicture ||
                                                                        "/placeholder.png"
                                                                    }
                                                                    alt={review.userName || review.user?.name || "User"}
                                                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover flex-shrink-0"
                                                                />

                                                                <div>
                                                                    <h4 className="font-semibold text-xs">{review.userName}</h4>
                                                                    <div className="flex mt-1">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating
                                                                                    ? "fill-brand-yellow text-brand-yellow"
                                                                                    : "text-gray-300"
                                                                                    }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-600 flex-shrink-0">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                        </div>

                                                        {review.title && (
                                                            <h5 className="font-semibold text-sm">{review.title}</h5>
                                                        )}

                                                        {review.productVariant && (
                                                            <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                                                <span className="capitalize truncate">{product.name}</span>
                                                                <div className="w-px h-4 sm:h-5 bg-brand-gray flex-shrink-0" />
                                                                <span className="flex-shrink-0">{review.productVariant}</span>
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-brand-dark-gray leading-5 sm:leading-6">
                                                            {review.reviewText}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Expanded Reviews */}
                                        {showAllReviews && reviewData.reviews.length > 2 && (
                                            <div className="mt-8 sm:mt-10 space-y-8 sm:space-y-12 border-t pt-8">
                                                {reviewData.reviews.slice(2).map((review) => (
                                                    <div key={review._id} className="space-y-3 sm:space-y-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex gap-3 sm:gap-4">
                                                                <img
                                                                    src={
                                                                        review.userAvatar ||
                                                                        review.user?.profilePicture ||
                                                                        "/placeholder.png"
                                                                    }
                                                                    alt={review.userName || review.user?.name || "User"}
                                                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover flex-shrink-0"
                                                                />

                                                                <div>
                                                                    <h4 className="font-semibold text-xs">{review.userName}</h4>
                                                                    <div className="flex mt-1">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating
                                                                                    ? "fill-brand-yellow text-brand-yellow"
                                                                                    : "text-gray-300"
                                                                                    }`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-600 flex-shrink-0">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                        </div>

                                                        {review.title && (
                                                            <h5 className="font-semibold text-sm">{review.title}</h5>
                                                        )}

                                                        {review.productVariant && (
                                                            <div className="flex items-center gap-2 sm:gap-3 text-xs">
                                                                <span className="capitalize truncate">{product.name}</span>
                                                                <div className="w-px h-4 sm:h-5 bg-brand-gray flex-shrink-0" />
                                                                <span className="flex-shrink-0">{review.productVariant}</span>
                                                            </div>
                                                        )}

                                                        <p className="text-xs text-brand-dark-gray leading-5 sm:leading-6">
                                                            {review.reviewText}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* View More / View Less Button */}
                                        {reviewData.reviews.length > 2 && (
                                            <button
                                                onClick={() => setShowAllReviews(!showAllReviews)}
                                                className="flex items-center gap-2 sm:gap-3 ml-auto text-xs font-semibold py-4 sm:py-6 cursor-pointer"
                                            >
                                                {showAllReviews ? "View Less" : "View More"}
                                                {showAllReviews ? (
                                                    <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                                                )}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                productId={product._id}
                productName={product.name}
                onReviewAdded={handleReviewAdded}
            />
        </div>

    );
}

// Export the current product to be used by RelatedProducts
// export const getproduct = () => products[0];