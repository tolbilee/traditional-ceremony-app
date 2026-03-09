'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ContentItem {
  id?: string;
  page_type: string;
  section: string;
  field_key: string;
  field_value: string;
  field_type: string;
  display_order: number;
}

interface ContentData {
  [key: string]: any;
}

export default function ContentEditor() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<'wedding' | 'doljanchi'>('wedding');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [content, setContent] = useState<ContentData>({});
  const [rawContent, setRawContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});

  const weddingSections = [
    { id: 'overview', label: '모집개요' },
    { id: 'ceremony', label: '전통혼례 안내' },
    { id: 'venue', label: '장소안내' },
    { id: 'meal', label: '식사안내' },
  ];

  const doljanchiSections = [
    { id: 'overview', label: '모집개요' },
    { id: 'program', label: '돌잔치 안내' },
    { id: 'venue', label: '장소안내' },
    { id: 'meal', label: '식사·답례품' },
  ];

  useEffect(() => {
    loadContent();
  }, [activePage, activeSection]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/content?page_type=${activePage}&section=${activeSection}`
      );
      if (response.ok) {
        const data = await response.json();
        setContent(data.data || {});
        setRawContent(data.raw || []);
        
        // 편집 필드 초기화
        const fields: Record<string, string> = {};
        if (data.raw) {
          data.raw.forEach((item: ContentItem) => {
            const key = `${item.section}.${item.field_key}`;
            fields[key] = item.field_value || '';
          });
        }
        setEditingFields(fields);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      alert('콘텐츠를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditingFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      
      // 변경된 필드만 업데이트
      Object.keys(editingFields).forEach((key) => {
        const [section, fieldKey] = key.split('.');
        if (section === activeSection) {
          updates[fieldKey] = editingFields[key];
        }
      });

      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_type: activePage,
          section: activeSection,
          updates,
        }),
      });

      if (response.ok) {
        alert('콘텐츠가 성공적으로 저장되었습니다.');
        loadContent();
      } else {
        const errorData = await response.json();
        alert('저장 중 오류가 발생했습니다: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/admin/api/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const renderEditableFields = () => {
    if (loading) {
      return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
    }

    // 섹션별 필드 정의
    const fieldDefinitions: Record<string, Record<string, { label: string; type: 'text' | 'textarea' | 'html' }>> = {
      wedding: {
        overview: {
          'recruitment_count': { label: '모집 인원', type: 'text' },
          'schedule_time': { label: '일시', type: 'text' },
          'target_audience': { label: '모집 대상', type: 'textarea' },
          'support_content_1': { label: '지원 내용 1', type: 'textarea' },
          'support_content_2': { label: '지원 내용 2', type: 'textarea' },
          'support_content_3': { label: '지원 내용 3', type: 'textarea' },
          'application_period': { label: '신청 접수 기간', type: 'text' },
          'review_period': { label: '선정 심사 기간', type: 'text' },
          'announcement_date': { label: '발표일', type: 'text' },
        },
        ceremony: {
          'intro_text': { label: '소개 문구', type: 'textarea' },
          'schedule_01_title': { label: '진행 순서 1 제목', type: 'text' },
          'schedule_01_time': { label: '진행 순서 1 시간', type: 'text' },
          'schedule_01_desc': { label: '진행 순서 1 설명', type: 'textarea' },
          'schedule_02_title': { label: '진행 순서 2 제목', type: 'text' },
          'schedule_02_time': { label: '진행 순서 2 시간', type: 'text' },
          'schedule_02_desc': { label: '진행 순서 2 설명', type: 'textarea' },
          'schedule_03_title': { label: '진행 순서 3 제목', type: 'text' },
          'schedule_03_time': { label: '진행 순서 3 시간', type: 'text' },
          'schedule_03_desc': { label: '진행 순서 3 설명', type: 'textarea' },
          'schedule_04_title': { label: '진행 순서 4 제목', type: 'text' },
          'schedule_04_time': { label: '진행 순서 4 시간', type: 'text' },
          'schedule_04_desc': { label: '진행 순서 4 설명', type: 'textarea' },
        },
        venue: {
          'venue_name': { label: '장소명', type: 'text' },
          'venue_address': { label: '주소', type: 'text' },
          'venue_description': { label: '장소 설명', type: 'textarea' },
        },
        meal: {
          'meal_title': { label: '식사 제목', type: 'text' },
          'meal_subtitle': { label: '식사 부제목', type: 'text' },
          'meal_description': { label: '식사 설명', type: 'textarea' },
          'meal_guest_count': { label: '하객 수', type: 'text' },
        },
      },
      doljanchi: {
        overview: {
          'type1_time': { label: 'TYPE 1 일시', type: 'text' },
          'type1_venue': { label: 'TYPE 1 장소', type: 'text' },
          'type1_target': { label: 'TYPE 1 모집대상', type: 'textarea' },
          'type1_count': { label: 'TYPE 1 모집인원', type: 'text' },
          'type1_age_range': { label: 'TYPE 1 연령 범위', type: 'text' },
          'type2_time': { label: 'TYPE 2 일시', type: 'text' },
          'type2_venue': { label: 'TYPE 2 장소', type: 'text' },
          'type2_target': { label: 'TYPE 2 모집대상', type: 'textarea' },
          'type2_institution': { label: 'TYPE 2 선정기관', type: 'text' },
          'type2_age_range': { label: 'TYPE 2 연령 범위', type: 'text' },
        },
        program: {
          'schedule_01_title': { label: '진행 순서 1 제목', type: 'text' },
          'schedule_01_time': { label: '진행 순서 1 시간', type: 'text' },
          'schedule_01_desc': { label: '진행 순서 1 설명', type: 'textarea' },
          'schedule_02_title': { label: '진행 순서 2 제목', type: 'text' },
          'schedule_02_time': { label: '진행 순서 2 시간', type: 'text' },
          'schedule_02_desc': { label: '진행 순서 2 설명', type: 'textarea' },
          'schedule_03_title': { label: '진행 순서 3 제목', type: 'text' },
          'schedule_03_time': { label: '진행 순서 3 시간', type: 'text' },
          'schedule_03_desc': { label: '진행 순서 3 설명', type: 'textarea' },
          'schedule_04_title': { label: '진행 순서 4 제목', type: 'text' },
          'schedule_04_time': { label: '진행 순서 4 시간', type: 'text' },
          'schedule_04_desc': { label: '진행 순서 4 설명', type: 'textarea' },
        },
        venue: {
          'venue_name': { label: '장소명', type: 'text' },
          'venue_address': { label: '주소', type: 'text' },
          'venue_description': { label: '장소 설명', type: 'textarea' },
          'visiting_venue_title': { label: '찾아가는 돌잔치 제목', type: 'text' },
          'visiting_venue_description': { label: '찾아가는 돌잔치 설명', type: 'textarea' },
        },
        meal: {
          'meal_title': { label: '식사 제목', type: 'text' },
          'meal_subtitle': { label: '식사 부제목', type: 'text' },
          'meal_description': { label: '식사 설명', type: 'textarea' },
          'gift_cake_title': { label: '떡케이크 제목', type: 'text' },
          'gift_cake_description': { label: '떡케이크 설명', type: 'textarea' },
          'gift_tteok_title': { label: '답례떡 제목', type: 'text' },
          'gift_tteok_description': { label: '답례떡 설명', type: 'textarea' },
        },
      },
    };

    const fields = fieldDefinitions[activePage]?.[activeSection] || {};
    const sectionKey = `${activeSection}.`;

    return (
      <div className="space-y-6">
        {Object.entries(fields).map(([fieldKey, fieldDef]) => {
          const fullKey = `${sectionKey}${fieldKey}`;
          const value = editingFields[fullKey] || '';

          return (
            <div key={fieldKey} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {fieldDef.label}
              </label>
              {fieldDef.type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(fullKey, e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleFieldChange(fullKey, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const sections = activePage === 'wedding' ? weddingSections : doljanchiSections;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← 대시보드로 돌아가기
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* 페이지 선택 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setActivePage('wedding');
              setActiveSection('overview');
            }}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              activePage === 'wedding'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            전통혼례
          </button>
          <button
            onClick={() => {
              setActivePage('doljanchi');
              setActiveSection('overview');
            }}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              activePage === 'doljanchi'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            돌잔치
          </button>
        </div>

        {/* 섹션 선택 */}
        <div className="mb-6 flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                activeSection === section.id
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* 편집 영역 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {sections.find((s) => s.id === activeSection)?.label} 편집
            </h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                saving ? 'opacity-50' : ''
              }`}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>

          {renderEditableFields()}
        </div>
      </div>
    </div>
  );
}
