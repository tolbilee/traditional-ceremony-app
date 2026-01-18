'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface IntroScreenProps {
  onEnter: () => void;
  allowEnter?: boolean; // 입장 허용 여부
}

export default function IntroScreen({ onEnter, allowEnter = false }: IntroScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    if (!allowEnter) return; // 입장이 허용되지 않으면 아무 동작도 하지 않음
    
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
    >
      {/* 그라데이션 오버레이로 더 부드러운 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-pink-600/80"></div>
      
      {/* 메인 컨텐츠 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg"
        >
          모바일 신청 서비스는
        </motion.h1>
        
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-8 drop-shadow-lg"
        >
          2026년 6월 22일 09:00에
        </motion.p>
        
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg"
        >
          오픈합니다.
        </motion.p>
      </motion.div>

      {/* 입장하기 버튼 (선택사항 - 필요시 주석 해제) */}
      {/* 
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        onClick={handleEnter}
        className="relative z-10 mt-12 rounded-full bg-white/20 backdrop-blur-sm px-10 py-3 text-lg font-semibold text-white border-2 border-white/30 shadow-lg transition-all hover:bg-white/30 hover:shadow-xl active:scale-95"
      >
        입장하기
      </motion.button>
      */}
    </motion.div>
  );
}
