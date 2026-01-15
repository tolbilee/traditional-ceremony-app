'use client';

import { useState } from 'react';
import { ApplicationFormData, CeremonyType, WeddingApplicationData, DoljanchiApplicationData } from '@/types';

interface ApplicationDataStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  type: CeremonyType;
  isEditMode?: boolean;
  originalData?: any;
}

export default function ApplicationDataStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  type,
  isEditMode = false,
  originalData,
}: ApplicationDataStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 전통혼례 신청서
  if (type === 'wedding') {
    const weddingData = (formData.applicationData as Partial<WeddingApplicationData>) || {};
    
    const handleWeddingChange = (field: string, value: any) => {
      const newData = {
        ...weddingData,
        [field]: value,
      } as Partial<WeddingApplicationData>;
      
      // 대표 정보 업데이트 시 applicationData만 업데이트 (userName은 신랑 이름 사용)
      if (field === 'representative') {
        updateFormData({
          applicationData: newData as any,
        });
      } else {
        updateFormData({ applicationData: newData as any });
      }
      
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    const validateWedding = () => {
      const newErrors: Record<string, string> = {};
      
      if (!weddingData.groom?.name) newErrors['groom.name'] = '신랑 이름을 입력해주세요.';
      if (!weddingData.groom?.birthDate || weddingData.groom.birthDate.length !== 6) {
        newErrors['groom.birthDate'] = '신랑 생년월일 6자리를 입력해주세요.';
      }
      if (!weddingData.groom?.nationality) newErrors['groom.nationality'] = '신랑 국적을 입력해주세요.';
      
      if (!weddingData.bride?.name) newErrors['bride.name'] = '신부 이름을 입력해주세요.';
      if (!weddingData.bride?.birthDate || weddingData.bride.birthDate.length !== 6) {
        newErrors['bride.birthDate'] = '신부 생년월일 6자리를 입력해주세요.';
      }
      if (!weddingData.bride?.nationality) newErrors['bride.nationality'] = '신부 국적을 입력해주세요.';
      
      if (!weddingData.representative?.address) newErrors['representative.address'] = '주소를 입력해주세요.';
      if (!weddingData.representative?.phone) newErrors['representative.phone'] = '전화번호를 입력해주세요.';
      if (!weddingData.representative?.email) newErrors['representative.email'] = '이메일을 입력해주세요.';
      
      if (!weddingData.targetCategory) newErrors['targetCategory'] = '대상 구분을 선택해주세요.';
      if (!weddingData.applicationReason || weddingData.applicationReason.length > 1000) {
        newErrors['applicationReason'] = '신청동기를 입력해주세요. (최대 1,000자)';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

  const handleNext = () => {
    if (validateWedding()) {
      // 자동 입력 필드 설정
      const finalData: WeddingApplicationData = {
        ...weddingData as WeddingApplicationData,
        supportType: formData.supportType || '',
        documentSubmitted: (formData.files?.length || 0) > 0,
        preferredDateTime: formData.schedule1 
          ? `${formData.schedule1.date} ${formData.schedule1.time}`
          : '',
      };
      
      // userName과 birthDate를 명시적으로 설정 (로그인용)
      const userName = weddingData.groom?.name || formData.userName || '';
      const birthDate = weddingData.groom?.birthDate || formData.birthDate || '';
      
      console.log('=== Setting userName and birthDate before next step ===');
      console.log('userName:', userName);
      console.log('birthDate:', birthDate);
      
      updateFormData({ 
        applicationData: finalData,
        userName: userName,
        birthDate: birthDate,
      });
      onNext();
    } else {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLInputElement)?.focus();
      }
    }
  };

    const getOriginalValue = (field: string) => {
      if (!isEditMode || !originalData) return '';
      const keys = field.split('.');
      let value: any = originalData;
      for (const key of keys) {
        value = value?.[key];
      }
      return value || '';
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">신청서 작성</h2>
        <p className="text-gray-600">신청자 정보를 입력해주세요.</p>

        {/* 참가자 정보 */}
        <div className="space-y-6 rounded-lg border-2 border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-800">참가자 정보</h3>
          
          {/* 신랑 정보 */}
          <div className="space-y-4 border-b border-gray-200 pb-4">
            <h4 className="font-semibold text-gray-700">신랑</h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom.name"
                value={weddingData.groom?.name || ''}
                onChange={(e) => {
                  const updatedGroom = { ...weddingData.groom, name: e.target.value };
                  handleWeddingChange('groom', updatedGroom);
                  // 신랑 이름을 formData.userName으로도 설정 (로그인용)
                  updateFormData({ userName: e.target.value });
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['groom.name'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('groom.name') ? 'text-red-600' : ''}`}
                placeholder="홍길동"
              />
              {errors['groom.name'] && (
                <p className="mt-1 text-sm text-red-500">{errors['groom.name']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                생년월일 (6자리) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom.birthDate"
                value={weddingData.groom?.birthDate || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  const updatedGroom = { ...weddingData.groom, birthDate: value };
                  handleWeddingChange('groom', updatedGroom);
                  // 신랑 생년월일을 formData.birthDate로도 설정 (로그인용)
                  updateFormData({ birthDate: value });
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['groom.birthDate'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('groom.birthDate') ? 'text-red-600' : ''}`}
                placeholder="900101"
                maxLength={6}
              />
              {errors['groom.birthDate'] && (
                <p className="mt-1 text-sm text-red-500">{errors['groom.birthDate']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                국적 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="groom.nationality"
                value={weddingData.groom?.nationality || ''}
                onChange={(e) => handleWeddingChange('groom', { ...weddingData.groom, nationality: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['groom.nationality'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('groom.nationality') ? 'text-red-600' : ''}`}
                placeholder="대한민국"
              />
              {errors['groom.nationality'] && (
                <p className="mt-1 text-sm text-red-500">{errors['groom.nationality']}</p>
              )}
            </div>
          </div>

          {/* 신부 정보 */}
          <div className="space-y-4 border-b border-gray-200 pb-4 pt-4">
            <h4 className="font-semibold text-gray-700">신부</h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride.name"
                value={weddingData.bride?.name || ''}
                onChange={(e) => {
                  const updatedBride = { ...weddingData.bride, name: e.target.value };
                  handleWeddingChange('bride', updatedBride);
                  // 신부 이름도 formData.userName으로 설정 가능 (신랑 이름이 없을 경우)
                  if (!formData.userName || !weddingData.groom?.name) {
                    updateFormData({ userName: e.target.value });
                  }
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['bride.name'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('bride.name') ? 'text-red-600' : ''}`}
                placeholder="김영희"
              />
              {errors['bride.name'] && (
                <p className="mt-1 text-sm text-red-500">{errors['bride.name']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                생년월일 (6자리) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride.birthDate"
                value={weddingData.bride?.birthDate || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  const updatedBride = { ...weddingData.bride, birthDate: value };
                  handleWeddingChange('bride', updatedBride);
                  // 신부 생년월일도 formData.birthDate로 설정 가능 (신랑 생년월일이 없을 경우)
                  if (!formData.birthDate || !weddingData.groom?.birthDate) {
                    updateFormData({ birthDate: value });
                  }
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['bride.birthDate'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('bride.birthDate') ? 'text-red-600' : ''}`}
                placeholder="950101"
                maxLength={6}
              />
              {errors['bride.birthDate'] && (
                <p className="mt-1 text-sm text-red-500">{errors['bride.birthDate']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                국적 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bride.nationality"
                value={weddingData.bride?.nationality || ''}
                onChange={(e) => handleWeddingChange('bride', { ...weddingData.bride, nationality: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['bride.nationality'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('bride.nationality') ? 'text-red-600' : ''}`}
                placeholder="대한민국"
              />
              {errors['bride.nationality'] && (
                <p className="mt-1 text-sm text-red-500">{errors['bride.nationality']}</p>
              )}
            </div>
          </div>

          {/* 대표 정보 */}
          <div className="space-y-4 pt-4">
            <h4 className="font-semibold text-gray-700">대표 정보</h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="representative.address"
                value={weddingData.representative?.address || ''}
                onChange={(e) => handleWeddingChange('representative', { ...weddingData.representative, address: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['representative.address'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('representative.address') ? 'text-red-600' : ''}`}
                placeholder="서울시 강남구 테헤란로 123"
              />
              {errors['representative.address'] && (
                <p className="mt-1 text-sm text-red-500">{errors['representative.address']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="representative.phone"
                value={weddingData.representative?.phone || ''}
                onChange={(e) => {
                  handleWeddingChange('representative', { ...weddingData.representative, phone: e.target.value });
                  // 전화번호는 userName이 아님 (userName은 신랑 이름 사용)
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['representative.phone'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('representative.phone') ? 'text-red-600' : ''}`}
                placeholder="010-1234-5678"
              />
              {errors['representative.phone'] && (
                <p className="mt-1 text-sm text-red-500">{errors['representative.phone']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="representative.email"
                value={weddingData.representative?.email || ''}
                onChange={(e) => handleWeddingChange('representative', { ...weddingData.representative, email: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['representative.email'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('representative.email') ? 'text-red-600' : ''}`}
                placeholder="example@email.com"
              />
              {errors['representative.email'] && (
                <p className="mt-1 text-sm text-red-500">{errors['representative.email']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 진행 정보 */}
        <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-800">진행 정보</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              대상 구분 <span className="text-red-500">*</span>
            </label>
            <select
              name="targetCategory"
              value={weddingData.targetCategory || ''}
              onChange={(e) => handleWeddingChange('targetCategory', e.target.value)}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['targetCategory'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('targetCategory') ? 'text-red-600' : ''}`}
            >
              <option value="">선택해주세요</option>
              <option value="pre_marriage">예비부부</option>
              <option value="married_no_ceremony_no_registration">결혼식 미진행 부부(혼인신고 X)</option>
              <option value="married_no_ceremony_registered">결혼식 미진행 부부(혼인신고 O)</option>
              <option value="other">기타</option>
            </select>
            {errors['targetCategory'] && (
              <p className="mt-1 text-sm text-red-500">{errors['targetCategory']}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              희망 혼례 일시
            </label>
            <div className="mt-1 space-y-2">
              {formData.schedule1 && (
                <input
                  type="text"
                  value={`1순위: ${formData.schedule1.date} ${formData.schedule1.time}`}
                  disabled
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600"
                />
              )}
              {formData.schedule2 && (
                <input
                  type="text"
                  value={`2순위: ${formData.schedule2.date} ${formData.schedule2.time}`}
                  disabled
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600"
                />
              )}
              {!formData.schedule1 && !formData.schedule2 && (
                <input
                  type="text"
                  value="날짜를 선택하지 않았습니다"
                  disabled
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-400"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              신청동기 <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-normal text-gray-500">(최대 1,000자)</span>
            </label>
            <textarea
              name="applicationReason"
              value={weddingData.applicationReason || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 1000);
                handleWeddingChange('applicationReason', value);
              }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['applicationReason'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('applicationReason') ? 'text-red-600' : ''}`}
              rows={6}
              placeholder="신청동기를 입력해주세요."
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {weddingData.applicationReason?.length || 0} / 1,000자
            </p>
            {errors['applicationReason'] && (
              <p className="mt-1 text-sm text-red-500">{errors['applicationReason']}</p>
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
            onClick={handleNext}
            className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            다음 단계
          </button>
        </div>
      </div>
    );
  }

  // 돌잔치 신청서
  const doljanchiData = (formData.applicationData as Partial<DoljanchiApplicationData>) || {};
  
  const handleDoljanchiChange = (field: string, value: any) => {
    const newData = {
      ...doljanchiData,
      [field]: value,
    } as Partial<DoljanchiApplicationData>;
    
    // applicationData 업데이트 (userName은 부/모 이름 사용)
    updateFormData({ applicationData: newData as any });
    
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateDoljanchi = () => {
    const newErrors: Record<string, string> = {};
    
    if (!doljanchiData.parent?.name) newErrors['parent.name'] = '부/모 이름을 입력해주세요.';
    if (!doljanchiData.parent?.birthDate || doljanchiData.parent.birthDate.length !== 6) {
      newErrors['parent.birthDate'] = '부/모 생년월일 6자리를 입력해주세요.';
    }
    if (!doljanchiData.parent?.gender) newErrors['parent.gender'] = '부/모 성별을 선택해주세요.';
    
    if (!doljanchiData.child?.name) newErrors['child.name'] = '아이 이름을 입력해주세요.';
    if (!doljanchiData.child?.birthDate || doljanchiData.child.birthDate.length !== 6) {
      newErrors['child.birthDate'] = '아이 생년월일 6자리를 입력해주세요.';
    }
    if (!doljanchiData.child?.gender) newErrors['child.gender'] = '아이 성별을 선택해주세요.';
    
    if (!doljanchiData.representative?.address) newErrors['representative.address'] = '주소를 입력해주세요.';
    if (!doljanchiData.representative?.phone) newErrors['representative.phone'] = '전화번호를 입력해주세요.';
    if (!doljanchiData.representative?.email) newErrors['representative.email'] = '이메일을 입력해주세요.';
    
    if (!doljanchiData.parentMarried) newErrors['parentMarried'] = '혼인 여부를 선택해주세요.';
    if (!doljanchiData.parentRaisingChild) newErrors['parentRaisingChild'] = '자녀 양육여부를 선택해주세요.';
    if (!doljanchiData.applicationReason || doljanchiData.applicationReason.length > 1000) {
      newErrors['applicationReason'] = '신청동기를 입력해주세요. (최대 1,000자)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateDoljanchi()) {
      const finalData: DoljanchiApplicationData = {
        ...doljanchiData as DoljanchiApplicationData,
        supportType: formData.supportType || '',
        documentSubmitted: (formData.files?.length || 0) > 0,
        preferredDateTime: formData.schedule1 
          ? `${formData.schedule1.date} ${formData.schedule1.time}`
          : '',
      };
      
      // userName과 birthDate를 명시적으로 설정 (로그인용)
      const userName = doljanchiData.parent?.name || formData.userName || '';
      const birthDate = doljanchiData.parent?.birthDate || formData.birthDate || '';
      
      console.log('=== Setting userName and birthDate before next step (Doljanchi) ===');
      console.log('userName:', userName);
      console.log('birthDate:', birthDate);
      
      updateFormData({ 
        applicationData: finalData,
        userName: userName,
        birthDate: birthDate,
      });
      onNext();
    } else {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLInputElement)?.focus();
      }
    }
  };

  const getOriginalValue = (field: string) => {
    if (!isEditMode || !originalData) return '';
    const keys = field.split('.');
    let value: any = originalData;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">신청서 작성</h2>
      <p className="text-gray-600">신청자 정보를 입력해주세요.</p>

      {/* 참가자 정보 */}
      <div className="space-y-6 rounded-lg border-2 border-gray-200 bg-white p-6">
        <h3 className="text-xl font-semibold text-gray-800">참가자 정보</h3>
        
        {/* 신청자 정보 */}
        <div className="space-y-4 border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700">신청자</h4>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="parent.name"
              value={doljanchiData.parent?.name || ''}
              onChange={(e) => {
                handleDoljanchiChange('parent', { ...doljanchiData.parent, name: e.target.value });
                // 신청자 이름을 formData.userName으로도 설정 (로그인용)
                updateFormData({ userName: e.target.value });
              }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['parent.name'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('parent.name') ? 'text-red-600' : ''}`}
              placeholder="홍길동"
            />
            {errors['parent.name'] && (
              <p className="mt-1 text-sm text-red-500">{errors['parent.name']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              생년월일 (6자리) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="parent.birthDate"
              value={doljanchiData.parent?.birthDate || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                const updatedParent = { ...doljanchiData.parent, birthDate: value };
                handleDoljanchiChange('parent', updatedParent);
                // 부모 생년월일을 formData.birthDate로도 설정 (로그인용)
                updateFormData({ birthDate: value });
              }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['parent.birthDate'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('parent.birthDate') ? 'text-red-600' : ''}`}
              placeholder="900101"
              maxLength={6}
            />
            {errors['parent.birthDate'] && (
              <p className="mt-1 text-sm text-red-500">{errors['parent.birthDate']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              성별 <span className="text-red-500">*</span>
            </label>
            <select
              name="parent.gender"
              value={doljanchiData.parent?.gender || ''}
              onChange={(e) => handleDoljanchiChange('parent', { ...doljanchiData.parent, gender: e.target.value as 'male' | 'female' })}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['parent.gender'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('parent.gender') ? 'text-red-600' : ''}`}
            >
              <option value="">선택해주세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
            {errors['parent.gender'] && (
              <p className="mt-1 text-sm text-red-500">{errors['parent.gender']}</p>
            )}
          </div>
        </div>

        {/* 아이 정보 */}
        <div className="space-y-4 border-b border-gray-200 pb-4 pt-4">
          <h4 className="font-semibold text-gray-700">아이</h4>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="child.name"
              value={doljanchiData.child?.name || ''}
              onChange={(e) => handleDoljanchiChange('child', { ...doljanchiData.child, name: e.target.value })}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['child.name'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('child.name') ? 'text-red-600' : ''}`}
              placeholder="홍아이"
            />
            {errors['child.name'] && (
              <p className="mt-1 text-sm text-red-500">{errors['child.name']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              생년월일 (6자리) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="child.birthDate"
              value={doljanchiData.child?.birthDate || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                handleDoljanchiChange('child', { ...doljanchiData.child, birthDate: value });
              }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['child.birthDate'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('child.birthDate') ? 'text-red-600' : ''}`}
              placeholder="230101"
              maxLength={6}
            />
            {errors['child.birthDate'] && (
              <p className="mt-1 text-sm text-red-500">{errors['child.birthDate']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              성별 <span className="text-red-500">*</span>
            </label>
            <select
              name="child.gender"
              value={doljanchiData.child?.gender || ''}
              onChange={(e) => handleDoljanchiChange('child', { ...doljanchiData.child, gender: e.target.value as 'male' | 'female' })}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['child.gender'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('child.gender') ? 'text-red-600' : ''}`}
            >
              <option value="">선택해주세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
            {errors['child.gender'] && (
              <p className="mt-1 text-sm text-red-500">{errors['child.gender']}</p>
            )}
          </div>
        </div>

        {/* 대표 정보 */}
        <div className="space-y-4 pt-4">
          <h4 className="font-semibold text-gray-700">대표 정보</h4>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="representative.address"
              value={doljanchiData.representative?.address || ''}
              onChange={(e) => handleDoljanchiChange('representative', { ...doljanchiData.representative, address: e.target.value })}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['representative.address'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('representative.address') ? 'text-red-600' : ''}`}
              placeholder="서울시 강남구 테헤란로 123"
            />
            {errors['representative.address'] && (
              <p className="mt-1 text-sm text-red-500">{errors['representative.address']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="representative.phone"
              value={doljanchiData.representative?.phone || ''}
                onChange={(e) => {
                  handleDoljanchiChange('representative', { ...doljanchiData.representative, phone: e.target.value });
                  // 전화번호는 userName이 아님 (userName은 부/모 이름 사용)
                }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['representative.phone'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('representative.phone') ? 'text-red-600' : ''}`}
              placeholder="010-1234-5678"
            />
            {errors['representative.phone'] && (
              <p className="mt-1 text-sm text-red-500">{errors['representative.phone']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="representative.email"
              value={doljanchiData.representative?.email || ''}
              onChange={(e) => handleDoljanchiChange('representative', { ...doljanchiData.representative, email: e.target.value })}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['representative.email'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('representative.email') ? 'text-red-600' : ''}`}
              placeholder="example@email.com"
            />
            {errors['representative.email'] && (
              <p className="mt-1 text-sm text-red-500">{errors['representative.email']}</p>
            )}
          </div>
        </div>
      </div>

      {/* 진행 정보 */}
      <div className="space-y-4 rounded-lg border-2 border-gray-200 bg-white p-6">
        <h3 className="text-xl font-semibold text-gray-800">진행 정보</h3>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            부/모(신청자 본인)의 혼인 여부 <span className="text-red-500">*</span>
          </label>
          <select
            name="parentMarried"
            value={doljanchiData.parentMarried || ''}
            onChange={(e) => handleDoljanchiChange('parentMarried', e.target.value)}
            className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
              errors['parentMarried'] ? 'border-red-500' : 'border-gray-300'
            } ${isEditMode && getOriginalValue('parentMarried') ? 'text-red-600' : ''}`}
          >
            <option value="">선택해주세요</option>
            <option value="yes">예</option>
            <option value="no">아니오</option>
          </select>
          {errors['parentMarried'] && (
            <p className="mt-1 text-sm text-red-500">{errors['parentMarried']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            부/모(신청자 본인)의 자녀 양육여부 <span className="text-red-500">*</span>
          </label>
          <select
            name="parentRaisingChild"
            value={doljanchiData.parentRaisingChild || ''}
            onChange={(e) => handleDoljanchiChange('parentRaisingChild', e.target.value)}
            className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
              errors['parentRaisingChild'] ? 'border-red-500' : 'border-gray-300'
            } ${isEditMode && getOriginalValue('parentRaisingChild') ? 'text-red-600' : ''}`}
          >
            <option value="">선택해주세요</option>
            <option value="yes">예</option>
            <option value="no">아니오</option>
          </select>
          {errors['parentRaisingChild'] && (
            <p className="mt-1 text-sm text-red-500">{errors['parentRaisingChild']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            희망 돌잔치 일시
          </label>
          <div className="mt-1 space-y-2">
            {formData.schedule1 && (
              <input
                type="text"
                value={`1순위: ${formData.schedule1.date} ${formData.schedule1.time}`}
                disabled
                className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600"
              />
            )}
            {formData.schedule2 && (
              <input
                type="text"
                value={`2순위: ${formData.schedule2.date} ${formData.schedule2.time}`}
                disabled
                className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-600"
              />
            )}
            {!formData.schedule1 && !formData.schedule2 && (
              <input
                type="text"
                value="날짜를 선택하지 않았습니다"
                disabled
                className="w-full rounded-lg border-2 border-gray-300 bg-gray-100 px-4 py-3 text-lg text-gray-400"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">
            신청동기 <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-500">(최대 1,000자)</span>
          </label>
          <textarea
            name="applicationReason"
            value={doljanchiData.applicationReason || ''}
            onChange={(e) => {
              const value = e.target.value.slice(0, 1000);
              handleDoljanchiChange('applicationReason', value);
            }}
            className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
              errors['applicationReason'] ? 'border-red-500' : 'border-gray-300'
            } ${isEditMode && getOriginalValue('applicationReason') ? 'text-red-600' : ''}`}
            rows={6}
            placeholder="신청동기를 입력해주세요."
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-gray-500">
            {doljanchiData.applicationReason?.length || 0} / 1,000자
          </p>
          {errors['applicationReason'] && (
            <p className="mt-1 text-sm text-red-500">{errors['applicationReason']}</p>
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
          onClick={handleNext}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}

