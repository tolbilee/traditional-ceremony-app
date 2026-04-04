'use client';

import { usePathname } from 'next/navigation';
import BottomNavigationBar from './BottomNavigationBar';

export default function ConditionalBottomNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith('/admin') ||
    pathname === '/qr' ||
    pathname.startsWith('/captions/admin') ||
    pathname.startsWith('/captions/view')
  ) {
    return null;
  }

  return <BottomNavigationBar />;
}
