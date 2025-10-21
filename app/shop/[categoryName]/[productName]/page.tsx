import ProductDetails from "@/components/Products/ProductDetails";
import RelatedProducts from "@/components/Products/RelatedProducts";
import BackButton from "@/components/ui/BackButton";
import { notFound } from "next/navigation";

export default function ProductViewPage({
    params,
}: {
    params: { categoryName: string; productName: string };
}) {
    const { categoryName, productName } = params;

    return (
        <div className="min-h-screen p-4 bg-gray-50">
            <BackButton />
            <ProductDetails />
            <RelatedProducts />
        </div>
    );
}
