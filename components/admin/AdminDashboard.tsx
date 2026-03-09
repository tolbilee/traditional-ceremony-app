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
  application_data?: any;
  schedule_1: any;
  created_at: string;
  consent_status: boolean;
  deleted_at?: string | null;
}

interface AdminDashboardProps {
  applications: Application[];
  error?: any;
}

export default function AdminDashboard({ applications, error }: AdminDashboardProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'all' | 'wedding' | 'doljanchi'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localApplications, setLocalApplications] = useState<Application[]>(applications);
  const [showTrash, setShowTrash] = useState(false);
  const [trashApplications, setTrashApplications] = useState<Application[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);

  const handleLogout = async () => {
    await fetch('/admin/api/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const loadTrash = async () => {
    setLoadingTrash(true);
    try {
      const response = await fetch('/api/applications/trash');
      if (response.ok) {
        const data = await response.json();
        setTrashApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Failed to load trash:', error);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 신청서를 휴지통으로 이동하시겠습니까? 나중에 복원할 수 있습니다.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // 응답 본문이 있는지 확인
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to delete application';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            // JSON 파싱 실패 시 텍스트로 읽기 시도
            try {
              const text = await response.text();
              errorMessage = text || errorMessage;
            } catch (textError) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
          }
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      // 응답 본문이 있는지 확인 후 파싱
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          await response.json();
        } catch (jsonError) {
          // JSON이 아니어도 성공 응답이면 무시
          console.log('Response is not JSON, but status is OK');
        }
      }

      // 로컬 상태에서 삭제된 항목 제거
      setLocalApplications(localApplications.filter(app => app.id !== id));
      
      // 휴지통이 열려있으면 새로고침
      if (showTrash) {
        loadTrash();
      }
      
      // 페이지 새로고침하여 서버 상태 동기화
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredApplications = localApplications.filter((app) => {
    const matchesType = filterType === 'all' || app.type === filterType;
    
    if (searchTerm === '') {
      return matchesType;
    }
    
    // 찾아가는 돌잔치인지 확인
    const appData = app.application_data;
    const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
    
    if (isVisitingDoljanchi) {
      // 찾아가는 돌잔치: 대표자 이름과 사업자번호로 검색
      const representative = appData?.facility?.representative || app.user_name || '';
      const businessNumber = appData?.facility?.businessNumber || '';
      const matchesSearch = 
        representative.includes(searchTerm) ||
        businessNumber.includes(searchTerm);
      return matchesType && matchesSearch;
    } else {
      // 일반 신청: 이름과 생년월일로 검색
      const matchesSearch =
        app.user_name.includes(searchTerm) ||
        app.birth_date.includes(searchTerm);
      return matchesType && matchesSearch;
    }
  });

  const getTypeLabel = (type: string) => {
    return type === 'wedding' ? '전통혼례' : '돌잔치';
  };

  const getSupportTypeLabel = (type: string, applicationData?: any) => {
    const labels: Record<string, string> = {
      basic_livelihood: '기초생활수급자',
      near_poor: '차상위계층',
      multicultural: '다문화가정',
      disabled: '장애인',
      north_korean_defector: '새터민',
      national_merit: '유공자',
      doljanchi: '한부모가족',
      doljanchi_welfare_facility: '찾아가는 돌잔치(복지시설)',
      doljanchi_orphanage: '찾아가는 돌잔치(영아원)',
    };
    
    // 복수 선택된 지원유형 확인 (application_data.supportType에 쉼표로 구분되어 저장됨)
    if (applicationData && applicationData.supportType && typeof applicationData.supportType === 'string') {
      const supportTypes = applicationData.supportType.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      if (supportTypes.length > 0) {
        // 복수 선택된 경우 모두 표시
        return supportTypes.map((t: string) => labels[t] || t).join(', ');
      }
    }
    
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/content"
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                콘텐츠 관리
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 필터 및 검색 */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 에러 표시 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">데이터 조회 오류</h3>
            <p className="text-sm text-red-700">
              {error.message || '신청 데이터를 불러오는 중 오류가 발생했습니다.'}
            </p>
            <details className="mt-2">
              <summary className="text-sm text-red-600 cursor-pointer">상세 정보 보기</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
            <p className="mt-2 text-sm text-red-600">
              💡 <strong>해결 방법:</strong> Supabase RLS 정책을 확인하거나, Supabase 연결 설정을 확인해주세요.
            </p>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowTrash(false);
                setFilterType('all');
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                !showTrash && filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => {
                setShowTrash(false);
                setFilterType('wedding');
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                !showTrash && filterType === 'wedding'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              전통혼례
            </button>
            <button
              onClick={() => {
                setShowTrash(false);
                setFilterType('doljanchi');
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                !showTrash && filterType === 'doljanchi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              돌잔치
            </button>
            <button
              onClick={() => {
                setShowTrash(true);
                loadTrash();
              }}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                showTrash
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              휴지통
            </button>
          </div>

          <input
            type="text"
            placeholder="이름/생년월일 또는 대표자/사업자번호로 검색..."
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
              {localApplications.length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">전통혼례</div>
            <div className="text-2xl font-bold text-blue-600">
              {localApplications.filter((a) => a.type === 'wedding').length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="text-sm text-gray-600">돌잔치</div>
            <div className="text-2xl font-bold text-yellow-600">
              {localApplications.filter((a) => a.type === 'doljanchi').length}
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
              {showTrash ? (
                loadingTrash ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : trashApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      휴지통이 비어있습니다.
                    </td>
                  </tr>
                ) : (
                  trashApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 opacity-75">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {format(new Date(app.created_at), 'yyyy-MM-dd HH:mm', {
                          locale: ko,
                        })}
                        <br />
                        <span className="text-xs text-gray-500">
                          삭제: {app.deleted_at ? format(new Date(app.deleted_at), 'yyyy-MM-dd HH:mm', { locale: ko }) : '-'}
                        </span>
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
                        {(() => {
                          const appData = app.application_data;
                          const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
                          
                          if (isVisitingDoljanchi) {
                            return (
                              <>
                                {appData?.facility?.representative || app.user_name}
                                <br />
                                <span className="text-gray-500">{appData?.facility?.businessNumber || '-'}</span>
                              </>
                            );
                          } else {
                            return (
                              <>
                                {app.user_name}
                                <br />
                                <span className="text-gray-500">{app.birth_date}</span>
                              </>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getSupportTypeLabel(app.support_type, app.application_data)}
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
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={async () => {
                              if (!confirm('이 신청서를 복원하시겠습니까?')) {
                                return;
                              }
                              try {
                                const response = await fetch(`/api/applications/${app.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'restore' }),
                                });
                                if (response.ok) {
                                  setTrashApplications(trashApplications.filter(a => a.id !== app.id));
                                  router.refresh();
                                } else {
                                  const errorData = await response.json();
                                  alert('복원 중 오류가 발생했습니다: ' + (errorData.error || 'Unknown error'));
                                }
                              } catch (error) {
                                console.error('Restore error:', error);
                                alert('복원 중 오류가 발생했습니다.');
                              }
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="복원"
                          >
                            복원
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('정말 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                                return;
                              }
                              try {
                                const response = await fetch(`/api/applications/${app.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'permanent-delete' }),
                                });
                                if (response.ok) {
                                  setTrashApplications(trashApplications.filter(a => a.id !== app.id));
                                } else {
                                  const errorData = await response.json();
                                  alert('영구 삭제 중 오류가 발생했습니다: ' + (errorData.error || 'Unknown error'));
                                }
                              } catch (error) {
                                console.error('Permanent delete error:', error);
                                alert('영구 삭제 중 오류가 발생했습니다.');
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="영구 삭제"
                          >
                            영구 삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : filteredApplications.length === 0 ? (
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
                      {(() => {
                        // 찾아가는 돌잔치인지 확인
                        const appData = app.application_data;
                        const isVisitingDoljanchi = appData?.facility || appData?.targets || appData?.target;
                        
                        if (isVisitingDoljanchi) {
                          // 찾아가는 돌잔치: 대표자 이름과 사업자번호 표시
                          return (
                            <>
                              {appData?.facility?.representative || app.user_name}
                              <br />
                              <span className="text-gray-500">{appData?.facility?.businessNumber || '-'}</span>
                            </>
                          );
                        } else {
                          // 일반 신청: 이름과 생년월일 표시
                          return (
                            <>
                              {app.user_name}
                              <br />
                              <span className="text-gray-500">{app.birth_date}</span>
                            </>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getSupportTypeLabel(app.support_type, app.application_data)}
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
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세보기
                        </Link>
                        <button
                          onClick={() => handleDelete(app.id)}
                          disabled={deletingId === app.id}
                          className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                            deletingId === app.id ? 'opacity-50' : ''
                          }`}
                          title="삭제"
                        >
                          {deletingId === app.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
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