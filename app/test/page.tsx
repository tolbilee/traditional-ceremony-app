'use client';

import MainScreen from '@/components/MainScreen';

// 관리자 테스트용 페이지
// 이 경로로 접근하면 오픈 안내 화면을 건너뛰고 바로 메인 화면으로 이동
export default function TestPage() {
  return (
    <div className="min-h-screen bg-white">
      <MainScreen />
    </div>
  );
}
