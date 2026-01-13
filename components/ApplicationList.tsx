'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Application } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

interface ApplicationListProps {
  userName: string;
  birthDate: string;
}

export default function ApplicationList({ userName, birthDate }: ApplicationListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_name', userName)
          .eq('birth_date', birthDate)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        setError('신청내역을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userName && birthDate) {
      fetchApplications();
    }
  }, [userName, birthDate]);

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
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700"
        >
          신청하러 가기
        </Link>
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
              <p className="text-lg font-semibold text-gray-800">{app.user_name}</p>
              {app.schedule_1 && (
                <p className="mt-1 text-sm text-gray-600">
                  1순위: {format(new Date((app.schedule_1 as any).date), 'M월 d일', { locale: ko })}{' '}
                  {(app.schedule_1 as any).time}
                </p>
              )}
            </div>
            <span className="text-gray-400">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
