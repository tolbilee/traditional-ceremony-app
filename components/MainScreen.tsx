'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type TabType = 'wedding' | 'doljanchi';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('wedding');

  const colors = {
    wedding: '#2E5BB6',
    doljanchi: '#D4AF37',
    textInactive: '#9CA3AF', // 비활성 상태 회색
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white flex flex-col">
      
      {/* 1. 상단 슬라이딩 배경 영역 */}
      <div className="relative h-[60%] w-full overflow-hidden">
        <motion.div 
          className="flex h-full w-[200%]"
          animate={{ x: activeTab === 'wedding' ? '0%' : '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* 전통혼례 배경 */}
          <div className="w-1/2 h-full relative" style={{ backgroundColor: colors.wedding }}>
            <div className="absolute left-8 top-12 text-white">
              <p className="text-sm opacity-80 mb-1">2026 사회적배려대상자</p>
              <h1 className="text-4xl font-bold font-serif">전통혼례 및<br />돌잔치</h1>
            </div>
            {/* 일러스트 삽입부 */}
            <div className="absolute right-4 bottom-10 w-1/2 h-1/2">
               <img src="/images/wedding_couple.png" alt="" className="object-contain w-full h-full" />
            </div>
          </div>

          {/* 돌잔치 배경 */}
          <div className="w-1/2 h-full relative" style={{ backgroundColor: colors.doljanchi }}>
            <div className="absolute left-8 top-12 text-white">
              <p className="text-sm opacity-80 mb-1">2026 사회적배려대상자</p>
              <h1 className="text-4xl font-bold font-serif">전통혼례 및<br />돌잔치</h1>
            </div>
            {/* 일러스트 삽입부 */}
            <div className="absolute right-4 bottom-10 w-1/2 h-1/2">
               <img src="/images/doljanchi_baby.png" alt="" className="object-contain w-full h-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. 탭 메뉴 영역 (중앙 경계선 물방울 트릭) */}
      <div className="relative flex-1 bg-white">
        <div className="absolute -top-[1px] left-0 w-full flex">
          
          {/* 전통혼례 탭: 왼쪽은 화면 끝에 꽉 채움 */}
          <button
            onClick={() => setActiveTab('wedding')}
            style={{ 
              backgroundColor: activeTab === 'wedding' ? colors.wedding : 'white',
              color: activeTab === 'wedding' ? 'white' : colors.textInactive 
            }}
            className={`relative flex-1 py-5 text-center font-bold text-lg transition-colors duration-300
              ${activeTab === 'wedding' ? 'curve-inner-right' : ''}`}
          >
            전통혼례
          </button>

          {/* 돌잔치 탭: 오른쪽은 화면 끝에 꽉 채움 */}
          <button
            onClick={() => setActiveTab('doljanchi')}
            style={{ 
              backgroundColor: activeTab === 'doljanchi' ? colors.doljanchi : 'white',
              color: activeTab === 'doljanchi' ? 'white' : colors.textInactive 
            }}
            className={`relative flex-1 py-5 text-center font-bold text-lg transition-colors duration-300
              ${activeTab === 'doljanchi' ? 'curve-inner-left' : ''}`}
          >
            돌잔치
          </button>

        </div>

        {/* 3. 하단 신청 버튼 영역 */}
        <div className="flex flex-col items-center justify-center h-full pt-20 px-6">
          <div className="flex w-full gap-4 max-w-md">
            <Link
              href={activeTab === 'wedding' ? '/apply/wedding' : '/apply/doljanchi'}
              className="flex-1 py-4 rounded-xl text-white text-center font-bold bg-[#FF4B3A] shadow-md"
            >
              온라인 신청하기
            </Link>
            <Link
              href={activeTab === 'wedding' ? '/wedding/program' : '/doljanchi/program'}
              className="flex-1 py-4 rounded-xl text-white text-center font-bold bg-[#4DA9FF] shadow-md"
            >
              {activeTab === 'wedding' ? '전통혼례 맛보기' : '돌잔치 맛보기'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}