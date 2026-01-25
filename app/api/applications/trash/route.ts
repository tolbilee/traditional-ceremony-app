import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // deleted_at이 null이 아닌 항목만 조회 (삭제된 항목)
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

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

    return NextResponse.json(
      { applications: applications || [] },
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
      { error: '조회 중 오류가 발생했습니다.' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
