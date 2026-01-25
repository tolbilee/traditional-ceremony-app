'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationFormData, CeremonyType, WeddingApplicationData, DoljanchiApplicationData, VisitingDoljanchiApplicationData } from '@/types';

// KAKAO 주소 API 타입 선언 (공식 매뉴얼 기준)
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string; // 우편번호
          address: string; // 기본 주소
          roadAddress: string; // 도로명 주소
          jibunAddress: string; // 지번 주소
          addressType: string; // 'R'(도로명) 또는 'J'(지번)
          userSelectedType: string; // 사용자가 선택한 타입
          bname: string; // 법정동명
          buildingName: string; // 건물명
          apartment: string; // 아파트 여부 ('Y' 또는 'N')
        }) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

interface ApplicationDataStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  type: CeremonyType;
  isEditMode?: boolean;
  originalData?: any;
  doljanchiSubType?: 'doljanchi' | 'welfare_facility' | 'orphanage' | 'visiting';
}

export default function ApplicationDataStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  type,
  isEditMode = false,
  originalData,
  doljanchiSubType,
}: ApplicationDataStepProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDaumPostcodeLoaded, setIsDaumPostcodeLoaded] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // KAKAO 주소 API 동적 로드 및 확인
  useEffect(() => {
    const loadDaumPostcode = () => {
      if (typeof window === 'undefined') return;
      
      // 이미 로드되어 있으면 확인만
      if (window.daum && window.daum.Postcode) {
        setIsDaumPostcodeLoaded(true);
        return;
      }

      // 스크립트가 이미 추가되어 있는지 확인
      const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
      if (existingScript) {
        // 스크립트가 있으면 로드 대기
        const checkInterval = setInterval(() => {
          if (window.daum && window.daum.Postcode) {
            setIsDaumPostcodeLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        
        // 5초 후 타임아웃
        setTimeout(() => {
          clearInterval(checkInterval);
        }, 5000);
        return;
      }

      // 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        // 스크립트 로드 후 약간의 지연을 두고 확인
        setTimeout(() => {
          if (window.daum && window.daum.Postcode) {
            setIsDaumPostcodeLoaded(true);
          }
        }, 100);
      };
      document.head.appendChild(script);
    };

    loadDaumPostcode();
  }, []);

  // 주소 검색 함수
  const handleAddressSearch = (onComplete: (address: string) => void) => {
    // API가 로드되지 않았으면 동적으로 로드 시도
    if (!window.daum || !window.daum.Postcode) {
      const script = document.createElement('script');
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (window.daum && window.daum.Postcode) {
            openPostcodePopup(onComplete);
          } else {
            alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
          }
        }, 100);
      };
      script.onerror = () => {
        alert('주소 검색 서비스를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.');
      };
      document.head.appendChild(script);
      return;
    }

    openPostcodePopup(onComplete);
  };

  // 주소 검색 팝업 열기 (카카오 주소검색 API 공식 매뉴얼 기준)
  const openPostcodePopup = (onComplete: (address: string) => void) => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 사용할 수 없습니다.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 사용자가 선택한 타입에 따라 도로명 주소 또는 지번 주소 선택
        const isRoad = data.userSelectedType === 'R';
        let fullAddress = isRoad ? data.roadAddress : data.jibunAddress;

        // 법정동명(bname)이 있고 동/로/가로 끝나면 추가
        if (data.bname && /[동|로|가]$/g.test(data.bname)) {
          fullAddress += ' ' + data.bname;
        }

        // 건물명이 있고 아파트/오피스텔 등 다세대 주택인 경우 추가
        if (data.buildingName && data.apartment === 'Y') {
          fullAddress += (fullAddress ? ', ' : '') + data.buildingName;
        }

        onComplete(fullAddress);
      },
    }).open();
  };

  // 전화번호 포맷팅 함수 (000-0000-0000 형식)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 중복 신청 확인 함수
  const checkDuplicate = async (checkType: 'wedding' | 'doljanchi' | 'visiting_doljanchi', data: any) => {
    // 편집 모드에서는 중복 확인하지 않음
    if (isEditMode) return;

    try {
      let requestBody: any = { type: checkType };

      if (checkType === 'wedding') {
        // 신랑 또는 신부 중 한명이라도 이름과 생년월일이 있으면 확인
        const groomName = data.groom?.name?.trim();
        const groomBirth = data.groom?.birthDate;
        const brideName = data.bride?.name?.trim();
        const brideBirth = data.bride?.birthDate;

        // 신랑 정보로 확인
        if (groomName && groomBirth && groomBirth.length === 6) {
          requestBody.name = groomName;
          requestBody.birthDate = groomBirth;
        }
        // 신부 정보로 확인
        else if (brideName && brideBirth && brideBirth.length === 6) {
          requestBody.name = brideName;
          requestBody.birthDate = brideBirth;
        } else {
          return; // 둘 다 없으면 확인하지 않음
        }
      } else if (checkType === 'doljanchi') {
        const parentName = data.parent?.name?.trim();
        const parentBirth = data.parent?.birthDate;
        
        if (parentName && parentBirth && parentBirth.length === 6) {
          requestBody.name = parentName;
          requestBody.birthDate = parentBirth;
        } else {
          return;
        }
      } else if (checkType === 'visiting_doljanchi') {
        const repName = data.facility?.representative?.trim();
        const businessNum = data.facility?.businessNumber?.replace(/\D/g, '');
        
        if (repName && businessNum && businessNum.length === 10) {
          requestBody.representativeName = repName;
          requestBody.businessNumber = businessNum;
        } else {
          return;
        }
      }

      const response = await fetch('/api/applications/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.exists && result.applications && result.applications.length > 0) {
        setShowDuplicateModal(true);
      }
    } catch (error) {
      console.error('중복 확인 중 오류:', error);
      // 오류 발생 시에도 계속 진행 (사용자 경험을 위해)
    }
  };

  // Debounce를 사용한 중복 확인
  const debouncedCheckDuplicate = (checkType: 'wedding' | 'doljanchi' | 'visiting_doljanchi', data: any) => {
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current);
    }
    
    duplicateCheckTimeoutRef.current = setTimeout(() => {
      checkDuplicate(checkType, data);
    }, 1000); // 1초 후 확인
  };

  // 모달 핸들러
  const handleDuplicateModalYes = () => {
    setShowDuplicateModal(false);
    router.push('/my-applications');
  };

  const handleDuplicateModalNo = () => {
    setShowDuplicateModal(false);
  };

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
      // applicationData.supportType이 이미 있으면 유지 (복수 선택된 경우), 없으면 formData.supportType 사용
      const existingSupportType = (weddingData as WeddingApplicationData)?.supportType;
      const finalData: WeddingApplicationData = {
        ...weddingData as WeddingApplicationData,
        supportType: existingSupportType || formData.supportType || '',
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
                onBlur={() => {
                  if (weddingData.groom?.name && weddingData.groom?.birthDate && weddingData.groom.birthDate.length === 6) {
                    debouncedCheckDuplicate('wedding', weddingData);
                  }
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
                onBlur={() => {
                  if (weddingData.bride?.name && weddingData.bride?.birthDate && weddingData.bride.birthDate.length === 6) {
                    debouncedCheckDuplicate('wedding', weddingData);
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
                onClick={() => handleAddressSearch((address) => {
                  handleWeddingChange('representative', { ...weddingData.representative, address });
                })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg cursor-pointer ${
                  errors['representative.address'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('representative.address') ? 'text-red-600' : ''}`}
                placeholder="주소를 검색하려면 클릭하세요"
                readOnly
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
                  const formatted = formatPhoneNumber(e.target.value);
                  handleWeddingChange('representative', { ...weddingData.representative, phone: formatted });
                  // 전화번호는 userName이 아님 (userName은 신랑 이름 사용)
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['representative.phone'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('representative.phone') ? 'text-red-600' : ''}`}
                placeholder="010-1234-5678"
                maxLength={13}
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
              placeholder="신청동기를 입력해주세요. 정성어린 신청동기는 최종 선정에 중요한 참고 자료입니다"
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

        {/* 중복 신청 확인 모달 */}
        {showDuplicateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6">
              <h3 className="mb-4 text-xl font-bold text-gray-800">중복 신청 확인</h3>
              <p className="mb-6 text-gray-600">
                기존에 이미 신청하신 정보가 있습니다. 나의 신청내역을 확인하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDuplicateModalYes}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-700"
                >
                  예
                </button>
                <button
                  onClick={handleDuplicateModalNo}
                  className="flex-1 rounded-lg bg-gray-300 px-6 py-3 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-400"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 찾아가는 돌잔치 신청서 (7-4)
  if (type === 'doljanchi' && doljanchiSubType === 'visiting') {
    const visitingData = (formData.applicationData as Partial<VisitingDoljanchiApplicationData>) || {};
    
    // targets 배열 초기화 (기존 target이 있으면 배열로 변환, 없으면 빈 배열)
    const [targets, setTargets] = useState<Array<{
      name: string;
      birthDate: string;
      gender: string;
      targetType: string;
      additionalTypes: string;
    }>>(() => {
      if (visitingData.targets && Array.isArray(visitingData.targets)) {
        return visitingData.targets;
      } else if (visitingData.target) {
        // 기존 target을 targets 배열로 변환 (하위 호환성)
        return [{
          name: visitingData.target.name || '',
          birthDate: visitingData.target.birthDate || '',
          gender: visitingData.target.gender || '',
          targetType: visitingData.target.targetType || '',
          additionalTypes: visitingData.target.additionalTypes || '',
        }];
      }
      // 기본값: 1팀 추가
      return [{
        name: '',
        birthDate: '',
        gender: '',
        targetType: '',
        additionalTypes: '',
      }];
    });

    // 편집 모드에서 기존 데이터 로드 시 targets 업데이트
    useEffect(() => {
      if (isEditMode && originalData && originalData.application_data) {
        const appData = originalData.application_data as any;
        if (appData.targets && Array.isArray(appData.targets)) {
          setTargets(appData.targets);
        } else if (appData.target) {
          // 기존 target을 targets 배열로 변환
          setTargets([{
            name: appData.target.name || '',
            birthDate: appData.target.birthDate || '',
            gender: appData.target.gender || '',
            targetType: appData.target.targetType || '',
            additionalTypes: appData.target.additionalTypes || '',
          }]);
        }
      }
    }, [isEditMode, originalData]);
    
    const handleVisitingChange = (field: string, value: any) => {
      const newData = {
        ...visitingData,
        [field]: value,
      } as Partial<VisitingDoljanchiApplicationData>;
      
      updateFormData({ applicationData: newData as any });
      
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

    // 콤마로 구분된 문자열을 배열로 파싱
    const parseCommaSeparated = (value: string): string[] => {
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    };

    // 대상자 팀 추가
    const addTargetTeam = () => {
      const supportTypeString = formData.applicationData?.supportType as string || formData.supportType || '';
      const supportTypes = supportTypeString ? supportTypeString.split(',').map(t => t.trim()) : [];
      const targetType = supportTypes.find(t => t === 'doljanchi_welfare_facility' || t === 'doljanchi_orphanage') || '';
      const additionalTypes = supportTypes.filter(t => t !== 'doljanchi_welfare_facility' && t !== 'doljanchi_orphanage').join(',');
      
      const newTarget = {
        name: '',
        birthDate: '',
        gender: '',
        targetType: targetType,
        additionalTypes: additionalTypes,
      };
      const updatedTargets = [...targets, newTarget];
      setTargets(updatedTargets);
      handleVisitingChange('targets', updatedTargets);
    };

    // 대상자 팀 삭제
    const removeTargetTeam = (index: number) => {
      if (targets.length <= 1) return; // 최소 1팀은 유지
      const updatedTargets = targets.filter((_, i) => i !== index);
      setTargets(updatedTargets);
      handleVisitingChange('targets', updatedTargets);
    };

    // 대상자 필드 업데이트
    const updateTargetField = (teamIndex: number, field: 'name' | 'birthDate' | 'gender', value: string) => {
      const updatedTargets = [...targets];
      updatedTargets[teamIndex] = {
        ...updatedTargets[teamIndex],
        [field]: value,
      };
      setTargets(updatedTargets);
      handleVisitingChange('targets', updatedTargets);
      
      // 첫 번째 팀의 이름을 userName으로 설정 (로그인용)
      if (teamIndex === 0 && field === 'name') {
        updateFormData({ userName: value.split(',')[0].trim() });
      }
      // 첫 번째 팀의 생년월일을 birthDate로 설정 (로그인용)
      if (teamIndex === 0 && field === 'birthDate') {
        const firstBirthDate = parseCommaSeparated(value)[0] || '';
        updateFormData({ birthDate: firstBirthDate });
      }
    };

    const validateVisiting = () => {
      const newErrors: Record<string, string> = {};
      
      // 대상자 정보 검증 (각 팀별)
      targets.forEach((target, teamIndex) => {
        if (!target.name || target.name.trim() === '') {
          newErrors[`targets.${teamIndex}.name`] = '이름을 입력해주세요.';
        }
        
        if (!target.birthDate || target.birthDate.trim() === '') {
          newErrors[`targets.${teamIndex}.birthDate`] = '생년월일을 입력해주세요.';
        } else {
          // 콤마로 구분된 생년월일 검증
          const birthDates = parseCommaSeparated(target.birthDate);
          const invalidDates = birthDates.filter(bd => bd.length !== 6 || !/^\d{6}$/.test(bd));
          if (invalidDates.length > 0) {
            newErrors[`targets.${teamIndex}.birthDate`] = '생년월일은 6자리 숫자로 입력해주세요.';
          }
        }
        
        if (!target.gender || target.gender.trim() === '') {
          newErrors[`targets.${teamIndex}.gender`] = '성별을 입력해주세요.';
        } else {
          // 콤마로 구분된 성별 검증
          const genders = parseCommaSeparated(target.gender);
          const validGenders = ['남', '여', 'male', 'female', '남성', '여성'];
          const invalidGenders = genders.filter(g => !validGenders.includes(g.trim()));
          if (invalidGenders.length > 0) {
            newErrors[`targets.${teamIndex}.gender`] = '성별은 "남" 또는 "여"로 입력해주세요.';
          }
        }
        
        // 이름, 생년월일, 성별 개수 일치 확인
        const names = parseCommaSeparated(target.name);
        const birthDates = parseCommaSeparated(target.birthDate);
        const genders = parseCommaSeparated(target.gender);
        
        if (names.length !== birthDates.length || names.length !== genders.length) {
          newErrors[`targets.${teamIndex}.name`] = '이름, 생년월일, 성별의 개수가 일치해야 합니다.';
        }
      });
      
      // 복지시설 정보
      if (!visitingData.facility?.name) newErrors['facility.name'] = '시설명을 입력해주세요.';
      if (!visitingData.facility?.representative) newErrors['facility.representative'] = '대표자 이름을 입력해주세요.';
      if (!visitingData.facility?.address) newErrors['facility.address'] = '주소를 입력해주세요.';
      // 사업자번호는 10자리 숫자 (하이픈 제외) 또는 13자리 (하이픈 포함)
      const businessNumberDigits = visitingData.facility?.businessNumber?.replace(/\D/g, '') || '';
      if (!businessNumberDigits || businessNumberDigits.length !== 10) {
        newErrors['facility.businessNumber'] = '사업자번호를 입력해주세요. (10자리 숫자)';
      }
      if (!visitingData.facility?.manager) newErrors['facility.manager'] = '담당자 이름을 입력해주세요.';
      if (!visitingData.facility?.phone) newErrors['facility.phone'] = '전화번호를 입력해주세요.';
      if (!visitingData.facility?.email) newErrors['facility.email'] = '이메일을 입력해주세요.';
      
      if (!visitingData.applicationReason || visitingData.applicationReason.length > 1000) {
        newErrors['applicationReason'] = '신청동기를 입력해주세요. (최대 1,000자)';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
      if (validateVisiting()) {
        // applicationData.supportType이 이미 있으면 유지 (복수 선택된 경우), 없으면 formData.supportType 사용
        const existingSupportType = visitingData?.supportType;
        
        // 대상유형과 추가유형 자동 입력
        const supportTypeString = formData.applicationData?.supportType as string || formData.supportType || '';
        const supportTypes = supportTypeString ? supportTypeString.split(',').map(t => t.trim()) : [];
        const targetType = supportTypes.find(t => t === 'doljanchi_welfare_facility' || t === 'doljanchi_orphanage') || '';
        const additionalTypes = supportTypes.filter(t => t !== 'doljanchi_welfare_facility' && t !== 'doljanchi_orphanage').join(',');
        
        // targets 배열에 대상유형과 추가유형 자동 입력
        const updatedTargets = targets.map(target => ({
          ...target,
          targetType: targetType || target.targetType,
          additionalTypes: additionalTypes || target.additionalTypes,
        }));
        
        const finalData: VisitingDoljanchiApplicationData = {
          ...visitingData as VisitingDoljanchiApplicationData,
          targets: updatedTargets,
          supportType: existingSupportType || formData.supportType || '',
          documentSubmitted: (formData.files?.length || 0) > 0,
          preferredDateTime: formData.schedule1 
            ? `${formData.schedule1.date} ${formData.schedule1.time}`
            : '',
        };
        
        // userName과 birthDate를 명시적으로 설정 (로그인용 - 첫 번째 팀의 첫 번째 대상자 사용)
        const firstTarget = updatedTargets[0];
        const firstNames = parseCommaSeparated(firstTarget?.name || '');
        const firstBirthDates = parseCommaSeparated(firstTarget?.birthDate || '');
        const userName = firstNames[0] || formData.userName || '';
        const birthDate = firstBirthDates[0] || formData.birthDate || '';
        
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
        if (key.match(/^\d+$/)) {
          // 배열 인덱스
          value = value?.[parseInt(key)];
        } else {
          value = value?.[key];
        }
      }
      return value || '';
    };

    // 사업자번호 포맷팅 함수
    const formatBusinessNumber = (value: string) => {
      const numbers = value.replace(/\D/g, '').slice(0, 10);
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
    };

    // 전화번호 포맷팅 함수는 상단의 formatPhoneNumber 사용

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">신청서 작성</h2>
        <p className="text-gray-600">신청자 정보를 입력해주세요.</p>

        {/* 참가자 정보 */}
        <div className="space-y-6 rounded-lg border-2 border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-800">참가자 정보</h3>
          
          {/* 대상자 정보 (7-4-1: 팀 추가 기능 및 콤마 구분 입력) */}
          {targets.map((target, teamIndex) => (
            <div key={teamIndex} className="space-y-4 border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700">대상자 ({teamIndex + 1}팀)</h4>
                <div className="flex gap-2">
                  {teamIndex === 0 && (
                    <button
                      type="button"
                      onClick={addTargetTeam}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
                    >
                      팀 추가하기
                    </button>
                  )}
                  {targets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTargetTeam(teamIndex)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-95"
                    >
                      팀 삭제하기
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  이름 <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-500">(여러명 입력 시 콤마로 구분)</span>
                </label>
                <input
                  type="text"
                  name={`targets.${teamIndex}.name`}
                  value={target.name}
                  onChange={(e) => updateTargetField(teamIndex, 'name', e.target.value)}
                  className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                    errors[`targets.${teamIndex}.name`] ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode && getOriginalValue(`targets.${teamIndex}.name`) ? 'text-red-600' : ''}`}
                  placeholder="김철수, 이영희, 박순희"
                />
                {errors[`targets.${teamIndex}.name`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`targets.${teamIndex}.name`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  생년월일 (6자리) <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-500">(여러명 입력 시 콤마로 구분)</span>
                </label>
                <input
                  type="text"
                  name={`targets.${teamIndex}.birthDate`}
                  value={target.birthDate}
                  onChange={(e) => {
                    // 숫자와 콤마, 공백만 허용
                    const value = e.target.value.replace(/[^\d, ]/g, '');
                    updateTargetField(teamIndex, 'birthDate', value);
                  }}
                  className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                    errors[`targets.${teamIndex}.birthDate`] ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode && getOriginalValue(`targets.${teamIndex}.birthDate`) ? 'text-red-600' : ''}`}
                  placeholder="240101, 240307, 240528"
                />
                {errors[`targets.${teamIndex}.birthDate`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`targets.${teamIndex}.birthDate`]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  성별 <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-500">(여러명 입력 시 콤마로 구분: 남, 여)</span>
                </label>
                <input
                  type="text"
                  name={`targets.${teamIndex}.gender`}
                  value={target.gender}
                  onChange={(e) => updateTargetField(teamIndex, 'gender', e.target.value)}
                  className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                    errors[`targets.${teamIndex}.gender`] ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode && getOriginalValue(`targets.${teamIndex}.gender`) ? 'text-red-600' : ''}`}
                  placeholder="남, 여, 여"
                />
                {errors[`targets.${teamIndex}.gender`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`targets.${teamIndex}.gender`]}</p>
                )}
              </div>
            </div>
          ))}

          {/* 복지시설 정보 */}
          <div className="space-y-4 pt-4">
            <h4 className="font-semibold text-gray-700">복지시설</h4>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                시설명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="facility.name"
                value={visitingData.facility?.name || ''}
                onChange={(e) => handleVisitingChange('facility', { ...visitingData.facility, name: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.name'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.name') ? 'text-red-600' : ''}`}
                placeholder="○○복지시설"
              />
              {errors['facility.name'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.name']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                대표자 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="facility.representative"
                value={visitingData.facility?.representative || ''}
                onChange={(e) => handleVisitingChange('facility', { ...visitingData.facility, representative: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.representative'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.representative') ? 'text-red-600' : ''}`}
                placeholder="홍길동"
              />
              {errors['facility.representative'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.representative']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="facility.address"
                value={visitingData.facility?.address || ''}
                onChange={(e) => handleVisitingChange('facility', { ...visitingData.facility, address: e.target.value })}
                onClick={() => handleAddressSearch((address) => {
                  handleVisitingChange('facility', { ...visitingData.facility, address });
                })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg cursor-pointer ${
                  errors['facility.address'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.address') ? 'text-red-600' : ''}`}
                placeholder="주소를 검색하려면 클릭하세요"
                readOnly
              />
              {errors['facility.address'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.address']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                사업자번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="facility.businessNumber"
                value={visitingData.facility?.businessNumber || ''}
                onChange={(e) => {
                  const formatted = formatBusinessNumber(e.target.value);
                  handleVisitingChange('facility', { ...visitingData.facility, businessNumber: formatted });
                }}
                onBlur={() => {
                  const businessNum = visitingData.facility?.businessNumber?.replace(/\D/g, '');
                  if (visitingData.facility?.representative && businessNum && businessNum.length === 10) {
                    debouncedCheckDuplicate('visiting_doljanchi', visitingData);
                  }
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.businessNumber'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.businessNumber') ? 'text-red-600' : ''}`}
                placeholder="000-00-00000"
                maxLength={13}
              />
              {errors['facility.businessNumber'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.businessNumber']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                홈페이지
              </label>
              <input
                type="text"
                name="facility.website"
                value={visitingData.facility?.website || ''}
                onChange={(e) => handleVisitingChange('facility', { ...visitingData.facility, website: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.website'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.website') ? 'text-red-600' : ''}`}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                담당자 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="facility.manager"
                value={visitingData.facility?.manager || ''}
                onChange={(e) => handleVisitingChange('facility', { ...visitingData.facility, manager: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.manager'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.manager') ? 'text-red-600' : ''}`}
                placeholder="홍길동"
              />
              {errors['facility.manager'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.manager']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="facility.phone"
                value={visitingData.facility?.phone || ''}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  handleVisitingChange('facility', { ...visitingData.facility, phone: formatted });
                }}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.phone'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.phone') ? 'text-red-600' : ''}`}
                placeholder="010-1234-5678"
                maxLength={13}
              />
              {errors['facility.phone'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.phone']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="facility.email"
                value={visitingData.facility?.email || ''}
                onChange={(e) => handleVisitingChange('facility', { ...visitingData.facility, email: e.target.value })}
                className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                  errors['facility.email'] ? 'border-red-500' : 'border-gray-300'
                } ${isEditMode && getOriginalValue('facility.email') ? 'text-red-600' : ''}`}
                placeholder="example@email.com"
              />
              {errors['facility.email'] && (
                <p className="mt-1 text-sm text-red-500">{errors['facility.email']}</p>
              )}
            </div>
          </div>
        </div>

        {/* 진행 정보 */}
        <div className="space-y-6 rounded-lg border-2 border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-800">진행 정보</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              희망 일시
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
              value={visitingData.applicationReason || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 1000);
                handleVisitingChange('applicationReason', value);
              }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['applicationReason'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('applicationReason') ? 'text-red-600' : ''}`}
              rows={6}
              placeholder="신청동기를 입력해주세요. 정성어린 신청동기는 최종 선정에 중요한 참고 자료입니다"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {visitingData.applicationReason?.length || 0} / 1,000자
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

        {/* 중복 신청 확인 모달 */}
        {showDuplicateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6">
              <h3 className="mb-4 text-xl font-bold text-gray-800">중복 신청 확인</h3>
              <p className="mb-6 text-gray-600">
                기존에 이미 신청하신 정보가 있습니다. 나의 신청내역을 확인하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDuplicateModalYes}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-700"
                >
                  예
                </button>
                <button
                  onClick={handleDuplicateModalNo}
                  className="flex-1 rounded-lg bg-gray-300 px-6 py-3 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-400"
                >
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 돌잔치 신청서 (7-3)
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
      // applicationData.supportType이 이미 있으면 유지 (복수 선택된 경우), 없으면 formData.supportType 사용
      const existingSupportType = (doljanchiData as DoljanchiApplicationData)?.supportType;
      const finalData: DoljanchiApplicationData = {
        ...doljanchiData as DoljanchiApplicationData,
        supportType: existingSupportType || formData.supportType || '',
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
              onBlur={() => {
                if (doljanchiData.parent?.name && doljanchiData.parent?.birthDate && doljanchiData.parent.birthDate.length === 6) {
                  debouncedCheckDuplicate('doljanchi', doljanchiData);
                }
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
              onClick={() => handleAddressSearch((address) => {
                handleDoljanchiChange('representative', { ...doljanchiData.representative, address });
              })}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg cursor-pointer ${
                errors['representative.address'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('representative.address') ? 'text-red-600' : ''}`}
              placeholder="주소를 검색하려면 클릭하세요"
              readOnly
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
                  const formatted = formatPhoneNumber(e.target.value);
                  handleDoljanchiChange('representative', { ...doljanchiData.representative, phone: formatted });
                  // 전화번호는 userName이 아님 (userName은 부/모 이름 사용)
                }}
              className={`mt-1 w-full rounded-lg border-2 px-4 py-3 text-lg ${
                errors['representative.phone'] ? 'border-red-500' : 'border-gray-300'
              } ${isEditMode && getOriginalValue('representative.phone') ? 'text-red-600' : ''}`}
              placeholder="010-1234-5678"
              maxLength={13}
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
            placeholder="신청동기를 입력해주세요. 정성어린 동기 작성은 최종 선정에 중요한 참고 자료입니다."
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

      {/* 중복 신청 확인 모달 */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800">중복 신청 확인</h3>
            <p className="mb-6 text-gray-600">
              기존에 이미 신청하신 정보가 있습니다. 나의 신청내역을 확인하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDuplicateModalYes}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-700"
              >
                예
              </button>
              <button
                onClick={handleDuplicateModalNo}
                className="flex-1 rounded-lg bg-gray-300 px-6 py-3 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-400"
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

