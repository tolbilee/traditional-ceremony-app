'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApplicationFormData, SupportType, RequiredDocument } from '@/types';
import { REQUIRED_DOCUMENTS } from '@/lib/utils/constants';

interface DocumentUploadStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onFileUploaded?: (fileUrls: string[]) => Promise<void>; // 파일 업로드 후 저장을 위한 콜백
  doljanchiSubType?: 'doljanchi' | 'welfare_facility' | 'orphanage';
}

export default function DocumentUploadStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  onFileUploaded,
  doljanchiSubType,
}: DocumentUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(formData.files || []);
  
  // 기존에 DB에 저장된 파일 URL 목록 (수정 모드에서만 사용)
  // 초기 로드 시 formData.fileUrls를 originalFileUrls로 설정
  const [originalFileUrls, setOriginalFileUrls] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 초기 로드 시 originalFileUrls 설정 (한 번만)
  useEffect(() => {
    if (!isInitialized && formData.fileUrls && formData.fileUrls.length > 0) {
      setOriginalFileUrls([...formData.fileUrls]);
      setIsInitialized(true);
    }
  }, [formData.fileUrls, isInitialized]);
  
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
  
  // 선택된 모든 지원유형의 증빙서류 목록 가져오기
  const getAllRequiredDocuments = () => {
    if (formData.type === 'doljanchi') {
      if (doljanchiSubType === 'doljanchi') {
        // 4-6-1) 돌잔치: 4-3-1)에서 선택한 지원유형에 따라 증빙서류 목록 모두 표시
        // 한부모가족은 필수이므로 항상 포함
        const documents: RequiredDocument[] = [REQUIRED_DOCUMENTS.doljanchi];
        const addedTypes = new Set<SupportType>(['doljanchi']); // 이미 추가된 타입 추적
        
        console.log('[DocumentUploadStep] 돌잔치 - 선택된 지원유형:', doljanchiSelectedSupportTypes);
        
        // 추가로 선택된 지원유형의 증빙서류 (중복 방지)
        doljanchiSelectedSupportTypes.forEach(type => {
          console.log('[DocumentUploadStep] 돌잔치 - 처리 중인 타입:', type, '이미 추가됨:', addedTypes.has(type));
          // 'doljanchi'는 이미 추가되었으므로 제외하고, 중복 방지
          if (type !== 'doljanchi' && !addedTypes.has(type) && REQUIRED_DOCUMENTS[type]) {
            console.log('[DocumentUploadStep] 돌잔치 - 증빙서류 추가:', type, REQUIRED_DOCUMENTS[type]);
            documents.push(REQUIRED_DOCUMENTS[type]);
            addedTypes.add(type);
          }
        });
        
        console.log('[DocumentUploadStep] 돌잔치 - 최종 증빙서류 목록:', documents);
        return documents;
      } else {
        // 4-6-2) 찾아가는 돌잔치: 복수 선택된 지원유형에 따라 증빙서류 목록 모두 표시
        const documents: RequiredDocument[] = [];
        const addedTypes = new Set<SupportType>(); // 이미 추가된 타입 추적
        
        // 기본 증빙서류 (복지시설 또는 영아원)
        if (supportType === 'doljanchi_welfare_facility') {
          documents.push(REQUIRED_DOCUMENTS.doljanchi_welfare_facility);
          addedTypes.add('doljanchi_welfare_facility');
        } else if (supportType === 'doljanchi_orphanage') {
          documents.push(REQUIRED_DOCUMENTS.doljanchi_orphanage);
          addedTypes.add('doljanchi_orphanage');
        }
        
        // 추가로 선택된 지원유형의 증빙서류 (중복 방지)
        doljanchiSelectedSupportTypes.forEach(type => {
          // 기본 타입과 중복되지 않도록 확인
          if (type !== 'doljanchi_welfare_facility' && type !== 'doljanchi_orphanage' && !addedTypes.has(type) && REQUIRED_DOCUMENTS[type]) {
            documents.push(REQUIRED_DOCUMENTS[type]);
            addedTypes.add(type);
          }
        });
        
        return documents;
      }
    } else {
      // 전통혼례: 복수 선택된 모든 지원유형의 증빙서류 (중복 방지)
      const documents: RequiredDocument[] = [];
      const addedTypes = new Set<SupportType>(); // 이미 추가된 타입 추적
      
      console.log('[DocumentUploadStep] 전통혼례 - 선택된 지원유형:', selectedSupportTypes);
      
      selectedSupportTypes.forEach(type => {
        console.log('[DocumentUploadStep] 전통혼례 - 처리 중인 타입:', type, '이미 추가됨:', addedTypes.has(type), '증빙서류 존재:', !!REQUIRED_DOCUMENTS[type]);
        if (!addedTypes.has(type) && REQUIRED_DOCUMENTS[type]) {
          console.log('[DocumentUploadStep] 전통혼례 - 증빙서류 추가:', type, REQUIRED_DOCUMENTS[type]);
          documents.push(REQUIRED_DOCUMENTS[type]);
          addedTypes.add(type);
        }
      });
      
      console.log('[DocumentUploadStep] 전통혼례 - 최종 증빙서류 목록:', documents);
      return documents;
    }
  };
  
  const allRequiredDocuments = getAllRequiredDocuments();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 파일을 즉시 업로드하고 URL 받기
    const uploadedUrls: string[] = [];
    for (const file of files) {
      try {
        const formDataToUpload = new FormData();
        formDataToUpload.append('file', file);
        formDataToUpload.append('type', formData.type || 'wedding');
        
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
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
      }
    }

    // 새로 업로드된 URL만 추가 (기존 URL은 유지)
    // originalFileUrls는 수정 모드에서 DB에 저장된 원본 파일들
    // uploadedUrls는 방금 업로드한 새 파일들
    const newFileUrls = [...originalFileUrls, ...uploadedUrls];
    
    console.log('=== File upload completed ===');
    console.log('Original file URLs (from DB):', originalFileUrls);
    console.log('Newly uploaded URLs:', uploadedUrls);
    console.log('Total file URLs:', newFileUrls.length);
    
    // formData 업데이트
    updateFormData({ fileUrls: newFileUrls });

    // 로컬 파일 목록도 업데이트 (UI 표시용 - 새로 업로드한 파일만)
    setUploadedFiles((prev) => [...prev, ...files]);
    
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
    
    // input 초기화
    if (e.target) {
      e.target.value = '';
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
    // 파일 첨부는 선택사항으로 변경 (필수 아님)
    // if (uploadedFiles.length === 0) {
    //   alert('증빙서류를 최소 1개 이상 첨부해주세요.');
    //   return;
    // }
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">증빙서류 첨부</h2>

      {allRequiredDocuments.length > 0 ? (
        <div className="space-y-3">
          {allRequiredDocuments.map((doc, index) => (
            <div key={index} className="rounded-lg bg-blue-50 p-4">
              <p className="font-semibold text-gray-800">{doc.documentName}</p>
              <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 기존에 업로드된 파일 URL 표시 (수정 모드 - DB에 저장된 원본 파일만) */}
        {originalFileUrls && originalFileUrls.length > 0 && (
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

        {/* 새로 추가된 파일 표시 (방금 업로드한 파일들) */}
        {newlyUploadedUrls.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">새로 추가된 파일 ({newlyUploadedUrls.length}개)</p>
            {newlyUploadedUrls.map((url, index) => {
              const fileName = url.split('/').pop() || `파일 ${index + 1}`;
              return (
                <div
                  key={`new-${index}`}
                  className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4"
                >
                  <span className="text-gray-700">{fileName}</span>
                  <button
                    onClick={() => {
                      // newlyUploadedUrls에서 제거
                      const updatedNewUrls = newlyUploadedUrls.filter((_, i) => i !== index);
                      // 전체 fileUrls 업데이트 (originalFileUrls + updatedNewUrls)
                      const updatedAllUrls = [...originalFileUrls, ...updatedNewUrls];
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

