import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!GOOGLE_APPS_SCRIPT_URL) {
      return NextResponse.json(
        { error: 'Google Apps Script URL not configured' },
        { status: 500 }
      );
    }

    const { id: applicationId } = await params;

    // Supabase에서 신청서 데이터 가져오기
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Google Apps Script로 데이터 전송
    console.log('Sending request to Google Apps Script URL:', GOOGLE_APPS_SCRIPT_URL);
    
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: application.id,
        type: application.type,
        userName: application.user_name,
        birthDate: application.birth_date,
        schedule1: application.schedule_1,
        schedule2: application.schedule_2,
        supportType: application.support_type,
        applicationData: application.application_data,
        consentStatus: application.consent_status,
        fileUrls: application.file_urls, // 모든 파일 URL 전달 (Google Apps Script에서 처리)
      }),
    });
    console.log('Google Apps Script response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate PDF via Google Docs' },
        { status: 500 }
      );
    }

    // 응답 본문 확인
    const responseText = await response.text();
    console.log('Google Apps Script response body:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText);
      return NextResponse.json(
        { error: 'Invalid response from Google Apps Script' },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'PDF generation failed' },
        { status: 500 }
      );
    }

    // PDF URL 반환
    return NextResponse.json({
      pdfUrl: result.pdfUrl,
      fileName: `신청서_${application.user_name}_${new Date().toISOString().split('T')[0]}.pdf`,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
