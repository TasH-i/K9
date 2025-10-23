"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, X, Search } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface CouponForm {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountPercentageValue: number;
  applicableCategories: string[];
  applicableBrands: string[];
  applicableProducts: string[];
  startDate: string;
  endDate: string;
}

interface Product {
  _id: string;
  name: string;
  image?: string;
  imageUrl?: string;
}

const CouponForm = () => {
  const router = useRouter();
  const params = useParams();
  const isEdit = Boolean(params?.id && params.id !== "new");

  const [form, setForm] = useState<CouponForm>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    discountPercentageValue: 0,
    applicableCategories: [],
    applicableBrands: [],
    applicableProducts: [],
    startDate: "",
    endDate: "",
  });

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Product search state
  const [productSearch, setProductSearch] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchBrandsAndCategories();
    fetchAllProducts();
    if (isEdit) {
      fetchCoupon();
    }
  }, []);

  // Filter products based on search
  useEffect(() => {
    if (productSearch.trim()) {
      const filtered = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
          !form.applicableProducts.includes(p._id)
      );
      setFilteredProducts(filtered.slice(0, 5));
      setShowProductSuggestions(true);
    } else {
      setFilteredProducts([]);
      setShowProductSuggestions(false);
    }
  }, [productSearch, form.applicableProducts, allProducts]);

  const fetchBrandsAndCategories = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/brands?limit=100"),
        fetch("/api/admin/categories?limit=100"),
      ]);

      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load brands and categories");
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch("/api/admin/products?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCoupon = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await fetch(`/api/admin/coupons/${params?.id}`);
      const data = await response.json();

      if (data.success) {
        const couponData = data.data;

        const selectedProductIds = couponData.applicableProducts?.map(
          (p: any) => (typeof p === "string" ? p : p._id)
        ) || [];
        const selectedProducts = couponData.applicableProducts?.map((p: any) => ({
          _id: typeof p === "string" ? p : p._id,
          name: typeof p === "string" ? "" : p.name,
          image: typeof p === "string" ? "" : p.image,
          imageUrl: typeof p === "string" ? "" : p.imageUrl,
        })) || [];

        setForm({
          code: couponData.code || "",
          description: couponData.description || "",
          discountType: couponData.discountType || "percentage",
          discountValue: couponData.discountValue || 0,
          discountPercentageValue: couponData.discountPercentageValue || 0,
          applicableCategories: couponData.applicableCategories?.map(
            (c: any) => (typeof c === "string" ? c : c._id)
          ) || [],
          applicableBrands: couponData.applicableBrands?.map((b: any) =>
            typeof b === "string" ? b : b._id
          ) || [],
          applicableProducts: selectedProductIds,
          startDate: couponData.startDate?.slice(0, 16) || "",
          endDate: couponData.endDate?.slice(0, 16) || "",
        });

        setProducts(selectedProducts);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load coupon";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching coupon:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        ["discountValue", "discountPercentageValue"].includes(name)
          ? value === ""
            ? 0
            : parseFloat(value) || 0
          : value,
    }));
  };

  const handleMultiSelect = (name: string, value: string) => {
    setForm((prev) => {
      const array = prev[name as keyof CouponForm] as string[];
      if (array.includes(value)) {
        return { ...prev, [name]: array.filter((v) => v !== value) };
      } else {
        return { ...prev, [name]: [...array, value] };
      }
    });
  };

  const handleAddProduct = (product: Product) => {
    if (!form.applicableProducts.includes(product._id)) {
      setForm((prev) => ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, product._id],
      }));
      setProducts((prev) => [...prev, product]);
      setProductSearch("");
      setShowProductSuggestions(false);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter((p) => p !== productId),
    }));
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.code.trim()) {
      const errorMsg = "Coupon code is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (
      form.discountType === "percentage" &&
      (form.discountPercentageValue <= 0 || form.discountPercentageValue > 100)
    ) {
      const errorMsg = "Discount percentage must be between 1 and 100";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (form.discountType === "fixed" && form.discountValue <= 0) {
      const errorMsg = "Discount value must be greater than 0";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!form.startDate || !form.endDate) {
      const errorMsg = "Start date and end date are required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const startDateTime = new Date(form.startDate);
    const endDateTime = new Date(form.endDate);
    if (endDateTime <= startDateTime) {
      const errorMsg = "End date must be after start date";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      isEdit ? "Updating coupon..." : "Creating coupon..."
    );

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `/api/admin/coupons/${params?.id}`
        : "/api/admin/coupons";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(toastId);
        toast.success(
          `Coupon has been ${isEdit ? "updated" : "created"} successfully!`
        );
        setTimeout(() => {
          router.push("/admin/coupons");
        }, 500);
      } else {
        throw new Error(data.error || "Failed to save coupon");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error saving coupon";
      setError(errorMessage);
      toast.dismiss(toastId);
      toast.error(errorMessage);
      console.error("Error saving coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coupon details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:bg-gray-100 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type *
            </label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
          />
        </div>

        {/* Discount Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.discountType === "percentage" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage (%) *
              </label>
              <input
                type="number"
                name="discountPercentageValue"
                value={form.discountPercentageValue}
                onChange={handleChange}
                required
                min="1"
                max="100"
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Amount ($) *
              </label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
            />
          </div>
        </div>

        {/* Applicable Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Categories (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-pink-300 p-3 rounded-lg bg-pink-50">
            {categories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.applicableCategories.includes(cat._id)}
                  onChange={() =>
                    handleMultiSelect("applicableCategories", cat._id)
                  }
                  disabled={loading}
                  className="w-4 h-4 disabled:opacity-50 accent-brand-pink"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Applicable Brands */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Brands (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-pink-300 p-3 rounded-lg bg-pink-50">
            {brands.map((brand) => (
              <label
                key={brand._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={form.applicableBrands.includes(brand._id)}
                  onChange={() => handleMultiSelect("applicableBrands", brand._id)}
                  disabled={loading}
                  className="w-4 h-4 disabled:opacity-50 accent-brand-pink"
                />
                <span className="text-sm text-gray-700">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Applicable Products */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applicable Products (Optional)
          </label>

          {/* Product Search Input */}
          <div className="relative mb-3">
            <div className="flex items-center gap-2 border border-pink-300 rounded-lg px-3 py-2 bg-pink-50">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search and add products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onFocus={() =>
                  productSearch && setShowProductSuggestions(true)
                }
                disabled={loading}
                className="flex-1 outline-none text-sm bg-pink-50 disabled:opacity-50"
              />
            </div>

            {/* Product Suggestions Dropdown */}
            {showProductSuggestions && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-pink-300 rounded-lg mt-1 z-10 shadow-lg">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleAddProduct(product)}
                    className="w-full text-left px-4 py-2 hover:bg-pink-50 text-sm border-b border-pink-100 last:border-b-0 transition-colors"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Products as Chips */}
          {products.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-2 bg-pink-100 border border-pink-300 rounded-full px-2 py-1"
                >
                  {(product.image || product.imageUrl) && (
                    <Image
                      src={product.image || product.imageUrl || ""}
                      alt={product.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded object-cover"
                      unoptimized
                    />
                  )}
                  <span className="text-sm text-gray-700">{product.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(product._id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 ml-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {products.length === 0 && productSearch === "" && (
            <p className="text-sm text-gray-500 italic">
              No products selected. Search to add products.
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || isFetching}
            className="bg-brand-pink text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;