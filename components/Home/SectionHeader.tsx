import { ChevronLeft, ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  showNav?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  canScrollLeft?: boolean;
  canScrollRight?: boolean;
}

export default function SectionHeader({
  icon,
  title,
  subtitle,
  showNav = true,
  onPrev,
  onNext,
  canScrollLeft = false,
  canScrollRight = false,
}: SectionHeaderProps) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 md:mb-12">
        {/* Title */}
        <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-12">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-noto-kr text-base font-medium">{title}</h2>
          </div>
          <div className="w-px h-12 lg:h-6 bg-[#9299A5]" />
          <p className="text-base text-[#9299A5]">{subtitle}</p>
        </div>

        {/* Navigation */}
        {showNav && (
          <div className="hidden md:flex items-center gap-10">
            <button
              onClick={onPrev}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${canScrollLeft
                  ? "bg-[var(--brand-pink)]  cursor-pointer"
                  : "bg-[#9A9A99]/40 cursor-not-allowed"
                }`}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={onNext}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded flex items-center justify-center transition-all ${canScrollRight
                  ? "bg-[var(--brand-pink)]  cursor-pointer"
                  : "bg-[#9A9A99]/40 cursor-not-allowed"
                }`}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

      </div>
      {showNav && (
        <div className="block md:hidden mb-4 items-end justify-end w-full flex gap-8 mt-12">
          <button
            onClick={onPrev}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded flex items-center justify-center transition-all ${canScrollLeft
                ? "bg-[var(--brand-pink)]  cursor-pointer"
                : "bg-[#9A9A99]/40 cursor-not-allowed"
              }`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={onNext}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded flex items-center justify-center transition-all ${canScrollRight
                ? "bg-[var(--brand-pink)]  cursor-pointer"
                : "bg-[#9A9A99]/40 cursor-not-allowed"
              }`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </>
  );
}
