import Container from "./BrandContainer";

import Image from "next/image";
import React from "react";

interface Brand {
  _id: string;
  name: string;
  image: string;
}

export const BrandNameSection = async () => {
  let brands: Brand[] = [];
  let error: string | null = null;

  try {
    // Fetch brands from PUBLIC endpoint (no auth required)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/brands`,
      {
        next: {
          revalidate: 60, // ISR - revalidate every 60 seconds
          tags: ['brands']
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle response from public endpoint
    if (data.success && data.data) {
      brands = data.data; // Already filtered for active brands with images on backend
    } else if (Array.isArray(data)) {
      brands = data;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load brands';
    console.error('Error fetching brands:', error);
    // Use empty array as fallback
    brands = [];
  }

  // If no brands or error, show nothing or fallback
  if (!brands.length) {
    return null;
  }

  // Duplicate brands array for seamless scrolling effect
  const allImages = [...brands, ...brands];

  const animationStyles: React.CSSProperties = {
    animation: "scroll 40s linear infinite",
    display: "flex",
    minWidth: "200%",
    flexWrap: "nowrap",
  };

  const keyframes = `
        @keyframes scroll {
            0% {
                transform: translateX(0);
            }
            100% {
                transform: translateX(-50%);
            }
        }
    `;

  return (
    <div className="w-full border-gray-200 overflow-hidden py-16 pb-26">
      <style>{keyframes}</style>
      <Container>
        <div
          style={animationStyles}
          className="flex items-center justify-between space-x-6"
        >
          {allImages.map((brand, index) => (
            <React.Fragment key={index}>
              <Image
                src={brand.image}
                alt={brand.name}
                width={80}
                height={30}
                objectFit="contain"
                unoptimized
              />
              <div className="h-10" />
            </React.Fragment>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default BrandNameSection;