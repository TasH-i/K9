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

  // Check if current path starts with /admin or matches login/register
  const hideLayout =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/admin');
    
  if (hideLayout) {
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