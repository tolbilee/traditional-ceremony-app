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
  const [savedApplicationId, setSavedApplicationId] = useState<string | null>(
    isEditMode && originalApplication ? originalApplication.id : null
  );
  
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
      
      if (!formData.userName || !formData.birthDate || !formData.type) {
        console.log('Skipping save - insufficient data:', {
          hasUserName: !!formData.userName,
          hasBirthDate: !!formData.birthDate,
          hasType: !!formData.type,
          userName: formData.userName,
          birthDate: formData.birthDate,
        });
        return;
      }

      console.log('=== Auto-saving progress ===');
      console.log('Current step:', currentStep);
      console.log('Saved application ID:', savedApplicationId);

      const birthDate6 = formData.birthDate.length === 8 
        ? formData.birthDate.slice(2, 8) 
        : formData.birthDate;

      const saveData = {
        type: formData.type,
        user_name: formData.userName,
        birth_date: birthDate6,
        schedule_1: formData.schedule1 || null,
        schedule_2: formData.schedule2 || null,
        support_type: formData.supportType || null,
        application_data: formData.applicationData || {},
        consent_status: formData.consentStatus || false,
        file_urls: formData.fileUrls || [],
      };

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
        if (result.data?.id) {
          setSavedApplicationId(result.data.id);
          console.log('Progress saved successfully. ID:', result.data.id);
        }
      } else {
        const error = await response.json();
        console.error('Save error:', error);
        // 저장 실패해도 진행은 계속
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      // 저장 실패해도 진행은 계속
    }
  };

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

      // 파일을 먼저 업로드하고 URL 받기
      let fileUrls: string[] = formData.fileUrls || [];
      console.log('Starting file upload process...', {
        hasFiles: !!formData.files,
        filesCount: formData.files?.length || 0,
        existingFileUrls: fileUrls.length,
      });
      
      if (formData.files && formData.files.length > 0) {
        try {
          console.log('Uploading files...');
          // 파일 업로드 API 호출
          const uploadPromises = formData.files.map(async (file) => {
            console.log('Uploading file:', file.name);
            const formDataToUpload = new FormData();
            formDataToUpload.append('file', file);
            formDataToUpload.append('type', formData.type!);
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formDataToUpload,
            });
            
            if (uploadResponse.ok) {
              const { url } = await uploadResponse.json();
              console.log('File uploaded successfully:', url);
              return url;
            } else {
              console.error('File upload failed:', uploadResponse.status);
              return null;
            }
          });
          
          const uploadedUrls = await Promise.all(uploadPromises);
          fileUrls = [...fileUrls, ...uploadedUrls.filter((url): url is string => url !== null)];
          console.log('All files uploaded. Total URLs:', fileUrls.length);
        } catch (error) {
          console.error('File upload error:', error);
          // 파일 업로드 실패해도 신청은 진행
        }
      }

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

      // 이미 saveCurrentProgress에서 저장했으므로, 여기서는 완료 메시지만 표시
      if (savedApplicationId) {
        console.log('Application already saved with ID:', savedApplicationId);
        alert('신청이 완료되었습니다!');
      } else {
        // 저장이 안 된 경우에만 다시 시도
        console.log('No saved ID, attempting final save...');
        await saveCurrentProgress();
        alert('신청이 완료되었습니다!');
      }
      
      if (isEditMode) {
        alert('수정신청이 완료되었습니다. 서류검토 후 담당자가 연락을 드리오니 기다려 주시면 감사하겠습니다.');
      }
      
      // 메인 페이지로 이동
      console.log('Redirecting to home page...');
      window.location.href = '/';
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
