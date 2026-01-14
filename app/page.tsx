'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';
import MainScreen from '@/components/MainScreen';

const INTRO_SHOWN_KEY = 'intro-screen-shown';

export default function Home() {
  const [showMain, setShowMain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // sessionStorage에서 현재 세션에서 인트로를 봤는지 확인
    const hasSeenIntro = sessionStorage.getItem(INTRO_SHOWN_KEY);
    if (hasSeenIntro === 'true') {
      // 현재 세션에서 이미 인트로를 본 적이 있으면 바로 메인 화면 표시
      setShowMain(true);
    }
  }, []);

  const handleIntroEnter = () => {
    // 현재 세션에서 인트로 화면을 본 것으로 표시
    sessionStorage.setItem(INTRO_SHOWN_KEY, 'true');
    setShowMain(true);
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
      <AnimatePresence mode="wait">
        {!showMain ? (
          <IntroScreen key="intro" onEnter={handleIntroEnter} />
        ) : (
          <MainScreen key="main" />
        )}
      </AnimatePresence>
    </div>
  );
}
