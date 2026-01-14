'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { INQUIRY_PHONE } from '@/lib/utils/constants';

export default function MainScreen() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* 헤더 */}
      <div className="px-4 py-2">
        <h1 className="text-xs text-gray-500">2026 한국의집</h1>
        <h2 className="text-base font-bold text-gray-900">전통혼례 및 돌잔치</h2>
      </div>

      {/* 상단: 전통혼례 섹션 */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-3 mb-2 flex flex-1 flex-col rounded-xl bg-blue-900 px-4 py-3 text-white"
      >
        {/* 일러스트 영역 (향후 이미지로 교체) */}
        <div className="mb-2 flex items-center justify-center">
          <div className="flex gap-2">
            <div className="h-12 w-12 rounded-full bg-blue-700/50" />
            <div className="h-12 w-12 rounded-full bg-blue-700/50" />
          </div>
        </div>

        <h2 className="mb-3 text-center text-xl font-bold">전통혼례</h2>
        
        {/* 4개 메뉴 버튼 - 시안에 맞게 레이아웃 조정 */}
        <div className="w-full space-y-2">
          {/* 첫 번째 버튼: 전체 너비 */}
          <Link
            href="/wedding/program"
            className="block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
          >
            프로그램 상세 소개
          </Link>
          
          {/* 나머지 3개 버튼: 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/apply/wedding"
              className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              온라인 신청
            </Link>
            <Link
              href="/wedding/events"
              className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              공연·이벤트
            </Link>
            <Link
              href="/wedding/menu"
              className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
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
        className="mx-3 mb-2 flex flex-1 flex-col rounded-xl bg-yellow-300 px-4 py-3"
      >
        {/* 일러스트 영역 (향후 이미지로 교체) */}
        <div className="mb-2 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-yellow-200/50" />
        </div>

        <h2 className="mb-3 text-center text-xl font-bold text-green-700">돌잔치</h2>
        
        {/* 4개 메뉴 버튼 - 시안에 맞게 레이아웃 조정 */}
        <div className="w-full space-y-2">
          {/* 첫 번째 버튼: 전체 너비 */}
          <Link
            href="/doljanchi/program"
            className="block w-full rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
          >
            프로그램 상세 소개
          </Link>
          
          {/* 나머지 3개 버튼: 2x2 그리드 */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/apply/doljanchi"
              className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              온라인 신청
            </Link>
            <Link
              href="/doljanchi/events"
              className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              이벤트
            </Link>
            <Link
              href="/doljanchi/menu"
              className="block rounded-lg bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
            >
              식사
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 하단 고정 바 - 나의 신청내역, 전화 문의하기 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mx-3 mb-2 space-y-2"
      >
        <Link
          href="/my-applications"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>나의 신청내역</span>
        </Link>
        <a
          href={`tel:${INQUIRY_PHONE}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
        >
          <svg
            className="h-5 w-5"
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
    </div>
  );
}

