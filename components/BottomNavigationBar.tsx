'use client';

import Link from 'next/link';
import { INQUIRY_PHONE } from '@/lib/utils/constants';

export default function BottomNavigationBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md bg-white border-t-2 border-gray-200 shadow-lg">
      <div className="px-3 py-2 space-y-2">
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
      </div>
    </div>
  );
}
