'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DevPage() {
  const router = useRouter();
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // 쿠키에서 dev 모드 확인
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const devCookie = cookies.find(c => c.trim().startsWith('dev-mode='));
      if (devCookie && devCookie.split('=')[1] === 'true') {
        setDevMode(true);
      }
    }
  }, []);

  const enableDevMode = () => {
    // 쿠키 설정 (30일 유지)
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `dev-mode=true; expires=${expires.toUTCString()}; path=/`;
    setDevMode(true);
  };

  const disableDevMode = () => {
    // 쿠키 삭제
    document.cookie = 'dev-mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setDevMode(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            개발자 모드
          </h1>
          <p className="mb-6 text-gray-600">
            로컬 개발 환경에서 PC에서도 모바일 웹을 확인할 수 있습니다.
          </p>

          {devMode ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-800">
                  ✓ 개발자 모드가 활성화되었습니다
                </p>
                <p className="mt-2 text-xs text-green-700">
                  이제 PC에서도 모든 페이지에 접근할 수 있습니다.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-all hover:bg-blue-700"
                >
                  홈으로 이동
                </Link>
                
                <button
                  onClick={disableDevMode}
                  className="w-full rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-300"
                >
                  개발자 모드 비활성화
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-yellow-50 p-4 text-left">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ 주의사항
                </p>
                <ul className="list-inside list-disc space-y-1 text-xs text-yellow-700">
                  <li>이 모드는 로컬 개발 환경에서만 사용하세요</li>
                  <li>프로덕션 환경에서는 사용하지 마세요</li>
                  <li>모바일 체크가 비활성화됩니다</li>
                </ul>
              </div>

              <button
                onClick={enableDevMode}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
              >
                개발자 모드 활성화
              </button>
            </div>
          )}

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
            <p className="text-xs text-gray-600">
              <strong>사용 방법:</strong>
              <br />
              1. "개발자 모드 활성화" 버튼을 클릭하세요
              <br />
              2. "홈으로 이동" 버튼을 클릭하여 메인 페이지로 이동하세요
              <br />
              3. 이제 PC에서도 모든 페이지에 접근할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
