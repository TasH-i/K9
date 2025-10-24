"use client";
import React, { useRef, useState, useEffect } from "react";
import SectionHeader from "@/components/Home/SectionHeader";
import CouponCard from "../CouponCard";
import { GitCompare } from "lucide-react";

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: string;
  oldPrice: string;
  categoryName: string;
  brandName: string;
  rating: number;
  reviewCount: number;
  stock: number;
}

interface RelatedProductsProps {
  categoryId: string;
  productId: string;
  categoryName?: string;
}

const RelatedProducts = ({
  categoryId,
  productId,
  categoryName = "products",
}: RelatedProductsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/products/related?categoryId=${categoryId}&productId=${productId}&limit=10`
        );
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && productId) {
      fetchRelatedProducts();
    }
  }, [categoryId, productId]);

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

  // Don't render the section if there are no related products or still loading
  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-screen mx-auto px-4 md:px-18 py-10">
      <SectionHeader
        icon={<GitCompare className="w-9 h-10 md:w-6 md:h-6 stroke-[#FF4D6D]" />}
        title="Related Products"
        subtitle={`Good ${categoryName} products to compare!`}
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
        {products.map((product) => (
          <div key={product._id} className="flex-shrink-0 w-[240px]">
            <CouponCard
              _id={product._id}
              name={product.name}
              image={product.image}
              price={product.price}
              oldPrice={product.oldPrice}
              categoryName={product.categoryName || "General"}
              slug={product.slug}
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

export default RelatedProducts;