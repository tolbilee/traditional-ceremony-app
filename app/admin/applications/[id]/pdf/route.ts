import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';

// jsPDF는 동적 import로 로드
let jsPDF: any;
try {
  jsPDF = require('jspdf').jsPDF;
} catch (error) {
  console.error('jsPDF import error:', error);
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

    // jsPDF가 없으면 에러 반환
    if (!jsPDF) {
      console.error('jsPDF is not available');
      return NextResponse.json(
        { 
          error: 'PDF 생성 라이브러리를 로드할 수 없습니다.',
          details: 'jsPDF 라이브러리가 설치되지 않았거나 로드에 실패했습니다.'
        },
        { status: 500 }
      );
    }

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

    // jsPDF로 PDF 생성 (A4 사이즈)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 20; // 시작 Y 위치

    // 제목
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = '2026 한국의 집 전통혼례 및 돌잔치 신청서';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (210 - titleWidth) / 2, yPosition);
    yPosition += 15;

    // 기본 정보
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('기본 정보', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`신청 ID: ${app.id || '-'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`신청 유형: ${app.type === 'wedding' ? '전통혼례' : '돌잔치'}`, 20, yPosition);
    yPosition += 6;
    if (app.created_at) {
      doc.text(`신청일시: ${createdDate}`, 20, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // 신청자 정보
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('신청자 정보', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`이름: ${app.user_name || '-'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`생년월일: ${app.birth_date || '-'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`지원 유형: ${supportTypeLabels[app.support_type] || app.support_type || '-'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`동의 여부: ${app.consent_status ? '동의함' : '미동의'}`, 20, yPosition);
    yPosition += 10;

    // 일정 정보
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('일정 정보', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (schedule1.date) {
      doc.text(`1순위: ${schedule1.date || ''} ${schedule1.time || ''}`, 20, yPosition);
      yPosition += 6;
    }
    if (schedule2.date) {
      doc.text(`2순위: ${schedule2.date || ''} ${schedule2.time || ''}`, 20, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // 신청서 상세 내용
    if (appData && Object.keys(appData).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('신청서 상세 내용', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (app.type === 'wedding') {
        if (appData.groom) {
          doc.text(`신랑: ${appData.groom.name || '-'}`, 20, yPosition);
          yPosition += 6;
          if (appData.groom.birthDate) {
            doc.text(`  생년월일: ${appData.groom.birthDate}`, 20, yPosition);
            yPosition += 6;
          }
          if (appData.groom.nationality) {
            doc.text(`  국적: ${appData.groom.nationality}`, 20, yPosition);
            yPosition += 6;
          }
        }
        if (appData.bride) {
          doc.text(`신부: ${appData.bride.name || '-'}`, 20, yPosition);
          yPosition += 6;
          if (appData.bride.birthDate) {
            doc.text(`  생년월일: ${appData.bride.birthDate}`, 20, yPosition);
            yPosition += 6;
          }
          if (appData.bride.nationality) {
            doc.text(`  국적: ${appData.bride.nationality}`, 20, yPosition);
            yPosition += 6;
          }
        }
      } else {
        if (appData.parent) {
          doc.text(`부모: ${appData.parent.name || '-'}`, 20, yPosition);
          yPosition += 6;
          if (appData.parent.birthDate) {
            doc.text(`  생년월일: ${appData.parent.birthDate}`, 20, yPosition);
            yPosition += 6;
          }
          if (appData.parent.gender) {
            doc.text(`  성별: ${appData.parent.gender === 'male' ? '남' : '여'}`, 20, yPosition);
            yPosition += 6;
          }
        }
        if (appData.child) {
          doc.text(`아이: ${appData.child.name || '-'}`, 20, yPosition);
          yPosition += 6;
          if (appData.child.birthDate) {
            doc.text(`  생년월일: ${appData.child.birthDate}`, 20, yPosition);
            yPosition += 6;
          }
          if (appData.child.gender) {
            doc.text(`  성별: ${appData.child.gender === 'male' ? '남' : '여'}`, 20, yPosition);
            yPosition += 6;
          }
        }
      }

      if (appData.representative) {
        yPosition += 3;
        doc.text('대표 정보:', 20, yPosition);
        yPosition += 6;
        if (appData.representative.address) {
          const addressLines = doc.splitTextToSize(`  주소: ${appData.representative.address}`, 170);
          doc.text(addressLines, 20, yPosition);
          yPosition += addressLines.length * 6;
        }
        if (appData.representative.phone) {
          doc.text(`  전화번호: ${appData.representative.phone}`, 20, yPosition);
          yPosition += 6;
        }
        if (appData.representative.email) {
          doc.text(`  이메일: ${appData.representative.email}`, 20, yPosition);
          yPosition += 6;
        }
      }

      if (appData.applicationReason) {
        yPosition += 3;
        doc.text('신청 동기:', 20, yPosition);
        yPosition += 6;
        // 긴 텍스트는 자동 줄바꿈
        const reasonLines = doc.splitTextToSize(appData.applicationReason, 170);
        doc.text(reasonLines, 20, yPosition);
        yPosition += reasonLines.length * 6;
      }
    }

    // PDF를 Buffer로 변환
    const pdfOutput = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfOutput);

    // Response 반환
    const fileName = `신청서_${app.user_name || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
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
