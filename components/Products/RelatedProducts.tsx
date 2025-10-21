"use client";
import React, { useRef, useState, useEffect } from "react";
import SectionHeader from "@/components/Home/SectionHeader";
import CouponCard from "../CouponCard";
import { GitCompare } from "lucide-react";
import { getCurrentProduct } from "./ProductDetails";

// All available products
const allProducts = [
  {
    name: "Freelife - BT Audio Transmitter",
    image: "/coupondeal/deal1.png",
    price: "LKR 7,600.00",
    oldPrice: "LKR 9,000.00",
    categoryName: "Electronics",
    brandName: "Freelife",
    rating: 4.5,
    reviewCount: 12,
    stock: 20,
    todayDeal: true,
    couponDeal: true,
    specifications: ["Color: Black", "Connectivity: Bluetooth 5.0"],
    galleryImages: ["/coupondeal/deal1-1.png", "/coupondeal/deal1-2.png"],
  },
  {
    name: "Cordway USB Type-C to 3.5mm",
    image: "/coupondeal/deal2.png",
    price: "LKR 2,100.00",
    oldPrice: "LKR 3,200.00",
    categoryName: "Baby Products",
    brandName: "Freelife",
    rating: 4.5,
    reviewCount: 12,
    stock: 20,
    todayDeal: true,
    couponDeal: true,
  },
  {
    name: "Mirum Lifting RF Galvanic Facial Massager",
    image: "/coupondeal/deal3.png",
    price: "LKR 7,100.00",
    oldPrice: "LKR 9,000.00",
    categoryName: "Electronics",
    todayDeal: true,
    couponDeal: true,
  },
  {
    name: "Mamconi Portable Milk Pot",
    image: "/coupondeal/deal4.png",
    price: "LKR 17,000.00",
    oldPrice: "LKR 21,000.00",
    categoryName: "Baby Products",
    todayDeal: true,
    couponDeal: true,
  },
  {
    name: "Icebubble Braun Shaver Liquid",
    image: "/coupondeal/deal5.png",
    price: "LKR 5,100.00",
    oldPrice: "LKR 6,000.00",
    categoryName: "Electronics",
    todayDeal: true,
    couponDeal: true,
  },
  {
    name: "Wireless Gaming Headset",
    image: "/coupondeal/deal6.png",
    price: "LKR 15,800.00",
    oldPrice: "LKR 18,000.00",
    categoryName: "Electronics",
    todayDeal: true,
    couponDeal: true,
  },
  {
    name: "Smart Lamp",
    image: "/coupondeal/deal7.png",
    price: "LKR 3,200.00",
    oldPrice: "LKR 4,000.00",
    categoryName: "Home & Garden",
    todayDeal: true,
    couponDeal: true,
  },
];

const RelatedProducts = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Get current product and filter products by category
  const currentProduct = getCurrentProduct();
  const currentCategory = currentProduct.categoryName;
  
  // Filter products to only show those with the same category (excluding the current product)
  const products = allProducts.filter(
    (product) => 
      product.categoryName === currentCategory && 
      product.name !== currentProduct.name
  );

  //  Scroll handler
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.9;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  //  Track scroll edges
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateState = () => {
      setIsAtStart(el.scrollLeft <= 5);
      setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
    };

    el.addEventListener("scroll", updateState);
    updateState();

    return () => el.removeEventListener("scroll", updateState);
  }, []);

  // Don't render the section if there are no related products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-screen mx-auto px-4 md:px-18 py-10">
      <SectionHeader
        icon={<GitCompare className="w-9 h-10 md:w-6 md:h-6 stroke-[#FF4D6D]" />}
        title="Related Products"
        subtitle={`Good ${currentCategory} products to compare!`}
        showNav={true}
        onPrev={() => handleScroll("left")}
        onNext={() => handleScroll("right")}
        canScrollLeft={!isAtStart}
        canScrollRight={!isAtEnd}
      />

      {/*  Carousel Row */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 scroll-smooth hide-scrollbar py-4 pb-6"
      >
        {products.map((deal, index) => (
          <div key={index} className="flex-shrink-0 w-[240px] ">
            <CouponCard
              name={deal.name}
              image={deal.image}
              price={deal.price}
              oldPrice={deal.oldPrice}
              categoryName={deal.categoryName || "General"}
            />
          </div>
        ))}
      </div>

      {/*  Fade overlay edges */}
      <div className="pointer-events-none absolute left-0 right-0 mx-auto max-w-[1240px]">
        {!isAtStart && (
          <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent" />
        )}
        {!isAtEnd && (
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent" />
        )}
      </div>
    </section>
  );
};

export default RelatedProducts;