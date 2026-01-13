'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from '@/components/IntroScreen';
import MainScreen from '@/components/MainScreen';

export default function Home() {
  const [showMain, setShowMain] = useState(false);
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

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {!showMain ? (
          <IntroScreen key="intro" onEnter={() => setShowMain(true)} />
        ) : (
          <MainScreen key="main" />
        )}
      </AnimatePresence>
    </div>
  );
}
