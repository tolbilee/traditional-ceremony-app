'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { useRouter } from 'next/navigation';
import { REQUIRED_DOCUMENTS, VISITING_DOLJANCHI_SPECIAL_DOCUMENTS } from '@/lib/utils/constants';
import { SupportType } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ApplicationDetailProps {
  application: any;
}

export default function ApplicationDetail({ application }: ApplicationDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    // 클라이언트 사이드에서 직접 PDF 생성 (html2canvas + jsPDF)
    try {
      setLoading(true);
      
      if (!pdfContentRef.current) {
        throw new Error('PDF 생성 영역을 찾을 수 없습니다.');
      }

      // 숨겨진 영역을 잠시 보이게 만들기
      const originalDisplay = pdfContentRef.current.style.display;
      const originalPosition = pdfContentRef.current.style.position;
      const originalLeft = pdfContentRef.current.style.left;
      const originalTop = pdfContentRef.current.style.top;
      const originalWidth = pdfContentRef.current.style.width;
      const originalZIndex = pdfContentRef.current.style.zIndex;
      
      pdfContentRef.current.style.display = 'block';
      pdfContentRef.current.style.position = 'absolute';
      pdfContentRef.current.style.left = '-9999px';
      pdfContentRef.current.style.top = '0';
      pdfContentRef.current.style.width = '210mm'; // A4 가로
      pdfContentRef.current.style.zIndex = '-9999';
      
      // 잠시 대기 (렌더링 완료 대기)
      await new Promise(resolve => setTimeout(resolve, 300));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 가로 (mm)
      const pageHeight = 297; // A4 세로 (mm)
      // 픽셀을 mm로 변환 (96 DPI 기준: 1px = 0.264583mm)
      // 좌우 여백 30px, 상하단 여백 40px
      const topMargin = 40 * 0.264583; // 상단 여백 40px
      const bottomMargin = 40 * 0.264583; // 하단 여백 40px
      let currentY = topMargin;

      // 타이틀 + 1. 참가자 정보 + 2. 진행정보를 각각 캡처
      const mainContentDiv = pdfContentRef.current.querySelector('div > div') as HTMLElement;
      if (mainContentDiv) {
        const canvas = await html2canvas(mainContentDiv, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.75);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 페이지에 맞게 조정
        if (currentY + imgHeight > pageHeight - bottomMargin) {
          pdf.addPage();
          currentY = topMargin;
        }

        pdf.addImage(imgData, 'JPEG', 0, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5;
      }

      // 3. 증빙서류 섹션 - 항상 새 페이지에서 시작
      const fileUrls = application.file_urls || [];
      if (fileUrls.length > 0) {
        // 무조건 새 페이지 생성
        pdf.addPage();
        currentY = topMargin;

        for (let i = 0; i < fileUrls.length; i++) {
          const url = fileUrls[i];
          const fileName = (() => {
            let fileMetadata: Record<string, string> = {};
            if (application.file_metadata) {
              if (typeof application.file_metadata === 'string') {
                try {
                  fileMetadata = JSON.parse(application.file_metadata);
                } catch (e) {
                  fileMetadata = {};
                }
              } else if (typeof application.file_metadata === 'object') {
                fileMetadata = application.file_metadata as Record<string, string>;
              }
            }
            return fileMetadata[url] || url.split('/').pop() || `증빙서류_${i + 1}`;
          })();

          try {
            // 파일이 PDF인지 확인 (PDF 파일은 건너뛰기)
            const isPDF = url.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.pdf');
            
            if (isPDF) {
              // PDF 파일은 건너뛰기
              console.warn(`PDF 파일 "${fileName}"은 건너뜁니다.`);
              continue;
            }

            // 증빙서류 제목 추가
            const evidenceTitleDiv = document.createElement('div');
            evidenceTitleDiv.style.cssText = `
              width: 210mm;
              padding: 40px 30px;
              background: white;
              font-family: 'Malgun Gothic', Arial, sans-serif;
              box-sizing: border-box;
            `;
            evidenceTitleDiv.innerHTML = `
              <h2 style="font-size: 16pt; font-weight: bold; margin-bottom: 10px; margin-top: 0; margin-left: 25px;">
                3. 증빙서류 ${i + 1}
              </h2>
              <p style="font-size: 11pt; margin: 0; word-break: break-word;">
                ${fileName}
              </p>
            `;
            document.body.appendChild(evidenceTitleDiv);

            const titleCanvas = await html2canvas(evidenceTitleDiv, {
              scale: 1.5,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              width: evidenceTitleDiv.scrollWidth,
              height: evidenceTitleDiv.scrollHeight,
            });
            document.body.removeChild(evidenceTitleDiv);

            // 일반 이미지 파일 처리
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'));
              }, 10000);
              
              img.onload = () => {
                clearTimeout(timeout);
                resolve(img);
              };
              img.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
              };
              
              img.src = url;
            });

            // 증빙서류는 항상 새 페이지에서 시작
            if (i > 0) {
              pdf.addPage();
              currentY = topMargin;
            }

            // 제목 이미지 추가
            const titleImgData = titleCanvas.toDataURL('image/jpeg', 0.75);
            const titleHeight = (titleCanvas.height * 210) / titleCanvas.width;
            pdf.addImage(titleImgData, 'JPEG', 0, currentY, 210, titleHeight);
            currentY += titleHeight;

            // 이미지를 canvas에 그려서 EXIF orientation 무시
            const imageCanvas = document.createElement('canvas');
            imageCanvas.width = img.naturalWidth || img.width;
            imageCanvas.height = img.naturalHeight || img.height;
            const imageCtx = imageCanvas.getContext('2d');
            
            if (!imageCtx) {
              throw new Error('Canvas context를 생성할 수 없습니다.');
            }
            
            imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
            
            // 원본 이미지 크기 및 비율 저장
            const originalWidth = imageCanvas.width;
            const originalHeight = imageCanvas.height;
            
            // 이미지 크기 계산 (A4에 맞춤)
            const pageWidth = 210; // A4 가로 (mm)
            const maxWidth = pageWidth - (30 * 0.264583 * 2); // 좌우 여백 (각 30px)
            const maxHeight = pageHeight - currentY - bottomMargin;
            
            // 픽셀을 mm로 변환 (96 DPI 기준: 1px = 0.264583mm)
            const pxToMm = 0.264583;
            let imgWidthMm = originalWidth * pxToMm;
            let imgHeightMm = originalHeight * pxToMm;
            
            // 원본 비율 유지하며 크기 조정
            if (imgWidthMm > maxWidth) {
              imgHeightMm = (imgHeightMm * maxWidth) / imgWidthMm;
              imgWidthMm = maxWidth;
            }
            if (imgHeightMm > maxHeight) {
              imgWidthMm = (imgWidthMm * maxHeight) / imgHeightMm;
              imgHeightMm = maxHeight;
            }
            
            // canvas를 이미지 데이터로 변환
            const finalImgData = imageCanvas.toDataURL('image/jpeg', 0.75);
            
            // 이미지가 페이지를 넘어가면 새 페이지에 추가
            if (currentY + imgHeightMm > pageHeight - bottomMargin) {
              pdf.addPage();
              currentY = topMargin;
            }
            
            // 이미지 중앙 정렬: (페이지 너비 - 이미지 너비) / 2
            const imgX = (pageWidth - imgWidthMm) / 2;
            
            pdf.addImage(finalImgData, 'JPEG', imgX, currentY, imgWidthMm, imgHeightMm);
            currentY += imgHeightMm + 5;
          } catch (error) {
            console.error(`증빙서류 ${i + 1} 처리 실패:`, error);
            // 에러가 발생해도 계속 진행
          }
        }
      }

      // 4. 개인정보 동의 페이지 추가
      pdf.addPage();
      currentY = topMargin;

      // 신청자 이름 추출
      const getApplicantName = (): string => {
        const appData = application.application_data || {};
        
        if (application.type === 'wedding') {
          // 전통혼례: 신랑 이름 사용
          return appData.groom?.name || application.user_name || '';
        } else {
          const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
          if (isVisitingDoljanchi) {
            // 찾아가는 돌잔치: 복지시설 대표자 이름 사용
            return appData.facility?.representative || application.user_name || '';
          } else {
            // 돌잔치: 부/모 이름 사용
            return appData.parent?.name || application.user_name || '';
          }
        }
      };

      const applicantName = getApplicantName();
      
      // 날짜 추출 (신청일시 사용)
      const consentDate = application.created_at 
        ? format(new Date(application.created_at), 'yyyy년 M월 d일', { locale: ko })
        : format(new Date(), 'yyyy년 M월 d일', { locale: ko });

      // 개인정보 동의 페이지 HTML 생성
      const consentPageHTML = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Noto Sans KR', sans-serif;
              font-size: 10.8pt;
              line-height: 1.4;
              color: #1f2937;
              background: #ffffff;
              padding: 36px 27px 50px 27px;
              width: 210mm;
              box-sizing: border-box;
            }
            .content-wrapper {
              margin: 0 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 27px;
              margin-left: 40px;
              margin-right: 40px;
              padding-bottom: 13.5px;
              border-bottom: 3px solid #1e40af;
            }
            .header h1 {
              font-size: 18pt;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 7.2px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 14.4pt;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 12px;
              margin-left: 0;
              padding-bottom: 7.2px;
              border-bottom: 2px solid #e5e7eb;
            }
            .intro-text {
              font-size: 9.9pt;
              line-height: 1.4;
              color: #374151;
              margin-bottom: 16px;
            }
            .info-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 5.4px;
              padding: 8.5px;
              margin-bottom: 13.5px;
            }
            .info-item {
              margin-bottom: 9px;
            }
            .info-item:last-child {
              margin-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #1f2937;
              display: block;
              margin-bottom: 4px;
            }
            .info-value {
              color: #4b5563;
              font-size: 9.9pt;
              line-height: 1.3;
            }
            .notice {
              font-size: 9pt;
              color: #6b7280;
              margin-top: 13.5px;
              padding-left: 9px;
              border-left: 3px solid #d1d5db;
            }
            .consent-box {
              border: 2px solid #d1d5db;
              border-radius: 5.4px;
              padding: 8.5px;
              background: #ffffff;
              margin-top: 13.5px;
            }
            .consent-question {
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 10.8px;
              font-size: 9.9pt;
            }
            .consent-options {
              display: flex;
              gap: 18px;
              font-size: 9.9pt;
            }
            .consent-option {
              display: flex;
              align-items: center;
              gap: 7.2px;
            }
            .consent-checkbox {
              width: 16.2px;
              height: 16.2px;
              border: 2px solid #4b5563;
              border-radius: 2.7px;
              display: inline-block;
              position: relative;
              flex-shrink: 0;
            }
            .consent-checkbox.checked::after {
              content: '✓';
              position: absolute;
              top: -10px;
              left: 3px;
              color: #dc2626;
              font-weight: bold;
              font-size: 12.6px;
              line-height: 16.2px;
            }
            .divider {
              border-top: none;
              margin: 18px 0;
            }
            .signature-section {
              margin-top: 10px;
              padding-top: 15px;
              padding-bottom: 20px;
              border-top: none;
            }
            .signature-text {
              font-size: 9.9pt;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
            }
            .signature-info {
              font-size: 9.9pt;
              color: #374151;
              line-height: 1.5;
            }
            .signature-date {
              margin-bottom: 7.2px;
            }
            .signature-name {
              margin-bottom: 7.2px;
            }
            .signature-recipient {
              margin-top: 18px;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>개인정보이용동의서</h1>
          </div>

          <div class="content-wrapper">
          <div class="section">
            <div class="section-title">개인정보 수집·이용 동의서</div>
            
            <div class="intro-text">
              <p style="margin-bottom: 10px;">
                국가유산진흥원에서는 귀하의 2026년 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 참가자 모집을 위하여 아래와 같이 개인정보를 수집·이용하고자 합니다.
              </p>
              <p>
                아래 내용을 충분히 숙지하신 후, 개인정보 수집‧이용 동의서에 서명하여 주시기 바랍니다.
              </p>
            </div>

            <div class="info-box">
              <div class="info-item">
                <span class="info-label">[수집하는 개인정보의 항목]</span>
                <div class="info-value">성명, 생년월일, 주소, 성별, 국적, 이메일, 연락처 등</div>
              </div>
              <div class="info-item">
                <span class="info-label">[개인정보 수집 이용 목적]</span>
                <div class="info-value">2026년 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 참가자 모집 및 관리</div>
              </div>
              <div class="info-item">
                <span class="info-label">[개인정보 보유기간]</span>
                <div class="info-value">행사 종료 후 1년</div>
              </div>
            </div>

            <p class="notice">
              ※ 위의 개인정보 처리에 대한 동의를 거부할 권리가 있습니다. 그러나, 동의를 거부할 경우 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 신청을 할 수 없습니다.
            </p>

            <div class="consent-box">
              <div class="consent-question">
                개인정보의 수집 및 이용에 동의하십니까?
              </div>
              <div class="consent-options">
                <div class="consent-option">
                  <span class="consent-checkbox checked"></span>
                  <span>동의함</span>
                </div>
                <div class="consent-option">
                  <span class="consent-checkbox"></span>
                  <span>동의하지 않음</span>
                </div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="section">
            <div class="section-title">민감정보의 수집 및 이용 동의</div>
            
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">[수집하는 민감정보의 항목]</span>
                <div class="info-value">사회적 배려 대상자 증빙 서류 및 혼인사실 증빙 서류</div>
              </div>
              <div class="info-item">
                <span class="info-label">[수집 이용 목적]</span>
                <div class="info-value">2026년 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 참가자 모집 및 관리</div>
              </div>
              <div class="info-item">
                <span class="info-label">[개인정보 보유기간]</span>
                <div class="info-value">행사 종료 후 1년</div>
              </div>
            </div>

            <p class="notice">
              ※ 위의 민감정보 처리에 대한 동의를 거부할 권리가 있습니다. 그러나, 동의를 거부할 경우 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 신청을 할 수 없습니다.
            </p>

            <div class="consent-box">
              <div class="consent-question">
                민감정보의 수집 및 이용에 동의하십니까?
              </div>
              <div class="consent-options">
                <div class="consent-option">
                  <span class="consent-checkbox checked"></span>
                  <span>동의함</span>
                </div>
                <div class="consent-option">
                  <span class="consent-checkbox"></span>
                  <span>동의하지 않음</span>
                </div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="signature-section">
            <p class="signature-text">위의 각 사항에 동의하였음을 확인합니다.</p>
            <div class="signature-info">
              <div class="signature-date">${consentDate}</div>
              <div class="signature-name">성명 : ${applicantName || '(신청자 성명)'}</div>
              <div class="signature-recipient">국가유산진흥원장 귀하</div>
            </div>
          </div>
          </div>
        </body>
        </html>
      `;

      // 개인정보 동의 페이지를 임시 DOM 요소로 생성
      const consentPageDiv = document.createElement('div');
      consentPageDiv.innerHTML = consentPageHTML;
      consentPageDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 210mm;
        background: white;
        font-family: 'Noto Sans KR', sans-serif;
      `;
      document.body.appendChild(consentPageDiv);

      // 폰트 로딩 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // 개인정보 동의 페이지 캡처
      const consentCanvas = await html2canvas(consentPageDiv, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: consentPageDiv.scrollWidth,
        height: consentPageDiv.scrollHeight,
      });

      document.body.removeChild(consentPageDiv);

      const consentImgData = consentCanvas.toDataURL('image/jpeg', 0.75);
      const consentImgHeight = (consentCanvas.height * imgWidth) / consentCanvas.width;

      // 개인정보 동의 페이지를 PDF에 추가
      pdf.addImage(consentImgData, 'JPEG', 0, currentY, imgWidth, consentImgHeight);

      // 원래 스타일 복원
      pdfContentRef.current.style.display = originalDisplay;
      pdfContentRef.current.style.position = originalPosition;
      pdfContentRef.current.style.left = originalLeft;
      pdfContentRef.current.style.top = originalTop;
      pdfContentRef.current.style.width = originalWidth;
      pdfContentRef.current.style.zIndex = originalZIndex;

      // 파일명 생성
      const createdDate = application.created_at 
        ? format(new Date(application.created_at), 'yyyyMMdd', { locale: ko })
        : format(new Date(), 'yyyyMMdd', { locale: ko });
      const appData = application.application_data || {};
      const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
      let prefix = '전통혼례';
      let nameForFileName = application.user_name;
      if (application.type === 'doljanchi') {
        if (isVisitingDoljanchi) {
          prefix = '찾아가는돌잔치';
          // 찾아가는 돌잔치의 경우 대표자 이름 사용
          nameForFileName = appData.facility?.representative || application.user_name;
        } else {
          prefix = '돌잔치';
        }
      }
      const fileName = `${prefix}_${nameForFileName}_${createdDate}.pdf`;

      // PDF 다운로드
      pdf.save(fileName);
      
      setLoading(false);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
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
    const documentNames: string[] = [];
    
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
        
        visitingTypes.forEach(type => {
          // 찾아가는 돌잔치의 경우 한부모가족 복지시설/영아원은 개별 서류로 분리 (4-6-2 * 주의사항)
          if (type === 'doljanchi_welfare_facility' || type === 'doljanchi_orphanage') {
            // 한부모가족 복지시설 또는 영아원인 경우 3개의 개별 서류로 분리
            documentNames.push(VISITING_DOLJANCHI_SPECIAL_DOCUMENTS.business_registration.documentName);
            documentNames.push(VISITING_DOLJANCHI_SPECIAL_DOCUMENTS.admission_confirmation.documentName);
            documentNames.push(VISITING_DOLJANCHI_SPECIAL_DOCUMENTS.single_parent_certificate.documentName);
          } else {
            const docName = REQUIRED_DOCUMENTS[type]?.documentName;
            if (docName) documentNames.push(docName);
          }
        });
      } else {
        orderedTypes.forEach(type => {
          const docName = REQUIRED_DOCUMENTS[type]?.documentName;
          if (docName) documentNames.push(docName);
        });
      }
    } else {
      // 전통혼례: 선택한 순서대로
      supportTypes.forEach(type => {
        const docName = REQUIRED_DOCUMENTS[type]?.documentName;
        if (docName) documentNames.push(docName);
      });
      
      // 전통혼례 특이 케이스 증빙서류 추가 (혼인관계증명서, 주민등록등본 등)
      const targetCategory = (appData as any)?.targetCategory;
      if (targetCategory === 'pre_marriage' || targetCategory === 'married_no_ceremony_no_registration') {
        documentNames.push('혼인관계증명서');
      }
      if (targetCategory === 'married_no_ceremony_registered') {
        documentNames.push('주민등록등본');
      }
    }
    
    return documentNames;
  };

  const orderedDocumentNames = getOrderedDocumentNames();
  
  // file_metadata에서 파일명을 파싱하여 증빙서류명 추출하는 함수
  const getDocumentNameFromFileName = (fileName: string): string | null => {
    // file_metadata의 파일명 형식: [신청자이름]_[증빙서류명]_[날짜시간].확장자
    // 예: "이석_기초수급증명서_20260122224222.jpg"
    const parts = fileName.split('_');
    if (parts.length >= 2) {
      // 두 번째 부분이 증빙서류명일 가능성이 높음
      const possibleDocName = parts.slice(1, -1).join('_'); // 마지막 부분(날짜시간.확장자) 제외
      // orderedDocumentNames와 매칭 시도
      const matched = orderedDocumentNames.find(docName => possibleDocName.includes(docName) || docName.includes(possibleDocName));
      if (matched) return matched;
      return possibleDocName;
    }
    return null;
  };

  // 디버깅: file_urls 및 file_metadata 확인
  console.log('=== ApplicationDetail Debug ===');
  console.log('Application file_urls:', application.file_urls);
  console.log('Application file_metadata:', application.file_metadata);
  console.log('Application file_metadata type:', typeof application.file_metadata);
  console.log('Application file_metadata is null?:', application.file_metadata === null);
  console.log('Application file_metadata is undefined?:', application.file_metadata === undefined);
  if (application.file_metadata && typeof application.file_metadata === 'object') {
    console.log('Application file_metadata keys:', Object.keys(application.file_metadata));
    console.log('Application file_metadata entries:', Object.entries(application.file_metadata));
  }
  console.log('Application data:', application);

  const appData = application.application_data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 숨겨진 PDF 생성 영역 */}
      <div ref={pdfContentRef} style={{ display: 'none' }}>
        <div style={{ width: '210mm', padding: '40px 30px', fontFamily: "'Malgun Gothic', Arial, sans-serif", backgroundColor: 'white' }}>
          {/* 타이틀 */}
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', marginTop: 0 }}>
            {(() => {
              const appData = application.application_data || {};
              const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
              if (application.type === 'doljanchi' && isVisitingDoljanchi) {
                return '2026년 사회적배려대상자 찾아가는 돌잔치 참가신청서';
              } else if (application.type === 'doljanchi') {
                return '2026년 사회적배려대상자 돌잔치 참가신청서';
              } else {
                return '2026년 사회적배려대상자 전통혼례 참가신청서';
              }
            })()}
          </h1>
          
          {/* 1. 참가자 정보 */}
          <div data-section="participant">
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '10px', marginTop: 0, marginLeft: '25px' }}>1. 신청자 정보</h2>
            {(() => {
              const appData = application.application_data || {};
              const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
              
              if (isVisitingDoljanchi) {
                // 찾아가는 돌잔치 케이스
                return (
                  <table style={{ width: 'calc(100% - 50px)', margin: '0 25px', borderCollapse: 'collapse', border: '0.5px solid #000', tableLayout: 'fixed', fontSize: '10pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>대표자</td>
                        <td style={{ width: '38%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{appData.facility?.representative || ''}</td>
                        <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>시설명</td>
                        <td style={{ width: '38%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{appData.facility?.name || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>주소</td>
                        <td colSpan={3} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{appData.facility?.address || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>사업자번호</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{appData.facility?.businessNumber || ''}</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>담당자</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{appData.facility?.manager || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>전화번호</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.facility?.phone || ''}</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>이메일</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{appData.facility?.email || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>홈페이지</td>
                        <td colSpan={3} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{appData.facility?.website || ''}</td>
                      </tr>
                    </tbody>
                  </table>
                );
              } else if (application.type === 'wedding') {
                // 전통혼례 케이스
                return (
                  <table style={{ width: 'calc(100% - 50px)', margin: '0 25px', borderCollapse: 'collapse', border: '0.5px solid #000', tableLayout: 'fixed', fontSize: '10pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>이름</td>
                        <td rowSpan={3} style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>신랑<br/>(남)</td>
                        <td style={{ width: '32%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.groom?.name || ''}</td>
                        <td rowSpan={3} style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>신부<br/>(여)</td>
                        <td style={{ width: '36%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.bride?.name || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>생년월일</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.groom?.birthDate || ''}</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.bride?.birthDate || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>국적</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.groom?.nationality || ''}</td>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.bride?.nationality || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>주소</td>
                        <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{appData.representative?.address || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>대표번호</td>
                        <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.representative?.phone || ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>지원유형</td>
                        <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{getSupportTypeLabel(application.support_type || '', appData)}</td>
                      </tr>
                    </tbody>
                  </table>
                );
              } else {
                // 일반 돌잔치 케이스
                return (
              <table style={{ width: 'calc(100% - 50px)', margin: '0 25px', borderCollapse: 'collapse', border: '0.5px solid #000', tableLayout: 'fixed', fontSize: '10pt' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>이름</td>
                    <td rowSpan={3} style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>부/모<br/>({appData.parent?.gender === 'male' ? '남' : appData.parent?.gender === 'female' ? '여' : ''})</td>
                    <td style={{ width: '32%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.parent?.name || ''}</td>
                    <td rowSpan={3} style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>아이</td>
                    <td style={{ width: '36%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.child?.name || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>생년월일</td>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.parent?.birthDate || ''}</td>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.child?.birthDate || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>성별</td>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.parent?.gender === 'male' ? '남' : appData.parent?.gender === 'female' ? '여' : ''}</td>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.child?.gender === 'male' ? '남' : appData.child?.gender === 'female' ? '여' : ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>주소</td>
                    <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{appData.representative?.address || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>대표번호</td>
                    <td colSpan={2} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '10pt' }}>{appData.representative?.phone || ''}</td>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>이메일</td>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{appData.representative?.email || ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>지원유형</td>
                    <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{getSupportTypeLabel(application.support_type || '', appData)}</td>
                  </tr>
                </tbody>
              </table>
                );
              }
            })()}
          </div>
          
          {/* 2. 진행정보 */}
          <div data-section="progress" style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '10px', marginTop: 0, marginLeft: '25px' }}>2. 진행정보</h2>
            {(() => {
              const appData = application.application_data || {};
              const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
              
              if (isVisitingDoljanchi) {
                // 찾아가는 돌잔치 케이스
                // targets 배열이 있으면 사용, 없으면 target을 배열로 변환
                const targetsArray = appData.targets && Array.isArray(appData.targets) 
                  ? appData.targets 
                  : appData.target 
                    ? [appData.target]
                    : [];
                
                // 콤마로 구분된 문자열을 배열로 파싱하는 함수
                const parseCommaSeparated = (value: string) => {
                  return value ? value.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0) : [];
                };
                
                // 각 팀의 정보를 파싱하여 줄바꿈으로 표시할 문자열 생성
                const formatTargetInfo = (target: any) => {
                  const names = parseCommaSeparated(target.name || '');
                  const birthDates = parseCommaSeparated(target.birthDate || '');
                  const genders = parseCommaSeparated(target.gender || '');
                  
                  const maxCount = Math.max(names.length, birthDates.length, genders.length, 1);
                  const lines: string[] = [];
                  
                  for (let i = 0; i < maxCount; i++) {
                    const name = names[i] || '';
                    const birthDate = birthDates[i] || '';
                    const gender = genders[i] || '';
                    // gender가 'male'/'female' 형식이면 한글로 변환
                    const genderText = gender === 'male' ? '남' : gender === 'female' ? '여' : gender;
                    lines.push(`${name} ${birthDate} ${genderText}`.trim());
                  }
                  
                  return lines.join('\n');
                };
                
                // 대상자 행의 rowSpan 계산 (각 팀당 1행)
                const totalTargetRows = Math.max(targetsArray.length, 1);
                
                return (
                  <table style={{ width: 'calc(100% - 50px)', margin: '0 25px', borderCollapse: 'collapse', border: '0.5px solid #000', tableLayout: 'fixed', fontSize: '10pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '14%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>희망일시</td>
                        <td style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>1순위</td>
                        <td style={{ width: '24%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{application.schedule_1?.date && application.schedule_1?.time ? `${application.schedule_1.date} ${application.schedule_1.time}` : ''}</td>
                        <td style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>2순위</td>
                        <td colSpan={3} style={{ width: '42%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{application.schedule_2?.date && application.schedule_2?.time ? `${application.schedule_2.date} ${application.schedule_2.time}` : ''}</td>
                      </tr>
                      {targetsArray.length > 0 ? targetsArray.map((target: any, teamIndex: number) => {
                        // 각 팀당 1행: 대상자 | 1팀 | {{1팀대상자이름}} | 생년월일 | {{생년월일}} | 성별 | {{성별}}
                        const isFirstTeam = teamIndex === 0;
                        
                        return (
                          <tr key={teamIndex}>
                            {isFirstTeam && (
                              <td rowSpan={totalTargetRows} style={{ width: '14%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>대상자</td>
                            )}
                            <td style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>{teamIndex === 0 ? '1팀' : teamIndex === 1 ? '2팀' : `${teamIndex + 1}팀`}</td>
                            <td style={{ width: '22%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'pre-line', fontSize: '10pt' }}>{parseCommaSeparated(target.name || '').join('\n')}</td>
                            <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>생년월일</td>
                            <td style={{ width: '20%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'pre-line', fontSize: '10pt' }}>{parseCommaSeparated(target.birthDate || '').join('\n')}</td>
                            <td style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>성별</td>
                            <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'pre-line', fontSize: '10pt' }}>{target.gender ? parseCommaSeparated(target.gender || '').map((g: string) => g === 'male' ? '남' : g === 'female' ? '여' : g).join('\n') : ''}</td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td style={{ width: '14%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>대상자</td>
                          <td style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>1팀</td>
                          <td style={{ width: '22%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}></td>
                          <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>생년월일</td>
                          <td style={{ width: '20%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '10pt' }}></td>
                          <td style={{ width: '10%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>성별</td>
                          <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}></td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ width: '14%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>신청동기</td>
                        <td colSpan={6} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{(appData.applicationReason || '').replace(/\n+$/, '')}</td>
                      </tr>
                    </tbody>
                  </table>
                );
              } else if (application.type === 'wedding') {
                // 전통혼례 케이스
                return (
                  <table style={{ width: 'calc(100% - 50px)', margin: '0 25px', borderCollapse: 'collapse', border: '0.5px solid #000', tableLayout: 'fixed', fontSize: '10pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '20%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>대상구분</td>
                        <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', fontSize: '10pt' }}>{(appData as any)?.targetCategory === 'pre_marriage' ? '예비부부' : (appData as any)?.targetCategory === 'married_no_ceremony_no_registration' ? '결혼식 미진행 부부(혼인신고 X)' : (appData as any)?.targetCategory === 'married_no_ceremony_registered' ? '결혼식 미진행 부부(혼인신고 O)' : (appData as any)?.targetCategory === 'other' ? '기타' : ''}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>희망혼례 일시</td>
                        <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>1순위</td>
                        <td style={{ width: '25%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{application.schedule_1?.date && application.schedule_1?.time ? `${application.schedule_1.date} ${application.schedule_1.time}` : ''}</td>
                        <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>2순위</td>
                        <td style={{ width: '31%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{application.schedule_2?.date && application.schedule_2?.time ? `${application.schedule_2.date} ${application.schedule_2.time}` : ''}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>신청동기</td>
                        <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{(appData.applicationReason || '').replace(/\n+$/, '')}</td>
                      </tr>
                    </tbody>
                  </table>
                );
              } else {
                // 일반 돌잔치 케이스
                return (
              <table style={{ width: 'calc(100% - 50px)', margin: '0 25px', borderCollapse: 'collapse', border: '0.5px solid #000', tableLayout: 'fixed', fontSize: '10pt' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '20%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>혼인여부</td>
                    <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.parentMarried === 'yes' ? '예' : appData.parentMarried === 'no' ? '아니오' : ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>자녀양육여부</td>
                    <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', fontSize: '10pt' }}>{appData.parentRaisingChild === 'yes' ? '예' : appData.parentRaisingChild === 'no' ? '아니오' : ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>희망일시</td>
                    <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>1순위</td>
                    <td style={{ width: '25%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{application.schedule_1?.date && application.schedule_1?.time ? `${application.schedule_1.date} ${application.schedule_1.time}` : ''}</td>
                    <td style={{ width: '12%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>2순위</td>
                    <td style={{ width: '31%', paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'center', whiteSpace: 'nowrap', fontSize: '10pt' }}>{application.schedule_2?.date && application.schedule_2?.time ? `${application.schedule_2.date} ${application.schedule_2.time}` : ''}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1', border: '0.5px solid #000', backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>신청동기</td>
                    <td colSpan={4} style={{ paddingTop: '1px', paddingBottom: '15px', paddingLeft: '5px', paddingRight: '5px', verticalAlign: 'middle', lineHeight: '1.3', border: '0.5px solid #000', textAlign: 'left', wordBreak: 'break-word', fontSize: '10pt' }}>{(appData.applicationReason || '').replace(/\n+$/, '')}</td>
                  </tr>
                </tbody>
              </table>
                );
              }
            })()}
          </div>
        </div>
      </div>

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
            {(() => {
              // 찾아가는 돌잔치인지 확인
              const appData = application.application_data;
              const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
              
              if (isVisitingDoljanchi) {
                // 찾아가는 돌잔치: 대표자 이름과 사업자번호 표시
                return (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">대표자 이름</label>
                      <p className="mt-1 text-gray-900">{appData?.facility?.representative || application.user_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">사업자등록번호</label>
                      <p className="mt-1 text-gray-900">{appData?.facility?.businessNumber || '-'}</p>
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
                );
              } else {
                // 일반 신청: 이름과 생년월일 표시
                return (
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
                );
              }
            })()}
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
                  
                  // file_metadata에서 원본 파일명 가져오기
                  // JSONB 타입이므로 객체로 변환 필요할 수 있음
                  let fileMetadata: Record<string, string> = {};
                  if (application.file_metadata) {
                    if (typeof application.file_metadata === 'string') {
                      try {
                        fileMetadata = JSON.parse(application.file_metadata);
                      } catch (e) {
                        console.error('Failed to parse file_metadata:', e);
                        fileMetadata = {};
                      }
                    } else if (typeof application.file_metadata === 'object') {
                      fileMetadata = application.file_metadata as Record<string, string>;
                    }
                  }
                  
                  // 디버깅: file_metadata 조회
                  console.log(`File ${index}: URL =`, url);
                  console.log(`File ${index}: fileMetadata type =`, typeof application.file_metadata);
                  console.log(`File ${index}: fileMetadata[url] =`, fileMetadata[url]);
                  console.log(`File ${index}: All fileMetadata keys:`, Object.keys(fileMetadata));
                  
                  // URL이 정확히 일치하는지 확인
                  let originalFileName = fileMetadata[url];
                  
                  // 정확히 일치하지 않으면 부분 매칭 시도 (파일명으로)
                  if (!originalFileName) {
                    const fileNameFromUrl = url.split('/').pop() || '';
                    const urlKey = Object.keys(fileMetadata).find(key => {
                      const keyFileName = key.split('/').pop() || '';
                      return keyFileName === fileNameFromUrl || key === url;
                    });
                    if (urlKey) {
                      originalFileName = fileMetadata[urlKey];
                      console.log(`File ${index}: Found by partial match:`, urlKey, '->', originalFileName);
                    }
                  }
                  
                  // 여전히 없으면 URL에서 파일명 추출 (UUID 형식)
                  if (!originalFileName) {
                    originalFileName = url.split('/').pop() || url.split('\\').pop() || `증빙서류_${index + 1}`;
                    console.warn(`File ${index}: originalFileName not found in file_metadata, using URL:`, originalFileName);
                  }
                  
                  const storageFileName = url.split('/').pop() || url.split('\\').pop() || `증빙서류_${index + 1}`;
                  
                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(originalFileName) || url.includes('image') || url.includes('photo');
                  
                  // 해당 인덱스에 매핑된 증빙서류명 가져오기
                  // file_metadata의 파일명에서 증빙서류명 추출 시도
                  let documentName = orderedDocumentNames[index];
                  
                  // orderedDocumentNames에 없으면 파일명에서 추출 시도
                  if (!documentName && originalFileName) {
                    const extractedDocName = getDocumentNameFromFileName(originalFileName);
                    if (extractedDocName) {
                      documentName = extractedDocName;
                    }
                  }
                  
                  // 여전히 없으면 기본값 사용
                  if (!documentName) {
                    documentName = `증빙서류 ${index + 1}`;
                  }
                  
                  return (
                    <div
                      key={index}
                      className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-center">
                        {isImage ? (
                          <img
                            src={url}
                            alt={originalFileName}
                            className="h-48 max-w-full rounded-lg object-contain bg-white mx-auto"
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
                      <p className="mb-3 truncate text-xs text-gray-500" title={originalFileName}>
                        {originalFileName}
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
                              a.download = originalFileName; // 원본 파일명 사용
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

