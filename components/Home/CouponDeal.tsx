"use client";
import React, { useRef, useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";
import CouponCard from "../CouponCard";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

interface CouponDealProduct {
  _id: string;
  name: string;
  image: string;
  price: string;
  oldPrice?: string;
  categoryName: string;
  slug: string;
}

const CouponDeal = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [products, setProducts] = useState<CouponDealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch coupon deals on mount
  useEffect(() => {
    fetchCouponDeals();
  }, []);

  const fetchCouponDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coupon-deals?limit=20");
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setProducts(data.data);
      } else {
        // Fallback to empty array if no data
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching coupon deals:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll handler
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

  // Track scroll edges
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

  // Don't render if loading or no products
  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-screen mx-auto px-4 md:px-18 py-10">
      <SectionHeader
        icon={<Ticket className="w-9 h-10 md:w-6 md:h-6 stroke-[#FF4D6D]" />}
        title="Coupons Deals"
        subtitle="Discount coupons!"
        showNav={true}
        onPrev={() => handleScroll("left")}
        onNext={() => handleScroll("right")}
        canScrollLeft={!isAtStart}
        canScrollRight={!isAtEnd}
      />

      {/* Carousel Row */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 scroll-smooth hide-scrollbar py-4 pb-6"
      >
        {products.map((deal) => (
          <div key={deal._id} className="flex-shrink-0 w-[240px]">
            <CouponCard
             _id={deal._id}
              name={deal.name}
              image={deal.image}
              price={deal.price}
              oldPrice={deal.oldPrice || ""}
              categoryName={deal.categoryName || "General"}
              slug={deal.slug}
            />
          </div>
        ))}
      </div>

      {/* Fade overlay edges */}
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

export default CouponDeal;