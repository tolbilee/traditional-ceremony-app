'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';
import MainScreen from '@/components/MainScreen';

// 사이트 오픈 전까지 오픈 안내 화면만 표시
// 일반 사용자는 입장 불가, 관리자는 /test 경로로 접근
const SITE_OPEN_DATE = new Date('2026-06-22T09:00:00');
const IS_SITE_OPEN = new Date() >= SITE_OPEN_DATE;

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  // 사이트가 오픈되지 않았으면 오픈 안내 화면만 표시 (입장 불가)
  if (!IS_SITE_OPEN) {
    return (
      <div className="min-h-screen bg-white">
        <IntroScreen onEnter={() => {}} allowEnter={false} />
      </div>
    );
  }

  // 사이트가 오픈되었으면 기존 로직대로 동작
  return (
    <div className="min-h-screen bg-white">
      <MainScreen />
    </div>
  );
}
