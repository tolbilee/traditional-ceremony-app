'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApplicationFormData, SupportType, RequiredDocument, WeddingApplicationData } from '@/types';
import { REQUIRED_DOCUMENTS, WEDDING_SPECIAL_DOCUMENTS, VISITING_DOLJANCHI_SPECIAL_DOCUMENTS } from '@/lib/utils/constants';

interface DocumentUploadStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onFileUploaded?: (fileUrls: string[]) => Promise<void>; // 파일 업로드 후 저장을 위한 콜백
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
  
  // 선택된 파일 목록 (업로드 전)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // 각 파일에 대한 사용자 지정 파일명
  const [fileNames, setFileNames] = useState<Record<number, string>>({});
  
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
  const sanitizeFileName = (fileName: string): string => {
    // 1. Windows에서 파일명에 사용할 수 없는 문자 제거: < > : " / \ | ? *
    let sanitized = fileName.replace(/[<>:"/\\|?*]/g, '');
    
    // 2. 공백을 언더스코어로 변환 (Supabase Storage 키에서 공백은 문제가 될 수 있음)
    sanitized = sanitized.replace(/\s+/g, '_');
    
    // 3. 연속된 언더스코어를 하나로 통합
    sanitized = sanitized.replace(/_+/g, '_');
    
    // 4. 앞뒤 언더스코어 제거
    sanitized = sanitized.replace(/^_+|_+$/g, '');
    
    // 5. 한글과 특수문자가 포함된 경우, URL-safe하게 인코딩
    // 하지만 Supabase Storage는 한글을 직접 지원하지 않을 수 있으므로
    // 한글을 제거하거나 영문/숫자/언더스코어/하이픈만 허용
    // 한글 유니코드 범위: \uAC00-\uD7A3
    // 영문, 숫자, 언더스코어, 하이픈, 점만 허용
    sanitized = sanitized.replace(/[^\w\-.]/g, '');
    
    return sanitized.trim();
  };

  // 자동 파일명 생성 함수
  const generateAutoFileName = (index: number = 0, totalFiles: number = 1): string => {
    const parts: string[] = [];
    
    // 1. 신청자 이름
    const userName = formData.userName?.trim() || '';
    if (userName) {
      parts.push(sanitizeFileName(userName));
    }
    
    // 2. 증빙서류명
    const documentName = currentDocument?.documentName?.trim() || '';
    if (documentName) {
      parts.push(sanitizeFileName(documentName));
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
    
    return parts.join('_');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // 파일 선택 후 파일명 입력을 위해 파일 목록 저장
    setSelectedFiles(files);
    
    // 각 파일의 자동 생성 파일명 설정
    const initialFileNames: Record<number, string> = {};
    files.forEach((file, index) => {
      // 자동 생성 파일명 사용
      initialFileNames[index] = generateAutoFileName(index, files.length);
    });
    setFileNames(initialFileNames);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    // 파일을 업로드하고 URL 받기
    const uploadedUrls: string[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const formDataToUpload = new FormData();
        formDataToUpload.append('file', file);
        formDataToUpload.append('type', formData.type || 'wedding');
        
        // 파일명 지정: fileNames에 저장된 파일명이 있으면 사용, 없으면 자동 생성
        let customFileName = fileNames[i];
        
        if (!customFileName || customFileName.trim() === '') {
          // 파일명이 지정되지 않았으면 자동 생성
          customFileName = generateAutoFileName(i, selectedFiles.length);
        }
        
        // 파일명 정리 (특수문자 제거)
        customFileName = sanitizeFileName(customFileName);
        
        if (customFileName && customFileName.trim()) {
          formDataToUpload.append('fileName', customFileName);
        }
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToUpload,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
          console.log('File uploaded:', result.url);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Upload failed:', errorData);
          const errorMessage = errorData.error || '알 수 없는 오류';
          const hint = errorData.hint || '';
          alert(`파일 업로드 실패: ${errorMessage}\n\n${hint}`);
          return; // 오류 발생 시 중단
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
        return; // 오류 발생 시 중단
      }
    }

    // 업로드 완료 후 선택된 파일 목록 초기화
    setSelectedFiles([]);
    setFileNames({});
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
    for (let i = 0; i <= currentDocumentIndex; i++) {
      if (uploadedFilesByStep[i]) {
        allStepUrls.push(...uploadedFilesByStep[i]);
      }
    }
    // 현재 단계의 새로 업로드한 파일 추가
    allStepUrls.push(...uploadedUrls);
    
    // 기존 파일 URL과 합치기
    const newFileUrls = [...originalFileUrls, ...allStepUrls];
    
    console.log('=== File upload completed ===');
    console.log('Current step index:', currentDocumentIndex);
    console.log('Uploaded URLs for current step:', uploadedUrls);
    console.log('Total file URLs:', newFileUrls.length);
    
    // formData 업데이트
    updateFormData({ fileUrls: newFileUrls });

    // 로컬 파일 목록도 업데이트 (UI 표시용 - 새로 업로드한 파일만)
    setUploadedFiles((prev) => [...prev, ...selectedFiles]);
    
    // 파일 업로드 후 즉시 저장 (fileUrls를 직접 전달)
    if (uploadedUrls.length > 0 && onFileUploaded) {
      console.log('Triggering immediate save after file upload...');
      // 약간의 지연을 두어 formData 업데이트가 완료되도록 함
      setTimeout(async () => {
        try {
          await onFileUploaded(newFileUrls);
          console.log('File URLs saved successfully');
        } catch (error) {
          console.error('Failed to save file URLs:', error);
        }
      }, 300);
    }
  };

  const handleCancelFileSelection = () => {
    setSelectedFiles([]);
    setFileNames({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

        {/* 선택된 파일이 있을 때 파일명 입력 및 업로드 */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                선택된 파일 ({selectedFiles.length}개)
              </h3>
              <button
                onClick={handleCancelFileSelection}
                className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-600"
              >
                취소
              </button>
            </div>
            
            {selectedFiles.map((file, index) => {
              const autoFileName = generateAutoFileName(index, selectedFiles.length);
              return (
                <div key={index} className="space-y-2 rounded-lg bg-white p-3">
                  <p className="text-sm font-medium text-gray-700">
                    원본 파일명: {file.name}
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      저장할 파일명 (선택사항)
                    </label>
                    <input
                      type="text"
                      value={fileNames[index] || ''}
                      placeholder={autoFileName}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      onChange={(e) => {
                        setFileNames(prev => ({
                          ...prev,
                          [index]: e.target.value,
                        }));
                      }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      파일명을 지정하지 않으면 자동으로 생성됩니다. 형식: [이름]_[증빙서류명]_[날짜시간]. 확장자는 자동으로 추가됩니다.
                    </p>
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={handleUploadFiles}
              className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              📤 파일 업로드
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
              const fileName = url.split('/').pop() || `파일 ${index + 1}`;
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
                    >
                      {fileName}
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
                      updateFormData({ fileUrls: updatedUrls });
                      // DB에도 저장
                      if (onFileUploaded) {
                        onFileUploaded(updatedUrls);
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

