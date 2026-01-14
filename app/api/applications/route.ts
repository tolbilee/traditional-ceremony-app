import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApplicationFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    console.log('=== API POST /api/applications called ===');
    const supabase = await createClient();
    
    // 요청 본문 파싱
    let formData: ApplicationFormData;
    try {
      const body = await request.json();
      formData = body;
      console.log('Parsed request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: '요청 데이터를 파싱할 수 없습니다.' },
        { status: 400 }
      );
    }

    console.log('Received application data:', {
      type: formData.type,
      userName: formData.userName,
      birthDate: formData.birthDate,
      supportType: formData.supportType,
      hasFiles: !!formData.files,
      hasFileUrls: !!formData.fileUrls,
      fileUrlsCount: formData.fileUrls?.length || 0,
      consentStatus: formData.consentStatus,
      hasApplicationData: !!formData.applicationData,
    });

    // 파일은 별도로 처리하지 않음 (이미 file_urls에 URL이 있을 수 있음)
    const fileUrls: string[] = formData.fileUrls || [];
    console.log('File URLs:', fileUrls);

    // 필수 필드 검증
    if (!formData.type) {
      console.error('Missing type');
      return NextResponse.json({ error: '신청 유형이 필요합니다.' }, { status: 400 });
    }
    if (!formData.userName) {
      console.error('Missing userName');
      return NextResponse.json({ error: '이름이 필요합니다.' }, { status: 400 });
    }
    if (!formData.birthDate) {
      console.error('Missing birthDate');
      return NextResponse.json({ error: '생년월일이 필요합니다.' }, { status: 400 });
    }
    if (!formData.supportType) {
      console.error('Missing supportType');
      return NextResponse.json({ error: '지원 유형이 필요합니다.' }, { status: 400 });
    }

    // 생년월일 6자리 추출 (YYYYMMDD -> YYMMDD 또는 이미 6자리면 그대로 사용)
    const birthDate6 = formData.birthDate.length === 8 
      ? formData.birthDate.slice(2, 8) 
      : formData.birthDate;
    console.log('Birth date converted:', formData.birthDate, '->', birthDate6);

    // 데이터베이스에 저장
    const insertData = {
      type: formData.type,
      user_name: formData.userName,
      birth_date: birthDate6,
      schedule_1: formData.schedule1 || null,
      schedule_2: formData.schedule2 || null,
      support_type: formData.supportType || null,
      application_data: formData.applicationData || {},
      consent_status: formData.consentStatus || false,
      file_urls: fileUrls,
    };

    console.log('Inserting data:', JSON.stringify(insertData, null, 2));
    
    // Supabase 연결 확인
    const { data: testData, error: testError } = await supabase
      .from('applications')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      console.error('This might be an RLS policy issue. Check Supabase RLS settings.');
    } else {
      console.log('Supabase connection OK');
    }
    
    const { data, error } = await (supabase as any)
      .from('applications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('=== DATABASE INSERT ERROR ===');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Insert data that failed:', JSON.stringify(insertData, null, 2));
      
      // RLS 관련 오류인지 확인
      if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        return NextResponse.json({ 
          error: '데이터베이스 권한 오류입니다. Supabase RLS 정책을 확인해주세요.',
          details: error.message,
          hint: 'Supabase 대시보드에서 applications 테이블의 RLS를 비활성화하거나 INSERT 정책을 추가해주세요.'
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: error.message || '데이터베이스 저장 중 오류가 발생했습니다.',
        details: error 
      }, { status: 500 });
    }

    console.log('=== SUCCESS ===');
    console.log('Successfully inserted application:', data?.id);
    console.log('Inserted data:', JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '신청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('user_name');
    const birthDate = searchParams.get('birth_date');

    if (!userName || !birthDate) {
      return NextResponse.json(
        { error: 'user_name과 birth_date가 필요합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_name', userName)
      .eq('birth_date', birthDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

