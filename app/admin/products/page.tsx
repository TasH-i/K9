"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  brand: { name: string };
  category: { name: string };
  isActive: boolean;
}

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(`/api/admin/products?${query}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setProducts(products.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Product
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Price
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.brand.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() =>
                        router.push(`/admin/products/${product._id}`)
                      }
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing 1-{Math.min(10, total)} of {total} products
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;