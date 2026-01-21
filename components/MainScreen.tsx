'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type TabType = 'wedding' | 'doljanchi';

const STORAGE_KEY = 'mainScreen_activeTab';

export default function MainScreen() {
  // Hydration 오류 방지: 초기값은 항상 'wedding'으로 고정
  const [activeTab, setActiveTab] = useState<TabType>('wedding');
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 localStorage에서 저장된 탭 상태를 읽어옴
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'wedding' || saved === 'doljanchi') {
        setActiveTab(saved as TabType);
      }
    }
  }, []);

  // activeTab이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, activeTab);
    }
  }, [activeTab, isMounted]);

  const colors = {
    wedding: '#2E5BB6',
    doljanchi: '#D4AF37',
    inactiveText: '#888888'
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white flex flex-col">
      
{/* 1. 배경 (Background): 즉시 슬라이딩 시작 */}
<div className="relative h-[60%] w-full overflow-hidden">
        {/* 부드러우면서도 일정한 속도로 이동하도록 베지어 곡선 사용 */}
        <motion.div 
          className="flex h-full w-[200%]"
          animate={{ x: activeTab === 'wedding' ? '0%' : '-50%' }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} 
        >
          <div className="w-1/2 h-full relative" style={{ backgroundColor: colors.wedding }}>
            {/* 내용 동일 */}
            <div className="absolute left-8 top-12 text-white z-10">
              <p className="text-sm opacity-80 mb-1">2026년 사회적 배려 대상자</p>
              <h1 className="text-4xl font-bold font-serif leading-tight">전통혼례 및<br />돌잔치</h1>
            </div>
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4 flex justify-end items-end p-4">
               <img src="/images/wedding_couple.png" alt="Wedding" className="object-contain max-h-full" />
            </div>
          </div>

          <div className="w-1/2 h-full relative" style={{ backgroundColor: colors.doljanchi }}>
            {/* 내용 동일 */}
            <div className="absolute left-8 top-12 text-white z-10">
              <p className="text-sm opacity-80 mb-1">2026년 사회적 배려 대상자</p>
              <h1 className="text-4xl font-bold font-serif leading-tight">전통혼례 및<br />돌잔치</h1>
            </div>
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4 flex justify-end items-end p-4">
               <img src="/images/doljanchi_baby.png" alt="Doljanchi" className="object-contain max-h-full scale-[0.7]" />
            </div>
          </div>
        </motion.div>
      </div>

{/* 2. 탭 (Tab) & 물방울 마스크 (Liquid Mask): 0.3초 지연 후 변화 */}
<div className="relative flex-1 bg-white">
        <div className="absolute -top-[1px] left-0 w-full flex h-[60px] z-30">
          
{/* 왼쪽 탭: 전통혼례 */}
<button
    onClick={() => setActiveTab('wedding')}
    style={{ 
      backgroundColor: activeTab === 'wedding' ? colors.wedding : 'white',
      color: activeTab === 'wedding' ? 'white' : colors.inactiveText,
      zIndex: activeTab === 'wedding' ? 30 : 10,
      '--tab-color': colors.wedding,
      /* 탭 본체 색상 변화 지연 (0.5s) */
      transition: 'background-color 0.2s ease, color 0.2s ease'
    } as any}
    /* curve-center-right는 항상 유지, tab-active만 조건부 추가 */
    className={`relative flex-1 flex items-center justify-center font-bold text-lg curve-center-right overflow-visible
      ${activeTab === 'wedding' ? 'tab-active rounded-br-[40px]' : ''}
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
      zIndex: activeTab === 'doljanchi' ? 30 : 10,
      '--tab-color': colors.doljanchi,
      /* 탭 본체 색상 변화 지연 (0.5s) */
      transition: 'background-color 0.2s ease, color 0.2s ease'
    } as any}
    /* curve-center-left는 항상 유지, tab-active만 조건부 추가 */
    className={`relative flex-1 flex items-center justify-center font-bold text-lg curve-center-left overflow-visible
      ${activeTab === 'doljanchi' ? 'tab-active rounded-bl-[40px]' : ''}
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
              {activeTab === 'wedding' ? '전통혼례 신청하기' : '돌잔치 신청하기'}
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