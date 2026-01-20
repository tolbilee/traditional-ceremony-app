'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { useRouter } from 'next/navigation';
import { REQUIRED_DOCUMENTS } from '@/lib/utils/constants';
import { SupportType } from '@/types';

interface ApplicationDetailProps {
  application: any;
}

export default function ApplicationDetail({ application }: ApplicationDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    // Google Docs 방식 사용 (더 안정적)
    try {
      setLoading(true);
      
      const response = await fetch(`/api/applications/${application.id}/google-docs-pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF 생성 실패');
      }

      const result = await response.json();
      
      // PDF URL로 다운로드
      const a = document.createElement('a');
      a.href = result.pdfUrl;
      a.download = result.fileName || `신청서_${application.user_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setLoading(false);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 기존 Netlify Function 방식 (백업용)
  const handleDownloadPDFLegacy = async () => {
    setLoading(true);
    try {
      // Netlify Function을 통해 PDF 생성 및 Supabase Storage에 저장
      const response = await fetch('/.netlify/functions/pdf-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.pdfUrl) {
          // PDF URL로 다운로드
          const a = document.createElement('a');
          a.href = result.pdfUrl;
          a.download = result.fileName || `신청서_${application.user_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setLoading(false);
          return;
        } else {
          alert(`PDF 생성 실패: ${result.error || 'Unknown error'}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`PDF 생성 중 오류가 발생했습니다: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('PDF download error:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'wedding' ? '전통혼례' : '돌잔치';
  };

  const getSupportTypeLabel = (type: string, applicationData?: any) => {
    const labels: Record<string, string> = {
      basic_livelihood: '기초생활수급자',
      near_poor: '차상위계층',
      multicultural: '다문화가정',
      disabled: '장애인',
      north_korean_defector: '새터민',
      national_merit: '유공자',
      doljanchi: '한부모가족',
      doljanchi_welfare_facility: '찾아가는 돌잔치(복지시설)',
      doljanchi_orphanage: '찾아가는 돌잔치(영아원)',
    };
    
    // 복수 선택된 지원유형 확인 (application_data.supportType에 쉼표로 구분되어 저장됨)
    if (applicationData && applicationData.supportType && typeof applicationData.supportType === 'string') {
      const supportTypes = applicationData.supportType.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      if (supportTypes.length > 0) {
        // 복수 선택된 경우 모두 표시
        return supportTypes.map((t: string) => labels[t] || t).join(', ');
      }
    }
    
    return labels[type] || type;
  };

  // 선택된 지원유형을 순서대로 정렬하여 증빙서류 목록 생성 (DocumentUploadStep과 동일한 로직)
  const getOrderedDocumentNames = (): string[] => {
    const appData = application.application_data || {};
    if (!appData.supportType) return [];

    const supportTypes = appData.supportType.split(',').map((t: string) => t.trim()).filter((t: string) => t) as SupportType[];
    
    if (application.type === 'doljanchi') {
      // 돌잔치: 한부모가족은 항상 첫 번째, 그 다음 선택한 순서대로
      const orderedTypes: SupportType[] = [];
      
      // 한부모가족이 있으면 첫 번째로
      if (supportTypes.includes('doljanchi')) {
        orderedTypes.push('doljanchi');
      }
      
      // 나머지는 순서대로
      supportTypes.forEach(type => {
        if (type !== 'doljanchi' && !orderedTypes.includes(type)) {
          orderedTypes.push(type);
        }
      });
      
      // 찾아가는 돌잔치의 경우 복지시설/영아원이 첫 번째
      const hasWelfareFacility = supportTypes.includes('doljanchi_welfare_facility');
      const hasOrphanage = supportTypes.includes('doljanchi_orphanage');
      
      if (hasWelfareFacility || hasOrphanage) {
        const visitingTypes: SupportType[] = [];
        if (hasWelfareFacility) {
          visitingTypes.push('doljanchi_welfare_facility');
        }
        if (hasOrphanage) {
          visitingTypes.push('doljanchi_orphanage');
        }
        
        supportTypes.forEach(type => {
          if (type !== 'doljanchi_welfare_facility' && type !== 'doljanchi_orphanage' && !visitingTypes.includes(type)) {
            visitingTypes.push(type);
          }
        });
        
        return visitingTypes.map(type => REQUIRED_DOCUMENTS[type]?.documentName || '').filter(Boolean);
      }
      
      return orderedTypes.map(type => REQUIRED_DOCUMENTS[type]?.documentName || '').filter(Boolean);
    } else {
      // 전통혼례: 선택한 순서대로
      return supportTypes.map(type => REQUIRED_DOCUMENTS[type]?.documentName || '').filter(Boolean);
    }
  };

  const orderedDocumentNames = getOrderedDocumentNames();

  const appData = application.application_data || {};

  // 디버깅: file_urls 확인
  console.log('Application file_urls:', application.file_urls);
  console.log('Application data:', application);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                ← 목록으로
              </Link>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                신청서 상세보기
              </h1>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'PDF 생성 중...' : 'PDF 출력하기'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">기본 정보</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">신청 ID</label>
                <p className="mt-1 text-gray-900">{application.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">신청 유형</label>
                <p className="mt-1 text-gray-900">{getTypeLabel(application.type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">신청일시</label>
                <p className="mt-1 text-gray-900">
                  {format(new Date(application.created_at), 'yyyy년 MM월 dd일 HH:mm', {
                    locale: ko,
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">수정일시</label>
                <p className="mt-1 text-gray-900">
                  {application.updated_at
                    ? format(new Date(application.updated_at), 'yyyy년 MM월 dd일 HH:mm', {
                        locale: ko,
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 신청자 정보 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">신청자 정보</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">이름</label>
                <p className="mt-1 text-gray-900">{application.user_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">생년월일</label>
                <p className="mt-1 text-gray-900">{application.birth_date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">지원 유형</label>
                <p className="mt-1 text-gray-900">
                  {getSupportTypeLabel(application.support_type, application.application_data)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">동의 여부</label>
                <p className="mt-1 text-gray-900">
                  {application.consent_status ? (
                    <span className="text-green-600">✓ 동의함</span>
                  ) : (
                    <span className="text-red-600">✗ 미동의</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 일정 정보 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">일정 정보</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">1순위</label>
                <p className="mt-1 text-gray-900">
                  {application.schedule_1?.date && application.schedule_1?.time
                    ? `${application.schedule_1.date} ${application.schedule_1.time}`
                    : '미선택'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">2순위</label>
                <p className="mt-1 text-gray-900">
                  {application.schedule_2?.date && application.schedule_2?.time
                    ? `${application.schedule_2.date} ${application.schedule_2.time}`
                    : '미선택'}
                </p>
              </div>
            </div>
          </div>

          {/* 증빙서류 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">증빙서류</h2>
            {application.file_urls && Array.isArray(application.file_urls) && application.file_urls.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {application.file_urls.map((url: string, index: number) => {
                  if (!url) return null;
                  const fileName = url.split('/').pop() || url.split('\\').pop() || `증빙서류_${index + 1}`;
                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName) || url.includes('image') || url.includes('photo');
                  
                  // 해당 인덱스에 매핑된 증빙서류명 가져오기
                  const documentName = orderedDocumentNames[index] || `증빙서류 ${index + 1}`;
                  
                  return (
                    <div
                      key={index}
                      className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
                    >
                      {/* 증빙서류명 표시 */}
                      <div className="mb-2 rounded-lg bg-blue-100 px-3 py-2">
                        <p className="text-sm font-semibold text-blue-800">{documentName}</p>
                      </div>
                      
                      <div className="mb-3">
                        {isImage ? (
                          <img
                            src={url}
                            alt={fileName}
                            className="h-48 w-full rounded-lg object-contain bg-white"
                            onError={(e) => {
                              console.error('Image load error:', url);
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex h-48 w-full items-center justify-center rounded-lg bg-gray-200"><span class="text-gray-500">이미지 로드 실패</span></div>';
                              }
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', url);
                            }}
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-200">
                            <span className="text-gray-500">📄 파일</span>
                          </div>
                        )}
                      </div>
                      <p className="mb-3 truncate text-xs text-gray-500" title={fileName}>
                        {fileName}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-blue-700"
                        >
                          보기
                        </a>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(url);
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = blobUrl;
                              a.download = fileName;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(blobUrl);
                            } catch (error) {
                              console.error('Download error:', error);
                              alert('다운로드 중 오류가 발생했습니다.');
                            }
                          }}
                          className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-green-700"
                        >
                          다운로드
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-gray-500">증빙서류가 업로드되지 않았습니다.</p>
                {application.file_urls && (
                  <p className="mt-2 text-xs text-gray-400">
                    Debug: file_urls = {JSON.stringify(application.file_urls)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 신청서 상세 내용 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">신청서 상세 내용</h2>
            <div className="space-y-4">
              {application.type === 'wedding' ? (
                <>
                  {appData.groom && (
                    <div>
                      <h3 className="font-semibold text-gray-700">신랑 정보</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div>
                          <span className="text-sm text-gray-500">이름:</span>{' '}
                          <span className="text-gray-900">{appData.groom.name || '-'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">생년월일:</span>{' '}
                          <span className="text-gray-900">
                            {appData.groom.birthDate || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">국적:</span>{' '}
                          <span className="text-gray-900">
                            {appData.groom.nationality || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {appData.bride && (
                    <div>
                      <h3 className="font-semibold text-gray-700">신부 정보</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div>
                          <span className="text-sm text-gray-500">이름:</span>{' '}
                          <span className="text-gray-900">{appData.bride.name || '-'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">생년월일:</span>{' '}
                          <span className="text-gray-900">
                            {appData.bride.birthDate || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">국적:</span>{' '}
                          <span className="text-gray-900">
                            {appData.bride.nationality || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* 찾아가는 돌잔치인지 확인 (facility 또는 targets/target이 있으면 찾아가는 돌잔치) */}
                  {appData.facility || appData.targets || appData.target ? (
                    <>
                      {/* 대상자 정보 (7-4-1: 여러 팀과 여러명 지원) */}
                      {(appData.targets && Array.isArray(appData.targets) && appData.targets.length > 0) || appData.target ? (
                        <div>
                          <h3 className="mb-4 font-semibold text-gray-700">대상자 정보</h3>
                          <div className="space-y-6">
                            {/* targets 배열이 있으면 사용, 없으면 target을 배열로 변환 */}
                            {(() => {
                              const targetsArray = appData.targets && Array.isArray(appData.targets) 
                                ? appData.targets 
                                : appData.target 
                                  ? [appData.target] 
                                  : [];
                              
                              return targetsArray.map((target: any, teamIndex: number) => {
                                // 콤마로 구분된 문자열을 배열로 파싱
                                const parseCommaSeparated = (value: string) => {
                                  return value ? value.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0) : [];
                                };
                                
                                const names = parseCommaSeparated(target.name || '');
                                const birthDates = parseCommaSeparated(target.birthDate || '');
                                const genders = parseCommaSeparated(target.gender || '');
                                
                                // 여러명이 있는 경우와 단일명인 경우 모두 처리
                                const personCount = Math.max(names.length, birthDates.length, genders.length, 1);
                                
                                return (
                                  <div key={teamIndex} className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                                    <h4 className="mb-3 text-lg font-semibold text-gray-800">
                                      대상자 {teamIndex + 1}팀
                                    </h4>
                                    
                                    {/* 여러명이 있는 경우 테이블로 표시 */}
                                    {personCount > 1 ? (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                번호
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                이름
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                생년월일
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                                성별
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200 bg-white">
                                            {Array.from({ length: personCount }).map((_, personIndex) => (
                                              <tr key={personIndex}>
                                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                                  {personIndex + 1}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                                  {names[personIndex] || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                                  {birthDates[personIndex] || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                                  {(() => {
                                                    const gender = genders[personIndex] || '';
                                                    if (gender === 'male' || gender === '남' || gender === '남성') return '남';
                                                    if (gender === 'female' || gender === '여' || gender === '여성') return '여';
                                                    return gender || '-';
                                                  })()}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      /* 단일명인 경우 일반 레이아웃 */
                                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                        <div>
                                          <span className="text-sm text-gray-500">이름:</span>{' '}
                                          <span className="text-gray-900">{names[0] || target.name || '-'}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-500">생년월일:</span>{' '}
                                          <span className="text-gray-900">{birthDates[0] || target.birthDate || '-'}</span>
                                        </div>
                                        <div>
                                          <span className="text-sm text-gray-500">성별:</span>{' '}
                                          <span className="text-gray-900">
                                            {(() => {
                                              const gender = genders[0] || target.gender || '';
                                              if (gender === 'male' || gender === '남' || gender === '남성') return '남';
                                              if (gender === 'female' || gender === '여' || gender === '여성') return '여';
                                              return gender || '-';
                                            })()}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* 대상유형과 추가유형 */}
                                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                                      <div className="text-sm">
                                        <span className="font-semibold text-gray-700">대상유형:</span>{' '}
                                        <span className="text-gray-900">{target.targetType || '-'}</span>
                                      </div>
                                      {target.additionalTypes && (
                                        <div className="mt-1 text-sm">
                                          <span className="font-semibold text-gray-700">추가유형:</span>{' '}
                                          <span className="text-gray-900">{target.additionalTypes}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      ) : null}
                      
                      {/* 복지시설 정보 */}
                      {appData.facility && (
                        <div>
                          <h3 className="mb-4 font-semibold text-gray-700">복지시설 정보</h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <span className="text-sm text-gray-500">시설명:</span>{' '}
                              <span className="text-gray-900">{appData.facility.name || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">대표자:</span>{' '}
                              <span className="text-gray-900">{appData.facility.representative || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-sm text-gray-500">주소:</span>{' '}
                              <span className="text-gray-900">{appData.facility.address || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">사업자번호:</span>{' '}
                              <span className="text-gray-900">{appData.facility.businessNumber || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">홈페이지:</span>{' '}
                              <span className="text-gray-900">{appData.facility.website || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">담당자:</span>{' '}
                              <span className="text-gray-900">{appData.facility.manager || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">전화번호:</span>{' '}
                              <span className="text-gray-900">{appData.facility.phone || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">이메일:</span>{' '}
                              <span className="text-gray-900">{appData.facility.email || '-'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* 일반 돌잔치 */
                    <>
                      {appData.parent && (
                        <div>
                          <h3 className="font-semibold text-gray-700">부모 정보</h3>
                          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <span className="text-sm text-gray-500">이름:</span>{' '}
                              <span className="text-gray-900">{appData.parent.name || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">생년월일:</span>{' '}
                              <span className="text-gray-900">{appData.parent.birthDate || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">성별:</span>{' '}
                              <span className="text-gray-900">
                                {appData.parent.gender === 'male' ? '남' : appData.parent.gender === 'female' ? '여' : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {appData.parentMarried !== undefined && (
                        <div>
                          <h3 className="font-semibold text-gray-700">대상 확인</h3>
                          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <span className="text-sm text-gray-500">부/모(신청자 본인)의 혼인 여부:</span>{' '}
                              <span className="text-gray-900">
                                {appData.parentMarried === 'yes' ? '예' : appData.parentMarried === 'no' ? '아니오' : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">부/모(신청자 본인)의 자녀 양육여부:</span>{' '}
                              <span className="text-gray-900">
                                {appData.parentRaisingChild === 'yes' ? '예' : appData.parentRaisingChild === 'no' ? '아니오' : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {appData.child && (
                        <div>
                          <h3 className="font-semibold text-gray-700">아이 정보</h3>
                          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <span className="text-sm text-gray-500">이름:</span>{' '}
                              <span className="text-gray-900">{appData.child.name || '-'}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">생년월일:</span>{' '}
                              <span className="text-gray-900">
                                {appData.child.birthDate || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {appData.representative && (
                <div>
                  <h3 className="font-semibold text-gray-700">대표 연락처</h3>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">전화번호:</span>{' '}
                    <span className="text-gray-900">
                      {appData.representative.phone || '-'}
                    </span>
                  </div>
                </div>
              )}
              {appData.applicationReason && (
                <div>
                  <h3 className="font-semibold text-gray-700">신청 동기</h3>
                  <p className="mt-2 text-gray-900">{appData.applicationReason}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

