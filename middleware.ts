import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 모바일 기기 감지 함수
function isMobileDevice(userAgent: string): boolean {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(userAgent);
}

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();
    const pathname = request.nextUrl.pathname;
    const userAgent = request.headers.get('user-agent') || '';

    // 관리자 페이지와 API, 일부 정적 경로는 제외
    const isAdminPage = pathname.startsWith('/admin');
    const isAPIRoute = pathname.startsWith('/api');
    const isQRPage = pathname === '/qr';
    const isDevPage = pathname === '/dev';
    const isStaticAsset =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/images') ||
      pathname.startsWith('/videos') ||
      /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(pathname);

    if (isAdminPage || isAPIRoute || isQRPage || isDevPage || isStaticAsset) {
      return response;
    }

    const devModeCookie = request.cookies.get('dev-mode');
    const isDevMode = devModeCookie?.value === 'true';

    // 데스크톱에서는 QR 페이지로 유도
    if (!isMobileDevice(userAgent) && !isDevMode) {
      const qrUrl = new URL('/qr', request.url);
      return NextResponse.redirect(qrUrl);
    }

    return response;
  } catch (error) {
    // Middleware 오류가 전체 사이트 500으로 번지지 않게 fail-open 처리
    console.error('Middleware error. Falling back to NextResponse.next()', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
