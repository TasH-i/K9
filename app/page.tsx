import BrandNameSection from "@/components/Home/BrandLogoSection";
import CategorySection from "@/components/Home/CategorySection";
import CouponDeal from "@/components/Home/CouponDeal";
import HeroBanner from "@/components/Home/Hero";
import TodaysDeals from "@/components/Home/TodaysDeals";
import ProductDetails from "@/components/Products/ProductDetails";
import { Cat } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-gray-50">
      <HeroBanner />
      <TodaysDeals />
      <CategorySection />
      <CouponDeal />
      <BrandNameSection />
    </div >
  );
}
