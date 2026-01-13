'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  type: 'wedding' | 'doljanchi';
  user_name: string;
  birth_date: string;
  support_type: string;
  schedule_1: any;
  created_at: string;
  consent_status: boolean;
}

interface AdminDashboardProps {
  applications: Application[];
}

export default function AdminDashboard({ applications }: AdminDashboardProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'all' | 'wedding' | 'doljanchi'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    await fetch('/admin/api/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const filteredApplications = applications.filter((app) => {
    const matchesType = filterType === 'all' || app.type === filterType;
    const matchesSearch =
      searchTerm === '' ||
      app.user_name.includes(searchTerm) ||
      app.birth_date.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  const getTypeLabel = (type: string) => {
    return type === 'wedding' ? '전통혼례' : '돌잔치';
  };

  const getSupportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      basic_livelihood: '기초수급자',
      multicultural: '다문화',
      disabled: '장애인',
      north_korean_defector: '북한이탈주민',
      national_merit: '국가유공자',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 필터 및 검색 */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('wedding')}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                filterType === 'wedding'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              전통혼례
            </button>
            <button
              onClick={() => setFilterType('doljanchi')}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                filterType === 'doljanchi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              돌잔치
            </button>
          </div>

          <input
            type="text"
            placeholder="이름 또는 생년월일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 통계 */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">전체 신청</div>
            <div className="text-2xl font-bold text-gray-900">
              {applications.length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">전통혼례</div>
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter((a) => a.type === 'wedding').length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">돌잔치</div>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter((a) => a.type === 'doljanchi').length}
            </div>
          </div>
        </div>

        {/* 신청자 목록 */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  신청일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  신청자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  지원유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  1순위 일정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  동의여부
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    신청 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {format(new Date(app.created_at), 'yyyy-MM-dd HH:mm', {
                        locale: ko,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          app.type === 'wedding'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {getTypeLabel(app.type)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {app.user_name}
                      <br />
                      <span className="text-gray-500">{app.birth_date}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {getSupportTypeLabel(app.support_type)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {app.schedule_1?.date
                        ? `${app.schedule_1.date} ${app.schedule_1.time}`
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {app.consent_status ? (
                        <span className="text-green-600">✓ 동의</span>
                      ) : (
                        <span className="text-red-600">✗ 미동의</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
