'use client';

import { useState } from 'react';
import { ApplicationFormData, SupportType, CeremonyType } from '@/types';
import { SUPPORT_TYPE_LABELS } from '@/lib/utils/constants';

interface SupportTypeStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  doljanchiSubType?: 'doljanchi' | 'welfare_facility' | 'orphanage';
}

// 전통혼례 지원 유형 (복수 선택 가능)
const WEDDING_SUPPORT_TYPES: SupportType[] = [
  'basic_livelihood', // 기초생활수급자
  'near_poor', // 차상위계층
  'disabled', // 장애인
  'multicultural', // 다문화가정
  'national_merit', // 유공자
  'north_korean_defector', // 새터민
];

// 돌잔치 지원 유형 (복수 선택 가능)
const DOLJANCHI_SUPPORT_TYPES: SupportType[] = [
  'basic_livelihood', // 기초생활수급자
  'disabled', // 장애인
  'national_merit', // 유공자
  'north_korean_defector', // 새터민
];

// 찾아가는 돌잔치 지원 유형 (복수 선택 가능)
const VISITING_DOLJANCHI_SUPPORT_TYPES: SupportType[] = [
  'basic_livelihood', // 기초생활수급자
  'disabled', // 장애인
  'national_merit', // 유공자
  'north_korean_defector', // 새터민
];

export default function SupportTypeStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  doljanchiSubType,
}: SupportTypeStepProps) {
  const ceremonyType: CeremonyType = formData.type || 'wedding';
  
  // 복수 선택을 위한 상태 (전통혼례와 돌잔치 모두 복수 선택 가능)
  const [selectedTypes, setSelectedTypes] = useState<SupportType[]>(() => {
    // 기존 supportType이 있으면 배열로 변환
    if (formData.supportType) {
      if (ceremonyType === 'doljanchi') {
        // 돌잔치: doljanchi, doljanchi_welfare_facility, doljanchi_orphanage는 메인 타입이므로 제외
        const mainType = formData.supportType;
        if (mainType === 'doljanchi' || mainType === 'doljanchi_welfare_facility' || mainType === 'doljanchi_orphanage') {
          return [];
        }
        return [formData.supportType];
      } else {
        // 전통혼례: 단일 값이었던 것을 배열로 변환
        return [formData.supportType];
      }
    }
    return [];
  });

  const handleSelect = (type: SupportType) => {
    // 전통혼례와 돌잔치 모두 복수 선택 가능
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleNext = () => {
    if (ceremonyType === 'doljanchi') {
      // 돌잔치 필수 조건 검증
      if (doljanchiSubType === 'doljanchi') {
        // 돌잔치: 한부모가족은 필수조건이지만, supportType에는 포함되지 않음
        // doljanchi 자체가 한부모가족을 의미하므로 selectedTypes만 확인
        if (selectedTypes.length === 0) {
          alert('지원 유형을 최소 1개 이상 선택해주세요.');
          return;
        }
        // 메인 타입은 이미 doljanchi로 설정되어 있음
        // 선택된 타입들을 저장하기 위해 첫 번째 타입을 메인으로 사용하거나, 별도로 저장
        updateFormData({ supportType: 'doljanchi' });
      } else if (doljanchiSubType === 'welfare_facility' || doljanchiSubType === 'orphanage') {
        // 찾아가는 돌잔치: 복지시설 또는 영아원 중 하나는 필수
        // doljanchi_welfare_facility 또는 doljanchi_orphanage가 이미 선택되어 있어야 함
        const mainType = doljanchiSubType === 'welfare_facility' ? 'doljanchi_welfare_facility' : 'doljanchi_orphanage';
        if (selectedTypes.length === 0) {
          alert('복지시설과 영아원 중 하나는 지원 필수조건입니다.');
          return;
        }
        updateFormData({ supportType: mainType });
      }
    } else {
      // 전통혼례: 복수 선택 가능, 최소 1개 이상 선택 필요
      if (selectedTypes.length === 0) {
        alert('지원 유형을 최소 1개 이상 선택해주세요.');
        return;
      }
      // 첫 번째 선택된 타입을 메인 supportType으로 저장
      // 복수 선택된 타입들은 applicationData.supportType에 쉼표로 구분하여 저장
      const mainType = selectedTypes[0];
      const allTypesString = selectedTypes.join(',');
      
      // applicationData 업데이트 (복수 선택 정보 저장)
      const currentApplicationData = formData.applicationData || {};
      if ('supportType' in currentApplicationData) {
        updateFormData({ 
          supportType: mainType,
          applicationData: {
            ...currentApplicationData,
            supportType: allTypesString, // 복수 선택된 모든 타입 저장
          }
        });
      } else {
        updateFormData({ supportType: mainType });
      }
    }
    onNext();
  };

  const isSelected = (type: SupportType) => {
    // 전통혼례와 돌잔치 모두 selectedTypes 배열로 확인
    return selectedTypes.includes(type);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">지원 유형 선택</h2>
      <p className="text-gray-600">해당하는 지원 유형을 선택해주세요.</p>

      <div className="space-y-4">
        {ceremonyType === 'wedding' ? (
          // 전통혼례 지원 유형 (복수 선택)
          <>
            {WEDDING_SUPPORT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                  isSelected(type)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-gray-800">
                    {SUPPORT_TYPE_LABELS[type]}
                  </div>
                  {isSelected(type) && (
                    <span className="text-2xl">✓</span>
                  )}
                </div>
              </button>
            ))}
            <p className="text-sm text-gray-500">
              * 복수 선택 가능합니다. 해당하는 모든 항목을 선택해주세요.
            </p>
          </>
        ) : (
          // 돌잔치 지원 유형 (복수 선택)
          <>
            {doljanchiSubType === 'doljanchi' ? (
              // 돌잔치: 한부모가족은 이미 선택된 상태 (doljanchi 자체가 한부모가족)
              <>
                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
                  <div className="text-lg font-semibold text-gray-800">
                    한부모가족 (필수)
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    돌잔치 신청의 필수조건입니다.
                  </div>
                </div>
                {DOLJANCHI_SUPPORT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelect(type)}
                    className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                      isSelected(type)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-semibold text-gray-800">
                        {SUPPORT_TYPE_LABELS[type]}
                      </div>
                      {isSelected(type) && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            ) : (
              // 찾아가는 돌잔치: 복지시설 또는 영아원 중 하나는 필수
              <>
                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {doljanchiSubType === 'welfare_facility' ? '한부모가족 복지시설' : '영아원'} (필수)
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    찾아가는 돌잔치 신청의 필수조건입니다.
                  </div>
                </div>
                {VISITING_DOLJANCHI_SUPPORT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelect(type)}
                    className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                      isSelected(type)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-semibold text-gray-800">
                        {SUPPORT_TYPE_LABELS[type]}
                      </div>
                      {isSelected(type) && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
            <p className="text-sm text-gray-500">
              * 복수 선택 가능합니다. 해당하는 모든 항목을 선택해주세요.
            </p>
          </>
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

