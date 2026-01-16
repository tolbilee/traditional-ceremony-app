'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

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
      {/* 배경 이미지 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 방법 1: public 폴더에 이미지 파일을 넣고 경로 지정 */}
        {/* 
        <Image
          src="/images/intro-background.jpg"
          alt="인트로 배경"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        */}
        
        {/* 방법 2: 외부 URL 사용 */}
        {/* 
        <Image
          src="https://example.com/intro-background.jpg"
          alt="인트로 배경"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        */}
        
        {/* 이미지 파일이 없을 경우를 위한 폴백 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-yellow-100 opacity-50" />
        
        {/* 이미지 위 오버레이 (텍스트 가독성을 위해) */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center space-y-4 px-6 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl font-bold text-white drop-shadow-lg md:text-4xl"
        >
          2026 한국의집
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg text-white drop-shadow-md md:text-xl"
        >
          전통혼례 및 돌잔치
          <br />
          온라인 신청
        </motion.p>
      </div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        onClick={handleEnter}
        className="relative z-10 mb-8 rounded-full bg-blue-600 px-10 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
      >
        입장하기
      </motion.button>
    </motion.div>
  );
}

