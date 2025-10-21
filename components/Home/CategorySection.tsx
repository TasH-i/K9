"use client";
import React, { useRef, useState, useEffect } from "react";
import CategoryCard from "../CategoryCard";
import SectionHeader from "./SectionHeader";
import { Book } from "lucide-react";

const categories = [
  {
    title: "Electronics",
    image: "/category/electro.png",
  },
  {
    title: "Fashion",
    image: "/category/fashion.png",
  },
  {
    title: "Baby Products",
    image: "/category/baby.png",
  },
  {
    title: "Personal Care",
    image: "/category/personal.png",
  },
  {
    title: "Foods",
    image: "/category/food.png",
  },
  {
    title: "Furniture",
    image: "/category/fur.png",
  },
  {
    title: "Sports",
    image: "/category/sport.png",
  },
];

const CategorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

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
        {categories.map((cat, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-[220px] md:w-fit snap-start"
          >
            <CategoryCard title={cat.title} image={cat.image}  />
          </div>
        ))}
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