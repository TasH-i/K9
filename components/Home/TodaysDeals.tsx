"use client"

import React from 'react'
import SectionHeader from './SectionHeader'
import { Flame, BookOpen, Ticket } from "lucide-react";
import { ProductCardHorizontal, ProductCardVertical } from '../ProductCard';
import { useRouter } from "next/navigation";

const TodaysDeals = () => {
    const router = useRouter();

  return (
    <section className="w-full max-w-screen mx-auto px-4 lg:px-16 mb-8 bg-gray-50 pb-8">
      <div className="flex justify-between items-center py-4">
        <SectionHeader
          icon={<Flame className="w-12 h-12 md:w-6 md:h-6 stroke-[#FF4D6D]" />}
          title="Today's Discovery"
          subtitle="K9 Buy's hottest products selected today!"
          showNav={false}
        />
        <button onClick={() => router.push("/shop")} className="hidden md:block text-sm bg-brand-pink px-4 py-1 rounded-sm text-white hover:text-black cursor-pointer hover:scale-105 easy-in-out duration-500">SHOW ALL PRODUCTS</button>
      </div>
      <div className=" block md:hidden mb-10 items-end justify-end w-full flex">
          <button onClick={() => router.push("/shop")} className=" text-sm bg-brand-pink px-4 py-1 rounded-sm text-white hover:text-black cursor-pointer hover:scale-105 easy-in-out duration-500 ">SHOW ALL PRODUCTS</button>
      </div>

      {/* Grid type 1 --> for first 4 cards */}
      <div className="flex flex-col lg:flex-row gap-2.5 mb-3 px-12">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <ProductCardHorizontal
              logo="/products/logo1.png"
              image="/products/p1.png"
              name="Namyang Dairy's Fresh Milk"
              subtitle="900ml"
              price="LKR 680.00"
            />
            <ProductCardHorizontal
              logo="/products/logo2.png"
              image="/products/p2.png"
              name="Roborock Vacuum Cleaner"
              subtitle="S9 MaxV Ultra"
              price="LKR 353,675.00"
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <ProductCardHorizontal
              logo="/products/logo4.png"
              image="/products/p4.png"
              name="Age 20's Signature Essence Cover"
              subtitle="Case + Refill 14g 2p Set"
              price="LKR 3480.00"
            />
            <ProductCardHorizontal
              logo="/products/logo5.png"
              image="/products/p5.png"
              name="TCL 4K QLED TV"
              subtitle="Google TV"
              price="LKR 118,348.00"
            />
          </div>
        </div>

        {/* Right Column - Vertical Cards */}
        <div className="flex flex-col md:flex-row lg:flex-col gap-2.5">
          <ProductCardVertical
            logo="/products/logo6.png"
            image="/products/p6.png"
            name="Cetaphil Baby Lotion"
            subtitle="400ml"
            price="LKR 3800.00"
          />
        </div>
      </div>

      {/* Grid type 2 --> for second 4 cards*/}
      <div className="flex flex-col lg:flex-row gap-2.5 px-12 ">
        {/* Left Column - Vertical Cards */}
        <div className="flex flex-col md:flex-row lg:flex-col gap-2.5">
          <ProductCardVertical
            logo="/products/logo6.png"
            image="/products/p6.png"
            name="Cetaphil Baby Lotion"
            subtitle="400ml"
            price="LKR 3800.00"
          />
        </div>
        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <ProductCardHorizontal
              logo="/products/logo7.png"
              image="/products/p7.png"
              name="Axxen ​​U3 ULTRA SD Card"
              subtitle="64GB"
              price="LKR 1,617.00"
            />
            <ProductCardHorizontal
              logo="/products/logo8.png"
              image="/products/p8.png"
              name="Roborock Vacuum Cleaner"
              subtitle="S9 MaxV Ultra"
              price="LKR 353,675.00"
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <ProductCardHorizontal
              logo="/products/logo9.png"
              image="/products/p9.png"
              name="TCL 4K QD Mini LED TV"
              subtitle="Smart TV"
              price="LKR 96,400.00"
            />
            <ProductCardHorizontal
              logo="/products/logo10.png"
              image="/products/p10.png"
              name="Age 20's Latest Essence Cover Pact"
              subtitle="Case + Refill 14g 2p Set"
              price="LKR 3480.00"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TodaysDeals