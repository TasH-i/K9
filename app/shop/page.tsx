"use client"
import { useState, useMemo, useCallback } from "react";
import CouponCard from "@/components/CouponCard";
import { FilterSidebar } from "@/components/Products/FilterSidebar";
import BackButton from "@/components/ui/BackButton";
import { X, Funnel } from "lucide-react";

export default function Shop() {
  const [filters, setFilters] = useState({
    availability: ["all products"],
    categories: [] as string[],
    brands: [] as string[],
    maxPrice: 1500000
  });
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const products = [
    {
        name: "Axxen U3 Ultra Micro SD Card",
        image: "/coupondeal/deal1.png",
        price: "LKR 1,617.00",
        oldPrice: "LKR 2,000.00",
        priceValue: 1617,
        categoryName: "Electronics",
        brandName: "Axxen",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.5,
        reviewCount: 229,
        stock: 20,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Color", value: "Black", label2: "Model", value2: "XYZ-123" },
            { label: "Capacity", value: "64GB", label2: "Speed Class", value2: "U3" },
            { label: "Interface", value: "SD", label2: "Max Speed", value2: "100MB/s" },
        ],
        galleryImages: [
            "https://api.builder.io/api/v1/image/assets/TEMP/ada6fb48659a43c87b26b7782ed28ba03e0b5931?width=800",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["64GB", "128GB", "256GB", "small", "medium", "large", "x-large"],
        availability: ["In Stock", "offers", "pre-order"],
        couponId: 1
    },
    {
        name: "Cordway USB Type-C to 3.5mm",
        image: "/coupondeal/deal2.png",
        price: "LKR 2,100.00",
        oldPrice: "LKR 3,200.00",
        priceValue: 2100,
        categoryName: "Baby Products",
        brandName: "Freelife",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.5,
        reviewCount: 12,
        stock: 20,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Color", value: "Silver", label2: "Model", value2: "USB-C-350" },
            { label: "Cable Length", value: "1.2m", label2: "Connector", value2: "Type-C" },
            { label: "Audio Jack", value: "3.5mm", label2: "Material", value2: "Aluminum" },
        ],
        galleryImages: [
            "/coupondeal/deal2.png",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["Silver", "Black", "Gold", "small", "medium", "large"],
        availability: ["In Stock", "offers"],
    },
    {
        name: "Mirum Lifting RF Galvanic Facial Massager",
        image: "/coupondeal/deal3.png",
        price: "LKR 7,100.00",
        oldPrice: "LKR 9,000.00",
        priceValue: 7100,
        categoryName: "Personal care",
        brandName: "Mirum",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.8,
        reviewCount: 156,
        stock: 15,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Color", value: "White", label2: "Model", value2: "RF-GF-200" },
            { label: "Power", value: "USB Rechargeable", label2: "Battery", value2: "Li-ion" },
            { label: "Modes", value: "5", label2: "Weight", value2: "180g" },
        ],
        galleryImages: [
            "/coupondeal/deal3.png",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["White", "Pink", "Blue"],
        availability: ["In Stock", "offers"],
    },
    {
        name: "Mamconi Portable Milk Pot",
        image: "/coupondeal/deal4.png",
        price: "LKR 17,000.00",
        oldPrice: "LKR 21,000.00",
        priceValue: 17000,
        categoryName: "Baby products",
        brandName: "Mamconi",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.7,
        reviewCount: 89,
        stock: 10,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Color", value: "Pink", label2: "Model", value2: "MP-2024" },
            { label: "Capacity", value: "500ml", label2: "Material", value2: "Stainless Steel" },
            { label: "Power", value: "220V", label2: "Auto Shutoff", value2: "Yes" },
        ],
        galleryImages: [
            "/coupondeal/deal4.png",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["Pink", "Blue", "White", "500ml", "750ml"],
        availability: ["In Stock", "offers"],
    },
    {
        name: "Icebubble Braun Shaver Liquid",
        image: "/coupondeal/deal5.png",
        price: "LKR 5,100.00",
        oldPrice: "LKR 6,000.00",
        priceValue: 5100,
        categoryName: "Personal care",
        brandName: "Icebubble",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.6,
        reviewCount: 203,
        stock: 30,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Volume", value: "300ml", label2: "Model", value2: "IB-SL-100" },
            { label: "Type", value: "Cleaning Solution", label2: "Scent", value2: "Fresh" },
            { label: "Compatible", value: "Braun Shavers", label2: "Pack", value2: "Single" },
        ],
        galleryImages: [
            "/coupondeal/deal5.png",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["300ml", "500ml", "Single Pack", "3-Pack"],
        availability: ["In Stock", "offers"],
    },
    {
        name: "Wireless Gaming Headset",
        image: "/coupondeal/deal6.png",
        price: "LKR 15,800.00",
        oldPrice: "LKR 18,000.00",
        priceValue: 15800,
        categoryName: "Electronics",
        brandName: "Phillips",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.9,
        reviewCount: 342,
        stock: 18,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Color", value: "Black", label2: "Model", value2: "WG-HS-700" },
            { label: "Connection", value: "Wireless 2.4GHz", label2: "Battery Life", value2: "20 hours" },
            { label: "Microphone", value: "Detachable", label2: "Driver Size", value2: "50mm" },
        ],
        galleryImages: [
            "/coupondeal/deal6.png",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["Black", "White", "Red", "Blue"],
        availability: ["In Stock", "offers", "pre-order"],
    },
    {
        name: "Smart Lamp",
        image: "/coupondeal/deal7.png",
        price: "LKR 3,200.00",
        oldPrice: "LKR 4,000.00",
        priceValue: 3200,
        categoryName: "Electronics",
        brandName: "TCL",
        brandLogo: "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        rating: 4.4,
        reviewCount: 178,
        stock: 25,
        inStock: true,
        todayDeal: true,
        couponDeal: true,
        specifications: [
            { label: "Color", value: "White", label2: "Model", value2: "SL-RGB-100" },
            { label: "Power", value: "12W", label2: "Connectivity", value2: "WiFi & Bluetooth" },
            { label: "Brightness", value: "Adjustable", label2: "Color Modes", value2: "16 Million" },
        ],
        galleryImages: [
            "/coupondeal/deal7.png",
            "https://api.builder.io/api/v1/image/assets/TEMP/6786a2fa7a22a5c9163624da40ed4d9eb99770b7?width=180",
        ],
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        options: ["White", "Black", "RGB", "12W", "15W"],
        availability: ["In Stock", "offers"],
    },
];

    // Calculate the highest product price
    const highestProductPrice = useMemo(() => {
        return Math.max(...products.map(p => p.priceValue));
    }, [products]);

    // Filter products based on selected filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Price filter
            const priceMatch = product.priceValue <= filters.maxPrice;

            // Availability filter
            const availabilityMatch = 
                filters.availability.includes("all products") ||
                filters.availability.length === 0 ||
                product.availability.some(avail => 
                    filters.availability.includes(avail.toLowerCase())
                );

            // Category filter
            const categoryMatch = 
                filters.categories.length === 0 ||
                filters.categories.includes(product.categoryName.toLowerCase());

            // Brand filter
            const brandMatch = 
                filters.brands.length === 0 ||
                filters.brands.includes(product.brandName.toLowerCase());

            return priceMatch && availabilityMatch && categoryMatch && brandMatch;
        });
    }, [filters, products]);

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
                                        All Products ({filteredProducts.length})
                                    </h1>
                                </div>

                                <div className="w-full h-px bg-[#D5D5D5]" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 lg:gap-7">
                                {filteredProducts.map((deal, index) => (
                                    <div key={index} className="flex-shrink-0 max-w-[240px]">
                                        <CouponCard
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

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}