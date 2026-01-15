'use client';

import { useState } from 'react';
import { ApplicationFormData } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import BottomNavigationBar from '../BottomNavigationBar';

interface PrivacyConsentStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PrivacyConsentStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: PrivacyConsentStepProps) {
  const [personalInfoConsent, setPersonalInfoConsent] = useState<'yes' | 'no' | null>(null);
  const [sensitiveInfoConsent, setSensitiveInfoConsent] = useState<'yes' | 'no' | null>(null);

  const currentDate = format(new Date(), 'yyyy년 M월 d일', { locale: ko });
  
  // 신청자 이름 추출 (전통혼례: 신랑/신부 이름, 돌잔치: 부/모 이름)
  const getApplicantName = (): string => {
    if (!formData.applicationData) return formData.userName || '';
    
    if ('groom' in formData.applicationData && formData.applicationData.groom?.name) {
      // 전통혼례: 신랑 이름 사용
      return formData.applicationData.groom.name;
    } else if ('parent' in formData.applicationData && formData.applicationData.parent?.name) {
      // 돌잔치: 부/모 이름 사용
      return formData.applicationData.parent.name;
    }
    
    return formData.userName || '';
  };
  
  const applicantName = getApplicantName();

  const handleNext = () => {
    if (personalInfoConsent !== 'yes' || sensitiveInfoConsent !== 'yes') {
      alert('개인정보 및 민감정보 수집·이용에 모두 동의해주세요.');
      return;
    }

    updateFormData({
      consentStatus: true,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">개인정보이용동의서</h2>

      <div className="space-y-6 rounded-lg border-2 border-gray-200 bg-white p-6">
        {/* 개인정보 수집·이용 동의서 */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">개인정보 수집·이용 동의서</h3>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              국가유산진흥원에서는 귀하의 2026년 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 참가자 모집을 위하여 아래와 같이 개인정보를 수집·이용하고자 합니다.
            </p>
            <p>아래 내용을 충분히 숙지하신 후, 개인정보 수집‧이용 동의서에 서명하여 주시기 바랍니다.</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">[수집하는 개인정보의 항목]</span>
                <p className="mt-1">성명, 생년월일, 주소, 성별, 국적, 이메일, 연락처 등</p>
              </div>
              <div>
                <span className="font-semibold">[개인정보 수집 이용 목적]</span>
                <p className="mt-1">2026년 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 참가자 모집 및 관리</p>
              </div>
              <div>
                <span className="font-semibold">[개인정보 보유기간]</span>
                <p className="mt-1">행사 종료 후 1년</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            ※ 위의 개인정보 처리에 대한 동의를 거부할 권리가 있습니다. 그러나, 동의를 거부할 경우 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 신청을 할 수 없습니다.
          </p>

          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <div className="mb-3">
              <span className="font-semibold text-gray-800">
                개인정보의 수집 및 이용에 동의하십니까?
              </span>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="personalInfo"
                  value="yes"
                  checked={personalInfoConsent === 'yes'}
                  onChange={() => setPersonalInfoConsent('yes')}
                  className="mr-2 h-5 w-5"
                />
                <span>동의함</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="personalInfo"
                  value="no"
                  checked={personalInfoConsent === 'no'}
                  onChange={() => setPersonalInfoConsent('no')}
                  className="mr-2 h-5 w-5"
                />
                <span>동의하지 않음</span>
              </label>
            </div>
          </div>
        </div>

        {/* 민감정보의 수집 및 이용 동의 */}
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="mb-4 text-xl font-bold text-gray-800">민감정보의 수집 및 이용 동의</h3>
          
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">[수집하는 민감정보의 항목]</span>
                <p className="mt-1">사회적 배려 대상자 증빙 서류 및 혼인사실 증빙 서류</p>
              </div>
              <div>
                <span className="font-semibold">[수집 이용 목적]</span>
                <p className="mt-1">2026년 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 참가자 모집 및 관리</p>
              </div>
              <div>
                <span className="font-semibold">[개인정보 보유기간]</span>
                <p className="mt-1">행사 종료 후 1년</p>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-600">
            ※ 위의 민감정보 처리에 대한 동의를 거부할 권리가 있습니다. 그러나, 동의를 거부할 경우 사회적 배려 대상자 전통혼례 및 돌잔치 지원 프로그램 신청을 할 수 없습니다.
          </p>

          <div className="mt-4 rounded-lg border-2 border-gray-300 bg-white p-4">
            <div className="mb-3">
              <span className="font-semibold text-gray-800">
                민감정보의 수집 및 이용에 동의하십니까?
              </span>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sensitiveInfo"
                  value="yes"
                  checked={sensitiveInfoConsent === 'yes'}
                  onChange={() => setSensitiveInfoConsent('yes')}
                  className="mr-2 h-5 w-5"
                />
                <span>동의함</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sensitiveInfo"
                  value="no"
                  checked={sensitiveInfoConsent === 'no'}
                  onChange={() => setSensitiveInfoConsent('no')}
                  className="mr-2 h-5 w-5"
                />
                <span>동의하지 않음</span>
              </label>
            </div>
          </div>
        </div>

        {/* 서명란 */}
        <div className="border-t-2 border-gray-200 pt-6">
          <p className="mb-4 text-sm font-semibold text-gray-800">위의 각 사항에 동의하였음을 확인합니다.</p>
          <div className="space-y-2 text-sm">
            <p>{currentDate}</p>
            <p>성명 : {applicantName || '(신청자 성명)'}</p>
            <p className="mt-4">국가유산진흥원장 귀하</p>
          </div>
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
          onClick={handleNext}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          다음 단계
        </button>
      </div>
      
      <BottomNavigationBar />
    </div>
  );
}

