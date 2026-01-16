'use client';

import { usePathname } from 'next/navigation';
import BottomNavigationBar from './BottomNavigationBar';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  
  // 홈화면('/')과 관리자 페이지('/admin/*')일 때는 네비게이션 바를 표시하지 않음
  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }
  
  return <BottomNavigationBar />;
}
