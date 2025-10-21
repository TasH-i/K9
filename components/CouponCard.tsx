"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

interface CouponCardProps {
    name: string;
    image: string;
    price: string;
    oldPrice: string;
    categoryName: string;
}

export default function CouponCard({ name, image, price, oldPrice, categoryName }: CouponCardProps) {
    const router = useRouter();
    const productSlug = name.replace(/\s+/g, "-");

    const handleView = () => {
        router.push(`/shop/${categoryName}/${productSlug}`);
    };


    return (
        <div className="group  h-[298px] bg-white rounded shadow-md relative">
            <h3 className="absolute left-4 top-4 font-noto-kr text-sm w-[calc(100%-32px)] sm:w-[208px] leading-tight">
                {name}
            </h3>

            <Image
                src={image}
                alt={name}
                width={120}
                height={120}
                className="absolute left-1/2 -translate-x-1/2 sm:left-[60px] sm:translate-x-0 top-[60px] object-contain transition-transform duration-500 ease-in-out group-hover:scale-115"
            />
            <div className="absolute left-4 top-[204px] flex items-center gap-2">
                <span className="text-base font-medium">{price}</span>
                <span className="text-[10px] font-medium text-[#9299A5] line-through">{oldPrice}</span>
            </div>

            <div className="absolute left-4 right-4 sm:right-auto bottom-6 flex items-center gap-4 sm:w-[208px] text-white hover:text-black">
                <button
                    onClick={handleView}
                    className="flex-1 h-6 bg-[#FF4D6D] cursor-pointer  rounded flex items-center justify-center cursor-pointer"
                >
                    <span className="text-[10px] font-medium uppercase">View</span>
                </button>
                <button className="hidden lg:flex flex-1 h-6 cursor-pointer  border border-[#FF4D6D] rounded flex items-center justify-center text-[#FF4D6D] hover:text-black cursor-pointer">
                    <span className="text-[10px] font-medium uppercase">Add to cart</span>
                </button>
                <button className="lg:hidden flex-1 h-6 cursor-pointer  rounded flex items-center justify-end text-[#FF4D6D] hover:text-black cursor-pointer">
                    <span className="text-[10px] font-medium uppercase"><ShoppingCart className="w-5 h-5" /></span>
                </button>
            </div>
        </div>
    );
}