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
    inactiveText: '#888888'
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white flex flex-col">
      
      {/* 1. 상단 슬라이딩 배경 영역: 동일 유지 */}
      <div className="relative h-[60%] w-full overflow-hidden">
        <motion.div 
          className="flex h-full w-[200%]"
          animate={{ x: activeTab === 'wedding' ? '0%' : '-50%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {/* 전통혼례 배경 */}
          <div className="w-1/2 h-full relative" style={{ backgroundColor: colors.wedding }}>
            <div className="absolute left-8 top-12 text-white z-10">
              <p className="text-sm opacity-80 mb-1">2026 사회적배려대상자</p>
              <h1 className="text-4xl font-bold font-serif leading-tight">전통혼례 및<br />돌잔치</h1>
            </div>
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4 flex justify-end items-end p-4">
               <img src="/images/wedding_couple.png" alt="Wedding" className="object-contain max-h-full" />
            </div>
          </div>

          {/* 돌잔치 배경 */}
          <div className="w-1/2 h-full relative" style={{ backgroundColor: colors.doljanchi }}>
            <div className="absolute left-8 top-12 text-white z-10">
              <p className="text-sm opacity-80 mb-1">2026 사회적배려대상자</p>
              <h1 className="text-4xl font-bold font-serif leading-tight">전통혼례 및<br />돌잔치</h1>
            </div>
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4 flex justify-end items-end p-4">
               <img src="/images/doljanchi_baby.png" alt="Doljanchi" className="object-contain max-h-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. 탭 메뉴 영역 (S자 곡선 완벽 수정 버전) */}
      <div className="relative flex-1 bg-white">
        <div className="absolute -top-[1px] left-0 w-full flex h-[60px] z-30">
          
  {/* 왼쪽 탭: 전통혼례 */}
<button
  onClick={() => setActiveTab('wedding')}
  style={{ 
    backgroundColor: activeTab === 'wedding' ? colors.wedding : 'white',
    color: activeTab === 'wedding' ? 'white' : colors.inactiveText,
    zIndex: activeTab === 'wedding' ? 20 : 10,
    '--tab-color': activeTab === 'wedding' ? colors.wedding : 'transparent',
    // [추가] 배경색과 글자색이 바뀌는 타이밍을 슬라이딩과 맞춤
    transition: 'background-color 0.3s ease 0.15s, color 0.3s ease 0.15s'
  } as any}
  className={`relative flex-1 flex items-center justify-center font-bold text-lg
    ${activeTab === 'wedding' 
      ? 'curve-center-right curve-active rounded-br-[30px] overflow-visible' 
      : 'overflow-hidden'}
  `}
>
  전통혼례
</button>

{/* 오른쪽 탭: 돌잔치 */}
<button
  onClick={() => setActiveTab('doljanchi')}
  style={{ 
    backgroundColor: activeTab === 'doljanchi' ? colors.doljanchi : 'white',
    color: activeTab === 'doljanchi' ? 'white' : colors.inactiveText,
    zIndex: activeTab === 'doljanchi' ? 20 : 10,
    '--tab-color': activeTab === 'doljanchi' ? colors.doljanchi : 'transparent',
    // [추가] 배경색과 글자색이 바뀌는 타이밍을 슬라이딩과 맞춤
    transition: 'background-color 0.3s ease 0.15s, color 0.3s ease 0.15s'
  } as any}
  className={`relative flex-1 flex items-center justify-center font-bold text-lg
    ${activeTab === 'doljanchi' 
      ? 'curve-center-left curve-active rounded-bl-[30px] overflow-visible' 
      : 'overflow-hidden'}
  `}
>
  돌잔치
</button>

        </div>

        {/* 3. 하단 신청 버튼 영역 (여백 넉넉히): 동일 유지 */}
        <div className="flex flex-col items-center justify-center h-full pt-16 px-6" style={{ marginTop: '-50px' }}>
          <div className="flex w-full gap-4 max-w-md">
            <Link
              href={activeTab === 'wedding' ? '/apply/wedding' : '/apply/doljanchi'}
              className="flex-1 py-5 rounded-2xl text-white text-center font-bold text-lg shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#FF4B3A' }}
            >
              온라인 신청하기
            </Link>
            
            <Link
              href={activeTab === 'wedding' ? '/wedding/program' : '/doljanchi/program'}
              className="flex-1 py-5 rounded-2xl text-white text-center font-bold text-lg shadow-lg active:scale-95 transition-transform"
              style={{ backgroundColor: '#4DA9FF' }}
            >
              {activeTab === 'wedding' ? '전통혼례 맛보기' : '돌잔치 맛보기'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}