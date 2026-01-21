'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CeremonyType, SupportType } from '@/types';
import ApplicationForm from '@/components/ApplicationForm';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const type = (params.type as CeremonyType) || 'wedding';
  const [showDoljanchiTypePicker, setShowDoljanchiTypePicker] = useState(type === 'doljanchi');
  const [selectedDoljanchiType, setSelectedDoljanchiType] = useState<SupportType | null>(null);

  const handleDoljanchiTypeSelect = (doljanchiType: 'doljanchi' | 'visiting') => {
    if (doljanchiType === 'doljanchi') {
      setSelectedDoljanchiType('doljanchi');
    } else {
      // 찾아가는 돌잔치는 초기 선택에서 구체적인 타입을 결정하지 않음
      // 지원유형 선택 단계에서 [한부모가족 복지시설] 또는 [영아원]을 선택하도록 함
      setSelectedDoljanchiType('doljanchi_welfare_facility' as SupportType); // 임시 값, 실제로는 지원유형 선택 단계에서 결정
    }
    setShowDoljanchiTypePicker(false);
  };

  // 돌잔치가 아니면 바로 ApplicationForm 표시
  if (type !== 'doljanchi') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ApplicationForm type={type} />
      </div>
    );
  }

  // 돌잔치 타입이 선택되지 않았으면 선택 팝업 표시
  if (showDoljanchiTypePicker || !selectedDoljanchiType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">돌잔치 유형을 선택해주세요</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDoljanchiTypeSelect('doljanchi')}
                className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700"
              >
                돌잔치
              </button>
              <button
                onClick={() => handleDoljanchiTypeSelect('visiting')}
                className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700"
              >
                찾아가는 돌잔치
              </button>
              <button
                onClick={() => router.push('/test')}
                className="w-full rounded-lg bg-gray-300 px-6 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 돌잔치 타입이 선택되었으면 ApplicationForm 표시
  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationForm 
        type={type} 
        initialSupportType={selectedDoljanchiType === 'doljanchi' ? 'doljanchi' : undefined}
        doljanchiSubType={selectedDoljanchiType === 'doljanchi' ? 'doljanchi' : 'visiting'}
      />
    </div>
  );
}

