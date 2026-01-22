'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApplicationFormData, SupportType, RequiredDocument, WeddingApplicationData } from '@/types';
import { REQUIRED_DOCUMENTS, WEDDING_SPECIAL_DOCUMENTS, VISITING_DOLJANCHI_SPECIAL_DOCUMENTS } from '@/lib/utils/constants';

interface DocumentUploadStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onFileUploaded?: (fileUrls: string[], fileMetadata?: Record<string, string>) => Promise<void>; // 파일 업로드 후 저장을 위한 콜백
  doljanchiSubType?: 'doljanchi' | 'welfare_facility' | 'orphanage' | 'visiting';
  isEditMode?: boolean; // 편집 모드 여부
}

export default function DocumentUploadStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  onFileUploaded,
  doljanchiSubType,
  isEditMode = false,
}: DocumentUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(formData.files || []);
  
  // 선택된 파일 목록 (업로드 전) - UI 조건문에서만 사용
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 파일 메타데이터: { storageUrl: originalFileName }
  // 기존 fileMetadata를 초기값으로 사용
  const [fileMetadata, setFileMetadata] = useState<Record<string, string>>(
    (formData.fileMetadata as Record<string, string>) || {}
  );
  
  // 기존에 DB에 저장된 파일 URL 목록 (수정 모드에서만 사용)
  // 초기 로드 시 formData.fileUrls를 originalFileUrls로 설정
  const [originalFileUrls, setOriginalFileUrls] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 순차 업로드를 위한 현재 단계 인덱스 (0부터 시작)
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  
  // 각 단계별로 업로드한 파일 URL을 저장 (지원유형별로 구분)
  const [uploadedFilesByStep, setUploadedFilesByStep] = useState<Record<number, string[]>>({});
  
  // 초기 로드 시 originalFileUrls 설정 (편집 모드일 때만, 한 번만)
  useEffect(() => {
    // 편집 모드가 아니면 originalFileUrls를 빈 배열로 유지
    if (!isEditMode) {
      setOriginalFileUrls([]);
      setIsInitialized(true);
      return;
    }
    
    // 편집 모드일 때만 기존 파일 URL 설정
    if (!isInitialized && isEditMode && formData.fileUrls && formData.fileUrls.length > 0) {
      setOriginalFileUrls([...formData.fileUrls]);
      setIsInitialized(true);
    }
  }, [formData.fileUrls, isInitialized, isEditMode]);
  
  // 순차 업로드: 선택된 지원유형이 변경되면 현재 단계 인덱스 초기화
  useEffect(() => {
    setCurrentDocumentIndex(0);
    setUploadedFilesByStep({});
  }, [formData.applicationData?.supportType, formData.type, doljanchiSubType]);
  
  // 새로 업로드한 파일의 URL 목록 (originalFileUrls에 없는 것들)
  const newlyUploadedUrls = formData.fileUrls?.filter(url => !originalFileUrls.includes(url)) || [];

  const supportType = formData.supportType;
  const requiredDoc = supportType ? REQUIRED_DOCUMENTS[supportType] : null;
  
  // 복수 선택된 지원유형 가져오기 (전통혼례의 경우)
  const getSelectedSupportTypes = (): SupportType[] => {
    if (formData.type === 'wedding') {
      // applicationData에서 복수 선택된 지원유형 확인
      if (formData.applicationData && 'supportType' in formData.applicationData) {
        const supportTypeString = formData.applicationData.supportType as string;
        console.log('[DocumentUploadStep] 전통혼례 - applicationData.supportType:', supportTypeString);
        // 쉼표로 구분된 문자열을 배열로 변환
        if (supportTypeString && supportTypeString.trim()) {
          if (supportTypeString.includes(',')) {
            const types = supportTypeString.split(',').map(t => t.trim()).filter(t => t) as SupportType[];
            console.log('[DocumentUploadStep] 전통혼례 - 파싱된 지원유형:', types);
            return types;
          } else {
            const types = [supportTypeString.trim() as SupportType];
            console.log('[DocumentUploadStep] 전통혼례 - 단일 지원유형:', types);
            return types;
          }
        }
      }
      // applicationData.supportType이 없으면 formData.supportType 사용 (단일 선택)
      if (supportType) {
        console.log('[DocumentUploadStep] 전통혼례 - formData.supportType 사용:', supportType);
        return [supportType];
      }
    }
    return [];
  };
  
  const selectedSupportTypes = getSelectedSupportTypes();
  console.log('[DocumentUploadStep] 최종 전통혼례 지원유형:', selectedSupportTypes);
  
  // 돌잔치 복수 선택된 지원유형 가져오기 (돌잔치와 찾아가는 돌잔치 모두)
  const getDoljanchiSelectedSupportTypes = (): SupportType[] => {
    if (formData.type === 'doljanchi') {
      // applicationData에서 복수 선택된 지원유형 확인
      if (formData.applicationData && 'supportType' in formData.applicationData) {
        const supportTypeString = formData.applicationData.supportType as string;
        console.log('[DocumentUploadStep] 돌잔치 - applicationData.supportType:', supportTypeString);
        // 쉼표로 구분된 문자열을 배열로 변환
        if (supportTypeString && supportTypeString.trim()) {
          if (supportTypeString.includes(',')) {
            const types = supportTypeString.split(',').map(t => t.trim()).filter(t => t) as SupportType[];
            console.log('[DocumentUploadStep] 돌잔치 - 파싱된 지원유형:', types);
            return types;
          } else {
            const types = [supportTypeString.trim() as SupportType];
            console.log('[DocumentUploadStep] 돌잔치 - 단일 지원유형:', types);
            return types;
          }
        }
      }
    }
    console.log('[DocumentUploadStep] 돌잔치 - 지원유형 없음');
    return [];
  };
  
  const doljanchiSelectedSupportTypes = getDoljanchiSelectedSupportTypes();
  console.log('[DocumentUploadStep] 최종 돌잔치 지원유형:', doljanchiSelectedSupportTypes);
  
  // 선택된 지원유형을 순서대로 정렬하여 증빙서류 목록 생성
  const getOrderedSupportTypes = (): SupportType[] => {
    if (formData.type === 'doljanchi') {
      if (doljanchiSubType === 'doljanchi') {
        // 돌잔치: 한부모가족은 항상 첫 번째, 그 다음 선택한 순서대로
        const orderedTypes: SupportType[] = ['doljanchi'];
        doljanchiSelectedSupportTypes.forEach(type => {
          if (type !== 'doljanchi' && !orderedTypes.includes(type)) {
            orderedTypes.push(type);
          }
        });
        return orderedTypes;
      } else {
        // 찾아가는 돌잔치: 복지시설 또는 영아원이 첫 번째, 그 다음 선택한 순서대로
        const orderedTypes: SupportType[] = [];
        const hasWelfareFacility = doljanchiSelectedSupportTypes.includes('doljanchi_welfare_facility');
        const hasOrphanage = doljanchiSelectedSupportTypes.includes('doljanchi_orphanage');
        
        if (hasWelfareFacility) {
          orderedTypes.push('doljanchi_welfare_facility');
        }
        if (hasOrphanage) {
          orderedTypes.push('doljanchi_orphanage');
        }
        
        doljanchiSelectedSupportTypes.forEach(type => {
          if (type !== 'doljanchi_welfare_facility' && type !== 'doljanchi_orphanage' && !orderedTypes.includes(type)) {
            orderedTypes.push(type);
          }
        });
        return orderedTypes;
      }
    } else {
      // 전통혼례: 선택한 순서대로
      return selectedSupportTypes;
    }
  };
  
  const orderedSupportTypes = getOrderedSupportTypes();
  
  // 순서대로 정렬된 증빙서류 목록 생성
  const getAllRequiredDocuments = (): RequiredDocument[] => {
    const documents: RequiredDocument[] = [];
    
    // 1. 지원유형별 증빙서류 추가
    orderedSupportTypes.forEach(type => {
      // 찾아가는 돌잔치의 경우 한부모가족 복지시설/영아원은 개별 서류로 분리 (4-6-2 * 주의사항)
      if (formData.type === 'doljanchi' && doljanchiSubType === 'visiting' && 
          (type === 'doljanchi_welfare_facility' || type === 'doljanchi_orphanage')) {
        // 한부모가족 복지시설 또는 영아원인 경우 3개의 개별 서류로 분리
        documents.push(VISITING_DOLJANCHI_SPECIAL_DOCUMENTS.business_registration);
        documents.push(VISITING_DOLJANCHI_SPECIAL_DOCUMENTS.admission_confirmation);
        documents.push(VISITING_DOLJANCHI_SPECIAL_DOCUMENTS.single_parent_certificate);
      } else if (REQUIRED_DOCUMENTS[type]) {
        documents.push(REQUIRED_DOCUMENTS[type]);
      }
    });
    
    // 2. 전통혼례 특이 케이스 증빙서류 추가 (3-5 * 표시 항목)
    if (formData.type === 'wedding' && formData.applicationData) {
      const weddingData = formData.applicationData as Partial<WeddingApplicationData>;
      const targetCategory = weddingData.targetCategory;
      
      // 예비부부 또는 결혼식 미진행 부부(혼인신고 X) → 혼인관계증명서
      if (targetCategory === 'pre_marriage' || targetCategory === 'married_no_ceremony_no_registration') {
        documents.push(WEDDING_SPECIAL_DOCUMENTS.marriage_certificate);
      }
      
      // 결혼식 미진행 부부(혼인신고 O) → 주민등록등본
      if (targetCategory === 'married_no_ceremony_registered') {
        documents.push(WEDDING_SPECIAL_DOCUMENTS.family_register);
      }
    }
    
    return documents;
  };
  
  const allRequiredDocuments = getAllRequiredDocuments();
  
  // 현재 단계의 증빙서류만 가져오기
  const getCurrentDocument = (): RequiredDocument | null => {
    if (allRequiredDocuments.length === 0) return null;
    if (currentDocumentIndex >= allRequiredDocuments.length) return null;
    return allRequiredDocuments[currentDocumentIndex];
  };
  
  const currentDocument = getCurrentDocument();
  const isLastDocument = currentDocumentIndex >= allRequiredDocuments.length - 1;

  // 파일명에 사용할 수 없는 문자 제거 및 URL-safe하게 변환 함수
  // Supabase Storage는 한글을 지원하지 않으므로 영문/숫자만 허용
  const sanitizeFileName = (fileName: string): string => {
    // 1. Windows에서 파일명에 사용할 수 없는 문자 제거: < > : " / \ | ? *
    let sanitized = fileName.replace(/[<>:"/\\|?*]/g, '');
    
    // 2. 공백을 언더스코어로 변환
    sanitized = sanitized.replace(/\s+/g, '_');
    
    // 3. 한글을 영문으로 변환 (간단한 매핑)
    // 주요 증빙서류명 매핑
    const documentNameMap: Record<string, string> = {
      '가족관계증명서': 'FamilyRelation',
      '기초수급증명서': 'BasicLivelihood',
      '국가유공자증명서': 'NationalMerit',
      '장애인증명서': 'Disability',
      '한부모가족증명서': 'SingleParent',
      '차상위계층증명서': 'NearPoverty',
      '주민등록등본': 'ResidentRegister',
      '주민등록초본': 'ResidentExtract',
      '소득증명원': 'IncomeCertificate',
      '사업자등록증명원': 'BusinessRegistration',
    };
    
    // 증빙서류명 변환
    for (const [korean, english] of Object.entries(documentNameMap)) {
      sanitized = sanitized.replace(new RegExp(korean, 'g'), english);
    }
    
    // 4. 한글 및 특수문자 제거, 영문/숫자/언더스코어/하이픈/점만 허용
    // Supabase Storage는 한글을 지원하지 않으므로 영문/숫자만 사용
    sanitized = sanitized.replace(/[^\w\-.]/g, '');
    
    // 5. 연속된 언더스코어를 하나로 통합
    sanitized = sanitized.replace(/_+/g, '_');
    
    // 6. 앞뒤 언더스코어 제거
    sanitized = sanitized.replace(/^_+|_+$/g, '');
    
    // 7. 제어 문자 제거
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    return sanitized.trim();
  };

  // 자동 파일명 생성 함수 (UI 표시용 - 한글 유지)
  const generateAutoFileName = (index: number = 0, totalFiles: number = 1): string => {
    const parts: string[] = [];
    
    // 1. 신청자 이름 (한글 유지, 특수문자만 제거)
    const userName = formData.userName?.trim() || '';
    if (userName) {
      // Windows 파일명에 사용할 수 없는 문자만 제거 (한글은 유지)
      const cleanedName = userName.replace(/[<>:"/\\|?*]/g, '').trim();
      if (cleanedName) {
        parts.push(cleanedName);
      }
    } else {
      console.warn('generateAutoFileName: userName is empty');
    }
    
    // 2. 증빙서류명 (한글 유지, 특수문자만 제거)
    const documentName = currentDocument?.documentName?.trim() || '';
    if (documentName) {
      // Windows 파일명에 사용할 수 없는 문자만 제거 (한글은 유지)
      const cleanedName = documentName.replace(/[<>:"/\\|?*]/g, '').trim();
      if (cleanedName) {
        parts.push(cleanedName);
      }
    } else {
      console.warn('generateAutoFileName: documentName is empty, currentDocument:', currentDocument);
    }
    
    // 3. 날짜시간 (YYYYMMDDHHmmss 형식)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
    parts.push(dateTime);
    
    // 여러 파일인 경우 번호 추가
    if (totalFiles > 1) {
      parts.push(String(index + 1));
    }
    
    const result = parts.join('_');
    console.log('generateAutoFileName result:', result, 'parts:', parts);
    return result;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // 파일 선택 시 즉시 업로드
    const uploadedUrls: string[] = [];
    const newFileMetadata: Record<string, string> = {}; // 업로드된 파일의 메타데이터를 직접 수집
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formDataToUpload = new FormData();
        formDataToUpload.append('file', file);
        formDataToUpload.append('type', formData.type || 'wedding');
        
        // 자동 생성 파일명 사용 (한글 포함, 확장자 추가)
        const customFileName = generateAutoFileName(i, files.length);
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const originalFileName = `${customFileName}.${fileExt}`;
        
        console.log('=== File Upload Debug ===');
        console.log('File index:', i);
        console.log('Generated customFileName:', customFileName);
        console.log('File extension:', fileExt);
        console.log('Final originalFileName:', originalFileName);
        console.log('formData.userName:', formData.userName);
        console.log('currentDocument:', currentDocument);
        
        // 원본 파일명(한글 포함)을 API에 전달
        if (originalFileName && originalFileName.trim()) {
          formDataToUpload.append('fileName', originalFileName);
          console.log('fileName appended to FormData:', originalFileName);
        } else {
          console.warn('originalFileName is empty, not appending to FormData');
        }
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
          
          // 원본 파일명을 직접 수집 (state 업데이트와 별도로)
          if (result.originalFileName && result.url) {
            newFileMetadata[result.url] = result.originalFileName;
            console.log('Added to newFileMetadata:', result.url, '->', result.originalFileName);
          }
          
          // state도 업데이트 (UI 동기화용)
          if (result.originalFileName) {
            setFileMetadata(prev => {
              const updated = {
                ...prev,
                [result.url]: result.originalFileName
              };
              console.log('Updated fileMetadata state:', updated);
              return updated;
            });
          }
          
          console.log('File uploaded:', result.url);
          console.log('Original file name:', result.originalFileName);
          console.log('Storage file name:', result.storageFileName);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Upload failed:', errorData);
          const errorMessage = errorData.error || '알 수 없는 오류';
          const hint = errorData.hint || '';
          alert(`파일 업로드 실패: ${errorMessage}\n\n${hint}`);
          // 오류 발생 시 파일 입력 초기화
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
        // 오류 발생 시 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
    }

    // 업로드 완료 후 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 현재 단계에 업로드한 파일 URL 저장
    const currentStepUrls = uploadedFilesByStep[currentDocumentIndex] || [];
    const updatedStepUrls = [...currentStepUrls, ...uploadedUrls];
    setUploadedFilesByStep(prev => ({
      ...prev,
      [currentDocumentIndex]: updatedStepUrls,
    }));

    // 전체 파일 URL 목록 업데이트 (모든 단계의 파일 URL 합치기)
    const allStepUrls: string[] = [];
    Object.values(uploadedFilesByStep).forEach(stepUrls => {
      allStepUrls.push(...stepUrls);
    });
    allStepUrls.push(...uploadedUrls);
    const newFileUrls = [...originalFileUrls, ...allStepUrls];
    
    console.log('=== File upload completed ===');
    console.log('Current step index:', currentDocumentIndex);
    console.log('Uploaded URLs for current step:', uploadedUrls);
    console.log('Total file URLs:', newFileUrls.length);
    
    // formData 업데이트 (fileUrls와 fileMetadata 함께)
    // 기존 fileMetadata와 새로 업로드한 fileMetadata 병합
    // newFileMetadata를 우선 사용 (업로드 응답에서 직접 수집한 데이터)
    const mergedFileMetadata = {
      ...(formData.fileMetadata as Record<string, string> || {}),
      ...newFileMetadata, // 업로드 응답에서 직접 수집한 메타데이터 우선 사용
      ...fileMetadata // state의 메타데이터도 포함
    };
    
    console.log('=== Updating formData with fileMetadata ===');
    console.log('New fileMetadata from upload responses:', newFileMetadata);
    console.log('fileMetadata state:', fileMetadata);
    console.log('Merged fileMetadata:', mergedFileMetadata);
    console.log('Merged fileMetadata keys:', Object.keys(mergedFileMetadata));
    console.log('Merged fileMetadata values:', Object.values(mergedFileMetadata));
    
    updateFormData({ 
      fileUrls: newFileUrls,
      fileMetadata: mergedFileMetadata
    });

    // 로컬 파일 목록도 업데이트 (UI 표시용 - 새로 업로드한 파일만)
    setUploadedFiles((prev) => [...prev, ...files]);
    
    // 파일 업로드 후 즉시 저장 (fileUrls와 fileMetadata 함께 전달)
    if (uploadedUrls.length > 0 && onFileUploaded) {
      console.log('Triggering immediate save after file upload...');
      console.log('Merged fileMetadata to save:', mergedFileMetadata);
      // 약간의 지연을 두어 formData 업데이트가 완료되도록 함
      setTimeout(async () => {
        try {
          // fileMetadata도 함께 전달 (mergedFileMetadata 사용)
          await onFileUploaded(newFileUrls, mergedFileMetadata);
          console.log('File URLs and metadata saved successfully');
        } catch (error) {
          console.error('Failed to save file URLs:', error);
        }
      }, 300);
    }
  };


  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData({ files: newFiles });
    
    // 새로 업로드한 파일을 제거할 때는 fileUrls에서도 제거
    // 새로 업로드한 파일의 URL은 formData.fileUrls의 마지막 부분에 있음
    const currentUrls = formData.fileUrls || [];
    const newFileUrls = currentUrls.slice(0, currentUrls.length - (uploadedFiles.length - newFiles.length));
    updateFormData({ fileUrls: newFileUrls });
    
    // DB에도 저장
    if (onFileUploaded) {
      onFileUploaded(newFileUrls);
    }
  };

  const handleNext = () => {
    // 순차 업로드: 현재 단계가 마지막이 아니면 다음 지원유형으로 이동
    if (!isLastDocument) {
      setCurrentDocumentIndex(prev => prev + 1);
      // 현재 단계의 파일 목록 초기화 (다음 단계로 넘어가므로)
      setUploadedFiles([]);
      return;
    }
    
    // 마지막 단계이면 실제 다음 단계로 이동
    onNext();
  };
  
  const handlePrev = () => {
    // 순차 업로드: 현재 단계가 첫 번째가 아니면 이전 지원유형으로 이동
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(prev => prev - 1);
      // 이전 단계의 파일 목록 표시를 위해 업데이트
      const prevStepUrls = uploadedFilesByStep[currentDocumentIndex - 1] || [];
      setUploadedFiles([]);
      return;
    }
    
    // 첫 번째 단계이면 실제 이전 단계로 이동
    onPrev();
  };

  // 현재 단계에서 업로드한 파일 URL
  const currentStepUrls = uploadedFilesByStep[currentDocumentIndex] || [];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">증빙서류 첨부</h2>

      {/* 진행 상황 표시 */}
      {allRequiredDocuments.length > 1 && (
        <div className="rounded-lg bg-gray-100 p-3">
          <p className="text-sm text-gray-600">
            {currentDocumentIndex + 1} / {allRequiredDocuments.length} 번째 증빙서류
          </p>
        </div>
      )}

      {/* 현재 단계의 증빙서류만 표시 */}
      {currentDocument ? (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="font-semibold text-gray-800">{currentDocument.documentName}</p>
          <p className="mt-1 text-sm text-gray-600">{currentDocument.description}</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {/* 선택된 파일이 없을 때만 파일 선택 버튼 표시 */}
        {selectedFiles.length === 0 && (
          <div className="flex gap-4">
            <button
              onClick={handleCameraClick}
              className="flex-1 rounded-lg bg-green-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 active:scale-95"
            >
              📷 카메라 촬영
            </button>
            <button
              onClick={handleGalleryClick}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              🖼️ 갤러리 선택
            </button>
          </div>
        )}


        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 기존에 업로드된 파일 URL 표시 (편집 모드일 때만 - DB에 저장된 원본 파일만) */}
        {isEditMode && originalFileUrls && originalFileUrls.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">기존 업로드된 파일 ({originalFileUrls.length}개)</p>
            {originalFileUrls.map((url, index) => {
              // file_metadata에서 원본 파일명 가져오기
              const currentFileMetadata = (formData.fileMetadata as Record<string, string>) || {};
              const originalFileName = currentFileMetadata[url] || url.split('/').pop() || `파일 ${index + 1}`;
              
              return (
                <div
                  key={`existing-${index}`}
                  className="flex items-center justify-between rounded-lg border-2 border-blue-200 bg-blue-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      title={originalFileName}
                    >
                      {originalFileName}
                    </a>
                    <span className="text-xs text-gray-500">(기존 파일)</span>
                  </div>
                  <button
                    onClick={() => {
                      // originalFileUrls에서 제거
                      const newOriginalUrls = originalFileUrls.filter((_, i) => i !== index);
                      setOriginalFileUrls(newOriginalUrls);
                      
                      // formData의 fileUrls도 업데이트 (전체 목록에서 해당 URL 제거)
                      const currentUrls = formData.fileUrls || [];
                      const urlToRemove = originalFileUrls[index];
                      const updatedUrls = currentUrls.filter(u => u !== urlToRemove);
                      
                      // file_metadata에서도 해당 URL 제거
                      const updatedFileMetadata = { ...currentFileMetadata };
                      delete updatedFileMetadata[urlToRemove];
                      
                      updateFormData({ 
                        fileUrls: updatedUrls,
                        fileMetadata: updatedFileMetadata
                      });
                      
                      // DB에도 저장 (fileMetadata도 함께 전달)
                      if (onFileUploaded) {
                        onFileUploaded(updatedUrls, updatedFileMetadata);
                      }
                    }}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 현재 단계에서 업로드한 파일 표시 */}
        {currentStepUrls.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">업로드된 파일 ({currentStepUrls.length}개)</p>
            {currentStepUrls.map((url, index) => {
              const fileName = url.split('/').pop() || `파일 ${index + 1}`;
              return (
                <div
                  key={`step-${currentDocumentIndex}-${index}`}
                  className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4"
                >
                  <span className="text-gray-700">{fileName}</span>
                  <button
                    onClick={() => {
                      // 현재 단계의 파일 URL에서 제거
                      const updatedStepUrls = currentStepUrls.filter((_, i) => i !== index);
                      setUploadedFilesByStep(prev => ({
                        ...prev,
                        [currentDocumentIndex]: updatedStepUrls,
                      }));
                      
                      // 전체 파일 URL 목록 재구성
                      const allStepUrls: string[] = [];
                      for (let i = 0; i < allRequiredDocuments.length; i++) {
                        if (i === currentDocumentIndex) {
                          allStepUrls.push(...updatedStepUrls);
                        } else if (uploadedFilesByStep[i]) {
                          allStepUrls.push(...uploadedFilesByStep[i]);
                        }
                      }
                      const updatedAllUrls = [...originalFileUrls, ...allStepUrls];
                      updateFormData({ fileUrls: updatedAllUrls });
                      
                      // DB에도 저장
                      if (onFileUploaded) {
                        onFileUploaded(updatedAllUrls);
                      }
                    }}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 pb-32">
        <button
          onClick={handlePrev}
          className="rounded-full bg-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-300 active:scale-95"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          {isLastDocument ? '다음 단계' : '다음'}
        </button>
      </div>
    </div>
  );
}

