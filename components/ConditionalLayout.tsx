'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Layouts/Header';
import Footer from '@/components/Layouts/Footer';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages where we DON'T want to show header and footer
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(pathname);

  if (isAuthPage) {
    // Return only children (no header/footer)
    return <>{children}</>;
  }

  // Return with header and footer for all other pages
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}