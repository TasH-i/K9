"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  Percent,
  MessageSquare,
  Users,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Products", icon: Package, href: "/admin/products" },
    { name: "Categories", icon: Layers, href: "/admin/categories" },
    { name: "Brands", icon: Tag, href: "/admin/brands" },
    { name: "Coupons", icon: Percent, href: "/admin/coupons" },
    { name: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
    { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { name: "Users", icon: Users, href: "/admin/users" },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 ease-in-out fixed h-screen overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && (
            <h1 className="text-xl font-bold">K9 Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
              title={item.name}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-2 right-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? "ml-64" : "ml-20"} flex-1 transition-all duration-300`}>
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find((item) => isActive(item.href))?.name ||
                "Dashboard"}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session?.user?.email}</span>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-auto h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;