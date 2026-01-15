import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';

// Puppeteer는 동적 import로 로드 (서버 사이드 전용)
let puppeteer: any;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.error('Puppeteer import error:', error);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !application) {
      console.error('Application fetch error:', error);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const app = application as any;
    console.log('Generating PDF for application:', app.id);

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

    // HTML 템플릿 생성 (한글 폰트 지원 및 예쁜 레이아웃)
    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>신청서</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header h1 {
      font-size: 24pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 16pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .info-item {
      display: flex;
      align-items: flex-start;
    }
    
    .info-label {
      font-weight: 600;
      color: #4b5563;
      min-width: 100px;
      margin-right: 10px;
    }
    
    .info-value {
      color: #111827;
      flex: 1;
    }
    
    .table-container {
      margin-top: 20px;
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #fff;
    }
    
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    td {
      padding: 12px;
      border: 1px solid #e5e7eb;
      color: #111827;
    }
    
    tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .text-content {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
      margin-top: 10px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>2026 한국의 집 전통혼례 및 돌잔치 신청서</h1>
  </div>

  <div class="section">
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
      <div class="info-item full-width">
        <span class="info-label">신청일시:</span>
        <span class="info-value">${createdDate}</span>
      </div>
    </div>
  </div>

  <div class="section">
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

  <div class="section">
    <div class="section-title">일정 정보</div>
    <div class="table-container">
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
  </div>

  ${appData && Object.keys(appData).length > 0 ? `
  <div class="section">
    <div class="section-title">신청서 상세 내용</div>
    ${app.type === 'wedding' ? `
      ${appData.groom ? `
      <div class="info-grid">
        <div class="info-item full-width">
          <span class="info-label">신랑 정보:</span>
        </div>
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
      ` : ''}
      ${appData.bride ? `
      <div class="info-grid" style="margin-top: 15px;">
        <div class="info-item full-width">
          <span class="info-label">신부 정보:</span>
        </div>
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
      ` : ''}
    ` : `
      ${appData.parent ? `
      <div class="info-grid">
        <div class="info-item full-width">
          <span class="info-label">부모 정보:</span>
        </div>
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
      ` : ''}
      ${appData.child ? `
      <div class="info-grid" style="margin-top: 15px;">
        <div class="info-item full-width">
          <span class="info-label">아이 정보:</span>
        </div>
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
      ` : ''}
    `}
    
    ${appData.representative ? `
    <div class="info-grid" style="margin-top: 20px;">
      <div class="info-item full-width">
        <span class="info-label">대표 정보:</span>
      </div>
      ${appData.representative.address ? `
      <div class="info-item full-width">
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
    ` : ''}
    
    ${appData.applicationReason ? `
    <div style="margin-top: 20px;">
      <div class="info-label" style="margin-bottom: 10px;">신청 동기:</div>
      <div class="text-content">${appData.applicationReason}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}
</body>
</html>
    `;

    // Puppeteer를 사용하여 HTML을 PDF로 변환 시도
    // 서버리스 환경에서는 Puppeteer가 작동하지 않을 수 있으므로 HTML을 반환
    if (!puppeteer) {
      console.log('Puppeteer is not available, returning HTML for browser print');
      // Puppeteer가 없으면 HTML을 반환 (브라우저에서 인쇄 가능)
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
        ],
      });

      try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { 
          waitUntil: 'networkidle0',
          timeout: 30000,
        });
        
        const pdfBuffer = await page.pdf({
          format: 'A4',
          margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm',
          },
          printBackground: true,
        });

        await browser.close();

        const fileName = `신청서_${app.user_name || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          },
        });
      } catch (pdfError) {
        await browser.close();
        console.error('Puppeteer PDF generation failed:', pdfError);
        // Puppeteer 실패 시 HTML 반환
        return new NextResponse(htmlContent, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }
    } catch (launchError) {
      console.error('Puppeteer launch failed:', launchError);
      // Puppeteer 실행 실패 시 HTML 반환
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'PDF 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
