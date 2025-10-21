"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface ProductForm {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number;
  cost: number;
  sku: string;
  stock: number;
  brand: string;
  category: string;
  images: string[];
  thumbnail: string;
  attributes: { name: string; value: string }[];
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  isActive: boolean;
  isFeatured: boolean;
}

const ProductForm = () => {
  const router = useRouter();
  const params = useParams();
  const isEdit: boolean = Boolean(params?.id && params.id !== "new");

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    shortDescription: "",
    price: 0,
    comparePrice: 0,
    cost: 0,
    sku: "",
    stock: 0,
    brand: "",
    category: "",
    images: [],
    thumbnail: "",
    attributes: [],
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
    },
    isActive: true,
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

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
        const brandsData = await brandsRes.json();
        setBrands(brandsData.data);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data);
      }
    } catch (error) {
      console.error("Error fetching brands and categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params?.id}`);
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageUpload = (url: string, filename: string) => {
    if (!form.thumbnail) {
      setForm((prev) => ({
        ...prev,
        thumbnail: url,
        images: [...prev.images, url],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    }
  };

  const handleAddAttribute = () => {
    setForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { name: "", value: "" }],
    }));
  };

  const handleAttributeChange = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const newAttributes = [...prev.attributes];
      newAttributes[index] = { ...newAttributes[index], [field]: value };
      return { ...prev, attributes: newAttributes };
    });
  };

  const handleRemoveAttribute = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setForm((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          metaKeywords: [...prev.seo.metaKeywords, newKeyword],
        },
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaKeywords: prev.seo.metaKeywords.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/admin/products/${params?.id}` : "/api/admin/products";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/products");
      } else {
        alert(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={isEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <select
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Pricing & Stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare Price
              </label>
              <input
                type="number"
                name="comparePrice"
                value={form.comparePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost
              </label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Images</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <ImageUploader
                onImageUpload={handleImageUpload}
                folder="products"
              />
            </div>

            {form.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Attributes</h2>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} /> Add Attribute
            </button>
          </div>

          <div className="space-y-3">
            {form.attributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Attribute name"
                  value={attr.name}
                  onChange={(e) =>
                    handleAttributeChange(index, "name", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Attribute value"
                  value={attr.value}
                  onChange={(e) =>
                    handleAttributeChange(index, "value", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Dimensions</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length (cm)
              </label>
              <input
                type="number"
                value={form.dimensions.length}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      length: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (cm)
              </label>
              <input
                type="number"
                value={form.dimensions.width}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      width: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={form.dimensions.height}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dimensions: {
                      ...prev.dimensions,
                      height: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">SEO</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={form.seo.metaTitle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaTitle: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={form.seo.metaDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value },
                  }))
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword and press button"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              {form.seo.metaKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.seo.metaKeywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Product is Active</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
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

export default ProductForm;