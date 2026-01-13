'use client';

import { ApplicationFormData } from '@/types';

interface ConsentStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
}

export default function ConsentStep({
  formData,
  updateFormData,
  onSubmit,
  onPrev,
}: ConsentStepProps) {
  const handleConsentChange = (checked: boolean) => {
    updateFormData({ consentStatus: checked });
  };

  const handleSubmit = () => {
    if (!formData.consentStatus) {
      alert('개인정보 및 민감정보 처리에 동의해주세요.');
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">동의서 확인</h2>

      <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-800">개인정보 및 민감정보 처리 동의</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            1. 수집 목적: 전통혼례 및 돌잔치 신청 접수 및 행정 처리
          </p>
          <p>
            2. 수집 항목: 성명, 생년월일, 전화번호, 주소, 증빙서류
          </p>
          <p>
            3. 보유 기간: 신청 처리 완료 후 1년
          </p>
          <p>
            4. 동의 거부 권리: 동의를 거부할 수 있으나, 이 경우 신청이 불가능합니다.
          </p>
        </div>
      </div>

      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={formData.consentStatus || false}
          onChange={(e) => handleConsentChange(e.target.checked)}
          className="mt-1 h-6 w-6 rounded border-gray-300"
        />
        <span className="text-lg font-semibold text-gray-800">
          위 개인정보 및 민감정보 처리에 동의합니다. <span className="text-red-500">*</span>
        </span>
      </label>

      {/* 신청 정보 요약 */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">신청 정보 요약</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-semibold">유형:</span>{' '}
            {formData.type === 'wedding' ? '전통혼례' : '돌잔치'}
          </p>
          <p>
            <span className="font-semibold">1순위:</span>{' '}
            {formData.schedule1
              ? `${formData.schedule1.date} ${formData.schedule1.time}`
              : '미선택'}
          </p>
          {formData.schedule2 && (
            <p>
              <span className="font-semibold">2순위:</span>{' '}
              {`${formData.schedule2.date} ${formData.schedule2.time}`}
            </p>
          )}
          <p>
            <span className="font-semibold">신청자:</span>{' '}
            {formData.applicationData?.applicantName || '미입력'}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="rounded-full bg-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-300 active:scale-95"
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 active:scale-95"
        >
          신청 완료
        </button>
      </div>
    </div>
  );
}
