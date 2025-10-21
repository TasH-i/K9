"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  usageCount: number;
  maxUsageCount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const CouponsPage = () => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCoupons();
  }, [page, search]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(`/api/admin/coupons?${query}`);
      const data = await response.json();

      if (data.success) {
        setCoupons(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        const response = await fetch(`/api/admin/coupons/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCoupons(coupons.filter((c) => c._id !== id));
        }
      } catch (error) {
        console.error("Error deleting coupon:", error);
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
              placeholder="Search coupons..."
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
          href="/admin/coupons/new"
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Create Coupon
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Discount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Usage</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Valid Period</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No coupons found
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{coupon.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.discountValue}{coupon.discountType === "percentage" ? "%" : "$"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {coupon.usageCount} {coupon.maxUsageCount ? `/ ${coupon.maxUsageCount}` : ""}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                    {new Date(coupon.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => router.push(`/admin/coupons/${coupon._id}`)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
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
          Showing 1-{Math.min(10, total)} of {total} coupons
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

export default CouponsPage;