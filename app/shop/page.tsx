"use client"
import { useState, useMemo, useCallback, useEffect } from "react";
import CouponCard from "@/components/CouponCard";
import { FilterSidebar } from "@/components/Products/FilterSidebar";
import BackButton from "@/components/ui/BackButton";
import { X, Funnel } from "lucide-react";

interface Product {
    _id?: string;
    name: string;
    image: string;
    thumbnail?: string;
    price: number;
    originalPrice?: number;
    category: string;
    brand: string;
    rating?: number;
    reviewCount?: number;
    stock?: number;
    inStock?: boolean;
    slug?: string;
    isCouponDeal?: boolean;
    isTodayDeal?: boolean;
    isFeatured?: boolean;
    isComingSoon?: boolean;
}

export default function Shop() {
    const [filters, setFilters] = useState({
        availability: ["all products"],
        categories: [] as string[],
        brands: [] as string[],
        maxPrice: 1500000
    });

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [highestProductPrice, setHighestProductPrice] = useState(1500000);

    // Fetch products from API with filters
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query parameters
                const params = new URLSearchParams();
                params.append('limit', '100'); // Get more products for client-side filtering

                // Add availability filters if not "all products"
                if (filters.availability.length > 0 && !filters.availability.includes("all products")) {
                    params.append('availability', filters.availability.join(','));
                }

                // Add category filters - using singular 'category' parameter
                if (filters.categories.length > 0) {
                    params.append('category', filters.categories.join(','));
                }

                // Add brand filters - using singular 'brand' parameter
                if (filters.brands.length > 0) {
                    params.append('brand', filters.brands.join(','));
                }

                // Add price filter
                if (filters.maxPrice < 1500000) {
                    params.append('maxPrice', filters.maxPrice.toString());
                }

                const response = await fetch(`/api/products?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();

                if (data.success && data.data) {
                    // Transform API data to match component expectations
                    const transformedProducts = data.data.map((product: any) => ({
                        _id: product._id,
                        name: product.name,
                        image: product.thumbnail || product.image || '/placeholder.png',
                        price: product.price || 0,
                        originalPrice: product.originalPrice || product.price || 0,
                        category: product.category?.name || 'General',
                        brand: product.brand?.name || 'Unknown',
                        rating: product.rating || 0,
                        reviewCount: product.reviewCount || 0,
                        stock: product.stock || 0,
                        inStock: (product.stock || 0) > 0,
                        slug: product.slug,
                        isCouponDeal: product.isCouponDeal || false,
                        isTodayDeal: product.isTodayDeal || false,
                        isFeatured: product.isFeatured || false,
                        isComingSoon: product.isComingSoon || false,
                    }));

                    setProducts(transformedProducts);

                    // Calculate highest price for filter
                    if (transformedProducts.length > 0) {
                        const maxPrice = Math.max(
                            ...transformedProducts.map((p: Product) => p.originalPrice || p.price || 0)
                        );
                        setHighestProductPrice(Math.ceil(maxPrice * 1.1)); // Add 10% buffer
                    }
                } else {
                    setProducts([]);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch products');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters]);

    // Format price to LKR string
    const formatPrice = (price: number) => {
        return `LKR ${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    };

    // Transform products for CouponCard (format prices as strings)
    const formattedProducts = products.map(product => ({
        ...product,
        price: formatPrice(product.price),
        oldPrice: product.originalPrice
            ? formatPrice(product.originalPrice)
            : formatPrice(product.price),
        categoryName: product.category,
        brandName: product.brand,
        priceValue: product.price,
    }));

    const handleFilterChange = useCallback((newFilters: {
        availability: string[];
        categories: string[];
        brands: string[];
        maxPrice: number;
    }) => {
        setFilters(newFilters);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-screen px-4 sm:px-6 lg:px-11 py-4 ">
                <div className="flex justify-between pb-6 ">
                    <BackButton />

                    {/* Mobile/Tablet Filter Button */}
                    <div className="lg:hidden mt-4 mb-6">
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="w-fit cursor-pointer  h-12 px-4 flex items-center justify-center gap-2 rounded border border-[#FF4D6D] bg-white shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <Funnel className="w-5 h-5 text-[#FF4D6D]" />
                            <span className="text-[#FF4D6D] text-sm font-medium uppercase">Filters</span>
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Filter Modal */}
                {isMobileFilterOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-black/30 bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)}>
                        <div
                            className="absolute right-0 top-0 h-full w-fit max-w-md bg-white shadow-xl overflow-y-auto px-4 md:px-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer "
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <FilterSidebar
                                    onFilterChange={handleFilterChange}
                                    highestProductPrice={highestProductPrice}
                                />
                            </div>
                            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-full h-12 px-3 flex items-center cursor-pointer  justify-center rounded bg-[#FF4D6D] text-white font-medium uppercase shadow-md hover:bg-[#e63d5d] transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:py-6">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block">
                        <FilterSidebar
                            onFilterChange={handleFilterChange}
                            highestProductPrice={highestProductPrice}
                        />
                    </div>

                    <div className="w-px bg-[#D5D5D5] hidden lg:block" />

                    <div className="flex-1">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-3">
                                <div className="w-full h-px bg-[#D5D5D5]" />

                                <div className="flex items-center gap-6">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 16L7 20L11 16" stroke="#9299A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M7 20V4" stroke="#9299A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M11 4H21" stroke="#9299A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M11 8H18" stroke="#9299A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M11 12H15" stroke="#9299A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <h1 className="font-noto-kr text-base font-medium text-secondary">
                                        All Products ({formattedProducts.length})
                                    </h1>
                                </div>

                                <div className="w-full h-px bg-[#D5D5D5]" />
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4D6D]" />
                                        <p className="text-gray-500 mt-4">Loading products...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !loading && (
                                <div className="text-center py-12">
                                    <p className="text-red-500 text-lg">Error loading products: {error}</p>
                                </div>
                            )}

                            {/* No Products State */}
                            {!loading && !error && formattedProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">
                                        {products.length === 0
                                            ? 'No products available.'
                                            : 'No products found matching your filters.'}
                                    </p>
                                </div>
                            )}

                            {/* Products Grid */}
                            {!loading && !error && formattedProducts.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 lg:gap-7">
                                    {formattedProducts.map((deal, index) => (
                                        <div key={deal._id || index} className="flex-shrink-0 max-w-[240px]">
                                            <CouponCard
                                                _id={deal._id}
                                                name={deal.name}
                                                image={deal.image}
                                                price={deal.price}
                                                oldPrice={deal.oldPrice}
                                                categoryName={deal.categoryName || "General"}
                                                slug={deal.slug}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}