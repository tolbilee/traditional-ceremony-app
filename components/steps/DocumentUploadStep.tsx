'use client';

import { useState, useRef } from 'react';
import { ApplicationFormData } from '@/types';
import { REQUIRED_DOCUMENTS } from '@/lib/utils/constants';
import BackButton from '../BackButton';

interface DocumentUploadStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function DocumentUploadStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: DocumentUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(formData.files || []);

  const supportType = formData.supportType;
  const requiredDoc = supportType ? REQUIRED_DOCUMENTS[supportType] : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    updateFormData({ files: [...uploadedFiles, ...files] });
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

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">첨부된 파일 ({uploadedFiles.length}개)</p>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
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

      <div className="flex justify-between pt-6 pb-24">
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
      
      <BackButton onClick={onPrev} />
    </div>
  );
}
