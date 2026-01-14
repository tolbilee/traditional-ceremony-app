'use client';

import { useState, useRef } from 'react';
import { ApplicationFormData } from '@/types';
import { REQUIRED_DOCUMENTS } from '@/lib/utils/constants';
import BottomNavigationBar from '../BottomNavigationBar';

interface DocumentUploadStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onFileUploaded?: (fileUrls: string[]) => Promise<void>; // 파일 업로드 후 저장을 위한 콜백
}

export default function DocumentUploadStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  onFileUploaded,
}: DocumentUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(formData.files || []);

  const supportType = formData.supportType;
  const requiredDoc = supportType ? REQUIRED_DOCUMENTS[supportType] : null;

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

    // 업로드된 URL을 fileUrls에 추가
    const existingUrls = formData.fileUrls || [];
    const newFileUrls = [...existingUrls, ...uploadedUrls];
    
    console.log('=== File upload completed ===');
    console.log('Uploaded URLs:', uploadedUrls);
    console.log('Existing URLs:', existingUrls);
    console.log('New total file URLs:', newFileUrls.length);
    
    // formData 업데이트
    updateFormData({ fileUrls: newFileUrls });

    // 로컬 파일 목록도 업데이트 (UI 표시용)
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
  };

  const handleRemoveExistingFile = (index: number) => {
    const newFileUrls = formData.fileUrls?.filter((_, i) => i !== index) || [];
    updateFormData({ fileUrls: newFileUrls });
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

      {requiredDoc && (
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="font-semibold text-gray-800">{requiredDoc.documentName}</p>
          <p className="mt-1 text-sm text-gray-600">{requiredDoc.description}</p>
        </div>
      )}

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

        {/* 기존에 업로드된 파일 URL 표시 (수정 모드) */}
        {formData.fileUrls && formData.fileUrls.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">기존 업로드된 파일 ({formData.fileUrls.length}개)</p>
            {formData.fileUrls.map((url, index) => {
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
                    onClick={() => handleRemoveExistingFile(index)}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 새로 추가된 파일 표시 */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">새로 추가된 파일 ({uploadedFiles.length}개)</p>
            {uploadedFiles.map((file, index) => (
              <div
                key={`new-${index}`}
                className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-4"
              >
                <span className="text-gray-700">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            ))}
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
      
      <BottomNavigationBar />
    </div>
  );
}

