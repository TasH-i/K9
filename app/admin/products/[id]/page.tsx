"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, X, Plus, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice: number;
  sku: string;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  attributes: Array<{ name: string; value: string }>;
  options: Array<{ name: string; values: string[] }>;
  isTodayDeal: boolean;
  isComingSoon: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

const ProductForm = () => {
  const router = useRouter();
  const params = useParams();
  const isEdit = Boolean(params?.id && params.id !== "new");

  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    shortDescription: "",
    price: 0,
    oldPrice: 0,
    sku: "",
    stock: 0,
    brand: "",
    category: "",
    thumbnail: "",
    images: [],
    attributes: [],
    options: [],
    isTodayDeal: false,
    isComingSoon: false,
    isActive: true,
    isFeatured: false,
  });

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [newAttribute, setNewAttribute] = useState({ name: "", value: "" });
  const [newOption, setNewOption] = useState({ name: "", value: "" });
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "LKR";

  useEffect(() => {
    fetchBrandsAndCategories();
    if (isEdit) {
      fetchProduct();
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
      toast.error("Failed to load brands and categories");
    }
  };

  const fetchProduct = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await fetch(`/api/admin/products/${params?.id}`);
      const data = await response.json();

      if (data.success) {
        const product = data.data;

        setForm({
          name: product.name || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          price: product.price || 0,
          oldPrice: product.oldPrice || 0,
          sku: product.sku || "",
          stock: product.stock || 0,
          brand: product.brand?._id || product.brand || "",
          category: product.category?._id || product.category || "",
          thumbnail: product.thumbnail || "",
          images: product.images || [],
          attributes: product.attributes || [],
          options: product.options || [],
          isTodayDeal: product.isTodayDeal || false,
          isComingSoon: product.isComingSoon || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
          isFeatured: product.isFeatured || false,
        });
      } else {
        throw new Error(data.error || "Failed to load product");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load product";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching product:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["price", "oldPrice", "stock"].includes(name)
            ? value === ""
              ? 0
              : parseFloat(value)
            : value,
    }));
  };

  const handleThumbnailUpload = (url: string) => {
    if (!url) {
      toast.error("Thumbnail upload failed");
      return;
    }
    setForm((prev) => ({ ...prev, thumbnail: url }));
    toast.success("Thumbnail uploaded successfully");
  };

  const handleRemoveThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: "" }));
  };

  const handleImagesUpload = (url: string) => {
    if (!url) {
      toast.error("Image upload failed");
      return;
    }
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    toast.success("Image added successfully");
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddAttribute = () => {
    if (!newAttribute.name.trim() || !newAttribute.value.trim()) {
      toast.error("Please fill in both name and value");
      return;
    }
    setForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, newAttribute],
    }));
    setNewAttribute({ name: "", value: "" });
    toast.success("Attribute added");
  };

  const handleRemoveAttribute = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleAddOption = () => {
    if (!newOption.name.trim() || !newOption.value.trim()) {
      toast.error("Please fill in both option name and value");
      return;
    }

    setForm((prev) => {
      const existingOptionIndex = prev.options.findIndex(
        (opt) => opt.name.toLowerCase() === newOption.name.toLowerCase()
      );

      if (existingOptionIndex !== -1) {
        const updatedOptions = [...prev.options];
        const existingValues = updatedOptions[existingOptionIndex].values;
        const uniqueValues = Array.from(
          new Set([...existingValues, newOption.value])
        );
        updatedOptions[existingOptionIndex] = {
          ...updatedOptions[existingOptionIndex],
          values: uniqueValues,
        };
        return { ...prev, options: updatedOptions };
      } else {
        return {
          ...prev,
          options: [
            ...prev.options,
            { name: newOption.name, values: [newOption.value] },
          ],
        };
      }
    });

    setNewOption({ name: "", value: "" });
    toast.success("Option added");
  };

  const handleRemoveOptionValue = (optionName: string, valueIndex: number) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options
        .map((opt) =>
          opt.name === optionName
            ? {
              ...opt,
              values: opt.values.filter((_, i) => i !== valueIndex),
            }
            : opt
        )
        .filter((opt) => opt.values.length > 0),
    }));
  };

  const handleRemoveOption = (optionName: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.name !== optionName),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      const msg = "Product name is required";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.description.trim()) {
      const msg = "Description is required";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (form.price <= 0) {
      const msg = "Price must be greater than 0";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.sku.trim()) {
      const msg = "SKU is required";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.brand) {
      const msg = "Brand is required";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.category) {
      const msg = "Category is required";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.thumbnail) {
      const msg = "Thumbnail image is required";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      isEdit ? "Updating product..." : "Creating product..."
    );

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit
        ? `/api/admin/products/${params?.id}`
        : "/api/admin/products";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(toastId);
        toast.success(
          `Product ${isEdit ? "updated" : "created"} successfully!`
        );
        setTimeout(() => {
          router.push("/admin/products");
        }, 500);
      } else {
        throw new Error(data.error || "Failed to save product");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error saving product";
      setError(errorMessage);
      toast.dismiss(toastId);
      toast.error(errorMessage);
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
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
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                disabled={isEdit || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:bg-gray-100 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              rows={2}
              maxLength={500}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.shortDescription.length}/500 characters
            </p>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Pricing & Stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ({currency}) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Old Price ({currency})
              </label>
              <input
                type="number"
                name="oldPrice"
                value={form.oldPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Brand & Category */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Organization
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <select
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* IMPROVED Images Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Product Images
          </h2>

          {/* Thumbnail Section */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Primary Image (Thumbnail) *
            </label>
            <div className="flex items-start gap-6">
              {form.thumbnail ? (
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-lg border-2 border-brand-pink overflow-hidden bg-gray-100">
                    <Image
                      src={form.thumbnail}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="border-2 border-dashed border-pink-300 rounded-lg p-8 bg-pink-50 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium mb-1">
                      Click to upload primary image
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    <ImageUploader
                      onImageUpload={handleThumbnailUpload}
                      currentImage=""
                      folder="products"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Gallery Images (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Add up to 5 additional images to showcase your product
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Image Items */}
              {form.images.map((image, index) => (
                <div key={index} className="relative">
                  <div
                    onMouseEnter={() => setHoveredImageIndex(index)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                    className="relative w-full aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Image Number Badge */}
                    <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                      {index + 1}
                    </div>

                    {/* Delete Button - Only on Hover, stays within bounds */}
                    {hoveredImageIndex === index && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Image Button - Completely separate from images grid */}
              {form.images.length < 5 && (
                <div className="relative w-full aspect-square py-8">
                  <div className="w-full h-full rounded-lg  transition-colors flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {/* <div className="text-center">
                        <Plus size={28} className="mx-auto text-pink-400 mb-1" />
                        <p className="text-xs text-gray-600 font-medium">Add image</p>
                      </div> */}
                    </div>
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageUploader
                        onImageUpload={handleImagesUpload}
                        currentImage=""
                        folder="products"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {form.images.length > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                {form.images.length} of 5 images added
              </p>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Attributes (Optional)
          </h2>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Attribute name (e.g., Color, Size)"
                value={newAttribute.name}
                onChange={(e) =>
                  setNewAttribute((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Value (e.g., Red, Medium)"
                value={newAttribute.value}
                onChange={(e) =>
                  setNewAttribute((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddAttribute}
                disabled={loading}
                className="bg-brand-pink text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium transition-colors"
              >
                Add
              </button>
            </div>

            {form.attributes.length > 0 && (
              <div className="space-y-2">
                {form.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white border border-pink-300 rounded-lg p-3 hover:bg-pink-50 transition-colors"
                  >
                    <span className="text-sm">
                      <strong className="text-gray-900">{attr.name}:</strong>
                      <span className="text-gray-600 ml-2">{attr.value}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Product Options (Optional)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Add options like sizes, colors, storage capacity, etc.
          </p>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Option name (e.g., Size, Color, Storage)"
                value={newOption.name}
                onChange={(e) =>
                  setNewOption((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Option value (e.g., Small, Red, 64GB)"
                value={newOption.value}
                onChange={(e) =>
                  setNewOption((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                disabled={loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddOption}
                disabled={loading}
                className="bg-brand-pink text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 font-medium transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>

            {form.options.length > 0 && (
              <div className="space-y-3">
                {form.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className="bg-white border border-pink-300 rounded-lg p-4 hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {option.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(option.name)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value, valIndex) => (
                        <div
                          key={valIndex}
                          className="flex items-center gap-2 bg-pink-100 border border-pink-300 rounded-full px-3 py-1"
                        >
                          <span className="text-sm text-gray-700">{value}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveOptionValue(option.name, valIndex)
                            }
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200">
            Status
          </h2>

          <div className="space-y-3 bg-pink-50 border border-pink-300 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-pink-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                name="isTodayDeal"
                checked={form.isTodayDeal}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 accent-brand-pink disabled:opacity-50 cursor-pointer"
              />
              <span className="text-gray-700 font-medium">Today's Deal</span>
              <span className="text-xs text-gray-500">(Show as special offer)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-pink-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                name="isComingSoon"
                checked={form.isComingSoon}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 accent-brand-pink disabled:opacity-50 cursor-pointer"
              />
              <span className="text-gray-700 font-medium">Coming Soon</span>
              <span className="text-xs text-gray-500">(Product not yet available)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-pink-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 accent-brand-pink disabled:opacity-50 cursor-pointer"
              />
              <span className="text-gray-700 font-medium">Active</span>
              <span className="text-xs text-gray-500">(Available for purchase)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-pink-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 accent-brand-pink disabled:opacity-50 cursor-pointer"
              />
              <span className="text-gray-700 font-medium">Featured</span>
              <span className="text-xs text-gray-500">(Show on homepage)</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || isFetching}
            className="bg-brand-pink text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;