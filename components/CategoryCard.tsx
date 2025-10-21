import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  image: string;
}

export default function CategoryCard({ title, image }: CategoryCardProps) {
  return (
    <div className="group w-[220px] md:w-[240px] h-[250px] bg-white rounded shadow-md relative ">
      <div className="absolute left-4 top-4">
        <h3 className="font-noto-kr text-lg md:text-xl font-medium leading-7 md:leading-8">{title}</h3>
      </div>

      <button
        className="absolute left-4 md:left-6 bottom-4 md:bottom-6 flex items-center justify-center rounded-md cursor-pointer
          bg-[#9A9A99]/40 text-white w-8 h-8 md:w-7 md:h-7 overflow-hidden transition-all duration-300 ease-in-out 
          active:scale-95 active:bg-[var(--brand-pink)] md:active:scale-100
          md:group-hover:w-[110px] md:group-hover:bg-[var(--brand-pink)] md:hover:text-black cursor-pointer "
      >
        <ChevronRight className="w-5 h-5 text-white transition-all duration-300 md:group-hover:opacity-0" />
        <span
          className="absolute opacity-0 md:group-hover:opacity-100 text-xs font-medium transition-all duration-300 whitespace-nowrap"
        >
          BUY NOW
        </span>
      </button>

      <img 
        src={image} 
        alt={title} 
        className="absolute left-[20px] md:left-[30px] top-12 md:top-14 w-[160px] md:w-[180px] h-[120px] md:h-[132px] object-contain" 
      />
    </div>
  );
}