import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.imweb.me',
        pathname: '/**',
      },
    ],
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: '/daum-map.html',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://ssl.daum.net http://ssl.daum.net https://postcode.map.daum.net http://postcode.map.daum.net https://postcode.map.kakao.com http://postcode.map.kakao.com https://*.map.daum.net http://*.map.daum.net https://*.map.kakao.com http://*.map.kakao.com https://*.daum.net http://*.daum.net https://*.kakao.com http://*.kakao.com https://dapi.kakao.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net",
              "img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "connect-src 'self' https: http: https://*.daumcdn.net http://*.daumcdn.net https://*.daum.net http://*.daum.net https://*.kakao.com http://*.kakao.com https://postcode.map.daum.net http://postcode.map.daum.net https://postcode.map.kakao.com http://postcode.map.kakao.com",
              "frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://ssl.daum.net http://ssl.daum.net https://postcode.map.daum.net http://postcode.map.daum.net https://postcode.map.kakao.com http://postcode.map.kakao.com https://*.map.daum.net http://*.map.daum.net https://*.map.kakao.com http://*.map.kakao.com https://*.daum.net http://*.daum.net https://*.kakao.com http://*.kakao.com https://www.youtube.com https://youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'unload=*',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://ssl.daum.net http://ssl.daum.net https://postcode.map.daum.net http://postcode.map.daum.net https://postcode.map.kakao.com http://postcode.map.kakao.com https://*.map.daum.net http://*.map.daum.net https://*.map.kakao.com http://*.map.kakao.com https://*.daum.net http://*.daum.net https://*.kakao.com http://*.kakao.com https://dapi.kakao.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net http://t1.daumcdn.net",
              "img-src 'self' data: https: blob: http://t1.daumcdn.net http://mts.daumcdn.net",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "connect-src 'self' https: http: https://*.daumcdn.net http://*.daumcdn.net https://*.daum.net http://*.daum.net https://*.kakao.com http://*.kakao.com https://postcode.map.daum.net http://postcode.map.daum.net https://postcode.map.kakao.com http://postcode.map.kakao.com",
              "frame-src 'self' https://t1.daumcdn.net http://t1.daumcdn.net https://*.daumcdn.net http://*.daumcdn.net https://ssl.daumcdn.net https://ssl.daum.net http://ssl.daum.net https://postcode.map.daum.net http://postcode.map.daum.net https://postcode.map.kakao.com http://postcode.map.kakao.com https://*.map.daum.net http://*.map.daum.net https://*.map.kakao.com http://*.map.kakao.com https://*.daum.net http://*.daum.net https://*.kakao.com http://*.kakao.com https://www.youtube.com https://youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'unload=*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
