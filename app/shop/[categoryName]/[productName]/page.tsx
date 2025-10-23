"use client";
import { useEffect, useState, use } from "react";
import ProductDetails from "@/components/Products/ProductDetails";
import RelatedProducts from "@/components/Products/RelatedProducts";
import BackButton from "@/components/ui/BackButton";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice: number;
  sku: string;
  stock: number;
  brand: {
    _id: string;
    name: string;
    image: string;
  };
  category: {
    _id: string;
    name: string;
  };
  thumbnail: string;
  images: string[];
  attributes: Array<{ name: string; value: string }>;
  options: Array<{ name: string; values: string[] }>;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isTodayDeal: boolean;
  isComingSoon: boolean;
  isCouponDeal: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductViewPage({
  params,
}: {
  params: Promise<{ categoryName: string; productName: string }>;
}) {

  const router = useRouter();
const { categoryName, productName } = use<{ categoryName: string; productName: string }>(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Use productName as slug since it's the URL-friendly version
        const slug = decodeURIComponent(productName);
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();

        if (!data.success) {
          setError("Product not found");
          return;
        }

        setProduct(data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productName]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-pink"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <BackButton />
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => router.push("/shop")}
            className="text-brand-pink hover:text-pink-700"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <BackButton />
      <ProductDetails product={product} />
      <RelatedProducts categoryId={product.category._id} productId={product._id} />
    </div>
  );
}