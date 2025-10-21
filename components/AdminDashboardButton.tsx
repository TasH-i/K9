"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const AdminDashboardButton = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkAdminStatus = () => {
      // Check NextAuth session first (for OAuth users)
      if (status === "authenticated" && session?.user?.role === "admin") {
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }

      // Fallback to localStorage (for email/password users)
      try {
        const user = localStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          setIsAdmin(userData.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }

      setIsLoading(false);
    };

    // Only check after session is loaded
    if (status !== "loading") {
      checkAdminStatus();
    }
  }, [session, status]);

  // Wait for both session and admin check to load
  if (status === "loading" || isLoading) return null;

  // Hide on login and register pages
  const authPages = ["/login", "/register"];
  if (authPages.includes(pathname)) return null;

  // Only show for admins
  if (!isAdmin) return null;

  // Detect if user is in admin area
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {isAdminPage ? (
        // Client Home Page Button
        <a
          href="/"
          className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full",
            "bg-brand-pink text-white",
            "transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
          )}
          aria-label="Client Home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-house-heart"
          >
            <path d="M8.62 13.8A2.25 2.25 0 1 1 12 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-brand-pink animate-ping opacity-25"></div>
        </a>
      ) : (
        // Admin Dashboard Button
        <a
          href="/admin"
          className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full",
            "bg-brand-pink text-white",
            "transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
          )}
          aria-label="Admin Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shield-user"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
            <circle cx="12" cy="11" r="4" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-brand-pink animate-ping opacity-25"></div>
        </a>
      )}
    </>
  );
};

export default AdminDashboardButton;