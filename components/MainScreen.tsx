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
      {/* 상단 비주얼 영역 (70%) - 활성 탭과 연결되는 부분 */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {/* 활성 탭과 연결되는 확장 영역 - 물방울 효과 */}
        <div 
          className="absolute bottom-0 z-30 transition-all duration-300 ease-in-out"
          style={{
            left: activeTab === 'wedding' ? 'calc(50% - 160px)' : 'calc(50% - 80px)',
            width: '160px',
            height: '60px',
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 160 60"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 0 
                 L 160 0 
                 L 160 40 
                 Q 140 50 120 55 
                 Q 100 58 80 60 
                 Q 60 58 40 55 
                 Q 20 50 0 40 Z"
              fill={activeTab === 'wedding' ? '#2E5BB6' : '#D4AF37'}
            />
          </svg>
        </div>
        
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

      {/* 하단 메뉴 영역 - 화이트 카드로 묶기 */}
      <div 
        className="relative w-full bg-white rounded-t-3xl z-20"
        style={{
          marginTop: '-20px',
          boxShadow: '0 -10px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* 탭 버튼들 - 물방울형 연결 효과 */}
        <div className="flex justify-center pt-6 relative">
          <div className="flex relative">
            {/* 전통혼례 탭 */}
            <button
              onClick={() => handleTabClick('wedding')}
              className={`relative px-8 py-3 text-lg font-semibold transition-all duration-300 overflow-visible ${
                activeTab === 'wedding'
                  ? 'text-white z-10'
                  : 'text-gray-800 z-0'
              }`}
              style={{
                backgroundColor: activeTab === 'wedding' ? '#2E5BB6' : 'transparent',
                fontFamily: 'Pretendard, sans-serif',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: activeTab === 'wedding' ? '0' : '1rem',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }}
            >
              <span className="relative z-10">전통혼례</span>
              {/* 활성 탭일 때 하단 물방울 곡선 효과 */}
              {activeTab === 'wedding' && (
                <svg
                  className="absolute bottom-0 left-0 w-full pointer-events-none"
                  style={{ 
                    height: '24px',
                    transform: 'translateY(100%)',
                  }}
                  viewBox="0 0 160 24"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 0 
                       L 160 0 
                       Q 140 8 120 12 
                       Q 100 16 80 18 
                       Q 60 16 40 12 
                       Q 20 8 0 0 Z"
                    fill="#2E5BB6"
                  />
                </svg>
              )}
            </button>
            
            {/* 돌잔치 탭 */}
            <button
              onClick={() => handleTabClick('doljanchi')}
              className={`relative px-8 py-3 text-lg font-semibold transition-all duration-300 overflow-visible ${
                activeTab === 'doljanchi'
                  ? 'text-white z-10'
                  : 'text-gray-800 z-0'
              }`}
              style={{
                backgroundColor: activeTab === 'doljanchi' ? '#D4AF37' : 'transparent',
                fontFamily: 'Pretendard, sans-serif',
                borderTopLeftRadius: activeTab === 'doljanchi' ? '0' : '1rem',
                borderTopRightRadius: '1rem',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
              }}
            >
              <span className="relative z-10">돌잔치</span>
              {/* 활성 탭일 때 하단 물방울 곡선 효과 */}
              {activeTab === 'doljanchi' && (
                <svg
                  className="absolute bottom-0 left-0 w-full pointer-events-none"
                  style={{ 
                    height: '24px',
                    transform: 'translateY(100%)',
                  }}
                  viewBox="0 0 160 24"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 0 
                       L 160 0 
                       Q 140 8 120 12 
                       Q 100 16 80 18 
                       Q 60 16 40 12 
                       Q 20 8 0 0 Z"
                    fill="#D4AF37"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 버튼 영역 - 여백을 넉넉하게 */}
        <div className="flex flex-col items-center justify-center px-5 py-8 pb-12">
          <div className="flex gap-4 w-[90%] max-w-md">
            {/* 온라인 신청하기 버튼 */}
            <Link
              href={activeTab === 'wedding' ? '/apply/wedding' : '/apply/doljanchi'}
              className="flex-1 rounded-xl px-6 text-center text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#FF4B3A',
                fontFamily: 'Pretendard, sans-serif',
                boxShadow: '0 4px 12px rgba(255, 75, 58, 0.3)',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                minHeight: '56px',
              }}
            >
              온라인 신청하기
            </Link>

            {/* 맛보기 버튼 */}
            <Link
              href={activeTab === 'wedding' ? '/wedding/program' : '/doljanchi/program'}
              className="flex-1 rounded-xl px-6 text-center text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#4DA9FF',
                fontFamily: 'Pretendard, sans-serif',
                boxShadow: '0 4px 12px rgba(77, 169, 255, 0.3)',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                minHeight: '56px',
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
