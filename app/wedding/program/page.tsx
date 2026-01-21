'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function WeddingProgramPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ceremony' | 'venue' | 'meal'>('overview');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 카카오 지도 API 로드
  useEffect(() => {
    if (activeTab !== 'venue' || !mapContainerRef.current) return;

    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        initMap();
        return;
      }

      // 카카오 지도 API 스크립트 로드
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'b11a4a12178e39f51ebb2e79a716df21';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
          initMap();
        });
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainerRef.current || !window.kakao?.maps) return;

      // 주소를 좌표로 변환
      const geocoder = new window.kakao.maps.services.Geocoder();
      const address = '서울특별시 중구 퇴계로36길 10';

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 지도 생성
          const mapOption = {
            center: coords,
            level: 3,
          };

          const map = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
          mapRef.current = map;

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: coords,
          });
          marker.setMap(map);

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:10px;font-size:12px;">한국의집<br/>${address}</div>`,
          });
          infowindow.open(map, marker);
        }
      });
    };

    loadKakaoMap();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      {/* Header */}
      <header className="relative px-6 pt-7 pb-6 text-center bg-gradient-to-b from-[#1A56DB] to-[#1648B8] overflow-hidden">
        <span className="inline-block text-[11px] tracking-[1px] text-white/70 mb-1.5 font-normal">
          2026년 사회적 배려 대상자
        </span>
        <h1 className="text-2xl font-semibold tracking-[-0.5px] mb-1.5 text-white">
          전통혼례
        </h1>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[rgba(26,86,219,0.12)] shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide gap-0">
          {[
            { id: 'overview', label: '모집개요' },
            { id: 'ceremony', label: '전통혼례 안내' },
            { id: 'venue', label: '장소안내' },
            { id: 'meal', label: '식사안내' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-fit px-4 py-[18px] text-[15px] whitespace-nowrap relative transition-colors font-normal ${
                activeTab === tab.id
                  ? 'text-[#1A56DB] font-semibold'
                  : 'text-[#9CA3AF]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A56DB] rounded-t-[3px] transition-all"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Contents */}
      <div className="px-5 py-6 pb-24 bg-[#F5F7FB]">
        {/* 1. 모집개요 */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              모집 개요
            </h2>

            {/* 유튜브 영상 */}
            <div className="mb-5 rounded-2xl overflow-hidden shadow-sm border border-[rgba(26,86,219,0.12)] bg-white">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full border-0"
                  src="https://www.youtube.com/embed/6LeMb6RjH-Y?rel=0&modestbranding=1&iv_load_policy=3&fs=1&playsinline=1&cc_load_policy=0&disablekb=0&enablejsapi=0"
                  title="전통혼례 소개 영상"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A56DB] to-[#3B6FE8] rounded-2xl p-6 mb-5 text-white">
              <h3 className="text-sm font-normal tracking-[1px] mb-1.5 opacity-80">모집 인원</h3>
              <p className="text-[26px] font-bold">60팀 선정</p>
            </div>

            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-[rgba(26,86,219,0.12)]">
              <div className="text-base font-semibold text-[#1F2937] mb-2.5 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1A56DB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                일시
              </div>
              <p className="text-[15px] text-[#4B5563] font-normal leading-relaxed">매주 일요일 12시 / 15시</p>
            </div>

            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-[rgba(26,86,219,0.12)]">
              <div className="text-base font-semibold text-[#1F2937] mb-2.5 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1A56DB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                모집 대상
              </div>
              <p className="text-[15px] text-[#4B5563] font-normal leading-relaxed">
                부부 중 1명이 사회적배려대상자인<br />예비 또는 결혼식 미진행 부부
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-[rgba(26,86,219,0.12)]">
              <div className="text-base font-semibold text-[#1F2937] mb-2.5 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1A56DB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                지원 내용
              </div>
              <ul className="space-y-0">
                <li className="py-3.5 border-b border-[rgba(26,86,219,0.12)] flex gap-3 text-[15px] text-[#4B5563] leading-relaxed">
                  <span className="w-6 h-6 bg-[rgba(26,86,219,0.1)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">전통혼례 진행 일체</strong>
                    <br />
                    의상, 헤어, 메이크업, 장소 및 본식 진행
                  </span>
                </li>
                <li className="py-3.5 border-b border-[rgba(26,86,219,0.12)] flex gap-3 text-[15px] text-[#4B5563] leading-relaxed">
                  <span className="w-6 h-6 bg-[rgba(26,86,219,0.1)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">피로연 진행</strong>
                    <br />
                    하객 최대 50명 식사 제공 (혼주 포함)
                  </span>
                </li>
                <li className="py-3.5 flex gap-3 text-[15px] text-[#4B5563] leading-relaxed">
                  <span className="w-6 h-6 bg-[rgba(26,86,219,0.1)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1A56DB]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">사진 및 영상 촬영</strong>
                    <br />
                    스냅 및 본식 촬영, 앨범·액자·영상 제공
                  </span>
                </li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold mb-5 mt-8 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              사회적 배려 대상자
            </h2>

            <div className="grid grid-cols-3 gap-2.5 mb-8">
              {['기초생활수급자', '차상위계층', '장애인', '다문화가정', '국가유공자', '새터민'].map((item) => (
                <div key={item} className="bg-white p-4 rounded-xl text-center border border-[rgba(26,86,219,0.12)] shadow-sm">
                  <span className="text-sm text-[#4B5563] font-medium">{item}</span>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              모집 일정
            </h2>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[rgba(26,86,219,0.12)]">
              <div className="relative pl-7">
                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-[rgba(26,86,219,0.2)] rounded"></div>
                <div className="relative pb-6">
                  <div className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 bg-[#1A56DB] rounded-full border-[3px] border-[#F5F7FB]"></div>
                  <div className="text-sm text-[#1A56DB] font-semibold mb-1">2026. 1. 26.(월) ~ 2. 25.(수)</div>
                  <div className="text-base font-semibold text-[#1F2937] mb-0.5">신청 접수</div>
                </div>
                <div className="relative pb-6">
                  <div className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 bg-[#1A56DB] rounded-full border-[3px] border-[#F5F7FB]"></div>
                  <div className="text-sm text-[#1A56DB] font-semibold mb-1">2026. 2. 26.(목) ~ 2. 27.(금)</div>
                  <div className="text-base font-semibold text-[#1F2937] mb-0.5">선정 심사</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[26px] top-1.5 w-3.5 h-3.5 bg-[#1A56DB] rounded-full border-[3px] border-[#F5F7FB]"></div>
                  <div className="text-sm text-[#1A56DB] font-semibold mb-1">2026. 2. 28.(토)</div>
                  <div className="text-base font-semibold text-[#1F2937] mb-0.5">발표</div>
                  <div className="text-sm text-[#9CA3AF] font-normal">개별연락</div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(26,86,219,0.12)]">
                제출 서류
              </div>
              <ul className="space-y-2.5">
                {['참여 신청서', '사회적배려대상자 유형별 증빙서류', '개인정보 동의서', '혼인사실 증빙서류'].map((doc) => (
                  <li key={doc} className="text-[15px] text-[#4B5563] flex gap-2 items-start">
                    <span className="text-[#1A56DB] font-bold">•</span>
                    {doc}
                  </li>
                ))}
              </ul>

              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(26,86,219,0.12)] mt-6">
                사회적 배려 대상자 유형별 증빙서류
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(26,86,219,0.12)]">
                  <thead>
                    <tr>
                      <th className="p-3.5 text-left text-sm bg-[rgba(26,86,219,0.06)] text-[#1F2937] font-semibold border-b border-[rgba(26,86,219,0.12)]">
                        대상 유형
                      </th>
                      <th className="p-3.5 text-left text-sm bg-[rgba(26,86,219,0.06)] text-[#1F2937] font-semibold border-b border-[rgba(26,86,219,0.12)]">
                        증빙서류
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['기초생활수급자', '수급자 증명서'],
                      ['차상위계층', '차상위계층확인서, 차상위본인부담경감대상자 증명서'],
                      ['장애인', '장애인 등록증 및 복지카드'],
                      ['다문화가정', '가족관계증명서'],
                      ['유공자', '유공자증명서'],
                      ['새터민', '북한이탈주민등록확인서'],
                    ].map(([type, doc]) => (
                      <tr key={type}>
                        <td className="p-3.5 text-sm text-[#4B5563] font-normal border-b border-[rgba(26,86,219,0.12)] bg-white leading-relaxed">
                          {type}
                        </td>
                        <td className="p-3.5 text-sm text-[#4B5563] font-normal border-b border-[rgba(26,86,219,0.12)] bg-white leading-relaxed">
                          {doc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(26,86,219,0.12)] mt-6">
                혼인사실 증빙서류
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(26,86,219,0.12)]">
                  <thead>
                    <tr>
                      <th className="p-3.5 text-left text-sm bg-[rgba(26,86,219,0.06)] text-[#1F2937] font-semibold border-b border-[rgba(26,86,219,0.12)]">
                        혼인 상태
                      </th>
                      <th className="p-3.5 text-left text-sm bg-[rgba(26,86,219,0.06)] text-[#1F2937] font-semibold border-b border-[rgba(26,86,219,0.12)]">
                        증빙서류
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['혼인신고 진행', '혼인관계증명서'],
                      ['혼인신고 미진행', '주민등록등본 (동거인 기재 확인)'],
                      ['사실혼 관계', '기관 추천서 / 확인서'],
                    ].map(([status, doc]) => (
                      <tr key={status}>
                        <td className="p-3.5 text-sm text-[#4B5563] font-normal border-b border-[rgba(26,86,219,0.12)] bg-white leading-relaxed">
                          {status}
                        </td>
                        <td className="p-3.5 text-sm text-[#4B5563] font-normal border-b border-[rgba(26,86,219,0.12)] bg-white leading-relaxed">
                          {doc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-br from-[rgba(26,86,219,0.08)] to-[rgba(96,165,250,0.08)] border border-[rgba(26,86,219,0.12)] rounded-xl p-5 mt-5">
                <div className="flex items-center gap-2 text-base font-bold text-[#1A56DB] mb-2.5">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  가산점 안내
                </div>
                <p className="text-[15px] text-[#1F2937] mb-1">
                  사회적배려대상자 유형 <strong className="text-[#EF4444] font-semibold">2개 이상</strong> 해당 시 가산점 부여
                </p>
                <p className="text-sm text-[#4B5563] font-normal">유형 1개당 가산점 5점</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. 전통혼례 안내 */}
        {activeTab === 'ceremony' && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              전통혼례 안내
            </h2>

            <p className="text-sm text-[#4B5563] font-light mb-6">
              전통혼례의 12단계 중 핵심 의례인<br />
              <strong className="text-[#1F2937]">전안례, 교배례, 합근례</strong>를 진행합니다.
            </p>

            <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { name: '혼담' },
                { name: '납채' },
                { name: '납기' },
                { name: '납폐' },
                { name: '초행' },
                { name: '전안례', desc: '혼인 의사\n전달 및 서약', highlight: true },
                { name: '교배례', desc: '서로를\n인정하고 인사', highlight: true },
                { name: '합근례', desc: '하나되어\n부부됨을 확정', highlight: true },
                { name: '신행' },
                { name: '현구고례' },
                { name: '묘현' },
                { name: '근친' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`flex-shrink-0 text-center p-3.5 rounded-xl min-w-[76px] shadow-sm ${
                    step.highlight 
                      ? 'bg-[#1A56DB] text-white border border-[#1A56DB]' 
                      : 'bg-white border border-[rgba(26,86,219,0.12)]'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${step.highlight ? 'text-white' : ''}`}>
                    {step.name}
                  </div>
                  {step.desc && (
                    <div className={`text-[11px] leading-snug whitespace-pre-line ${step.highlight ? 'text-white opacity-90' : 'opacity-70'}`}>
                      {step.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-5 mt-10 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              진행 순서
            </h2>

            <div className="inline-flex items-center gap-2 px-5 py-3.5 bg-white rounded-full text-[15px] text-[#1F2937] shadow-sm mb-5 border border-[rgba(26,86,219,0.12)] font-medium">
              <svg className="w-5 h-5 text-[#1A56DB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              1부 10:00~ &nbsp;|&nbsp; 2부 13:00~
            </div>

            <div className="space-y-3">
              {[
                {
                  number: '01',
                  time: '10:00 ~ 12:00 / 13:00 ~ 15:00',
                  title: '헤어 · 메이크업 · 스냅촬영',
                  desc: '헤어·메이크업을 받고, 전통혼례 복장으로 환복 후 스냅사진 및 영상 촬영이 진행됩니다.',
                  image: '/images/wedding/schedule-01.jpg',
                },
                {
                  number: '02',
                  time: '12:00 ~ 12:10 / 15:00 ~ 15:10',
                  title: '한국전통연희 축하공연',
                  desc: '풍물놀이 공연과 삼현육각 공연이 혼례의 기쁨과 품격을 더해줍니다.',
                  image: '/images/wedding/schedule-02.jpg',
                },
                {
                  number: '03',
                  time: '12:10 ~ 12:40 / 15:10 ~ 15:40',
                  title: '전통혼례 본식',
                  desc: '전안례 - 교배례 - 합근례로 이어지는 전통혼례의 하이라이트가 진행됩니다.',
                  image: '/images/wedding/schedule-03.jpg',
                },
                {
                  number: '04',
                  time: '12:40 ~ 14:00 / 15:40 ~ 17:00',
                  title: '단체사진 · 피로연',
                  desc: '하객들의 축하를 받으며 단체 사진을 촬영하고 피로연을 즐깁니다.',
                  image: '/images/wedding/schedule-04.jpg',
                },
              ].map((schedule) => (
                <div key={schedule.number} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(26,86,219,0.12)]">
                  <div className="relative h-40 bg-gradient-to-br from-[#E8EEF8] to-[#D4E0F0] flex items-center justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 w-9 h-9 bg-[#1A56DB] text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                      {schedule.number}
                    </div>
                    {schedule.image ? (
                      <img
                        src={schedule.image}
                        alt={schedule.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 이미지 로드 실패 시 placeholder 표시
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full flex items-center justify-center';
                            placeholder.innerHTML = `
                              <svg class="w-[52px] h-[52px] text-[#1A56DB] opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            `;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <svg className="w-[52px] h-[52px] text-[#1A56DB] opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-[#1A56DB] font-semibold mb-1.5">{schedule.time}</div>
                    <h3 className="text-lg font-bold text-[#1F2937] mb-2">{schedule.title}</h3>
                    <p className="text-[15px] text-[#4B5563] font-normal leading-relaxed">{schedule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 장소안내 */}
        {activeTab === 'venue' && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              장소 안내
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(26,86,219,0.12)]">
              <div className="relative h-44 bg-gradient-to-br from-[#E8EEF8] to-[#D4E0F0] flex items-center justify-center overflow-hidden">
                <img
                  src="/images/wedding/venue.jpg"
                  alt="한국의집"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 placeholder 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('span');
                      placeholder.className = 'text-2xl font-normal text-[#1A56DB] tracking-[6px] opacity-60';
                      placeholder.textContent = '한국의집';
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1.5 text-[#1F2937]">한국의집</h3>
                <p className="text-[15px] text-[#4B5563] font-normal mb-3.5">
                  서울특별시 중구 퇴계로36길 10
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['도심 속 한옥', '전통 정원', '고품격 공간'].map((tag) => (
                    <span key={tag} className="px-3.5 py-2 bg-[rgba(26,86,219,0.08)] rounded-2xl text-sm text-[#1A56DB] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 카카오 지도 */}
            <div className="mt-5 rounded-2xl overflow-hidden shadow-sm border border-[rgba(26,86,219,0.12)] bg-white">
              <div ref={mapContainerRef} className="w-full h-64"></div>
            </div>

            <div className="bg-white rounded-2xl p-5 mt-6 shadow-sm border border-[rgba(26,86,219,0.12)]">
              <p className="text-sm text-[#4B5563] font-light leading-relaxed">
                전통을 나누는 고품격 복합문화공간 한국의집에서 도심 속 아름다운 한옥의 정취를 간직한 채 인생의 소중한 순간을 남겨보세요.
              </p>
            </div>

            <div className="bg-[rgba(26,86,219,0.04)] rounded-xl p-4 mt-4 text-sm text-[#4B5563] leading-relaxed border border-[rgba(26,86,219,0.12)]">
              <strong className="text-[#EF4444] font-semibold">※</strong> 행사 일시는 신청하신 희망일자를 토대로 개별 상담을 진행하여 확정합니다.
            </div>
          </div>
        )}

        {/* 4. 식사안내 */}
        {activeTab === 'meal' && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-5 bg-[#1A56DB] rounded"></span>
              식사 안내
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(26,86,219,0.12)]">
              <div className="relative h-44 bg-gradient-to-br from-[#E8EEF8] to-[#D4E0F0] flex flex-col items-center justify-center gap-3 overflow-hidden">
                <img
                  src="/images/wedding/food.jpg"
                  alt="한국의집 특제 갈비탕"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 placeholder 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'flex flex-col items-center justify-center gap-3';
                      placeholder.innerHTML = `
                        <svg class="w-[52px] h-[52px] text-[#1A56DB] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" />
                          <path d="M6 16c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2" />
                        </svg>
                        <span class="text-base text-[#1A56DB] font-medium opacity-70">한국의집 특제 갈비탕</span>
                      `;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1.5 text-[#1F2937]">특제 갈비탕</h3>
                <p className="text-[15px] text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  전통혼례에 걸맞게 정성껏 준비한<br />
                  한국의집 특제 갈비탕이 제공됩니다.
                </p>
                <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[rgba(26,86,219,0.06)] rounded-xl text-[15px] text-[#4B5563]">
                  <svg className="w-[18px] h-[18px] text-[#1A56DB] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  하객 최대 50명 (혼주 포함)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="px-5 py-8 pb-10 text-center bg-white border-t border-[rgba(26,86,219,0.12)]">
        <p className="text-base text-[#4B5563] mb-5 font-normal leading-relaxed">
          한국의집에서<br />
          특별한 결혼식을 준비하세요
        </p>
        <Link
          href="/apply/wedding"
          className="inline-block px-[52px] py-[18px] bg-[#1A56DB] text-white text-[17px] font-semibold rounded-xl transition-transform active:scale-[0.98] shadow-lg"
          style={{ boxShadow: '0 4px 12px rgba(26, 86, 219, 0.3)' }}
        >
          신청하기
        </Link>
        <p className="mt-3.5 text-sm text-[#9CA3AF]">신청기간 2026. 1. 26.(월) ~ 2. 25.(수)</p>
      </section>

      {/* Footer */}
      <footer className="px-5 py-5 text-center bg-[#F5F7FB]">
        <p className="text-[13px] text-[#9CA3AF] font-normal">한국의집 전통혼례 프로그램</p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
