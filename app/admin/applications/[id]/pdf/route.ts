import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';
import jsPDF from 'jspdf';

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
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const app = application as any;

    // PDF 생성
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // 제목
    doc.setFontSize(18);
    doc.text(
      '2026 한국의 집 전통혼례 및 돌잔치 신청서',
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 15;

    // 기본 정보
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('기본 정보', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`신청 ID: ${app.id}`, margin, yPos);
    yPos += 6;
    doc.text(
      `신청 유형: ${app.type === 'wedding' ? '전통혼례' : '돌잔치'}`,
      margin,
      yPos
    );
    yPos += 6;
    doc.text(
      `신청일시: ${new Date(app.created_at).toLocaleString('ko-KR')}`,
      margin,
      yPos
    );
    yPos += 10;

    // 신청자 정보
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('신청자 정보', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`이름: ${app.user_name}`, margin, yPos);
    yPos += 6;
    doc.text(`생년월일: ${app.birth_date}`, margin, yPos);
    yPos += 6;
    doc.text(`지원 유형: ${app.support_type}`, margin, yPos);
    yPos += 6;
    doc.text(
      `동의 여부: ${app.consent_status ? '동의함' : '미동의'}`,
      margin,
      yPos
    );
    yPos += 10;

    // 일정 정보
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('일정 정보', margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (app.schedule_1) {
      const schedule1 = typeof app.schedule_1 === 'object' ? app.schedule_1 : {};
      const date1 = schedule1.date || '';
      const time1 = schedule1.time || '';
      doc.text(
        `1순위: ${date1} ${time1}`,
        margin,
        yPos
      );
      yPos += 6;
    }
    if (app.schedule_2) {
      const schedule2 = typeof app.schedule_2 === 'object' ? app.schedule_2 : {};
      const date2 = schedule2.date || '';
      const time2 = schedule2.time || '';
      doc.text(
        `2순위: ${date2} ${time2}`,
        margin,
        yPos
      );
      yPos += 6;
    }
    yPos += 10;

    // 신청서 상세 내용
    const appData = app.application_data || {};
    if (Object.keys(appData).length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('신청서 상세 내용', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      if (app.type === 'wedding') {
        if (appData.groom) {
          doc.text(`신랑: ${appData.groom.name || '-'}`, margin, yPos);
          yPos += 6;
        }
        if (appData.bride) {
          doc.text(`신부: ${appData.bride.name || '-'}`, margin, yPos);
          yPos += 6;
        }
      } else {
        if (appData.parent) {
          doc.text(
            `부모: ${appData.parent.fatherName || '-'} / ${appData.parent.motherName || '-'}`,
            margin,
            yPos
          );
          yPos += 6;
        }
        if (appData.child) {
          doc.text(`아이: ${appData.child.name || '-'}`, margin, yPos);
          yPos += 6;
        }
      }

      if (appData.representative?.phone) {
        doc.text(`대표 연락처: ${appData.representative.phone}`, margin, yPos);
        yPos += 6;
      }

      if (appData.applicationReason) {
        const reasonLines = doc.splitTextToSize(
          `신청 동기: ${appData.applicationReason}`,
          pageWidth - 2 * margin
        );
        doc.text(reasonLines, margin, yPos);
        yPos += reasonLines.length * 6;
      }
    }

    // PDF를 ArrayBuffer로 변환 (서버 사이드에서는 blob 대신 arraybuffer 사용)
    const pdfArrayBuffer = doc.output('arraybuffer');

    // Response 반환
    return new NextResponse(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="신청서_${app.user_name}_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
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

