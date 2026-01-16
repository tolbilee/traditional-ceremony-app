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
      className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-gradient-to-b from-blue-50 to-yellow-50"
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
        <Image
          src="https://cdn.imweb.me/thumbnail/20260116/a579b76ec6ca9.jpg"
          alt="인트로 배경"
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        onClick={handleEnter}
        className="relative z-10 mb-[82px] rounded-full bg-blue-600 px-10 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
      >
        입장하기
      </motion.button>
    </motion.div>
  );
}

