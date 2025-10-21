"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/home/hero1.png",
  "/home/hero2.png",
  "/home/hero3.png",
  "/home/hero4.png",
];

const mobImages = [
  "/home/mobhero1.png",
  "/home/mobhero1.png",
  "/home/mobhero1.png",
  "/home/mobhero1.png",
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 🔹 Detect screen width on mount + resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 🔹 Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % (isMobile ? mobImages.length : images.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile]);

  const currentImages = isMobile ? mobImages : images;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % currentImages.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + currentImages.length) % currentImages.length);

  return (
    <div className="relative w-full h-[220px] md:h-[230px] lg:h-[364px] overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {currentImages.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 md:bottom-[22px] w-full flex justify-center">
        <div className="w-full max-w-screen flex justify-between items-end px-4 md:px-10">
          <div className="hidden md:flex" />

          {/* Dots */}
          <div className="flex items-center justify-end gap-3 w-[88px]">
            {currentImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 ${
                  i === current
                    ? "w-[22px] h-3 bg-[#FF4D6D] rounded-full"
                    : "w-2.5 h-2.5 bg-white rounded-full cursor-pointer"
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-6 md:gap-8">
            <button
              onClick={prevSlide}
              className="w-9 h-9 rounded cursor-pointer bg-[#9A9A99]/40 hover:bg-brand-pink flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="w-9 h-9 rounded cursor-pointer bg-[#9A9A99]/40 hover:bg-brand-pink flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
