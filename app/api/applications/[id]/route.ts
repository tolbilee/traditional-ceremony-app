import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApplicationFormData } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const formData: ApplicationFormData = await request.json();
    const { id: applicationId } = await params;

    // 파일 업로드 처리 (새로 추가된 파일만)
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

    // 기존 파일 URL 가져오기
    const { data: existingApp } = await supabase
      .from('applications')
      .select('file_urls')
      .eq('id', applicationId)
      .single();

    const allFileUrls = [
      ...((existingApp as { file_urls?: string[] } | null)?.file_urls || []),
      ...fileUrls,
    ];

    // 생년월일 6자리 추출
    const birthDate6 = formData.birthDate.length === 8 
      ? formData.birthDate.slice(2, 8) 
      : formData.birthDate;

    // 데이터베이스 업데이트
    const updateData = {
      type: formData.type,
      user_name: formData.userName,
      birth_date: birthDate6,
      schedule_1: formData.schedule1,
      schedule_2: formData.schedule2 || null,
      support_type: formData.supportType!,
      application_data: formData.applicationData,
      consent_status: formData.consentStatus,
      file_urls: allFileUrls,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await (supabase as any)
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '수정 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
