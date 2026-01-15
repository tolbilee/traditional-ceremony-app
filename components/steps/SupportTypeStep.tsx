'use client';

import { ApplicationFormData, SupportType, CeremonyType } from '@/types';
import { SUPPORT_TYPE_LABELS, DOLJANCHI_SUPPORT_TYPE_LABELS } from '@/lib/utils/constants';

interface SupportTypeStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// 전통혼례 지원 유형
const WEDDING_SUPPORT_TYPES: SupportType[] = [
  'basic_livelihood',
  'multicultural',
  'disabled',
  'north_korean_defector',
  'national_merit',
];

// 돌잔치 지원 유형
const DOLJANCHI_SUPPORT_TYPES = [
  'doljanchi',
  'doljanchi_welfare_facility',
  'doljanchi_orphanage',
] as const;

export type DoljanchiSupportType = typeof DOLJANCHI_SUPPORT_TYPES[number];

export default function SupportTypeStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: SupportTypeStepProps) {
  const ceremonyType: CeremonyType = formData.type || 'wedding';
  
  const handleSelect = (type: SupportType | DoljanchiSupportType) => {
    updateFormData({ supportType: type as any });
  };

  const handleNext = () => {
    if (formData.supportType) {
      onNext();
    } else {
      alert('지원 유형을 선택해주세요.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">지원 유형 선택</h2>
      <p className="text-gray-600">해당하는 지원 유형을 선택해주세요.</p>

      <div className="space-y-4">
        {ceremonyType === 'wedding' ? (
          // 전통혼례 지원 유형
          WEDDING_SUPPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                formData.supportType === type
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-xl font-semibold text-gray-800">
                {SUPPORT_TYPE_LABELS[type]}
              </div>
            </button>
          ))
        ) : (
          // 돌잔치 지원 유형
          DOLJANCHI_SUPPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                formData.supportType === type
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-xl font-semibold text-gray-800">
                {DOLJANCHI_SUPPORT_TYPE_LABELS[type]}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex justify-between pt-6 pb-32">
        <button
          onClick={onPrev}
          className="rounded-full bg-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-300 active:scale-95"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}

