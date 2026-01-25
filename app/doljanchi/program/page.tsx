'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoljanchiProgramPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'program' | 'venue' | 'meal'>('overview');
  const [showMap, setShowMap] = useState(false);

  // 스크롤 기반 섹션 애니메이션
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // 모든 scroll-section 요소 관찰
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [activeTab]); // 탭이 변경될 때마다 다시 관찰

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Header */}
      <header className="relative px-6 pt-7 pb-6 text-center bg-gradient-to-b from-[#C9A227] to-[#B89220] overflow-hidden">
        <span className="inline-block text-[11px] tracking-[1px] text-white/70 mb-1.5 font-normal">
          2026년 사회적 배려 대상자
        </span>
        <h1 className="text-4xl font-semibold tracking-[-0.5px] mb-1.5 text-white">
          돌잔치
        </h1>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[rgba(201,162,39,0.15)] shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide gap-0">
          {[
            { id: 'overview', label: '모집개요' },
            { id: 'program', label: '돌잔치 안내' },
            { id: 'venue', label: '장소안내' },
            { id: 'meal', label: '식사·답례품' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-fit px-4 py-4 text-[16px] whitespace-nowrap relative transition-colors font-normal ${
                activeTab === tab.id
                  ? 'text-[#C9A227] font-semibold'
                  : 'text-[#6B7280]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#C9A227] rounded-t-[3px] transition-all"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Contents */}
      <div className="px-5 py-6 pb-24 bg-[#FFFDF7]">
        {/* 1. 모집개요 */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937] scroll-section">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              모집 개요
            </h2>

            {/* 소개 영상 */}
            <div className="mb-5 rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] bg-white scroll-section">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <video
                  className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer"
                  src="/videos/doljanchi-intro.mp4"
                  poster="/images/doljanchi/video-thumbnail.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  title="돌잔치 소개 영상"
                  onClick={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }}
                  style={{ 
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                  suppressHydrationWarning
                >
                  <source src="/videos/doljanchi-intro.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            {/* TYPE 1: 돌잔치 */}
            <div className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-[rgba(201,162,39,0.15)] border-l-4 border-l-[#C9A227] scroll-section">
              <span className="inline-block px-2.5 py-1 bg-[rgba(201,162,39,0.1)] rounded-[10px] text-[11px] font-semibold text-[#C9A227] mb-2.5">
                TYPE 1
              </span>
              <h3 className="text-[17px] font-bold mb-3.5 text-[#1F2937]">돌잔치</h3>
              <div className="space-y-2.5 mb-3">
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">일시</span>
                  <span className="text-[#4B5563]">일요일 17시</span>
                </div>
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">장소</span>
                  <span className="text-[#4B5563]">한국의집 우금헌</span>
                </div>
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">모집대상</span>
                  <span className="text-[#4B5563]">배우자 없이 자녀를 양육하고 있는 한부모가족</span>
                </div>
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">모집인원</span>
                  <span className="text-[#4B5563]">15팀</span>
                </div>
              </div>
              <span className="inline-block px-2.5 py-1 bg-[rgba(239,68,68,0.1)] text-[#EF4444] rounded-lg text-[11px] font-medium mt-2">
                행사일 기준 10~23개월 아이
              </span>
              <ul className="mt-4 space-y-0">
                <li className="py-3.5 border-b border-[rgba(201,162,39,0.15)] flex gap-3 text-[15px] text-[#4B5563]">
                  <span className="w-[22px] h-[22px] bg-[rgba(201,162,39,0.12)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#C9A227]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">돌잔치 진행 일체</strong>
                    <br />
                    의상, 헤어, 메이크업, 장소 및 본식 진행
                  </span>
                </li>
                <li className="py-3.5 border-b border-[rgba(201,162,39,0.15)] flex gap-3 text-[15px] text-[#4B5563]">
                  <span className="w-[22px] h-[22px] bg-[rgba(201,162,39,0.12)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#C9A227]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">피로연 진행</strong>
                    <br />
                    하객 최대 10명 식사 제공
                  </span>
                </li>
                <li className="py-3.5 flex gap-3 text-[15px] text-[#4B5563]">
                  <span className="w-[22px] h-[22px] bg-[rgba(201,162,39,0.12)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#C9A227]" viewBox="0 0 24 24" fill="currentColor">
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

            {/* TYPE 2: 찾아가는 돌잔치 */}
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-[rgba(201,162,39,0.15)] border-l-4 border-l-[#E07B4C] scroll-section">
              <span className="inline-block px-2.5 py-1 bg-[rgba(224,123,76,0.1)] rounded-[10px] text-[11px] font-semibold text-[#E07B4C] mb-2.5">
                TYPE 2
              </span>
              <h3 className="text-[17px] font-bold mb-3.5 text-[#1F2937]">찾아가는 돌잔치</h3>
              <div className="space-y-2.5 mb-3">
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">일시</span>
                  <span className="text-[#4B5563]">2026. 4월 ~ 11월</span>
                </div>
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">장소</span>
                  <span className="text-[#4B5563]">전국 한부모가족 복지시설 및 영아원 등</span>
                </div>
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">모집대상</span>
                  <span className="text-[#4B5563]">전국 한부모가족 복지시설 및 영아원 등<br />(시설 내 돌잔치 진행공간 보유)</span>
                </div>
                <div className="flex py-2.5 border-b border-[rgba(201,162,39,0.15)] text-[15px]">
                  <span className="w-[72px] flex-shrink-0 text-[#9CA3AF] font-medium">선정기관</span>
                  <span className="text-[#4B5563]">참여기관 15곳</span>
                </div>
              </div>
              <span className="inline-block px-2.5 py-1 bg-[rgba(239,68,68,0.1)] text-[#EF4444] rounded-lg text-[11px] font-medium mt-2">
                시설 내 10~23개월 아이 2명 이상
              </span>
              <ul className="mt-4 space-y-0">
                <li className="py-3.5 border-b border-[rgba(201,162,39,0.15)] flex gap-3 text-[15px] text-[#4B5563]">
                  <span className="w-[22px] h-[22px] bg-[rgba(201,162,39,0.12)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#C9A227]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">돌잔치 진행 일체</strong>
                    <br />
                    의상, 헤어, 메이크업, 장소 및 본식 진행
                  </span>
                </li>
                <li className="py-3.5 border-b border-[rgba(201,162,39,0.15)] flex gap-3 text-[15px] text-[#4B5563]">
                  <span className="w-[22px] h-[22px] bg-[rgba(201,162,39,0.12)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#C9A227]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">피로연 진행</strong>
                    <br />
                    30만원 상당의 간단한 다과 지원
                  </span>
                </li>
                <li className="py-3.5 flex gap-3 text-[15px] text-[#4B5563]">
                  <span className="w-[22px] h-[22px] bg-[rgba(201,162,39,0.12)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#C9A227]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-[#1F2937] font-semibold">사진 촬영</strong>
                    <br />
                    스냅 및 본식 촬영, 앨범·액자 제공
                  </span>
                </li>
              </ul>
            </div>

            <h2 className="text-lg font-semibold mb-5 mt-8 flex items-center gap-2.5 text-[#1F2937] scroll-section">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              사회적 배려 대상자
            </h2>

            <div className="grid grid-cols-3 gap-2.5 mb-8 scroll-section">
              {['한부모가족', '기초생활수급자', '차상위계층', '장애인', '국가유공자', '새터민'].map((item) => (
                <div key={item} className="bg-white p-3.5 rounded-xl text-center border border-[rgba(201,162,39,0.15)] shadow-sm">
                  <span className="text-sm text-[#4B5563] font-medium">{item}</span>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937] scroll-section">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              모집 일정
            </h2>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[rgba(201,162,39,0.15)] scroll-section">
              <div className="relative pl-6">
                <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-[rgba(201,162,39,0.25)] rounded"></div>
                <div className="relative pb-6">
                  <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-[#C9A227] rounded-full border-[3px] border-[#FFFDF7]"></div>
                  <div className="text-[13px] text-[#C9A227] font-semibold mb-1">2026. 1. 26.(월) ~ 2. 25.(수)</div>
                  <div className="text-[15px] font-semibold text-[#1F2937] mb-0.5">신청 접수</div>
                </div>
                <div className="relative pb-6">
                  <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-[#C9A227] rounded-full border-[3px] border-[#FFFDF7]"></div>
                  <div className="text-[13px] text-[#C9A227] font-semibold mb-1">2026. 2. 26.(목) ~ 2. 27.(금)</div>
                  <div className="text-[15px] font-semibold text-[#1F2937] mb-0.5">선정 심사</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-[#C9A227] rounded-full border-[3px] border-[#FFFDF7]"></div>
                  <div className="text-[13px] text-[#C9A227] font-semibold mb-1">2026. 2. 28.(토)</div>
                  <div className="text-[15px] font-semibold text-[#1F2937] mb-0.5">발표</div>
                  <div className="text-[13px] text-[#9CA3AF] font-normal">개별연락</div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(201,162,39,0.15)]">
                제출 서류
              </div>
              <ul className="space-y-2">
                {['참여 신청서', '사회적배려대상자 유형별 증빙서류', '개인정보 동의서'].map((doc) => (
                  <li key={doc} className="text-[15px] text-[#4B5563] flex gap-2 items-start">
                    <span className="text-[#C9A227] font-bold">•</span>
                    {doc}
                  </li>
                ))}
              </ul>

              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(201,162,39,0.15)] mt-6">
                돌잔치 증빙서류 (필수)
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(201,162,39,0.15)]">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-xs bg-[rgba(201,162,39,0.08)] text-[#1F2937] font-semibold border-b border-[rgba(201,162,39,0.15)]">
                        대상 유형
                      </th>
                      <th className="p-3 text-left text-xs bg-[rgba(201,162,39,0.08)] text-[#1F2937] font-semibold border-b border-[rgba(201,162,39,0.15)]">
                        증빙서류
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 text-xs text-[#4B5563] font-normal border-b border-[rgba(201,162,39,0.15)] bg-white">
                        한부모가족
                      </td>
                      <td className="p-3 text-xs text-[#4B5563] font-normal border-b border-[rgba(201,162,39,0.15)] bg-white">
                        한부모가족증명서
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(201,162,39,0.15)] mt-6">
                찾아가는 돌잔치 증빙서류 (필수)
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(201,162,39,0.15)]">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-xs bg-[rgba(201,162,39,0.08)] text-[#1F2937] font-semibold border-b border-[rgba(201,162,39,0.15)]">
                        대상 유형
                      </th>
                      <th className="p-3 text-left text-xs bg-[rgba(201,162,39,0.08)] text-[#1F2937] font-semibold border-b border-[rgba(201,162,39,0.15)]">
                        증빙서류
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 text-xs text-[#4B5563] font-normal border-b border-[rgba(201,162,39,0.15)] bg-white">
                        한부모가족 및 영아원 등
                      </td>
                      <td className="p-3 text-xs text-[#4B5563] font-normal border-b border-[rgba(201,162,39,0.15)] bg-white">
                        사업자등록증, 입소사실확인서, 한부모가족증명서(한부모가족일 경우)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[15px] font-semibold text-[#1F2937] mb-2.5 pb-2 border-b border-[rgba(201,162,39,0.15)] mt-6">
                추가 제출 서류 (가산점)
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full border-collapse rounded-xl overflow-hidden border border-[rgba(201,162,39,0.15)]">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-xs bg-[rgba(201,162,39,0.08)] text-[#1F2937] font-semibold border-b border-[rgba(201,162,39,0.15)]">
                        대상 유형
                      </th>
                      <th className="p-3 text-left text-xs bg-[rgba(201,162,39,0.08)] text-[#1F2937] font-semibold border-b border-[rgba(201,162,39,0.15)]">
                        증빙서류
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['기초생활수급자', '수급자 증명서'],
                      ['차상위계층', '차상위계층확인서, 차상위본인부담경감대상자 증명서'],
                      ['장애인', '장애인 등록증 및 복지카드'],
                      ['유공자', '유공자증명서'],
                      ['새터민', '북한이탈주민등록확인서'],
                    ].map(([type, doc]) => (
                      <tr key={type}>
                        <td className="p-3 text-xs text-[#4B5563] font-normal border-b border-[rgba(201,162,39,0.15)] bg-white">
                          {type}
                        </td>
                        <td className="p-3 text-xs text-[#4B5563] font-normal border-b border-[rgba(201,162,39,0.15)] bg-white">
                          {doc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-br from-[rgba(201,162,39,0.1)] to-[rgba(232,212,138,0.1)] border border-[rgba(201,162,39,0.15)] rounded-xl p-4.5 mt-5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#C9A227] mb-2.5">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  가산점 안내
                </div>
                <p className="text-sm text-[#1F2937] mb-1">
                  사회적배려대상자 유형 <strong className="text-[#EF4444] font-semibold">2개 이상</strong> 해당 시 가산점 부여
                </p>
                <p className="text-xs text-[#4B5563] font-normal">유형 1개당 가산점 5점</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. 돌잔치 안내 */}
        {activeTab === 'program' && (
          <div className="animate-fadeIn">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              돌잔치 안내
            </h2>

            <div className="inline-flex items-center gap-2 px-4.5 py-3 bg-white rounded-full text-[15px] text-[#1F2937] shadow-sm mb-5 border border-[rgba(201,162,39,0.15)] font-medium scroll-section">
              <svg className="w-[18px] h-[18px] text-[#C9A227]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              15:00 ~ 18:40
            </div>

            <div className="space-y-3">
              {[
                {
                  number: '01',
                  time: '15:00 ~ 17:00',
                  title: '헤어 · 메이크업 · 스냅촬영',
                  desc: '헤어·메이크업을 받고, 돌잔치 복장으로 환복 후 스냅사진 및 영상 촬영이 진행됩니다.',
                  image: '/images/doljanchi/schedule-01.jpg',
                },
                {
                  number: '02',
                  time: '17:00 ~ 17:10',
                  title: '성장 동영상 시청',
                  desc: '1:1 상담을 통해 사전 제작한 아이의 성장 동영상을 모두가 함께 시청합니다.',
                  image: '/images/doljanchi/schedule-02.jpg',
                },
                {
                  number: '03',
                  time: '17:10 ~ 17:40',
                  title: '돌잔치 · 경품 이벤트',
                  desc: '돌잡이 등 이벤트가 포함된 돌잔치 본식이 진행됩니다.',
                  image: '/images/doljanchi/schedule-03.jpg',
                },
                {
                  number: '04',
                  time: '17:40 ~ 18:40',
                  title: '단체사진 · 피로연',
                  desc: '하객들의 축하를 받으며 단체 사진을 촬영하고 피로연을 즐깁니다.',
                  image: '/images/doljanchi/schedule-04.jpg',
                },
              ].map((schedule) => (
                <div key={schedule.number} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] scroll-section">
                  <div className="relative h-40 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex items-center justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 w-8 h-8 bg-[#C9A227] text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
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
                            placeholder.className = 'flex items-center justify-center';
                            placeholder.innerHTML = `
                              <svg class="w-12 h-12 text-[#C9A227] opacity-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
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
                      <svg className="w-12 h-12 text-[#C9A227] opacity-35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4.5">
                    <div className="text-xs text-[#C9A227] font-semibold mb-1.5">{schedule.time}</div>
                    <h3 className="text-base font-bold text-[#1F2937] mb-1.5">{schedule.title}</h3>
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
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937]">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              장소 안내
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] scroll-section">
              <div className="relative h-44 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex flex-col items-center justify-center gap-3 overflow-hidden">
                <img
                  src="/images/doljanchi/venue.jpg"
                  alt="한국의집 우금헌"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 placeholder 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('span');
                      placeholder.className = 'text-lg font-normal text-[#C9A227] tracking-[4px] opacity-70';
                      placeholder.textContent = '한국의집 우금헌';
                      parent.appendChild(placeholder);
                    }
                  }}
                />
                <span className="absolute top-4 left-4 text-white text-sm font-medium bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  돌잔치
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-[#1F2937]">한국의집 우금헌</h3>
                  <a
                    href="https://www.kh.or.kr/kh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#C9A227] hover:text-[#C9A227]/80 underline decoration-1 underline-offset-2"
                  >
                    [홈페이지 바로가기]
                  </a>
                </div>
                <p className="text-[15px] text-[#4B5563] font-normal mb-3.5">
                  서울특별시 중구 퇴계로36길 10
                </p>
                <p className="text-sm text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  한국의집 우금헌에서 아이의 첫 번째 생일을 특별하게 기념하세요. 전통적인 분위기 속에서 소중한 추억을 남길 수 있습니다.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['전통 한옥', '아늑한 공간', '돌잔치 전용'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-[rgba(201,162,39,0.1)] rounded-2xl text-xs text-[#C9A227] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 지도보기 버튼 */}
            <div className="mt-5 flex justify-center scroll-section">
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-6 py-3 bg-[#C9A227] text-white text-[15px] font-semibold rounded-xl transition-all hover:bg-[#B89220] active:scale-[0.98] shadow-lg flex items-center gap-2"
                style={{ boxShadow: '0 4px 12px rgba(201, 162, 39, 0.35)' }}
              >
                {showMap ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    지도 숨기기
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    지도보기
                  </>
                )}
              </button>
            </div>

            {/* 다음 지도 */}
            {showMap && (
              <div className="mt-5 rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] bg-white animate-fadeIn">
                <iframe
                  src="/daum-map.html"
                  className="w-full border-0"
                  style={{ minHeight: '360px', height: '360px' }}
                  title="한국의집 우금헌 위치 지도"
                  loading="lazy"
                />
              </div>
            )}

            {/* 찾아가는 돌잔치 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] mt-5 scroll-section">
              <div className="relative h-44 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex flex-col items-center justify-center gap-3 overflow-hidden">
                <img
                  src="/images/doljanchi/visiting-venue.jpg"
                  alt="찾아가는 돌잔치"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 placeholder 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('span');
                      placeholder.className = 'text-lg font-normal text-[#C9A227] tracking-[4px] opacity-70';
                      placeholder.textContent = '찾아가는 돌잔치';
                      parent.appendChild(placeholder);
                    }
                  }}
                />
                <span className="absolute top-4 left-4 text-white text-sm font-medium bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  찾아가는 돌잔치
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1.5 text-[#1F2937]">복지시설 또는 영아원 등 신청자 지정 장소</h3>
                <p className="text-[15px] text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  아이의 소중한 첫 번째 생일을 축하해주기 위해 아이가 있는 곳으로 돌잔치 운영팀이 직접 방문합니다.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['복지시설', '영아원', '신청자 지정 장소'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-[rgba(201,162,39,0.1)] rounded-2xl text-xs text-[#C9A227] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[rgba(201,162,39,0.06)] rounded-xl p-4 mt-4 text-xs text-[#4B5563] leading-relaxed border border-[rgba(201,162,39,0.15)]">
              <strong className="text-[#EF4444] font-semibold">※</strong> 행사 일시는 신청하신 희망일자를 토대로 개별 상담을 진행하여 확정합니다.
            </div>
          </div>
        )}

        {/* 4. 식사 안내 및 답례품 */}
        {activeTab === 'meal' && (
          <div className="animate-fadeIn">
            {/* 1. 식사 안내 */}
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2.5 text-[#1F2937] scroll-section">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              식사 안내
            </h2>

            {/* 특제 갈비탕 - 돌잔치 제공 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] scroll-section">
              <div className="relative h-44 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex flex-col items-center justify-center gap-3 overflow-hidden">
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
                        <svg class="w-[52px] h-[52px] text-[#C9A227] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" />
                          <path d="M6 16c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2" />
                        </svg>
                        <span class="text-base text-[#C9A227] font-medium opacity-70">한국의집 특제 갈비탕</span>
                      `;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
                <span className="absolute top-4 left-4 text-white text-sm font-medium bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  돌잔치 제공
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 text-[#1F2937]">특제 갈비탕</h3>
                <p className="text-base text-[#C9A227] font-medium mb-3.5 italic">
                  "백년가약의 기쁨을 담은 따스한 한 그릇"
                </p>
                <p className="text-base text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  일생의 가장 찬란한 잔칫날, 한국의집이 엄선한 최상급 갈비와 오랜 시간 정성으로 우려낸 진한 육수가 만나 깊은 풍미를 완성했습니다. 귀한 발걸음 해주신 분들을 위해 혼례의 예를 다해 준비한 한국의집 특제 갈비탕을 대접합니다.
                </p>
                <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[rgba(201,162,39,0.06)] rounded-xl text-base text-[#4B5563]">
                  <svg className="w-[18px] h-[18px] text-[#C9A227] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  하객 최대 50명 (혼주 포함)
                </div>
              </div>
            </div>

            {/* 30만원 상당의 다과 제공 - 찾아가는 돌잔치 제공 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] mt-5 scroll-section">
              <div className="relative h-44 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex flex-col items-center justify-center gap-3 overflow-hidden">
                <img
                  src="/images/doljanchi/dan-gwa.jpg"
                  alt="30만원 상당의 다과"
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
                        <svg class="w-[52px] h-[52px] text-[#C9A227] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                          <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" />
                          <path d="M6 16c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2" />
                        </svg>
                        <span class="text-base text-[#C9A227] font-medium opacity-70">30만원 상당의 다과</span>
                      `;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
                <span className="absolute top-4 left-4 text-white text-sm font-medium bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  찾아가는 돌잔치 제공
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 text-[#1F2937]">30만원 상당의 다과 제공</h3>
                <p className="text-base text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  찾아가는 돌잔치에서는 30만원 상당의 간단한 다과가 지원됩니다. 시설 내 돌잔치 진행공간에서 아이의 첫 번째 생일을 특별하게 기념할 수 있습니다.
                </p>
                <div className="flex items-center gap-2 px-4 py-3 bg-[rgba(201,162,39,0.08)] rounded-xl text-[15px] text-[#4B5563]">
                  <svg className="w-4 h-4 text-[#C9A227] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  하객 최대 10명
                </div>
              </div>
            </div>

            {/* 2. 답례품 */}
            <h2 className="text-lg font-semibold mb-5 mt-8 flex items-center gap-2.5 text-[#1F2937] scroll-section">
              <span className="w-1 h-[18px] bg-[#C9A227] rounded"></span>
              답례품
              <span className="text-xs text-[#9CA3AF] font-normal ml-1">(돌잔치, 찾아가는 돌잔치 동일)</span>
            </h2>

            {/* 떡케이크 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] scroll-section">
              <div className="h-44 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <img 
                  src="/images/doljanchi/tteok-cake.jpg" 
                  alt="떡케이크" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 배경 그라데이션만 표시
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1.5 text-[#1F2937]">떡케이크</h3>
                <p className="text-[15px] text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  귀한 아이의 첫 번째 생일상,<br />
                  정성으로 빚고 귀여움으로 완성한 프리미엄 캐릭터 떡케이크를 준비했습니다.
                </p>
              </div>
            </div>

            {/* 답례떡 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[rgba(201,162,39,0.15)] mt-5 scroll-section">
              <div className="h-44 bg-gradient-to-br from-[#F5EED6] to-[#EBE0C0] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <img 
                  src="/images/doljanchi/gift-tteok.jpg" 
                  alt="답례떡" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 이미지 로드 실패 시 배경 그라데이션만 표시
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1.5 text-[#1F2937]">답례떡</h3>
                <p className="text-[15px] text-[#4B5563] font-normal mb-3.5 leading-relaxed">
                  아이의 미래에 보내주신 따뜻한 축복과 응원 잊지 않고,<br />
                  그 감사한 마음을 담아 행복한 미소가 지어지는 앙증맞은 캐릭터 답례떡을 정성껏 준비했습니다.
                </p>
                <div className="flex items-center gap-2 px-4 py-3 bg-[rgba(201,162,39,0.08)] rounded-xl text-[15px] text-[#4B5563]">
                  <svg className="w-4 h-4 text-[#C9A227] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  하객 최대 10명
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="px-5 py-8 pb-10 text-center bg-white border-t border-[rgba(201,162,39,0.15)]">
        <p className="text-[15px] text-[#4B5563] mb-5 font-normal leading-relaxed">
          한국의집에서<br />
          아이의 첫 번째 생일을 축하하세요
        </p>
        <Link
          href="/apply/doljanchi"
          className="inline-block px-12 py-4 bg-[#C9A227] text-white text-[15px] font-semibold rounded-xl transition-transform active:scale-[0.98] shadow-lg"
          style={{ boxShadow: '0 4px 12px rgba(201, 162, 39, 0.35)' }}
        >
          신청하기
        </Link>
        <p className="mt-3.5 text-xs text-[#9CA3AF]">신청기간 2026. 1. 26.(월) ~ 2. 25.(수)</p>
      </section>

      {/* Footer */}
      <footer className="px-5 py-5 text-center bg-[#FFFDF7]">
        <p className="text-[11px] text-[#9CA3AF] font-normal">한국의집 돌잔치 프로그램</p>
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
        /* 스크롤 기반 섹션 애니메이션 */
        .scroll-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .scroll-section.scroll-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
