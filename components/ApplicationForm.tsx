'use client';

import { useState } from 'react';
import { CeremonyType, ApplicationFormData, Schedule, TimeSlot, SupportType, ApplicationData } from '@/types';
import ProgressBar from './ProgressBar';
import DateSelectionStep from './steps/DateSelectionStep';
import SupportTypeStep from './steps/SupportTypeStep';
import ApplicationDataStep from './steps/ApplicationDataStep';
import PrivacyConsentStep from './steps/PrivacyConsentStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import CompletionStep from './steps/CompletionStep';

interface ApplicationFormProps {
  type: CeremonyType;
  isEditMode?: boolean;
  originalApplication?: any;
}

const TOTAL_STEPS = 6;

export default function ApplicationForm({ type, isEditMode = false, originalApplication }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // 수정 모드일 때 기존 데이터 로드
  const getInitialFormData = (): Partial<ApplicationFormData> => {
    if (isEditMode && originalApplication) {
      return {
        type: originalApplication.type,
        userName: originalApplication.user_name,
        birthDate: originalApplication.birth_date,
        schedule1: originalApplication.schedule_1 as Schedule,
        schedule2: originalApplication.schedule_2 as Schedule | undefined,
        supportType: originalApplication.support_type as SupportType,
        applicationData: originalApplication.application_data as ApplicationData,
        consentStatus: originalApplication.consent_status,
        files: [],
      };
    }
    
    return {
      type,
      userName: '',
      birthDate: '',
      schedule1: { date: '', time: '12:00' },
      supportType: undefined,
      applicationData: type === 'wedding' 
        ? {
            groom: { name: '', birthDate: '', nationality: '' },
            bride: { name: '', birthDate: '', nationality: '' },
            representative: { address: '', phone: '', email: '' },
            supportType: '',
            documentSubmitted: false,
            targetCategory: 'pre_marriage',
            preferredDateTime: '',
            applicationReason: '',
          }
        : {
            parent: { name: '', birthDate: '', gender: 'male' },
            child: { name: '', birthDate: '', gender: 'male' },
            representative: { address: '', phone: '', email: '' },
            supportType: '',
            documentSubmitted: false,
            parentMarried: 'yes',
            parentRaisingChild: 'yes',
            preferredDateTime: '',
            applicationReason: '',
          },
      consentStatus: false,
      files: [],
    };
  };
  
  const [formData, setFormData] = useState<Partial<ApplicationFormData>>(getInitialFormData());

  const updateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    try {
      // 필수 필드 검증
      if (!formData.userName || !formData.birthDate || !formData.schedule1 || !formData.supportType || !formData.applicationData) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      const submitData: ApplicationFormData = {
        ...formData as ApplicationFormData,
      };

      if (isEditMode && originalApplication) {
        // 수정 모드: PUT 요청
        const response = await fetch(`/api/applications/${originalApplication.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '수정 처리 중 오류가 발생했습니다.');
        }

        alert('수정신청이 완료되었습니다. 서류검토 후 담당자가 연락을 드리오니 기다려 주시면 감사하겠습니다.');
      } else {
        // 신규 신청: POST 요청
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '신청 처리 중 오류가 발생했습니다.');
        }

        alert('신청이 완료되었습니다!');
      }
      
      // 메인 페이지로 이동
      window.location.href = '/';
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="mt-8">
        {currentStep === 1 && (
          <DateSelectionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        )}
        {currentStep === 2 && (
          <SupportTypeStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {currentStep === 3 && (
          <ApplicationDataStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            type={type}
            isEditMode={isEditMode}
            originalData={originalApplication?.application_data}
          />
        )}
        {currentStep === 4 && (
          <PrivacyConsentStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {currentStep === 5 && (
          <DocumentUploadStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {currentStep === 6 && (
          <CompletionStep
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
          />
        )}
      </div>
    </div>
  );
}
