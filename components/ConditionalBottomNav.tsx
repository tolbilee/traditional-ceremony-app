'use client';

import { usePathname } from 'next/navigation';
import BottomNavigationBar from './BottomNavigationBar';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  
  // 관리자 페이지('/admin/*')일 때만 네비게이션 바를 표시하지 않음
  // 홈화면('/')과 테스트 페이지('/test')에서는 네비게이션 바 표시
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return <BottomNavigationBar />;
}
