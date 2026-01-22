import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApplicationFormData } from '@/types';
import { normalizeString, normalizeApplicationData } from '../helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const formData: ApplicationFormData = await request.json();
    const { id: applicationId } = await params;

    // formData.fileUrls에 이미 업로드된 URL이 포함되어 있음
    // (DocumentUploadStep에서 파일 선택 시 즉시 업로드됨)
    const newFileUrls: string[] = formData.fileUrls || [];
    
    console.log('=== UPDATE APPLICATION ===');
    console.log('Application ID:', applicationId);
    console.log('New file URLs from formData:', newFileUrls);
    console.log('New file URLs count:', newFileUrls.length);

    // 기존 파일 URL 및 메타데이터 가져오기 (삭제된 파일을 제외하기 위해)
    const { data: existingApp } = await supabase
      .from('applications')
      .select('file_urls, file_metadata')
      .eq('id', applicationId)
      .single();

    const existingFileUrls = (existingApp as { file_urls?: string[] } | null)?.file_urls || [];
    console.log('Existing file URLs:', existingFileUrls);
    console.log('Existing file URLs count:', existingFileUrls.length);

    // formData.fileUrls에 포함된 URL만 사용 (사용자가 삭제한 파일은 제외됨)
    // 중복 제거를 위해 Set 사용
    const allFileUrls = Array.from(new Set(newFileUrls));
    
    console.log('Final file URLs to save:', allFileUrls);
    console.log('Final file URLs count:', allFileUrls.length);

    // 생년월일 6자리 추출
    const birthDate6 = formData.birthDate.length === 8 
      ? formData.birthDate.slice(2, 8) 
      : formData.birthDate;

    // 한글 데이터 정규화는 helpers.ts에서 import한 함수 사용

    // 기존 file_metadata 가져오기
    const existingFileMetadata = (existingApp as { file_metadata?: Record<string, string> } | null)?.file_metadata || {};
    
    // 새로운 file_metadata 병합 (formData에서 온 것과 기존 것)
    const newFileMetadata = { ...existingFileMetadata, ...(formData.fileMetadata || {}) };
    
    // 데이터베이스 업데이트
    const updateData = {
      type: formData.type,
      user_name: normalizeString(formData.userName),
      birth_date: birthDate6,
      schedule_1: formData.schedule1,
      schedule_2: formData.schedule2 || null,
      support_type: formData.supportType!,
      application_data: normalizeApplicationData(formData.applicationData),
      consent_status: formData.consentStatus,
      file_urls: allFileUrls,
      file_metadata: newFileMetadata,
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
      return NextResponse.json(
        { error: error.message },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // 한글 데이터 정규화는 helpers.ts에서 import한 함수 사용

    const normalizedData = {
      ...data,
      user_name: normalizeString(data.user_name || ''),
      application_data: normalizeApplicationData(data.application_data || {}),
    };

    return NextResponse.json(
      { success: true, data: normalizedData },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '수정 처리 중 오류가 발생했습니다.' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

