"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Search, Shield, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isActive: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  createdAt: string;
  lastLogin?: string;
}

const UsersPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Note: This assumes you have a GET /api/admin/users endpoint
      // If not, you'll need to create it following the same pattern as other routes
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });

      if (filter !== "all") {
        query.append("filter", filter);
      }

      const response = await fetch(`/api/admin/users?${query}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        console.error("Failed to fetch users:", data.error);
        // Set dummy data for demonstration if API doesn't exist yet
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, isActive: !currentStatus } : u
          )
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (
      confirm(
        `Are you sure you want to delete user ${userName}? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUsers(users.filter((u) => u._id !== userId));
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const getLocationText = (user: User): string => {
    if (!user.address) return "N/A";
    const parts = [user.address.city, user.address.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 mb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="inactive">Inactive Users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
          <option value="admin">Admin Users</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-600 text-sm font-medium">Total Users</div>
          <div className="text-3xl font-bold text-gray-800 mt-2">{total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-600 text-sm font-medium">Active Users</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {users.filter((u) => u.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-600 text-sm font-medium">Verified</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {users.filter((u) => u.isVerified).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-gray-600 text-sm font-medium">Admin Users</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {users.filter((u) => u.isAdmin).length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Joined
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {total === 0
                      ? "No users found in database. API endpoint may not be configured yet."
                      : "No users matching your search criteria"}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          {user.isAdmin && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                              <Shield size={12} /> Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getLocationText(user)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                        {user.isVerified && (
                          <span
                            className="inline-flex items-center gap-1 text-green-600"
                            title="Email verified"
                          >
                            <CheckCircle size={14} />
                          </span>
                        )}
                        {!user.isVerified && (
                          <span
                            className="inline-flex items-center gap-1 text-red-600"
                            title="Email not verified"
                          >
                            <XCircle size={14} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() =>
                          handleStatusChange(user._id, user.isActive)
                        }
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                          user.isActive
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        }`}
                        title={
                          user.isActive ? "Deactivate user" : "Activate user"
                        }
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/users/${user._id}`)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-xs"
                        title="Edit user"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-xs"
                        title="Delete user"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1-{Math.min(10, total)} of {total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* API Integration Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> To fully enable user management, you need to create the API endpoint:
          <code className="bg-blue-100 px-2 py-1 rounded mx-1">/api/admin/users/route.ts</code>
          following the same pattern as the product/brand routes.
        </p>
      </div>
    </div>
  );
};

export default UsersPage;