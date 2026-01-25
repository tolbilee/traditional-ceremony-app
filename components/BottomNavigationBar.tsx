'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { INQUIRY_PHONE } from '@/lib/utils/constants';

export default function BottomNavigationBar() {
  const pathname = usePathname();
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md bg-white/95 backdrop-blur-sm border-t border-gray-100"
      style={{
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="grid grid-cols-3 gap-1 px-2 py-2">
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-base font-medium text-gray-600 transition-all hover:bg-gray-50 active:scale-95"
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-sm">홈으로</span>
        </Link>
        <Link
          href="/my-applications"
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-base font-medium text-blue-600 transition-all hover:bg-blue-50 active:scale-95"
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm">나의 신청내역</span>
        </Link>
        <a
          href={`tel:${INQUIRY_PHONE}`}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-base font-medium text-red-500 transition-all hover:bg-red-50 active:scale-95"
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
          <span className="text-sm">전화 문의</span>
        </a>
      </div>
    </div>
  );
}
