import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/admin/auth';

// 콘텐츠 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('page_type'); // 'wedding' 또는 'doljanchi'
    const section = searchParams.get('section'); // 'overview', 'ceremony', 'venue', 'meal' 등

    let query = supabase
      .from('content')
      .select('*')
      .order('display_order', { ascending: true });

    if (pageType) {
      query = query.eq('page_type', pageType);
    }
    if (section) {
      query = query.eq('section', section);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content:', error);
      return NextResponse.json(
        { error: '콘텐츠를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 데이터를 객체 형태로 변환 (field_key를 키로 사용)
    const contentMap: Record<string, any> = {};
    if (data) {
      data.forEach((item) => {
        const key = `${item.section}.${item.field_key}`;
        try {
          // JSON 타입인 경우 파싱
          if (item.field_type === 'json') {
            contentMap[key] = JSON.parse(item.field_value || '{}');
          } else {
            contentMap[key] = item.field_value;
          }
        } catch {
          contentMap[key] = item.field_value;
        }
      });
    }

    return NextResponse.json(
      { data: contentMap, raw: data },
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
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 콘텐츠 업데이트 (POST/PUT) - 관리자만 가능
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { page_type, section, field_key, field_value, field_type = 'text', display_order = 0 } = body;

    if (!page_type || !section || !field_key) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // upsert (있으면 업데이트, 없으면 생성)
    const { data, error } = await supabase
      .from('content')
      .upsert(
        {
          page_type,
          section,
          field_key,
          field_value: typeof field_value === 'object' ? JSON.stringify(field_value) : field_value,
          field_type,
          display_order,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'page_type,section,field_key',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting content:', error);
      return NextResponse.json(
        { error: '콘텐츠 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
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
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 배치 업데이트 (여러 필드를 한 번에 업데이트)
export async function PUT(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const isAuthenticated = await getAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const body = await request.json();
    const { page_type, section, updates } = body; // updates는 { field_key: field_value } 형태의 객체

    if (!page_type || !section || !updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 여러 필드를 한 번에 업데이트
    const updatePromises = Object.entries(updates).map(async ([field_key, field_value]) => {
      const { error } = await supabase
        .from('content')
        .upsert(
          {
            page_type,
            section,
            field_key,
            field_value: typeof field_value === 'object' ? JSON.stringify(field_value) : String(field_value),
            field_type: 'text',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'page_type,section,field_key',
          }
        );

      if (error) {
        console.error(`Error updating ${field_key}:`, error);
        throw error;
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      { success: true, message: '콘텐츠가 성공적으로 업데이트되었습니다.' },
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
      { error: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
