import { ShoppingCart, ChevronRight } from "lucide-react";

interface ProductCardProps {
    logo?: string;
    image: string;
    name: string;
    subtitle: string;
    price: string;
    type?: "horizontal" | "vertical";
}

export function ProductCardHorizontal({ logo, image, name, subtitle, price }: ProductCardProps) {
    return (
        <div className="group w-full h-[270px] bg-white rounded shadow-md relative">
            {logo && (
                <img src={logo} alt="" className="absolute left-6 top-4 h-[50px] object-contain" />
            )}

            <div className="absolute left-6 top-[82px] w-[262px]">
                <h3 className="font-noto-kr text-xl font-medium">{name}</h3>
                <p className="text-sm text-[#9299A5] mt-3.5">{subtitle}</p>
                <p className="text-lg font-medium mt-3.5">{price}</p>
            </div>

            {/* BUY NOW Button (triggered by group hover) */}
            <button
                className="absolute cursor-pointer  left-6 bottom-6 flex items-center justify-center rounded-md cursor-pointer
    bg-[#9A9A99]/40 text-white w-7 h-7 overflow-hidden transition-all duration-300 ease-in-out 
    group-hover:w-[110px] group-hover:bg-[var(--brand-pink)] hover:text-black"
            >
                <ChevronRight className="w-5 h-5 text-white transition-all duration-300 group-hover:opacity-0" />
                <span
                    className="absolute opacity-0 group-hover:opacity-100 text-xs font-medium transition-all duration-300 whitespace-nowrap"
                >
                    BUY NOW
                </span>
            </button>

            <button className="absolute cursor-pointer right-4 top-4 w-9 h-9 rounded bg-[#FAFAFA] flex items-center justify-center p-2.5 cursor-pointer">
                <ShoppingCart className="w-6 h-6 stroke-[#FF4D6D]" />
            </button>

            <img
                src={image}
                alt={name}
                className="absolute right-[10px] top-[10px] md:top-[46px] w-[180px] h-[180px] object-contain"
            />
        </div>
    );
}

export function ProductCardVertical({ logo, image, name, subtitle, price }: ProductCardProps) {
    return (
        <div className="group w-full md:w-[244px] h-[550px] bg-white rounded shadow-md relative">
            {logo && (
                <img src={logo} alt="" className="absolute left-4 top-4 h-10 object-contain" />
            )}

            <button className="absolute right-4 top-4 w-9 h-9 rounded cursor-pointer bg-[#FAFAFA] flex items-center justify-center p-2.5 cursor-pointer">
                <ShoppingCart className="w-6 h-6 stroke-[#FF4D6D]" />
            </button>

            <div className="absolute left-4 top-20 w-[212px]">
                <h3 className="font-noto-kr text-xl font-medium leading-8">{name}</h3>
                <p className="text-sm text-[#9299A5] mt-3.5">{subtitle}</p>
                <p className="text-lg font-medium mt-3.5">{price}</p>
            </div>

            <img src={image} alt={name} className="absolute left-[7px] top-[230px] w-[230px] h-[230px] object-contain" />

            <button
                className="absolute left-6 bottom-6 flex cursor-pointer items-center justify-center rounded-md cursor-pointer
    bg-[#9A9A99]/40 text-white w-7 h-7 overflow-hidden transition-all duration-300 ease-in-out 
    group-hover:w-[110px] group-hover:bg-[var(--brand-pink)] hover:text-black"
            >
                <ChevronRight className="w-5 h-5 text-white transition-all duration-300 group-hover:opacity-0" />
                <span
                    className="absolute opacity-0 group-hover:opacity-100 text-xs font-medium transition-all duration-300 whitespace-nowrap"
                >
                    BUY NOW
                </span>
            </button>
        </div>
    );
}
