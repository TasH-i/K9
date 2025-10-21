"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface CouponForm {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  minPurchaseAmount: number;
  maxUsageCount: number | null;
  applicableCategories: string[];
  applicableBrands: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
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
    maxDiscount: null,
    minPurchaseAmount: 0,
    maxUsageCount: null,
    applicableCategories: [],
    applicableBrands: [],
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrandsAndCategories();
    if (isEdit) {
      fetchCoupon();
    }
  }, []);

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
    }
  };

  const fetchCoupon = async () => {
    try {
      const response = await fetch(`/api/admin/coupons/${params?.id}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["discountValue", "maxDiscount", "minPurchaseAmount", "maxUsageCount"].includes(name)
          ? value === ""
            ? null
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/admin/coupons/${params?.id}` : "/api/admin/coupons";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/coupons");
      } else {
        alert(data.error || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Error saving coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Discount Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount ($)</label>
            <input
              type="number"
              name="maxDiscount"
              value={form.maxDiscount || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Purchase ($)</label>
            <input
              type="number"
              name="minPurchaseAmount"
              value={form.minPurchaseAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Usage Count</label>
            <input
              type="number"
              name="maxUsageCount"
              value={form.maxUsageCount || ""}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Applicable Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 p-3 rounded-lg">
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.applicableCategories.includes(cat._id)}
                  onChange={() => handleMultiSelect("applicableCategories", cat._id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Applicable Brands */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Brands (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 p-3 rounded-lg">
            {brands.map((brand) => (
              <label key={brand._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.applicableBrands.includes(brand._id)}
                  onChange={() => handleMultiSelect("applicableBrands", brand._id)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Coupon is Active</span>
        </label>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;