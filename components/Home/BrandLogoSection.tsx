import Container from "./BrandContainer";

import Image from "next/image";
import React from "react";

export const BrandNameSection = () => {
  const images = [
    { src: "/brands/brand1.png", alt: "AGE20's" },
    { src: "/brands/brand2.png", alt: "Axxen" },
    { src: "/brands/brand3.png", alt: "Cetaphil" },
    { src: "/brands/brand4.png", alt: "PHILIPS" },
    { src: "/brands/brand5.png", alt: "TCL" },
    { src: "/brands/brand6.png", alt: "Roborock" },
    { src: "/brands/brand7.png", alt: "MILK" },
  ];

  const allImages = [...images, ...images];

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
          {allImages.map((image, index) => (
            <React.Fragment key={index}>
              <Image
                src={image.src}
                alt={image.alt}
                width={80}
                height={30}
                objectFit="contain"
              />
              <div className=" h-10" />
            </React.Fragment>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default BrandNameSection;
