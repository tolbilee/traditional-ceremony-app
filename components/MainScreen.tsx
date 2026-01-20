'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type TabType = 'wedding' | 'doljanchi';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('wedding');

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      {/* 상단 비주얼 영역 (70%) */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {/* 슬라이딩 컨테이너 */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{
            width: '200%',
            transform: activeTab === 'wedding' ? 'translateX(0)' : 'translateX(-50%)',
          }}
        >
          {/* 전통혼례 비주얼 */}
          <div
            className="relative h-full w-1/2 flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: '#2E5BB6' }}
          >
            {/* 텍스트 오버레이 */}
            <div className="absolute left-6 top-6 z-10 text-white">
              <p className="text-sm font-sans mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                2026 사회적배려대상자
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ fontFamily: '"Noto Serif KR", "나눔명조", serif' }}
              >
                전통혼례 및
                <br />
                돌잔치
              </h1>
            </div>

            {/* 일러스트 영역 - 혼례 커플 이미지가 들어갈 자리 */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                {/* 실제 이미지가 있으면 여기에 img 태그로 교체 */}
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-white/50 text-sm">혼례 커플 일러스트</span>
                </div>
              </div>
            </div>
          </div>

          {/* 돌잔치 비주얼 */}
          <div
            className="relative h-full w-1/2 flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: '#D4AF37' }}
          >
            {/* 텍스트 오버레이 */}
            <div className="absolute left-6 top-6 z-10 text-white">
              <p className="text-sm font-sans mb-2" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                2026 사회적배려대상자
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold leading-tight"
                style={{ fontFamily: '"Noto Serif KR", "나눔명조", serif' }}
              >
                전통혼례 및
                <br />
                돌잔치
              </h1>
            </div>

            {/* 일러스트 영역 - 돌잡이 아이 이미지가 들어갈 자리 */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                {/* 실제 이미지가 있으면 여기에 img 태그로 교체 */}
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-white/50 text-sm">돌잡이 아이 일러스트</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 메뉴 영역 (30%) */}
      <div className="relative h-[30vh] w-full bg-white">
        {/* 탭 버튼들 - 메뉴 영역 상단에 겹쳐서 배치 */}
        <div className="relative -mt-8 flex justify-center z-10">
          <div className="flex shadow-lg" style={{ borderRadius: '1rem 1rem 0 0' }}>
            <button
              onClick={() => handleTabClick('wedding')}
              className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                activeTab === 'wedding'
                  ? 'text-white'
                  : 'text-gray-800'
              }`}
              style={{
                backgroundColor: activeTab === 'wedding' ? '#2E5BB6' : 'white',
                fontFamily: 'Pretendard, sans-serif',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: activeTab === 'wedding' ? '0' : '1rem',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }}
            >
              전통혼례
            </button>
            <button
              onClick={() => handleTabClick('doljanchi')}
              className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
                activeTab === 'doljanchi'
                  ? 'text-white'
                  : 'text-gray-800'
              }`}
              style={{
                backgroundColor: activeTab === 'doljanchi' ? '#D4AF37' : 'white',
                fontFamily: 'Pretendard, sans-serif',
                borderTopLeftRadius: activeTab === 'doljanchi' ? '0' : '1rem',
                borderTopRightRadius: '1rem',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }}
            >
              돌잔치
            </button>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col items-center justify-center h-full px-6 pb-6">
          <div className="flex gap-4 w-full max-w-md">
            {/* 온라인 신청하기 버튼 */}
            <Link
              href={activeTab === 'wedding' ? '/apply/wedding' : '/apply/doljanchi'}
              className="flex-1 rounded-xl px-6 py-4 text-center text-base font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#FF4B3A',
                fontFamily: 'Pretendard, sans-serif',
                boxShadow: '0 4px 12px rgba(255, 75, 58, 0.3)',
              }}
            >
              온라인 신청하기
            </Link>

            {/* 맛보기 버튼 */}
            <Link
              href={activeTab === 'wedding' ? '/wedding/program' : '/doljanchi/program'}
              className="flex-1 rounded-xl px-6 py-4 text-center text-base font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#4DA9FF',
                fontFamily: 'Pretendard, sans-serif',
                boxShadow: '0 4px 12px rgba(77, 169, 255, 0.3)',
              }}
            >
              {activeTab === 'wedding' ? '전통혼례 맛보기' : '돌잔치 맛보기'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
