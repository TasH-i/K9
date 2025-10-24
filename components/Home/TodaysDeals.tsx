"use client"

import React, { useState, useEffect } from 'react'
import SectionHeader from './SectionHeader'
import { Flame } from "lucide-react";
import { ProductCardHorizontal, ProductCardVertical } from '../ProductCard';
import { useRouter } from "next/navigation";

interface TodayDealProduct {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  image: string;
  subtitle: string;
  price: string;
  stock: number;
  rating: number;
  reviewCount: number;
  categoryName?: string;
}

const TodaysDeals = () => {
  const router = useRouter();
  const [products, setProducts] = useState<TodayDealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysDeals();
  }, []);

  const fetchTodaysDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/today-deals");
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching today's deals:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while loading or if no products
  if (loading || products.length === 0) {
    return null;
  }

  // Get products for each position
  const product1 = products[0];
  const product2 = products[1];
  const product3 = products[2];
  const product4 = products[3];
  const product5 = products[4];
  const product6 = products[5];
  const product7 = products[6];
  const product8 = products[7];
  const product9 = products[8];
  const product10 = products[9];

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
            {product1 && (
              <ProductCardHorizontal
               _id={product1._id}
                logo={product1.logo}
                image={product1.image}
                name={product1.name}
                subtitle={product1.subtitle}
                price={product1.price}
                slug={product1.slug}
                categoryName="Fashion"
              />
            )}
            {product2 && (
              <ProductCardHorizontal
               _id={product2._id}
                logo={product2.logo}
                image={product2.image}
                name={product2.name}
                subtitle={product2.subtitle}
                price={product2.price}
                slug={product2.slug}
                categoryName="Fashion"
              />
            )}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {product3 && (
              <ProductCardHorizontal
               _id={product3._id}
                logo={product3.logo}
                image={product3.image}
                name={product3.name}
                subtitle={product3.subtitle}
                price={product3.price}
                slug={product3.slug}
                categoryName="Fashion"
              />
            )}
            {product4 && (
              <ProductCardHorizontal
               _id={product4._id}
                logo={product4.logo}
                image={product4.image}
                name={product4.name}
                subtitle={product4.subtitle}
                price={product4.price}
                slug={product4.slug}
                categoryName="Fashion"
              />
            )}
          </div>
        </div>

        {/* Right Column - Vertical Cards */}
        <div className="flex flex-col md:flex-row lg:flex-col gap-2.5">
          {product5 && (
            <ProductCardVertical
              _id={product5._id}
              logo={product5.logo}
              image={product5.image}
              name={product5.name}
              subtitle={product5.subtitle}
              price={product5.price}
              slug={product5.slug}
              categoryName="Fashion"
            />
          )}
        </div>
      </div>

      {/* Grid type 2 --> for second 4 cards*/}
      <div className="flex flex-col lg:flex-row gap-2.5 px-12 ">
        {/* Left Column - Vertical Cards */}
        <div className="flex flex-col md:flex-row lg:flex-col gap-2.5">
          {product6 && (
            <ProductCardVertical
              _id={product6._id}
              logo={product6.logo}
              image={product6.image}
              name={product6.name}
              subtitle={product6.subtitle}
              price={product6.price}
              slug={product6.slug}
              categoryName="Fashion"
            />
          )}
        </div>
        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {product7 && (
              <ProductCardHorizontal
               _id={product7._id}
                logo={product7.logo}
                image={product7.image}
                name={product7.name}
                subtitle={product7.subtitle}
                price={product7.price}
                slug={product7.slug}
                categoryName="Fashion"
              />
            )}
            {product8 && (
              <ProductCardHorizontal
               _id={product8._id}
                logo={product8.logo}
                image={product8.image}
                name={product8.name}
                subtitle={product8.subtitle}
                price={product8.price}
                slug={product8.slug}
                categoryName="Fashion"
              />
            )}
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {product9 && (
              <ProductCardHorizontal
               _id={product9._id}
                logo={product9.logo}
                image={product9.image}
                name={product9.name}
                subtitle={product9.subtitle}
                price={product9.price}
                slug={product9.slug}
                categoryName="Fashion"
              />
            )}
            {product10 && (
              <ProductCardHorizontal
               _id={product10._id}
                logo={product10.logo}
                image={product10.image}
                name={product10.name}
                subtitle={product10.subtitle}
                price={product10.price}
                slug={product10.slug}
                categoryName="Fashion"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TodaysDeals