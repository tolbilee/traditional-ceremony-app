'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { INQUIRY_PHONE } from '@/lib/utils/constants';

type ViewMode = 'split' | 'wedding' | 'doljanchi';

export default function MainScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const handleSectionClick = (mode: 'wedding' | 'doljanchi') => {
    setViewMode(mode);
  };

  const handleClose = () => {
    setViewMode('split');
  };

  // 애니메이션 변수 계산
  const weddingWidth = viewMode === 'split' ? '50%' : viewMode === 'wedding' ? '100%' : '0%';
  const weddingX = viewMode === 'split' ? '0%' : viewMode === 'wedding' ? '0%' : '-100%';
  
  const doljanchiWidth = viewMode === 'split' ? '50%' : viewMode === 'doljanchi' ? '100%' : '0%';
  const doljanchiX = viewMode === 'split' ? '0%' : viewMode === 'doljanchi' ? '0%' : '100%';

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ backgroundColor: '#FDFCF8' }}>
      <div className="relative flex h-full w-full">
        {/* 전통혼례 섹션 */}
        <motion.div
          animate={{
            width: weddingWidth,
            x: weddingX,
          }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1], // cubic-bezier for smooth animation
          }}
          className="relative flex h-full flex-shrink-0 flex-col items-center justify-center"
          style={{ backgroundColor: '#1a365d' }}
        >
          {viewMode === 'split' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center space-y-6 px-8"
              onClick={() => handleSectionClick('wedding')}
            >
              <h2
                className="text-center text-4xl font-serif font-bold text-white"
                style={{ fontFamily: 'serif' }}
              >
                전통혼례
              </h2>
              <p className="text-center text-lg text-white/80">클릭하여 선택</p>
            </motion.div>
          ) : viewMode === 'wedding' ? (
            <>
              {/* 닫기 버튼 */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleClose}
                className="absolute right-6 top-6 z-10 rounded-full p-3 text-white transition-all hover:bg-white/20"
                aria-label="홈으로 돌아가기"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* 메뉴 버튼들 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center space-y-6 px-8"
              >
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12 text-center text-5xl font-serif font-bold text-white"
                  style={{ fontFamily: 'serif' }}
                >
                  전통혼례
                </motion.h2>

                <div className="flex w-full max-w-md flex-col space-y-4">
                  <Link
                    href="/apply/wedding"
                    className="group relative block w-full overflow-hidden rounded-lg px-8 py-6 text-center text-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: '#D4AF37',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    <span className="relative z-10">온라인 신청</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>

                  <Link
                    href="/wedding/program"
                    className="group relative block w-full overflow-hidden rounded-lg border-2 border-white/30 bg-white/10 px-8 py-6 text-center text-xl font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20 active:scale-95"
                    style={{
                      fontFamily: 'sans-serif',
                    }}
                  >
                    <span className="relative z-10">전통혼례 맛보기</span>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </div>
              </motion.div>
            </>
          ) : null}
        </motion.div>

        {/* 돌잔치 섹션 */}
        <motion.div
          animate={{
            width: doljanchiWidth,
            x: doljanchiX,
          }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="relative flex h-full flex-shrink-0 flex-col items-center justify-center"
          style={{ backgroundColor: '#c53030' }}
        >
          {viewMode === 'split' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center space-y-6 px-8"
              onClick={() => handleSectionClick('doljanchi')}
            >
              <h2
                className="text-center text-4xl font-serif font-bold text-white"
                style={{ fontFamily: 'serif' }}
              >
                돌잔치
              </h2>
              <p className="text-center text-lg text-white/80">클릭하여 선택</p>
            </motion.div>
          ) : viewMode === 'doljanchi' ? (
            <>
              {/* 닫기 버튼 */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleClose}
                className="absolute right-6 top-6 z-10 rounded-full p-3 text-white transition-all hover:bg-white/20"
                aria-label="홈으로 돌아가기"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* 메뉴 버튼들 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center space-y-6 px-8"
              >
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-12 text-center text-5xl font-serif font-bold text-white"
                  style={{ fontFamily: 'serif' }}
                >
                  돌잔치
                </motion.h2>

                <div className="flex w-full max-w-md flex-col space-y-4">
                  <Link
                    href="/apply/doljanchi"
                    className="group relative block w-full overflow-hidden rounded-lg px-8 py-6 text-center text-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: '#D4AF37',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    <span className="relative z-10">온라인 신청</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>

                  <Link
                    href="/doljanchi/program"
                    className="group relative block w-full overflow-hidden rounded-lg border-2 border-white/30 bg-white/10 px-8 py-6 text-center text-xl font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20 active:scale-95"
                    style={{
                      fontFamily: 'sans-serif',
                    }}
                  >
                    <span className="relative z-10">돌잔치 맛보기</span>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </div>
              </motion.div>
            </>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
