import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();
    
    // Storage 버킷 이름 확인
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'documents';
    console.log('Using bucket:', bucketName);

    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${type}/${fileName}`;

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

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      fileName: fileName
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
