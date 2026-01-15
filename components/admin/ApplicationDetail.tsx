'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { useRouter } from 'next/navigation';

interface ApplicationDetailProps {
  application: any;
}

export default function ApplicationDetail({ application }: ApplicationDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/applications/${application.id}/pdf`);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        // HTML이 반환된 경우 - jsPDF + html2canvas로 PDF 생성 (한글 폰트 지원)
        if (contentType?.includes('text/html')) {
          const htmlText = await response.text();
          
          // 임시 div 생성하여 HTML 삽입
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.width = '210mm'; // A4 width
          tempDiv.style.padding = '20px';
          tempDiv.style.backgroundColor = '#fff';
          tempDiv.innerHTML = htmlText;
          document.body.appendChild(tempDiv);
          
          // 폰트 로딩 대기 (Google Fonts 등)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // jsPDF와 html2canvas 동적 import
          const { jsPDF } = await import('jspdf');
          const html2canvas = (await import('html2canvas')).default;
          
          // jsPDF 인스턴스 생성
          const doc = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          });
          
          // 한글 폰트 등록 (폰트가 설정되어 있는 경우)
          try {
            const { registerKoreanFont } = await import('@/lib/pdf/fontLoader');
            registerKoreanFont(doc);
          } catch (fontError) {
            console.warn('한글 폰트 등록 실패 (기본 폰트 사용):', fontError);
          }
          
          // html2canvas로 HTML을 이미지로 변환
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: tempDiv.scrollWidth,
            height: tempDiv.scrollHeight,
          } as any);
          
          const imgData = canvas.toDataURL('image/png', 1.0);
          
          // PDF 크기 계산 (A4: 210mm x 297mm)
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = doc.internal.pageSize.getHeight();
          const imgWidth = pdfWidth - 30; // 여백 15mm씩
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // PDF에 이미지 추가
          let heightLeft = imgHeight;
          let position = 15; // 시작 위치 (상단 여백)
          
          // 첫 페이지에 이미지 추가
          doc.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 30); // 한 페이지 높이에서 여백 제외
          
          // 여러 페이지가 필요한 경우
          while (heightLeft > 0) {
            position = heightLeft - imgHeight + 15; // 다음 페이지 시작 위치
            doc.addPage();
            doc.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 30);
          }
          
          // PDF 저장
          const fileName = `신청서_${application.user_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
          doc.save(fileName);
          
          // 임시 div 제거
          document.body.removeChild(tempDiv);
          setLoading(false);
          return;
        }
        
        // PDF가 반환된 경우
        if (contentType?.includes('application/pdf')) {
          const blob = await response.blob();
          
          // PDF 유효성 검사
          const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const isPDF = uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && 
                        uint8Array[2] === 0x44 && uint8Array[3] === 0x46;
          
          if (!isPDF) {
            // PDF가 아니면 HTML로 처리
            const htmlText = await blob.text();
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm';
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = '#fff';
            tempDiv.innerHTML = htmlText;
            document.body.appendChild(tempDiv);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;
            
            const doc = new jsPDF({
              unit: 'mm',
              format: 'a4',
              orientation: 'portrait',
            });
            
            try {
              const { registerKoreanFont } = await import('@/lib/pdf/fontLoader');
              registerKoreanFont(doc);
            } catch (fontError) {
              console.warn('한글 폰트 등록 실패:', fontError);
            }
            
            const canvas = await html2canvas(tempDiv, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
            } as any);
            
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 30;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 15;
            
            doc.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 30);
            
            while (heightLeft > 0) {
              position = heightLeft - imgHeight + 15;
              doc.addPage();
              doc.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
              heightLeft -= (pdfHeight - 30);
            }
            
            const fileName = `신청서_${application.user_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
            doc.save(fileName);
            document.body.removeChild(tempDiv);
            setLoading(false);
            return;
          }
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `신청서_${application.user_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
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

  const getSupportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic_livelihood: '기초수급자',
      multicultural: '다문화',
      disabled: '장애인',
      north_korean_defector: '북한이탈주민',
      national_merit: '국가유공자',
    };
    return labels[type] || type;
  };

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
                  {getSupportTypeLabel(application.support_type)}
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
                  
                  return (
                    <div
                      key={index}
                      className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
                    >
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
                      <p className="mb-3 truncate text-sm font-medium text-gray-700" title={fileName}>
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
                        <a
                          href={url}
                          download={fileName}
                          className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-green-700"
                        >
                          다운로드
                        </a>
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
                  {appData.parent && (
                    <div>
                      <h3 className="font-semibold text-gray-700">부모 정보</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <div>
                          <span className="text-sm text-gray-500">부 이름:</span>{' '}
                          <span className="text-gray-900">{appData.parent.fatherName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">모 이름:</span>{' '}
                          <span className="text-gray-900">{appData.parent.motherName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">혼인여부:</span>{' '}
                          <span className="text-gray-900">
                            {appData.parent.married ? '기혼' : '미혼'}
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

