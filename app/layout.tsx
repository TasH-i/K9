import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { Toaster } from "sonner";
import SessionProvider from "@/components/SessionProvider";
import AdminDashboardButton from "@/components/AdminDashboardButton";

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "K9-BUY",
  description: "Next.js + Tailwind + ShadCN setup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSans.variable} ${notoSansKR.variable} antialiased`}
      >
        <SessionProvider>
          <Toaster
            richColors
            position="top-right"
            closeButton
            duration={3000}
            toastOptions={{
              classNames: {
                toast:
                  "rounded-lg shadow-lg border border-gray-200 font-medium text-sm",
              },
            }}
          />
          <ConditionalLayout>{children}</ConditionalLayout>
          <AdminDashboardButton />
        </SessionProvider>
      </body>
    </html>
  );
}