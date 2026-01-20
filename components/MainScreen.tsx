'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type TabType = 'wedding' | 'doljanchi';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('wedding');

  // 컬러 정의
  const colors = {
    wedding: '#2E5BB6', // 진청색
    doljanchi: '#D4AF37', // 황금색
    apply: '#FF4B3A', // 신청 버튼 빨강
    preview: '#4DA9FF', // 맛보기 버튼 하늘
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white flex flex-col">
      
      {/* 1. 상단 비주얼 영역: 배경색이 탭과 동기화됨 */}
      <motion.div 
        className="relative h-[60%] w-full transition-colors duration-500 ease-in-out"
        animate={{ backgroundColor: activeTab === 'wedding' ? colors.wedding : colors.doljanchi }}
      >
        {/* 텍스트 레이어 */}
        <div className="absolute left-8 top-12 z-10 text-white">
          <p className="text-sm font-light mb-1 opacity-90">2026 사회적배려대상자</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight font-serif">
            전통혼례 및<br />돌잔치
          </h1>
        </div>

        {/* 일러스트 슬라이딩 영역 */}
        <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="w-[70%] h-[70%] flex items-center justify-center"
            >
              {/* 실제 이미지 경로로 수정 필요 */}
              <img 
                src={activeTab === 'wedding' ? "/images/wedding_couple.png" : "/images/doljanchi_baby.png"} 
                alt="illustration"
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 2. 탭 및 하단 컨텐츠 영역 */}
      <div className="relative flex-1 bg-white">
        
        {/* 물방울형 탭 버튼 (배경색과 완벽히 결합) */}
        <div className="absolute -top-[1px] left-0 w-full flex justify-center">
          <div className="flex w-full px-4">
            
            {/* 전통혼례 탭 */}
            <button
              onClick={() => setActiveTab('wedding')}
              style={{ color: colors.wedding }}
              className={`relative flex-1 py-4 text-center font-bold text-lg transition-all duration-300 rounded-b-2xl
                ${activeTab === 'wedding' 
                  ? 'bg-current text-white inverted-radius-left inverted-radius-right' 
                  : 'bg-white text-gray-400'}`}
            >
              전통혼례
            </button>

            {/* 돌잔치 탭 */}
            <button
              onClick={() => setActiveTab('doljanchi')}
              style={{ color: colors.doljanchi }}
              className={`relative flex-1 py-4 text-center font-bold text-lg transition-all duration-300 rounded-b-2xl
                ${activeTab === 'doljanchi' 
                  ? 'bg-current text-white inverted-radius-left inverted-radius-right' 
                  : 'bg-white text-gray-400'}`}
            >
              돌잔치
            </button>

          </div>
        </div>

        {/* 3. 하단 버튼 영역 (이미지 자산과 동일한 비율) */}
        <div className="flex flex-col items-center justify-center h-full pt-16 px-6 gap-4">
          <div className="flex w-full gap-3 max-w-lg">
            <Link
              href="/apply"
              className="flex-1 py-5 rounded-2xl text-white text-center font-bold text-lg shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: colors.apply }}
            >
              온라인 신청하기
            </Link>
            
            <Link
              href="/preview"
              className="flex-1 py-5 rounded-2xl text-white text-center font-bold text-lg shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: activeTab === 'wedding' ? colors.preview : colors.preview }}
            >
              {activeTab === 'wedding' ? '전통혼례 맛보기' : '돌잔치 맛보기'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}