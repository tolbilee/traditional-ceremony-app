'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ backgroundColor: '#FDFCF8' }}>
      <AnimatePresence mode="wait">
        {viewMode === 'split' ? (
          <motion.div
            key="split"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full"
          >
            {/* 전통혼례 섹션 (왼쪽) */}
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSectionClick('wedding')}
              className="relative flex h-full w-1/2 cursor-pointer flex-col items-center justify-center"
              style={{ backgroundColor: '#1a365d' }} // 깊은 청색
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-4xl font-serif font-bold text-white"
                  style={{ fontFamily: 'serif' }}
                >
                  전통혼례
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-lg text-white/80"
                >
                  클릭하여 선택
                </motion.p>
              </div>
            </motion.div>

            {/* 돌잔치 섹션 (오른쪽) */}
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSectionClick('doljanchi')}
              className="relative flex h-full w-1/2 cursor-pointer flex-col items-center justify-center"
              style={{ backgroundColor: '#c53030' }} // 연지색
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 px-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-4xl font-serif font-bold text-white"
                  style={{ fontFamily: 'serif' }}
                >
                  돌잔치
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-lg text-white/80"
                >
                  클릭하여 선택
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        ) : viewMode === 'wedding' ? (
          <motion.div
            key="wedding"
            initial={{ x: '-50%', width: '50%' }}
            animate={{ x: 0, width: '100%' }}
            exit={{ x: '-50%', width: '50%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="relative flex h-full flex-col items-center justify-center"
            style={{ backgroundColor: '#1a365d' }}
          >
            {/* 닫기 버튼 */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
            <div className="flex flex-col items-center justify-center space-y-6 px-8">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12 text-center text-5xl font-serif font-bold text-white"
                style={{ fontFamily: 'serif' }}
              >
                전통혼례
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex w-full max-w-md flex-col space-y-4"
              >
                <Link
                  href="/apply/wedding"
                  className="group relative block w-full overflow-hidden rounded-lg px-8 py-6 text-center text-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: '#D4AF37', // 금색
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
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="doljanchi"
            initial={{ x: '50%', width: '50%' }}
            animate={{ x: 0, width: '100%' }}
            exit={{ x: '50%', width: '50%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="relative flex h-full flex-col items-center justify-center"
            style={{ backgroundColor: '#c53030' }}
          >
            {/* 닫기 버튼 */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
            <div className="flex flex-col items-center justify-center space-y-6 px-8">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12 text-center text-5xl font-serif font-bold text-white"
                style={{ fontFamily: 'serif' }}
              >
                돌잔치
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex w-full max-w-md flex-col space-y-4"
              >
                <Link
                  href="/apply/doljanchi"
                  className="group relative block w-full overflow-hidden rounded-lg px-8 py-6 text-center text-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: '#D4AF37', // 금색
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
