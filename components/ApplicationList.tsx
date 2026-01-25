'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Application } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

// 한글 문자열 정규화 함수 (helpers.ts와 동일한 로직)
function normalizeString(str: any): string {
  if (typeof str !== 'string') return String(str ?? '');
  try {
    return decodeURIComponent(encodeURIComponent(str));
  } catch {
    return str;
  }
}

interface ApplicationListProps {
  userName: string;
  birthDate: string;
  loginType?: 'normal' | 'visiting';
  businessNumber?: string;
}

export default function ApplicationList({ userName, birthDate, loginType = 'normal', businessNumber = '' }: ApplicationListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const supabase = createClient();
        let query = supabase.from('applications').select('*');

        if (loginType === 'visiting') {
          // 찾아가는 돌잔치: application_data.facility.representative와 businessNumber로 조회
          // 휴지통에 있는 데이터는 제외 (deleted_at이 null인 것만)
          const { data, error } = await query
            .eq('type', 'doljanchi')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

          if (error) throw error;

          console.log('=== 찾아가는 돌잔치 조회 디버깅 ===');
          console.log('입력값 - 대표자:', userName);
          console.log('입력값 - 사업자번호:', businessNumber);
          console.log('조회된 전체 돌잔치 신청서 수:', data?.length || 0);

          // 각 신청서의 application_data 구조 확인
          const applicationsData = (data || []) as Application[];
          applicationsData.forEach((app, index) => {
            console.log(`--- 신청서 ${index + 1} (ID: ${app.id}) ---`);
            console.log('application_data:', JSON.stringify(app.application_data, null, 2));
            const appData = app.application_data as any;
            console.log('facility 존재:', !!appData?.facility);
            console.log('facility 내용:', appData?.facility);
            console.log('targets 존재:', !!appData?.targets);
            console.log('target 존재:', !!appData?.target);
            console.log('parent 존재:', !!appData?.parent);
          });

          // 찾아가는 돌잔치인지 확인하는 함수
          const isVisitingDoljanchi = (appData: any): boolean => {
            // facility가 있어야 함
            if (!appData.facility) {
              console.log('필터링 실패: facility 없음');
              return false;
            }
            // targets 또는 target이 있어야 함 (찾아가는 돌잔치의 특징)
            if (!appData.targets && !appData.target) {
              console.log('필터링 실패: targets/target 없음');
              return false;
            }
            // parent.name이 비어있거나 없어야 함 (일반 돌잔치는 parent.name에 실제 값이 있음)
            if (appData.parent?.name && appData.parent.name.trim() !== '') {
              console.log('필터링 실패: parent.name에 값 존재 (일반 돌잔치)');
              return false;
            }
            console.log('찾아가는 돌잔치로 인식됨');
            return true;
          };

          // 먼저 찾아가는 돌잔치만 필터링
          const visitingDoljanchiApps = (data || []).filter((app) => {
            if (!app.application_data) {
              console.log('필터링 실패: application_data 없음');
              return false;
            }
            const appData = app.application_data as any;
            return isVisitingDoljanchi(appData);
          });

          console.log('찾아가는 돌잔치 신청서 수:', visitingDoljanchiApps.length);

          // application_data에서 facility.representative와 businessNumber가 일치하는 것만 필터링
          const filteredData = visitingDoljanchiApps.filter((app) => {
            const appData = app.application_data as any;
            
            // 대표자 이름과 사업자 번호 매칭
            // 저장 시 normalizeString을 사용하므로 조회 시에도 동일하게 정규화
            const storedRepresentative = normalizeString(appData.facility?.representative || '').trim();
            const storedBusinessNumber = (appData.facility?.businessNumber || '').replace(/\D/g, '');
            const inputRepresentative = normalizeString(userName).trim();
            const inputBusinessNumber = businessNumber.replace(/\D/g, '');

            // 디버깅 로그
            console.log('--- 신청서 ID:', app.id, '---');
            console.log('저장된 대표자:', storedRepresentative, '(원본:', appData.facility?.representative, ')');
            console.log('입력된 대표자:', inputRepresentative, '(원본:', userName, ')');
            console.log('대표자 매칭:', storedRepresentative === inputRepresentative);
            console.log('저장된 사업자번호:', storedBusinessNumber, '(원본:', appData.facility?.businessNumber, ')');
            console.log('입력된 사업자번호:', inputBusinessNumber, '(원본:', businessNumber, ')');
            console.log('사업자번호 매칭:', storedBusinessNumber === inputBusinessNumber);
            console.log('최종 매칭 결과:', storedRepresentative === inputRepresentative && storedBusinessNumber === inputBusinessNumber);

            return storedRepresentative === inputRepresentative && 
                   storedBusinessNumber === inputBusinessNumber;
          });

          console.log('최종 필터링된 신청서 수:', filteredData.length);
          console.log('================================');

          setApplications(filteredData);
        } else {
          // 일반 로그인: user_name과 birth_date로 조회
          // 휴지통에 있는 데이터는 제외 (deleted_at이 null인 것만)
          const { data, error } = await query
            .eq('user_name', userName)
            .eq('birth_date', birthDate)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setApplications(data || []);
        }
      } catch (err) {
        setError('신청내역을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (loginType === 'visiting') {
      if (userName && businessNumber) {
        fetchApplications();
      }
    } else {
      if (userName && birthDate) {
        fetchApplications();
      }
    }
  }, [userName, birthDate, loginType, businessNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <p className="text-lg text-gray-600">신청 내역이 없습니다.</p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 inline-block rounded-full bg-gray-600 px-6 py-3 text-white transition-all hover:bg-gray-700"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Link
          key={app.id}
          href={`/my-applications/${app.id}/edit`}
          className="block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-md transition-all hover:border-blue-300 hover:shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    app.type === 'wedding'
                      ? 'bg-navy-100 text-navy-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {app.type === 'wedding' ? '전통혼례' : '돌잔치'}
                </span>
                {app.created_at && (
                  <span className="text-sm text-gray-500">
                    {format(new Date(app.created_at), 'yyyy년 M월 d일', { locale: ko })}
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold text-gray-800">
                {(() => {
                  // 찾아가는 돌잔치인 경우 기관 대표자 이름 표시
                  if (loginType === 'visiting' && app.application_data) {
                    const appData = app.application_data as any;
                    if (appData.facility?.representative) {
                      return appData.facility.representative;
                    }
                  }
                  // 일반 신청의 경우 기존 user_name 표시
                  return app.user_name;
                })()}
              </p>
              <div className="mt-1 space-y-1">
                {app.schedule_1 && (
                  <p className="text-sm text-gray-600">
                    1순위: {format(new Date((app.schedule_1 as any).date), 'M월 d일', { locale: ko })}{' '}
                    {(app.schedule_1 as any).time}
                  </p>
                )}
                {app.schedule_2 && (
                  <p className="text-sm text-gray-600">
                    2순위: {format(new Date((app.schedule_2 as any).date), 'M월 d일', { locale: ko })}{' '}
                    {(app.schedule_2 as any).time}
                  </p>
                )}
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

