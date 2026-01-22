import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('=== File Upload API Called ===');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!type) {
      console.error('No type provided');
      return NextResponse.json({ error: '신청 유형이 없습니다.' }, { status: 400 });
    }

    console.log('File info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      ceremonyType: type,
    });

    // 서비스 역할 키를 사용하여 RLS 정책 우회
    let supabase;
    try {
      supabase = createAdminClient();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to create admin client:', errorMessage);
      
      if (errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        return NextResponse.json(
          { 
            error: '파일 업로드 설정이 완료되지 않았습니다.',
            details: 'SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.',
            hint: 'Netlify 대시보드 → Site settings → Environment variables에서 SUPABASE_SERVICE_ROLE_KEY를 추가해주세요. Supabase 대시보드 → Settings → API에서 service_role 키를 복사하세요.'
          },
          { status: 500 }
        );
      }
      throw error;
    }
    
    // Storage 버킷 이름 확인
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'documents';
    console.log('Using bucket:', bucketName);

    // 원본 파일명 처리: 사용자 지정 파일명이 있으면 사용, 없으면 원본 파일명 사용
    const customFileName = formData.get('fileName') as string | null;
    const originalFileName = customFileName && customFileName.trim() 
      ? customFileName  // 자동 생성된 파일명 사용 ([신청자이름]_[증빙서류명]_[날짜시간].확장자)
      : file.name;     // 사용자가 선택한 원본 파일명 사용
    
    // 파일 확장자 추출
    const fileExt = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // UUID 기반 파일명 생성 (Supabase Storage 호환을 위해 영문/숫자만 사용)
    // 형식: timestamp_uuid.확장자
    const timestamp = Date.now();
    const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 12); // 짧은 UUID
    const storageFileName = `${timestamp}_${uuid}.${fileExt}`;
    const filePath = `${type}/${storageFileName}`;

    console.log('File path:', filePath);

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Buffer size:', buffer.length);

    // 파일 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type || `image/${fileExt}`,
        upsert: false, // 기존 파일 덮어쓰기 방지
      });

    if (uploadError) {
      console.error('=== Upload Error ===');
      // StorageError 타입에 statusCode가 없을 수 있으므로 any로 캐스팅
      const anyError = uploadError as any;
      const errorCode = anyError.statusCode ?? anyError.status ?? anyError.code;
      console.error('Error code:', errorCode);
      console.error('Error message:', uploadError.message);
      console.error('Error name:', anyError.name);
      
      // RLS 오류인지 확인
      if (uploadError.message?.includes('new row violates row-level security') || 
          uploadError.message?.includes('RLS') ||
          errorCode === '403' || errorCode === 403) {
        return NextResponse.json(
          { 
            error: '파일 업로드 권한이 없습니다. Supabase Storage RLS 정책을 확인해주세요.',
            details: uploadError.message,
            hint: 'Storage 버킷의 RLS 정책에서 INSERT 권한을 허용해야 합니다.'
          },
          { status: 403 }
        );
      }

      // 버킷이 없는 경우
      if (uploadError.message?.includes('Bucket not found') || errorCode === '404' || errorCode === 404) {
        return NextResponse.json(
          { 
            error: `Storage 버킷 '${bucketName}'을 찾을 수 없습니다.`,
            details: uploadError.message,
            hint: 'Supabase 대시보드에서 Storage 버킷을 생성해주세요.'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          error: uploadError.message || '파일 업로드 중 오류가 발생했습니다.',
          details: uploadError.message,
          code: errorCode
        },
        { status: 500 }
      );
    }

    console.log('Upload successful:', uploadData);

    // Public URL 가져오기
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('URL data:', urlData);

    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL');
      return NextResponse.json(
        { error: '파일 URL을 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    console.log('=== Upload Success ===');
    console.log('Public URL:', urlData.publicUrl);
    console.log('Storage file name:', storageFileName);
    console.log('Original file name:', originalFileName);
    console.log('Custom fileName from formData:', customFileName);
    console.log('File name from file object:', file.name);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      storageFileName: storageFileName, // Storage에 저장된 파일명
      originalFileName: originalFileName // 원본 파일명 (한글 포함 가능)
    }, { status: 200 });
  } catch (error) {
    console.error('=== Upload API Error ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: '파일 업로드 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
