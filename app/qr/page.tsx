'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodePage() {
  const [mobileUrl, setMobileUrl] = useState('');

  useEffect(() => {
    // 도메인을 사용하여 모바일 웹 URL 생성
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'https';
    const url = `${protocol}://k-ceremony.co.kr`;
    setMobileUrl(url);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            모바일에서 접속해주세요
          </h1>
          <p className="mb-6 text-gray-600">
            이 서비스는 모바일 기기에서만 이용 가능합니다.
            <br />
            아래 QR 코드를 스마트폰으로 스캔하여 접속해주세요.
          </p>

          {/* QR 코드 */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-xl bg-white p-4 shadow-lg">
              {mobileUrl && (
                <QRCodeSVG
                  value={mobileUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
          </div>

          {/* URL 표시 */}
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">접속 URL</p>
            <p className="break-all text-sm text-gray-600">{mobileUrl}</p>
          </div>

          {/* 안내 문구 */}
          <div className="rounded-lg bg-blue-50 p-4 text-left">
            <p className="text-sm text-blue-800">
              <strong>안내사항:</strong>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
              <li>스마트폰 카메라 앱을 열어주세요</li>
              <li>QR 코드를 카메라로 비춰주세요</li>
              <li>화면에 표시된 링크를 탭하여 접속하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
