'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface IntroScreenProps {
  onEnter: () => void;
}

export default function IntroScreen({ onEnter }: IntroScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-yellow-50"
    >
      {/* 배경 이미지/영상 영역 - 실제 이미지로 교체 필요 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-yellow-100 opacity-50" />
      
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-4 px-6 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl font-bold text-gray-800 md:text-4xl"
        >
          2026 한국의 집
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg text-gray-700 md:text-xl"
        >
          전통혼례 및 돌잔치
          <br />
          온라인 신청 시스템
        </motion.p>
      </div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        onClick={handleEnter}
        className="relative z-10 mb-8 rounded-full bg-blue-600 px-10 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
      >
        환영합니다 (입장하기)
      </motion.button>
    </motion.div>
  );
}
