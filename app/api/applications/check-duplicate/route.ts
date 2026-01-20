import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeString } from '../helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { type, name, birthDate, representativeName, businessNumber } = body;

    if (!type) {
      return NextResponse.json(
        { error: '신청 유형이 필요합니다.' },
        { status: 400 }
      );
    }

    // 생년월일 6자리 변환
    const birthDate6 = birthDate && birthDate.length === 8 
      ? birthDate.slice(2, 8) 
      : birthDate;

    let query = supabase.from('applications').select('id, type, user_name, birth_date, application_data, created_at');

    if (type === 'wedding') {
      // 전통혼례: 신랑 또는 신부 중 한명이라도 이름+생년월일이 일치하는 경우
      if (!name || !birthDate6) {
        return NextResponse.json(
          { error: '이름과 생년월일이 필요합니다.' },
          { status: 400 }
        );
      }

      const normalizedName = normalizeString(name);
      
      // 전통혼례 타입의 모든 신청서를 가져온 후 JavaScript에서 필터링
      const { data, error } = await query
        .eq('type', 'wedding');

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      // 결과에서 신랑 또는 신부의 이름과 생년월일이 일치하는지 확인
      const matches = (data || []).filter((item: any) => {
        const appData = item.application_data;
        if (!appData) return false;
        
        const groomMatch = appData.groom?.name === normalizedName && 
                          appData.groom?.birthDate === birthDate6;
        const brideMatch = appData.bride?.name === normalizedName && 
                          appData.bride?.birthDate === birthDate6;
        
        return groomMatch || brideMatch;
      });

      return NextResponse.json({
        exists: matches.length > 0,
        applications: matches,
      });

    } else if (type === 'doljanchi') {
      // 돌잔치: 신청자의 이름+생년월일이 일치하는 경우
      if (!name || !birthDate6) {
        return NextResponse.json(
          { error: '이름과 생년월일이 필요합니다.' },
          { status: 400 }
        );
      }

      const normalizedName = normalizeString(name);
      
      // user_name과 birth_date로 직접 조회
      const { data, error } = await query
        .eq('type', 'doljanchi')
        .eq('user_name', normalizedName)
        .eq('birth_date', birthDate6);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        exists: (data || []).length > 0,
        applications: data || [],
      });

    } else if (type === 'visiting_doljanchi') {
      // 찾아가는 돌잔치: 대표자 이름+사업자번호가 일치하는 경우
      if (!representativeName || !businessNumber) {
        return NextResponse.json(
          { error: '대표자 이름과 사업자번호가 필요합니다.' },
          { status: 400 }
        );
      }

      const normalizedName = normalizeString(representativeName);
      const normalizedBusinessNumber = businessNumber.replace(/\D/g, ''); // 숫자만 추출
      
      // 찾아가는 돌잔치 타입의 모든 신청서를 가져온 후 JavaScript에서 필터링
      const { data, error } = await query
        .eq('type', 'doljanchi');

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      // 결과에서 대표자 이름과 사업자번호가 일치하는지 확인
      const matches = (data || []).filter((item: any) => {
        const appData = item.application_data;
        if (!appData || !appData.facility) return false;
        
        const facilityRep = appData.facility.representative;
        const facilityBusinessNum = appData.facility.businessNumber?.replace(/\D/g, '');
        
        return facilityRep === normalizedName && facilityBusinessNum === normalizedBusinessNumber;
      });

      return NextResponse.json({
        exists: matches.length > 0,
        applications: matches,
      });

    } else {
      return NextResponse.json(
        { error: '지원하지 않는 신청 유형입니다.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '중복 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
