import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 모바일 기기 감지 함수
function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(userAgent);
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // 관리자 페이지와 API, QR 페이지는 제외
  const isAdminPage = pathname.startsWith('/admin');
  const isAPIRoute = pathname.startsWith('/api');
  const isQRPage = pathname === '/qr';
  const isStaticAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/images') || 
                        pathname.startsWith('/videos') ||
                        pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);

  // 제외된 경로는 그대로 통과
  if (isAdminPage || isAPIRoute || isQRPage || isStaticAsset) {
    return response;
  }

  // 모바일이 아닌 경우 QR 페이지로 리다이렉트
  if (!isMobileDevice(userAgent)) {
    const qrUrl = new URL('/qr', request.url);
    return NextResponse.redirect(qrUrl);
  }

  // 개발 환경에서는 CSP를 완화하고, 프로덕션에서는 엄격하게 설정
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 공통으로 사용할 CSP 베이스 설정
  const scriptSrc = isDevelopment
    ? "'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://dapi.kakao.com"
    : "'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://dapi.kakao.com";
  
  const styleSrc = isDevelopment
    ? "'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net"
    : "'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net";
  
  const imgSrc = "'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net";
  const fontSrc = "'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net";
  const frameSrc = isDevelopment
    ? "'self' https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com"
    : "'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com";

  // frame-ancestors 설정: daum-map.html만 'self', 나머지는 'none'
  let frameAncestors = "'none'";
  if (pathname === '/daum-map.html') {
    frameAncestors = "'self'";
  }

  // CSP 헤더 구성
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    "connect-src 'self' https:",
    `frame-src ${frameSrc}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // daum-map.html의 경우 X-Frame-Options도 SAMEORIGIN으로 설정
  if (pathname === '/daum-map.html') {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 미들웨어 적용
     * 1. api (API 라우트)
     * 2. _next/static (정적 파일)
     * 3. _next/image (이미지 최적화 파일)
     * 4. favicon.ico, sitemap.xml, robots.txt (메타 파일)
     * 주의: daum-map.html은 여기서 제외하지 않아야 헤더가 주입됩니다.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

