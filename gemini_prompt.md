# 다음 지도 iframe 로드 문제 해결 요청

## 문제 상황

Next.js 앱을 Netlify에 배포하고 있으며, `public/daum-map.html` 파일을 iframe으로 로드하여 다음 지도(Roughmap)를 표시하려고 합니다. 하지만 Netlify 배포 환경에서 다음 오류가 발생합니다:

```
Framing 'https://traditional-ceremony.netlify.app/' violates the following Content Security Policy directive: "frame-ancestors 'none'". The request has been blocked.
```

로컬 개발 환경에서는 정상 작동하지만, Netlify 배포 환경에서만 문제가 발생합니다.

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **배포 플랫폼**: Netlify
- **Netlify 플러그인**: `@netlify/plugin-nextjs`
- **지도 서비스**: 다음 지도 Roughmap API

## 파일 구조

### 1. public/daum-map.html
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>다음 지도</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    #daumRoughmapContainer1769027350060 {
      width: 100%;
      height: 360px;
    }
  </style>
</head>
<body>
  <div id="daumRoughmapContainer1769027350060" class="root_daum_roughmap root_daum_roughmap_landing"></div>
  <script charset="UTF-8" class="daum_roughmap_loader_script" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script>
  <script>
    function initMap() {
      if (window.daum && window.daum.roughmap && typeof window.daum.roughmap.Lander === 'function') {
        try {
          new window.daum.roughmap.Lander({
            "timestamp": "1769027350060",
            "key": "g2cq6ubob8d",
            "mapWidth": "100%",
            "mapHeight": "360",
            "target": {
              "lat": "37.5600",
              "lng": "126.9900"
            },
            "level": "3"
          }).render();
        } catch (error) {
          console.error('지도 생성 오류:', error);
        }
      } else {
        setTimeout(initMap, 100);
      }
    }

    window.addEventListener('load', function() {
      setTimeout(initMap, 500);
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initMap, 500);
      });
    } else {
      setTimeout(initMap, 500);
    }
  </script>
</body>
</html>
```

### 2. netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

# daum-map.html에 대한 특별한 헤더 설정 (더 구체적인 경로가 먼저 와야 함)
[[headers]]
  for = "/daum-map.html"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
    X-Frame-Options = "SAMEORIGIN"

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://dapi.kakao.com https://hwwlqxculwuohfkzodrn.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

### 3. public/_headers
```
/daum-map.html
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'
  X-Frame-Options: SAMEORIGIN

/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://dapi.kakao.com https://hwwlqxculwuohfkzodrn.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

### 4. middleware.ts
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // daum-map.html에 대한 예외 처리
  if (request.nextUrl.pathname === '/daum-map.html') {
    const csp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'";
    response.headers.set('Content-Security-Policy', csp);
    return response;
  }

  // 개발 환경에서는 CSP를 완화하고, 프로덕션에서는 엄격하게 설정
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const csp = isDevelopment
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://dapi.kakao.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
    : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://dapi.kakao.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net; img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' https:; frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://ssl.daumcdn.net https://postcode.map.daum.net https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|daum-map.html).*)',
  ],
};
```

### 5. iframe 사용 예시 (React 컴포넌트에서)
```tsx
<iframe
  src="/daum-map.html"
  className="w-full border-0"
  style={{ minHeight: '360px', height: '360px' }}
  title="한국의집 위치 지도"
  loading="lazy"
/>
```

## 시도한 해결 방법

1. ✅ `netlify.toml`에 `/daum-map.html`에 대한 특별한 헤더 설정 추가 (`frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`)
2. ✅ `public/_headers` 파일에 `/daum-map.html`에 대한 헤더 설정 추가 (더 구체적인 경로를 먼저 배치)
3. ✅ `middleware.ts`에서 `/daum-map.html`에 대한 예외 처리 추가
4. ✅ `middleware.ts`의 `matcher`에서 `daum-map.html` 제외
5. ✅ `next.config.ts`에도 헤더 설정 추가 (하지만 `public` 폴더 파일에는 적용되지 않음)

## 문제점

- 로컬 개발 환경에서는 정상 작동
- Netlify 배포 환경에서만 `frame-ancestors 'none'` 오류 발생
- `@netlify/plugin-nextjs`를 사용할 때 `public` 폴더의 파일이 어떻게 처리되는지 불명확
- 여러 곳에서 헤더를 설정했지만 여전히 `frame-ancestors 'none'`이 적용되는 것으로 보임

## 질문

1. `@netlify/plugin-nextjs`를 사용할 때 `public` 폴더의 정적 파일에 헤더를 적용하는 올바른 방법은 무엇인가요?
2. `netlify.toml`의 헤더 설정이 `public/_headers` 파일보다 우선순위가 높은가요, 아니면 그 반대인가요?
3. Next.js middleware가 `public` 폴더의 정적 파일에도 적용되나요?
4. 이 문제를 해결하기 위한 다른 접근 방법이 있나요? (예: 다른 배포 설정, 다른 지도 서비스 사용 등)

## 추가 정보

- 배포 URL: `https://traditional-ceremony.netlify.app`
- 문제가 발생하는 페이지: 전통혼례 맛보기, 돌잔치 맛보기의 "장소안내" 탭
- 브라우저 콘솔 오류: `Framing 'https://traditional-ceremony.netlify.app/' violates the following Content Security Policy directive: "frame-ancestors 'none'". The request has been blocked.`
