'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { CeremonyType, SupportType } from '@/types';
import ApplicationForm from '@/components/ApplicationForm';

export default function ApplyPage() {
  const params = useParams();
  const type = (params.type as CeremonyType) || 'wedding';
  const [showDoljanchiTypePicker, setShowDoljanchiTypePicker] = useState(type === 'doljanchi');
  const [selectedDoljanchiType, setSelectedDoljanchiType] = useState<SupportType | null>(null);

  const handleDoljanchiTypeSelect = (doljanchiType: 'doljanchi' | 'doljanchi_welfare_facility' | 'doljanchi_orphanage') => {
    setSelectedDoljanchiType(doljanchiType);
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
                onClick={() => handleDoljanchiTypeSelect('doljanchi_welfare_facility')}
                className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700"
              >
                찾아가는 돌잔치
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 돌잔치 타입이 선택되었으면 ApplicationForm 표시 (supportType을 미리 설정)
  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationForm 
        type={type} 
        initialSupportType={selectedDoljanchiType}
        doljanchiSubType={selectedDoljanchiType === 'doljanchi' ? 'doljanchi' : selectedDoljanchiType === 'doljanchi_welfare_facility' ? 'welfare_facility' : 'orphanage'}
      />
    </div>
  );
}

