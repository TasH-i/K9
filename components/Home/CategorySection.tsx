"use client";
import React, { useRef, useState, useEffect } from "react";
import CategoryCard from "../CategoryCard";
import SectionHeader from "./SectionHeader";
import { Book } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  image: string;
  slug: string;
  description?: string;
}

const CategorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setCategories(data.data);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set empty array as fallback so page doesn't break
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll handler
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.9;

      const newScrollLeft =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  // Watch scroll position to disable arrows at edges
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

  // Don't render section if no categories
  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-screen mx-auto px-4 md:px-18 py-6 md:py-10 relative">
      <SectionHeader
        icon={<Book className="w-10 h-10 md:w-6 md:h-6 stroke-[#FF4D6D]" />}
        title="Product Categories"
        subtitle="K9 Buy's product categories!"
        showNav={true}
        onPrev={() => handleScroll("left")}
        onNext={() => handleScroll("right")}
        canScrollLeft={!isAtStart}
        canScrollRight={!isAtEnd}
      />

      {/* Carousel Row */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth py-4 pb-6 gap-4 
          snap-x snap-mandatory md:snap-none 
          -mx-4 px-4 md:mx-0 md:px-0"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollPaddingLeft: '1rem'
        }}
      >
        {isLoading ? (
          // Loading skeleton
          <div className="flex gap-4 w-full">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[220px] md:w-fit animate-pulse"
              >
                <div className="h-64 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="flex-shrink-0 w-[220px] md:w-fit snap-start"
            >
              <CategoryCard title={cat.name} image={cat.image} />
            </div>
          ))
        )}
      </div>

      {/* Optional: fade overlay for edges */}
      <div className="pointer-events-none absolute left-0 right-0 mx-auto max-w-[1240px]">
        {!isAtStart && (
          <div className="hidden md:block absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent" />
        )}
        {!isAtEnd && (
          <div className="hidden md:block absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent" />
        )}
      </div>
    </section>
  );
};

export default CategorySection;