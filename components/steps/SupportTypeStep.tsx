'use client';

import { useState } from 'react';
import { ApplicationFormData, SupportType, CeremonyType, WeddingApplicationData } from '@/types';
import { SUPPORT_TYPE_LABELS } from '@/lib/utils/constants';

interface SupportTypeStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  doljanchiSubType?: 'doljanchi' | 'welfare_facility' | 'orphanage' | 'visiting';
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
// [한부모가족 복지시설], [영아원]은 필수 선택 중 하나
// [기초생활수급자], [차상위계층], [장애인], [유공자], [새터민]은 추가 선택
const VISITING_DOLJANCHI_SUPPORT_TYPES: SupportType[] = [
  'doljanchi_welfare_facility', // 한부모가족 복지시설 (필수 중 하나)
  'doljanchi_orphanage', // 영아원 (필수 중 하나)
  'basic_livelihood', // 기초생활수급자
  'near_poor', // 차상위계층
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
    // applicationData에서 복수 선택된 지원유형 확인 (편집 모드)
    // 편집 모드인지 확인: applicationData에 실제 데이터가 있는지 확인 (빈 값이 아닌 경우)
    const isEditMode = formData.applicationData && (
      ('parent' in formData.applicationData && formData.applicationData.parent && 
       (formData.applicationData.parent as any)?.name) ||
      ('groom' in formData.applicationData && formData.applicationData.groom && 
       (formData.applicationData.groom as any)?.name) ||
      ('facility' in formData.applicationData && formData.applicationData.facility && 
       (formData.applicationData.facility as any)?.name)
    );
    
    // 편집 모드인 경우에만 기존 선택값 불러오기
    if (isEditMode && formData.applicationData && 'supportType' in formData.applicationData) {
      const supportTypeString = formData.applicationData.supportType as string;
      if (supportTypeString && supportTypeString.includes(',')) {
        // 쉼표로 구분된 복수 선택
        const types = supportTypeString.split(',').map(t => t.trim()) as SupportType[];
        return types;
      } else if (supportTypeString) {
        return [supportTypeString as SupportType];
      }
    }
    
    // 새로운 신청의 경우: 항상 빈 배열로 시작 (신청자가 직접 선택해야 함)
    // formData.supportType이 설정되어 있어도 selectedTypes에는 포함하지 않음
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
        // 돌잔치: 한부모가족은 필수조건
        if (!selectedTypes.includes('doljanchi')) {
          alert('한부모가족은 지원 필수조건입니다.');
          return;
        }
        // 복수 선택된 타입들을 applicationData에 저장 (한부모가족(doljanchi) 포함)
        // doljanchi를 맨 앞에 유지하여 한부모가족도 지원유형에 포함
        const allTypes = selectedTypes.includes('doljanchi') 
          ? selectedTypes 
          : ['doljanchi', ...selectedTypes];
        const allTypesString = allTypes.join(',');
        const currentApplicationData = formData.applicationData;
        if (currentApplicationData && 'parent' in currentApplicationData) {
          updateFormData({ 
            supportType: 'doljanchi',
            applicationData: {
              ...currentApplicationData,
              supportType: allTypesString, // 복수 선택된 모든 타입 저장 (한부모가족 포함)
            } as any
          });
        } else {
          updateFormData({ supportType: 'doljanchi' });
        }
      } else if (doljanchiSubType === 'welfare_facility' || doljanchiSubType === 'orphanage' || doljanchiSubType === 'visiting') {
        // 찾아가는 돌잔치: 복지시설 또는 영아원 중 하나는 필수
        // selectedTypes에 'doljanchi_welfare_facility' 또는 'doljanchi_orphanage'가 포함되어 있는지 확인
        const hasWelfareFacility = selectedTypes.includes('doljanchi_welfare_facility');
        const hasOrphanage = selectedTypes.includes('doljanchi_orphanage');
        
        if (!hasWelfareFacility && !hasOrphanage) {
          alert('복지시설과 영아원 중 하나는 지원 필수조건입니다.');
          return;
        }
        
        // 선택된 타입 중 필수 타입을 메인 타입으로 설정
        const mainType = hasWelfareFacility ? 'doljanchi_welfare_facility' : 'doljanchi_orphanage';
        
        // 복수 선택된 타입들을 applicationData에 저장 (필수 타입 포함)
        const allTypesString = selectedTypes.join(',');
        const currentApplicationData = formData.applicationData;
        if (currentApplicationData && 'parent' in currentApplicationData) {
          updateFormData({ 
            supportType: mainType,
            applicationData: {
              ...currentApplicationData,
              supportType: allTypesString, // 복수 선택된 모든 타입 저장
            } as any
          });
        } else {
          updateFormData({ supportType: mainType });
        }
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
      // 전통혼례인 경우 WeddingApplicationData 타입인지 확인
      const currentApplicationData = formData.applicationData;
      if (currentApplicationData && 'groom' in currentApplicationData) {
        // WeddingApplicationData 타입인 경우에만 업데이트
        const weddingData = currentApplicationData as WeddingApplicationData;
        updateFormData({ 
          supportType: mainType,
          applicationData: {
            ...weddingData,
            supportType: allTypesString, // 복수 선택된 모든 타입 저장
          } as WeddingApplicationData
        });
      } else {
        // applicationData가 없거나 다른 타입인 경우 supportType만 업데이트
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
              // 돌잔치: 한부모가족은 필수이지만 선택 가능
              <>
                <button
                  onClick={() => handleSelect('doljanchi')}
                  className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                    isSelected('doljanchi')
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-green-300 bg-green-50 hover:border-green-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-800">
                        {SUPPORT_TYPE_LABELS['doljanchi']} <span className="ml-2 text-sm text-green-600">(필수)</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        돌잔치 신청의 필수조건입니다.
                      </div>
                    </div>
                    {isSelected('doljanchi') && (
                      <span className="text-2xl">✓</span>
                    )}
                  </div>
                </button>
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
              // 찾아가는 돌잔치: 복지시설 또는 영아원 중 하나는 필수 (선택 가능)
              <>
                {VISITING_DOLJANCHI_SUPPORT_TYPES.map((type) => {
                  // 필수 타입인지 확인
                  const isRequired = type === 'doljanchi_welfare_facility' || type === 'doljanchi_orphanage';
                  return (
                    <button
                      key={type}
                      onClick={() => handleSelect(type)}
                      className={`w-full rounded-lg border-2 p-6 text-left transition-all ${
                        isSelected(type)
                          ? 'border-blue-600 bg-blue-50'
                          : isRequired
                          ? 'border-green-300 bg-green-50 hover:border-green-400'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-semibold text-gray-800">
                          {SUPPORT_TYPE_LABELS[type]}
                          {isRequired && <span className="ml-2 text-sm text-green-600">(필수 중 하나)</span>}
                        </div>
                        {isSelected(type) && (
                          <span className="text-2xl">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
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

