import { Handler } from '@netlify/functions';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createClient } from '@supabase/supabase-js';

// Pretendard 폰트 CDN URL
const PRETENDARD_FONT_URL = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css';

interface PDFGeneratorRequest {
  applicationId: string;
}

/**
 * PDF 생성 및 Supabase Storage 업로드
 */
export const handler: Handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // 요청 본문 파싱
    const { applicationId }: PDFGeneratorRequest = JSON.parse(event.body || '{}');

    if (!applicationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'applicationId is required' }),
      };
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Supabase configuration missing',
          details: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
        }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 신청서 데이터 조회
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Application not found' }),
      };
    }

    const app = application as any;

    // 지원 유형 한글 변환
    const supportTypeLabels: Record<string, string> = {
      basic_livelihood: '기초수급자',
      multicultural: '다문화가정',
      disabled: '장애인',
      north_korean_defector: '북한이탈주민',
      national_merit: '국가유공자',
    };

    const appData = app.application_data || {};
    const createdDate = app.created_at ? new Date(app.created_at).toLocaleString('ko-KR') : '-';
    const schedule1 = typeof app.schedule_1 === 'object' ? app.schedule_1 : {};
    const schedule2 = typeof app.schedule_2 === 'object' ? app.schedule_2 : {};

    // 파일명 생성: [신청일자]_[이름]_신청서.pdf
    const dateStr = app.created_at 
      ? new Date(app.created_at).toISOString().split('T')[0].replace(/-/g, '')
      : new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `${dateStr}_${app.user_name}_신청서.pdf`;

    // HTML 템플릿 생성 (Pretendard 폰트 + Tailwind CSS)
    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>신청서</title>
  <link rel="stylesheet" href="${PRETENDARD_FONT_URL}">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 20mm;
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .no-break {
      page-break-inside: avoid;
    }
    
    .header {
      border-bottom: 3px solid #1e40af;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th, td {
      padding: 10px;
      border: 1px solid #d1d5db;
      text-align: left;
    }
    
    th {
      background-color: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .info-item {
      display: flex;
    }
    
    .info-label {
      font-weight: 600;
      color: #4b5563;
      min-width: 90px;
      margin-right: 8px;
    }
    
    .info-value {
      color: #111827;
      flex: 1;
    }
    
    .text-content {
      background: #f9fafb;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #2563eb;
      margin-top: 8px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    @media print {
      body {
        padding: 15mm;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="font-size: 20pt; font-weight: 700; color: #1e40af; text-align: center; margin-bottom: 8px;">
      2026 한국의 집 전통혼례 및 돌잔치 신청서
    </h1>
  </div>

  <div class="section no-break">
    <div class="section-title">기본 정보</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">신청 ID:</span>
        <span class="info-value">${app.id || '-'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">신청 유형:</span>
        <span class="info-value">${app.type === 'wedding' ? '전통혼례' : '돌잔치'}</span>
      </div>
      <div class="info-item" style="grid-column: 1 / -1;">
        <span class="info-label">신청일시:</span>
        <span class="info-value">${createdDate}</span>
      </div>
    </div>
  </div>

  <div class="section no-break">
    <div class="section-title">신청자 정보</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">이름:</span>
        <span class="info-value">${app.user_name || '-'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">생년월일:</span>
        <span class="info-value">${app.birth_date || '-'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">지원 유형:</span>
        <span class="info-value">${supportTypeLabels[app.support_type] || app.support_type || '-'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">동의 여부:</span>
        <span class="info-value">${app.consent_status ? '동의함' : '미동의'}</span>
      </div>
    </div>
  </div>

  <div class="section no-break">
    <div class="section-title">일정 정보</div>
    <table>
      <thead>
        <tr>
          <th>순위</th>
          <th>날짜</th>
          <th>시간</th>
        </tr>
      </thead>
      <tbody>
        ${schedule1.date ? `
        <tr>
          <td>1순위</td>
          <td>${schedule1.date || '-'}</td>
          <td>${schedule1.time || '-'}</td>
        </tr>
        ` : ''}
        ${schedule2.date ? `
        <tr>
          <td>2순위</td>
          <td>${schedule2.date || '-'}</td>
          <td>${schedule2.time || '-'}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>
  </div>

  ${appData && Object.keys(appData).length > 0 ? `
  <div class="section no-break">
    <div class="section-title">신청서 상세 내용</div>
    ${app.type === 'wedding' ? `
      ${appData.groom ? `
      <div style="margin-bottom: 15px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">신랑 정보</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">이름:</span>
            <span class="info-value">${appData.groom.name || '-'}</span>
          </div>
          ${appData.groom.birthDate ? `
          <div class="info-item">
            <span class="info-label">생년월일:</span>
            <span class="info-value">${appData.groom.birthDate}</span>
          </div>
          ` : ''}
          ${appData.groom.nationality ? `
          <div class="info-item">
            <span class="info-label">국적:</span>
            <span class="info-value">${appData.groom.nationality}</span>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      ${appData.bride ? `
      <div style="margin-bottom: 15px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">신부 정보</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">이름:</span>
            <span class="info-value">${appData.bride.name || '-'}</span>
          </div>
          ${appData.bride.birthDate ? `
          <div class="info-item">
            <span class="info-label">생년월일:</span>
            <span class="info-value">${appData.bride.birthDate}</span>
          </div>
          ` : ''}
          ${appData.bride.nationality ? `
          <div class="info-item">
            <span class="info-label">국적:</span>
            <span class="info-value">${appData.bride.nationality}</span>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
    ` : `
      ${appData.parent ? `
      <div style="margin-bottom: 15px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">부모 정보</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">이름:</span>
            <span class="info-value">${appData.parent.name || '-'}</span>
          </div>
          ${appData.parent.birthDate ? `
          <div class="info-item">
            <span class="info-label">생년월일:</span>
            <span class="info-value">${appData.parent.birthDate}</span>
          </div>
          ` : ''}
          ${appData.parent.gender ? `
          <div class="info-item">
            <span class="info-label">성별:</span>
            <span class="info-value">${appData.parent.gender === 'male' ? '남' : '여'}</span>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      ${appData.child ? `
      <div style="margin-bottom: 15px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">아이 정보</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">이름:</span>
            <span class="info-value">${appData.child.name || '-'}</span>
          </div>
          ${appData.child.birthDate ? `
          <div class="info-item">
            <span class="info-label">생년월일:</span>
            <span class="info-value">${appData.child.birthDate}</span>
          </div>
          ` : ''}
          ${appData.child.gender ? `
          <div class="info-item">
            <span class="info-label">성별:</span>
            <span class="info-value">${appData.child.gender === 'male' ? '남' : '여'}</span>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
    `}
    
    ${appData.representative ? `
    <div style="margin-bottom: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">대표 정보</div>
      <div class="info-grid">
        ${appData.representative.address ? `
        <div class="info-item" style="grid-column: 1 / -1;">
          <span class="info-label">주소:</span>
          <span class="info-value">${appData.representative.address}</span>
        </div>
        ` : ''}
        ${appData.representative.phone ? `
        <div class="info-item">
          <span class="info-label">전화번호:</span>
          <span class="info-value">${appData.representative.phone}</span>
        </div>
        ` : ''}
        ${appData.representative.email ? `
        <div class="info-item">
          <span class="info-label">이메일:</span>
          <span class="info-value">${appData.representative.email}</span>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}
    
    ${appData.applicationReason ? `
    <div style="margin-top: 15px;">
      <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">신청 동기</div>
      <div class="text-content">${appData.applicationReason}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}
</body>
</html>
    `;

    // Puppeteer 설정 (Netlify 환경 최적화)
    const isNetlify = !!process.env.NETLIFY;
    const browser = await puppeteer.launch({
      args: isNetlify 
        ? [
            ...chromium.args,
            '--hide-scrollbars',
            '--disable-web-security',
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ]
        : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: isNetlify 
        ? await chromium.executablePath()
        : undefined,
      headless: true,
    });

    try {
      const page = await browser.newPage();
      
      // HTML 콘텐츠 설정 및 폰트 로딩 대기
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 추가 대기 시간 (폰트 로딩 보장)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // PDF 생성
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
        printBackground: true,
        preferCSSPageSize: false,
      });

      await browser.close();

      // Supabase Storage에 업로드
      const bucketName = 'application-pdfs';
      const filePath = `${dateStr}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true, // 기존 파일 덮어쓰기
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to upload PDF to storage',
            details: uploadError.message 
          }),
        };
      }

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          pdfUrl: urlData.publicUrl,
          fileName: fileName,
          filePath: filePath,
        }),
      };
    } catch (pdfError) {
      await browser.close();
      console.error('PDF generation error:', pdfError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'PDF generation failed',
          details: pdfError instanceof Error ? pdfError.message : String(pdfError)
        }),
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
    };
  }
};
