# file_metadata 저장 문제 디버깅 - 파일 요약

## 핵심 문제
`file_metadata`가 빈 객체 `{}`로 저장되고, 관리자 모드에서 UUID 파일명만 표시됨

## 관련 파일 위치

### 1. 프론트엔드 - 파일 업로드 및 메타데이터 수집
**파일**: `components/steps/DocumentUploadStep.tsx`
- **핵심 함수**: `handleFileSelect` (라인 319-458)
- **메타데이터 수집**: `newFileMetadata` 객체에 `{ url: originalFileName }` 저장
- **전달**: `onFileUploaded(newFileUrls, mergedFileMetadata)` 호출

### 2. 업로드 API - originalFileName 반환
**파일**: `app/api/upload/route.ts`
- **핵심 함수**: `POST` (라인 4-174)
- **originalFileName 처리**: `formData.get('fileName')` 또는 `file.name` 사용
- **반환**: `{ url, originalFileName, storageFileName }`

### 3. 프론트엔드 - 파일 저장 함수
**파일**: `components/ApplicationForm.tsx`
- **핵심 함수**: `saveFileUrls` (라인 119-231)
- **파라미터**: `fileUrls: string[]`, `fileMetadata?: Record<string, string>`
- **전달**: `fileMetadata || formData.fileMetadata || {}`를 API에 전달

### 4. POST API - 신청서 생성
**파일**: `app/api/applications/route.ts`
- **핵심 함수**: `POST` (라인 6-164)
- **메타데이터 저장**: `file_metadata: fileMetadata` (라인 85)
- **로그**: `console.log('File Metadata:', fileMetadata)` (라인 46)

### 5. PUT API - 신청서 업데이트
**파일**: `app/api/applications/[id]/route.ts`
- **핵심 함수**: `PUT` (라인 6-119)
- **메타데이터 병합**: 기존 메타데이터와 새 메타데이터 병합 (라인 85-92)
- **저장**: `file_metadata: newFileMetadata` (라인 98)

### 6. 관리자 모드 - 파일 표시
**파일**: `components/admin/ApplicationDetail.tsx`
- **핵심 함수**: `ApplicationDetail` 컴포넌트
- **메타데이터 조회**: `application.file_metadata`에서 원본 파일명 가져오기 (라인 309-359)
- **표시**: `originalFileName` 사용 (라인 378, 398)

## 데이터 플로우

```
1. 사용자 파일 선택
   ↓
2. DocumentUploadStep.handleFileSelect()
   - generateAutoFileName() → "이석_기초수급증명서_20260122224222.jpg"
   - FormData에 fileName 추가
   ↓
3. POST /api/upload
   - formData.get('fileName') 받음
   - UUID 파일명으로 Storage에 저장
   - { url, originalFileName } 반환
   ↓
4. DocumentUploadStep에서 응답 처리
   - newFileMetadata[result.url] = result.originalFileName
   - mergedFileMetadata 생성
   ↓
5. onFileUploaded(newFileUrls, mergedFileMetadata) 호출
   ↓
6. ApplicationForm.saveFileUrls(fileUrls, fileMetadata)
   - fileMetadata를 API에 전달
   ↓
7. POST /api/applications 또는 PUT /api/applications/[id]
   - file_metadata: fileMetadata 저장
   ↓
8. Supabase에 저장
   - file_metadata JSONB 컬럼에 저장되어야 함
   ↓
9. 관리자 모드에서 조회
   - application.file_metadata에서 원본 파일명 가져오기
```

## 확인해야 할 포인트

1. **타이밍 문제**: `onFileUploaded`가 호출될 때 `mergedFileMetadata`가 제대로 전달되는가?
2. **타입 문제**: `fileMetadata`가 JSONB로 저장될 때 형식이 올바른가?
3. **비동기 문제**: `updateFormData`와 `onFileUploaded` 호출 순서가 올바른가?
4. **Supabase 저장**: JSONB 컬럼에 객체를 저장할 때 특별한 처리가 필요한가?

## 디버깅 로그 확인 사항

브라우저 콘솔에서 다음을 확인:
- `Added to newFileMetadata:` - 메타데이터 수집 확인
- `Merged fileMetadata:` - 병합된 메타데이터 확인
- `File Metadata:` (API 로그) - API에 전달되는 메타데이터 확인
- `Inserting data:` 또는 `updateData:` - DB에 저장되는 데이터 확인
