// components/ClientRootProvider.tsx
'use client';

import { useLoadCart } from '@/lib/hooks/useLoadCart';

interface ClientRootProviderProps {
  children: React.ReactNode;
}

export default function ClientRootProvider({ children }: ClientRootProviderProps) {
  // Load cart from database or localStorage on app load
  useLoadCart();

  return <>{children}</>;
}