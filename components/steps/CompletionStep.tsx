'use client';

import React from 'react';
import Link from 'next/link';
import { ApplicationFormData } from '@/types';

interface CompletionStepProps {
  formData: Partial<ApplicationFormData>;
  onSubmit: () => void;
  onPrev: () => void;
}

export default function CompletionStep({
  formData,
  onSubmit,
  onPrev,
}: CompletionStepProps) {
  console.log('=== CompletionStep rendered ===');
  console.log('onSubmit function type:', typeof onSubmit);
  console.log('formData:', formData);
  
  // 자동 제출 제거 - 사용자가 명시적으로 제출 버튼을 눌러야 함
  const handleSubmit = () => {
    if (onSubmit && typeof onSubmit === 'function') {
      onSubmit();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-8 text-center">
        <div className="mb-4 text-6xl">✅</div>
        <h2 className="mb-4 text-2xl font-bold text-gray-800">신청해주셔서 감사합니다</h2>
        <p className="text-lg text-gray-700">
          서류검토 후 담당자가 합격 여부 및 향후 진행 과정에 대해 연락을 드리오니 결과를 기다려 주시면 감사하겠습니다.
        </p>
      </div>

      {/* 신청 정보 요약 */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">신청 정보 요약</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-semibold">유형:</span>{' '}
            {formData.type === 'wedding' ? '전통혼례' : '돌잔치'}
          </p>
          {formData.schedule1 && (
            <p>
              <span className="font-semibold">1순위:</span>{' '}
              {formData.schedule1.date} {formData.schedule1.time}
            </p>
          )}
          {formData.schedule2 && (
            <p>
              <span className="font-semibold">2순위:</span>{' '}
              {formData.schedule2.date} {formData.schedule2.time}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6 pb-32">
        <button
          onClick={onPrev}
          className="rounded-full bg-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-300 active:scale-95"
        >
          이전
        </button>
        <button
          onClick={async () => {
            await handleSubmit();
            // 신청 완료 후 홈으로 이동
            window.location.href = '/';
          }}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          신청 완료하기
        </button>
      </div>
    </div>
  );
}

