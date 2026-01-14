import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';
import PDFDocument from 'pdfkit';

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

    // PDF 생성
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // PDF를 ReadableStream으로 변환
    const stream = new ReadableStream({
      start(controller) {
        // PDF 데이터를 수집
        doc.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        doc.on('end', () => {
          controller.close();
        });

        doc.on('error', (err: Error) => {
          console.error('PDF stream error:', err);
          controller.error(err);
        });

        // PDF 내용 작성 시작
        try {
          // 제목
          doc.fontSize(18).font('Helvetica-Bold');
          doc.text('2026 한국의 집 전통혼례 및 돌잔치 신청서', {
            align: 'center',
          });
          doc.moveDown(1);

          // 기본 정보
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('기본 정보');
          doc.moveDown(0.5);

          doc.fontSize(10).font('Helvetica');
          doc.text(`신청 ID: ${app.id || '-'}`);
          doc.text(`신청 유형: ${app.type === 'wedding' ? '전통혼례' : '돌잔치'}`);
          if (app.created_at) {
            const createdDate = new Date(app.created_at);
            doc.text(`신청일시: ${createdDate.toLocaleString('ko-KR')}`);
          }
          doc.moveDown(1);

          // 신청자 정보
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('신청자 정보');
          doc.moveDown(0.5);

          doc.fontSize(10).font('Helvetica');
          doc.text(`이름: ${app.user_name || '-'}`);
          doc.text(`생년월일: ${app.birth_date || '-'}`);
          
          // 지원 유형 한글 변환
          const supportTypeLabels: Record<string, string> = {
            basic_livelihood: '기초수급자',
            multicultural: '다문화가정',
            disabled: '장애인',
            north_korean_defector: '북한이탈주민',
            national_merit: '국가유공자',
          };
          doc.text(`지원 유형: ${supportTypeLabels[app.support_type] || app.support_type || '-'}`);
          doc.text(`동의 여부: ${app.consent_status ? '동의함' : '미동의'}`);
          doc.moveDown(1);

          // 일정 정보
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('일정 정보');
          doc.moveDown(0.5);

          doc.fontSize(10).font('Helvetica');
          if (app.schedule_1) {
            const schedule1 = typeof app.schedule_1 === 'object' ? app.schedule_1 : {};
            const date1 = schedule1.date || '';
            const time1 = schedule1.time || '';
            doc.text(`1순위: ${date1} ${time1}`);
          }
          if (app.schedule_2) {
            const schedule2 = typeof app.schedule_2 === 'object' ? app.schedule_2 : {};
            const date2 = schedule2.date || '';
            const time2 = schedule2.time || '';
            doc.text(`2순위: ${date2} ${time2}`);
          }
          doc.moveDown(1);

          // 신청서 상세 내용
          const appData = app.application_data || {};
          if (appData && Object.keys(appData).length > 0) {
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('신청서 상세 내용');
            doc.moveDown(0.5);

            doc.fontSize(10).font('Helvetica');

            if (app.type === 'wedding') {
              if (appData.groom) {
                doc.text(`신랑: ${appData.groom.name || '-'}`);
                if (appData.groom.birthDate) {
                  doc.text(`  생년월일: ${appData.groom.birthDate}`);
                }
                if (appData.groom.nationality) {
                  doc.text(`  국적: ${appData.groom.nationality}`);
                }
              }
              if (appData.bride) {
                doc.text(`신부: ${appData.bride.name || '-'}`);
                if (appData.bride.birthDate) {
                  doc.text(`  생년월일: ${appData.bride.birthDate}`);
                }
                if (appData.bride.nationality) {
                  doc.text(`  국적: ${appData.bride.nationality}`);
                }
              }
            } else {
              if (appData.parent) {
                doc.text(`부모: ${appData.parent.name || '-'}`);
                if (appData.parent.birthDate) {
                  doc.text(`  생년월일: ${appData.parent.birthDate}`);
                }
                if (appData.parent.gender) {
                  doc.text(`  성별: ${appData.parent.gender === 'male' ? '남' : '여'}`);
                }
              }
              if (appData.child) {
                doc.text(`아이: ${appData.child.name || '-'}`);
                if (appData.child.birthDate) {
                  doc.text(`  생년월일: ${appData.child.birthDate}`);
                }
                if (appData.child.gender) {
                  doc.text(`  성별: ${appData.child.gender === 'male' ? '남' : '여'}`);
                }
              }
            }

            if (appData.representative) {
              doc.moveDown(0.5);
              doc.text('대표 정보:');
              if (appData.representative.address) {
                doc.text(`  주소: ${appData.representative.address}`);
              }
              if (appData.representative.phone) {
                doc.text(`  전화번호: ${appData.representative.phone}`);
              }
              if (appData.representative.email) {
                doc.text(`  이메일: ${appData.representative.email}`);
              }
            }

            if (appData.applicationReason) {
              doc.moveDown(0.5);
              doc.text('신청 동기:');
              // 긴 텍스트는 자동 줄바꿈
              doc.text(appData.applicationReason, {
                width: 500,
                align: 'left',
              });
            }
          }

          // PDF 완료
          doc.end();
        } catch (writeError) {
          console.error('PDF write error:', writeError);
          doc.end();
          controller.error(writeError);
        }
      },
    });

    // Response 반환
    const fileName = `신청서_${app.user_name || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return new NextResponse(stream, {
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
