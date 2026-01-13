'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { INQUIRY_PHONE } from '@/lib/utils/constants';

export default function MainScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <h1 className="text-sm text-gray-500">2026 한국의집</h1>
        <h2 className="text-xl font-bold text-gray-900">전통혼례 및 돌잔치</h2>
      </div>

      {/* 상단: 전통혼례 섹션 */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-4 mb-4 flex flex-1 flex-col rounded-2xl bg-blue-900 px-6 py-8 text-white"
      >
        {/* 일러스트 영역 (향후 이미지로 교체) */}
        <div className="mb-4 flex items-center justify-center">
          <div className="flex gap-4">
            <div className="h-24 w-24 rounded-full bg-blue-700/50" />
            <div className="h-24 w-24 rounded-full bg-blue-700/50" />
          </div>
        </div>

        <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">전통혼례</h2>
        
        {/* 4개 메뉴 버튼 - 시안에 맞게 레이아웃 조정 */}
        <div className="w-full space-y-3">
          {/* 첫 번째 버튼: 전체 너비 */}
          <Link
            href="/wedding/program"
            className="block w-full rounded-xl bg-white px-6 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
          >
            프로그램 상세 소개
          </Link>
          
          {/* 나머지 3개 버튼: 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/apply/wedding"
              className="block rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              온라인 신청
            </Link>
            <Link
              href="/wedding/events"
              className="block rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              공연·이벤트
            </Link>
            <Link
              href="/wedding/menu"
              className="block rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              식사
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 하단: 돌잔치 섹션 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-4 mb-4 flex flex-1 flex-col rounded-2xl bg-yellow-300 px-6 py-8"
      >
        {/* 일러스트 영역 (향후 이미지로 교체) */}
        <div className="mb-4 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-yellow-200/50" />
        </div>

        <h2 className="mb-6 text-center text-3xl font-bold text-green-700 md:text-4xl">돌잔치</h2>
        
        {/* 4개 메뉴 버튼 - 시안에 맞게 레이아웃 조정 */}
        <div className="w-full space-y-3">
          {/* 첫 번째 버튼: 전체 너비 */}
          <Link
            href="/doljanchi/program"
            className="block w-full rounded-xl bg-white px-6 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
          >
            프로그램 상세 소개
          </Link>
          
          {/* 나머지 3개 버튼: 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/apply/doljanchi"
              className="block rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              온라인 신청
            </Link>
            <Link
              href="/doljanchi/events"
              className="block rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              이벤트
            </Link>
            <Link
              href="/doljanchi/menu"
              className="block rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              식사
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 하단 고정 바 - 전화 문의하기 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-4 mb-4"
      >
        <a
          href={`tel:${INQUIRY_PHONE}`}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>전화 문의하기</span>
        </a>
      </motion.div>

      {/* 하단 바 높이만큼 여백 추가 */}
      <div className="h-24" />
    </div>
  );
}
