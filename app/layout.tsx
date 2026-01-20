import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "2026 한국의 집 전통혼례 및 돌잔치 온라인 신청",
  description: "사회적 배려 대상자를 위한 전통혼례 및 돌잔치 온라인 신청 시스템",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifKR.variable} antialiased`}
      >
        <Script
          src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="lazyOnload"
        />
        {children}
        <ConditionalBottomNav />
      </body>
    </html>
  );
}
