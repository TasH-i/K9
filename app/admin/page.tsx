"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Package, Tag, Percent, MessageSquare, Users, ShoppingCart } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalCoupons: number;
  pendingReviews: number;
  totalUsers: number;
  totalOrders: number;
}

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalCoupons: 0,
    pendingReviews: 0,
    totalUsers: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          productsRes,
          categoriesRes,
          brandsRes,
          couponsRes,
          reviewsRes,
        ] = await Promise.all([
          fetch("/api/admin/products?limit=1"),
          fetch("/api/admin/categories?limit=1"),
          fetch("/api/admin/brands?limit=1"),
          fetch("/api/admin/coupons?limit=1"),
          fetch("/api/admin/reviews?approved=false&limit=1"),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();
        const couponsData = await couponsRes.json();
        const reviewsData = await reviewsRes.json();

        setStats({
          totalProducts: productsData.pagination?.total || 0,
          totalCategories: categoriesData.pagination?.total || 0,
          totalBrands: brandsData.pagination?.total || 0,
          totalCoupons: couponsData.pagination?.total || 0,
          pendingReviews: reviewsData.pagination?.total || 0,
          totalUsers: 0,
          totalOrders: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Jan", sales: 4000, revenue: 2400 },
    { name: "Feb", sales: 3000, revenue: 1398 },
    { name: "Mar", sales: 2000, revenue: 9800 },
    { name: "Apr", sales: 2780, revenue: 3908 },
    { name: "May", sales: 1890, revenue: 4800 },
    { name: "Jun", sales: 2390, revenue: 3800 },
  ];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: Tag,
      color: "bg-green-500",
    },
    {
      title: "Brands",
      value: stats.totalBrands,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "Active Coupons",
      value: stats.totalCoupons,
      icon: Percent,
      color: "bg-orange-500",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: MessageSquare,
      color: "bg-red-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-indigo-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`${card.color} p-4 rounded-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/products/new"
            className="block p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-center font-medium transition-colors"
          >
            Add Product
          </a>
          <a
            href="/admin/categories/new"
            className="block p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-center font-medium transition-colors"
          >
            Add Category
          </a>
          <a
            href="/admin/coupons/new"
            className="block p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-center font-medium transition-colors"
          >
            Create Coupon
          </a>
          <a
            href="/admin/reviews"
            className="block p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-center font-medium transition-colors"
          >
            Review Pending
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;