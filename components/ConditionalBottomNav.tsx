'use client';

import { usePathname } from 'next/navigation';
import BottomNavigationBar from './BottomNavigationBar';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  
  // 관리자 페이지('/admin/*')와 QR 페이지('/qr')일 때 네비게이션 바를 표시하지 않음
  // 홈화면('/')에서는 네비게이션 바 표시
  if (pathname.startsWith('/admin') || pathname === '/qr') {
    return null;
  }
  
  return <BottomNavigationBar />;
}
