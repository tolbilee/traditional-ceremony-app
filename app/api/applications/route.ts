import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApplicationFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData: ApplicationFormData = await request.json();

    // 파일 업로드 처리
    const fileUrls: string[] = [];
    if (formData.files && formData.files.length > 0) {
      for (const file of formData.files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${formData.type}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'documents')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          fileUrls.push(urlData.publicUrl);
        }
      }
    }

    // 생년월일 6자리 추출 (YYYYMMDD -> YYMMDD 또는 이미 6자리면 그대로 사용)
    const birthDate6 = formData.birthDate.length === 8 
      ? formData.birthDate.slice(2, 8) 
      : formData.birthDate;

    // 데이터베이스에 저장
    const insertData = {
      type: formData.type,
      user_name: formData.userName,
      birth_date: birthDate6,
      schedule_1: formData.schedule1,
      schedule_2: formData.schedule2 || null,
      support_type: formData.supportType!,
      application_data: formData.applicationData,
      consent_status: formData.consentStatus,
      file_urls: fileUrls,
    };
    
    const { data, error } = await (supabase as any)
      .from('applications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
