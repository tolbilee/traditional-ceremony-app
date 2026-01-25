'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';
import MainScreen from '@/components/MainScreen';

const INTRO_STORAGE_KEY = 'intro_shown_date';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 하루에 한 번만 인트로 화면 표시
    if (typeof window !== 'undefined') {
      const today = new Date().toDateString();
      const lastShownDate = localStorage.getItem(INTRO_STORAGE_KEY);
      
      // 오늘 보지 않았으면 인트로 화면 표시
      if (lastShownDate !== today) {
        setShowIntro(true);
      }
    }
  }, []);

  const handleIntroEnter = () => {
    // 오늘 날짜를 localStorage에 저장
    if (typeof window !== 'undefined') {
      const today = new Date().toDateString();
      localStorage.setItem(INTRO_STORAGE_KEY, today);
    }
    setShowIntro(false);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {showIntro && (
          <IntroScreen onEnter={handleIntroEnter} />
        )}
      </AnimatePresence>
      {!showIntro && <MainScreen />}
    </div>
  );
}
