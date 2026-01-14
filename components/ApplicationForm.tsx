'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [savedApplicationId, setSavedApplicationId] = useState<string | null>(
    isEditMode && originalApplication ? originalApplication.id : null
  );
  
  // 수정 모드일 때 기존 데이터 로드
  const getInitialFormData = (): Partial<ApplicationFormData> => {
    if (isEditMode && originalApplication) {
      // file_urls를 fileUrls로 변환 (DB 컬럼명 -> FormData 필드명)
      const fileUrls = originalApplication.file_urls && Array.isArray(originalApplication.file_urls)
        ? originalApplication.file_urls
        : [];
      
      console.log('=== Loading edit mode data ===');
      console.log('Original file_urls:', originalApplication.file_urls);
      console.log('Converted fileUrls:', fileUrls);
      
      return {
        type: originalApplication.type,
        userName: originalApplication.user_name,
        birthDate: originalApplication.birth_date,
        schedule1: originalApplication.schedule_1 as Schedule,
        schedule2: originalApplication.schedule_2 as Schedule | undefined,
        supportType: originalApplication.support_type as SupportType,
        applicationData: originalApplication.application_data as ApplicationData,
        consentStatus: originalApplication.consent_status,
        fileUrls: fileUrls, // 기존 파일 URL 로드
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

  // fileUrls 변경 추적을 위한 ref
  const previousFileUrlsRef = useRef<string[]>([]);

  // 각 단계마다 자동 저장
  const saveCurrentProgress = async () => {
    try {
      // 최소한의 필수 데이터가 있어야 저장
      // userName과 birthDate는 ApplicationDataStep에서 자동 설정되므로, 
      // 3단계 이전에는 저장하지 않음
      if (currentStep < 3) {
        console.log('Skipping save - step too early');
        return;
      }
      
      // 3단계에서 userName/birthDate가 없으면 applicationData에서 추출 시도
      let userName = formData.userName;
      let birthDate = formData.birthDate;
      
      if (!userName || !birthDate) {
        if (formData.applicationData) {
          if ('groom' in formData.applicationData && formData.applicationData.groom) {
            userName = userName || formData.applicationData.groom.name || '';
            birthDate = birthDate || formData.applicationData.groom.birthDate || '';
          } else if ('parent' in formData.applicationData && formData.applicationData.parent) {
            userName = userName || formData.applicationData.parent.name || '';
            birthDate = birthDate || formData.applicationData.parent.birthDate || '';
          }
        }
      }
      
      if (!userName || !birthDate || !formData.type) {
        console.log('Skipping save - insufficient data:', {
          hasUserName: !!userName,
          hasBirthDate: !!birthDate,
          hasType: !!formData.type,
          userName: userName,
          birthDate: birthDate,
          extractedFromApplicationData: !formData.userName || !formData.birthDate,
        });
        return;
      }
      
      // 추출한 값으로 formData 업데이트
      if (userName !== formData.userName || birthDate !== formData.birthDate) {
        setFormData(prev => ({ ...prev, userName, birthDate }));
      }

      console.log('=== Auto-saving progress ===');
      console.log('Current step:', currentStep);
      console.log('Saved application ID:', savedApplicationId);
      console.log('Using userName:', userName, 'birthDate:', birthDate);
      console.log('File URLs to save:', formData.fileUrls);
      console.log('File URLs count:', formData.fileUrls?.length || 0);
      console.log('File URLs to save:', formData.fileUrls);
      console.log('File URLs count:', formData.fileUrls?.length || 0);

      const birthDate6 = birthDate.length === 8 
        ? birthDate.slice(2, 8) 
        : birthDate;

      // API는 ApplicationFormData 형태를 기대하므로 userName, birthDate 필드명 사용
      const saveData: Partial<ApplicationFormData> = {
        type: formData.type,
        userName: userName,  // user_name이 아닌 userName
        birthDate: birthDate,  // birth_date가 아닌 birthDate (API에서 6자리로 변환)
        schedule1: formData.schedule1 || undefined,
        schedule2: formData.schedule2 || undefined,
        supportType: formData.supportType || undefined,
        applicationData: formData.applicationData || undefined,
        consentStatus: formData.consentStatus || false,
        fileUrls: formData.fileUrls || [],
      };

      console.log('Sending saveData to API:', JSON.stringify(saveData, null, 2));

      let response;
      if (savedApplicationId) {
        // 기존 데이터 업데이트
        console.log('Updating existing application:', savedApplicationId);
        response = await fetch(`/api/applications/${savedApplicationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saveData),
        });
      } else {
        // 새 데이터 생성
        console.log('Creating new application');
        response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(saveData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('=== Save response received ===');
        console.log('Response data:', JSON.stringify(result, null, 2));
        if (result.data?.id) {
          setSavedApplicationId(result.data.id);
          console.log('Progress saved successfully. ID:', result.data.id);
          console.log('Saved file_urls:', result.data?.file_urls);
          console.log('Saved file_urls count:', result.data?.file_urls?.length || 0);
        }
      } else {
        const error = await response.json();
        console.error('=== Save error ===');
        console.error('Error response:', JSON.stringify(error, null, 2));
        console.error('Status:', response.status, response.statusText);
        // 저장 실패해도 진행은 계속
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      // 저장 실패해도 진행은 계속
    }
  };

  // fileUrls가 변경될 때마다 자동 저장 (5단계에서만)
  useEffect(() => {
    const currentFileUrls = formData.fileUrls || [];
    const previousFileUrls = previousFileUrlsRef.current;
    
    // fileUrls가 변경되었고, 5단계(DocumentUploadStep)이고, 파일이 추가된 경우에만 저장
    if (
      currentStep === 5 &&
      currentFileUrls.length > previousFileUrls.length &&
      currentFileUrls.length > 0 &&
      savedApplicationId // 이미 저장된 신청서가 있어야 함
    ) {
      console.log('=== File URLs changed, auto-saving ===');
      console.log('Previous file URLs:', previousFileUrls);
      console.log('Current file URLs:', currentFileUrls);
      console.log('Saved application ID:', savedApplicationId);
      
      // 약간의 지연을 두어 상태 업데이트가 완료되도록 함
      const timer = setTimeout(() => {
        saveCurrentProgress();
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // 이전 fileUrls 업데이트
    previousFileUrlsRef.current = currentFileUrls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fileUrls, currentStep, savedApplicationId]);

  const nextStep = async () => {
    // 다음 단계로 넘어가기 전에 현재 진행상황 저장
    await saveCurrentProgress();
    
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
    console.log('=== Final submission (handleSubmit) ===');
    console.log('Form data:', {
      userName: formData.userName,
      birthDate: formData.birthDate,
      schedule1: formData.schedule1,
      supportType: formData.supportType,
      hasApplicationData: !!formData.applicationData,
      consentStatus: formData.consentStatus,
      savedApplicationId,
    });
    
    try {
      // 필수 필드 검증
      if (!formData.userName || !formData.birthDate || !formData.schedule1 || !formData.supportType || !formData.applicationData) {
        console.error('Validation failed:', {
          userName: !!formData.userName,
          birthDate: !!formData.birthDate,
          schedule1: !!formData.schedule1,
          supportType: !!formData.supportType,
          applicationData: !!formData.applicationData,
        });
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }
      
      console.log('Validation passed, proceeding with final save...');

      // 파일은 DocumentUploadStep에서 이미 업로드되어 fileUrls에 포함됨
      const fileUrls: string[] = formData.fileUrls || [];
      console.log('=== SUBMIT APPLICATION ===');
      console.log('File URLs from formData:', fileUrls);
      console.log('File URLs count:', fileUrls.length);

      // 파일은 제외하고 데이터만 전송
      const submitData: Partial<ApplicationFormData> = {
        type: formData.type,
        userName: formData.userName,
        birthDate: formData.birthDate,
        schedule1: formData.schedule1,
        schedule2: formData.schedule2,
        supportType: formData.supportType,
        applicationData: formData.applicationData,
        consentStatus: formData.consentStatus,
        fileUrls: fileUrls,
      };
      
      console.log('Prepared submit data:', JSON.stringify(submitData, null, 2));

      // 이미 saveCurrentProgress에서 저장했으므로, 여기서는 최종 저장만 수행
      if (savedApplicationId) {
        console.log('Application already saved with ID:', savedApplicationId);
        // 최종 저장 (파일 URL 포함)
        await saveCurrentProgress();
      } else {
        // 저장이 안 된 경우에만 다시 시도
        console.log('No saved ID, attempting final save...');
        await saveCurrentProgress();
      }
      
      // 자동 이동하지 않음 - 사용자가 홈화면으로 돌아가기 버튼을 눌러야 함
      console.log('Application saved successfully. User can navigate manually.');
    } catch (error) {
      console.error('=== SUBMIT ERROR ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error:', error);
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

