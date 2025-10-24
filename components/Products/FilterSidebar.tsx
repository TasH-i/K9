"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";

interface FilterOption {
  label: string;
  checked: boolean;
  id?: string;
}

interface FilterSidebarProps {
  onFilterChange?: (filters: {
    availability: string[];
    categories: string[];
    brands: string[];
    maxPrice: number;
  }) => void;
  highestProductPrice?: number;
  initialCategory?: string; // NEW: pre-select category from URL
}

export function FilterSidebar({ 
  onFilterChange, 
  highestProductPrice = 1500000,
  initialCategory // NEW: receive category from URL param
}: FilterSidebarProps) {
  //  Independent state for each section
  const [maxPrice, setMaxPrice] = useState<number>(highestProductPrice);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<SVGSVGElement>(null);

  // Loading states for dynamic data
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [brandsLoading, setBrandsLoading] = useState<boolean>(true);

  const [availabilityOptions, setAvailabilityOptions] = useState<FilterOption[]>([
    { label: "All products", checked: true },
    { label: "Coupon Deals", checked: false },
    { label: "Today's Deals", checked: false },
    { label: "Featured", checked: false },
    { label: "Coming Soon", checked: false },
    { label: "In Stock", checked: false },
    { label: "Out of stock", checked: false },
  ]);

  // Dynamic categories and brands
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<FilterOption[]>([]);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data)) {
        const categories = data.data.map((cat: any) => ({
          label: cat.name,
          id: cat._id || cat.id,
          checked: false,
        }));
        setCategoryOptions(categories);
      } else {
        setCategoryOptions([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryOptions([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch brands from backend
  const fetchBrands = useCallback(async () => {
    try {
      setBrandsLoading(true);
      const response = await fetch("/api/admin/brands");
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data)) {
        const brands = data.data.map((brand: any) => ({
          label: brand.name,
          id: brand._id || brand.id,
          checked: false,
        }));
        setBrandOptions(brands);
      } else {
        setBrandOptions([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrandOptions([]);
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  // NEW: Pre-select category from URL parameter
  useEffect(() => {
    if (initialCategory && categoryOptions.length > 0) {
      setCategoryOptions(prev =>
        prev.map(cat => ({
          ...cat,
          checked: cat.id === initialCategory ? true : false,
        }))
      );
      
      // Uncheck "All products" when specific category is selected
      setAvailabilityOptions(prev =>
        prev.map((opt, i) => (i === 0 ? { ...opt, checked: false } : opt))
      );
    }
  }, [initialCategory, categoryOptions.length]);

  // Update maxPrice when highestProductPrice changes
  useEffect(() => {
    setMaxPrice(highestProductPrice);
  }, [highestProductPrice]);

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      const availability = availabilityOptions
        .filter(opt => opt.checked)
        .map(opt => opt.label.toLowerCase());

      const categories = categoryOptions
        .filter(opt => opt.checked)
        .map(opt => opt.id || opt.label.toLowerCase());

      const brands = brandOptions
        .filter(opt => opt.checked)
        .map(opt => opt.id || opt.label.toLowerCase());

      onFilterChange({ availability, categories, brands, maxPrice });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityOptions, categoryOptions, brandOptions, maxPrice]);

  // Handle slider drag
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;
    const offsetX = clientX - rect.left;

    let percentage = offsetX / sliderWidth;
    percentage = Math.max(0, Math.min(1, percentage));

    const newPrice = Math.round(percentage * highestProductPrice);
    setMaxPrice(newPrice);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleSliderMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderMove(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const sliderWidth = 189.336;
  const circleX = 10.832 + (maxPrice / highestProductPrice) * sliderWidth;

  const toggleOption = (
    index: number,
    list: FilterOption[],
    setter: React.Dispatch<React.SetStateAction<FilterOption[]>>,
    isAvailability: boolean = false
  ) => {
    setter((prev) => {
      if (isAvailability) {
        if (index === 0) {
          const hasOtherSelected = prev.slice(1).some(opt => opt.checked);

          if (!hasOtherSelected && prev[0].checked) {
            return prev;
          }

          return prev.map((opt, i) =>
            i === 0
              ? { ...opt, checked: !opt.checked }
              : { ...opt, checked: prev[0].checked ? false : opt.checked }
          );
        } else {
          const newState = prev.map((opt, i) =>
            i === index
              ? { ...opt, checked: !opt.checked }
              : i === 0 ? { ...opt, checked: false } : opt
          );

          const anySelected = newState.slice(1).some(opt => opt.checked);

          if (!anySelected) {
            newState[0].checked = true;
          }

          return newState;
        }
      }

      return prev.map((opt, i) => (i === index ? { ...opt, checked: !opt.checked } : opt));
    });
  };

  const renderOptionList = (
    title: string,
    options: FilterOption[],
    setter: React.Dispatch<React.SetStateAction<FilterOption[]>>,
    isAvailability: boolean = false,
    isLoading: boolean = false
  ) => (
    <div className="flex flex-col gap-3">
      <h2 className="font-noto-kr text-base font-medium uppercase leading-9">
        {title}
        {isLoading && <span className="text-xs font-normal text-gray-500 ml-2">(Loading...)</span>}
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full"></div>
          </div>
        </div>
      ) : options.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">No {title.toLowerCase()} available</div>
      ) : (
        options.map((option, index) => (
          <div
            key={option.id || index}
            onClick={() => toggleOption(index, options, setter, isAvailability)}
            className={`flex items-center gap-3 px-2 py-1 rounded cursor-pointer transition-colors ${option.checked ? "bg-[rgba(255,77,109,0.10)]" : "hover:bg-gray-50"
              }`}
          >
            <div
              className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors ${option.checked
                ? "border-[#FF4D6D] bg-[#FF4D6D]"
                : "border-black bg-white"
                }`}
            >
              {option.checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </div>
            <span
              className={`text-sm capitalize leading-6 ${option.checked ? "text-black font-medium" : "text-gray-800"
                }`}
            >
              {option.label}
            </span>
          </div>
        ))
      )}
    </div>
  );

  const formatPrice = (price: number) => {
    return `LKR. ${price.toLocaleString()}`;
  };

  return (
    <div className="w-full lg:w-fit flex-shrink-0 flex flex-col gap-8 lg:gap-16">
      <div className="flex flex-col gap-6">
        {/* ---- Filter by price ---- */}
        <div className="flex flex-col gap-6">
          <h2 className="font-noto-kr text-base font-medium uppercase leading-9">
            Filter by price
          </h2>

          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full" style={{ touchAction: 'none' }}>
              <svg
                ref={sliderRef}
                className="w-full cursor-pointer"
                width="211"
                height="12"
                viewBox="0 0 211 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                preserveAspectRatio="none"
              >
                <path
                  d="M5.49878 6V7H205.501V6V5H5.49878V6Z"
                  fill="#E5E7EB"
                />
                <path
                  d={`M5.49878 6V7H${circleX}V6V5H5.49878V6Z`}
                  fill="black"
                />
                <circle
                  cx="5.49878"
                  cy="6"
                  r="5.33333"
                  fill="black"
                  className="pointer-events-none"
                />
                <circle
                  cx={circleX}
                  cy="6"
                  r="5.33333"
                  fill="black"
                  className={`transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
                  style={{ cursor: 'grab' }}
                />
              </svg>
            </div>

            <div className="flex justify-between items-center w-full">
              <div className="flex w-fit h-6 px-1.5 items-center rounded bg-[#FAD7DD]">
                <span className="text-xs text-black">LKR. 0</span>
              </div>
              <div className="flex w-fit h-6 px-2 justify-center items-center gap-2 rounded bg-[#FAD7DD]">
                <span className="text-xs text-black">{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Dynamic sections ---- */}
        {renderOptionList("Availability", availabilityOptions, setAvailabilityOptions, true)}
        {renderOptionList("Category", categoryOptions, setCategoryOptions, false, categoriesLoading)}
        {renderOptionList("Brand", brandOptions, setBrandOptions, false, brandsLoading)}
      </div>

      {/* ---- Clear All ---- */}
      <button
        onClick={() => {
          setAvailabilityOptions((prev) =>
            prev.map((opt, i) => ({ ...opt, checked: i === 0 }))
          );
          setCategoryOptions((prev) => prev.map((opt) => ({ ...opt, checked: false })));
          setBrandOptions((prev) => prev.map((opt) => ({ ...opt, checked: false })));
          setMaxPrice(highestProductPrice);
        }}
        className="flex w-full h-12 px-3 justify-center cursor-pointer items-center gap-2.5 rounded border border-secondary shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] hover:bg-gray-50 transition-colors"
      >
        <span className="text-secondary text-sm uppercase leading-6">
          Clear All
        </span>
      </button>
    </div>
  );
}