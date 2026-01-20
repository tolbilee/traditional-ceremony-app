import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 개발 환경에서는 CSP를 완화하고, 프로덕션에서는 엄격하게 설정
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // CSP 헤더 설정
  // 카카오 주소검색 API를 위해 frame-src와 script-src에 t1.daumcdn.net 추가
  // 또한 postcode.map.daum.net도 iframe으로 사용될 수 있으므로 추가
  const csp = isDevelopment
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net https://*.daumcdn.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net https://*.daumcdn.net https://postcode.map.daum.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net https://postcode.map.daum.net; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: '/:path*',
};

