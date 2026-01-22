# file_metadata 저장 문제 디버깅 요청

## 문제 상황

Next.js 16.1.1 + Supabase를 사용하는 전통의식 신청 앱에서 `file_metadata`가 데이터베이스에 저장되지 않는 문제가 발생하고 있습니다.

### 증상
1. 파일 업로드 시 `file_metadata`가 빈 객체 `{}`로 저장됨
2. 관리자 모드에서 파일명이 UUID 형식(`1769093575636_cbb686a9e854.jpg`)으로 표시됨
3. 예상되는 한글 파일명 형식: `[신청자이름]_[증빙서류명]_[날짜시간].확장자` (예: `이석_기초수급증명서_20260122224222.jpg`)

### 기대 동작
1. 파일 업로드 시 `file_metadata`에 `{ "storage_url": "original_filename.jpg" }` 형식으로 저장
2. 관리자 모드에서 `file_metadata`를 조회하여 한글 파일명 표시
3. 파일 다운로드 시 원본 한글 파일명 사용

## 기술 스택
- Next.js 16.1.1 (App Router)
- TypeScript
- Supabase (PostgreSQL + Storage)
- React 18

## 데이터베이스 스키마

```sql
-- applications 테이블
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS file_metadata JSONB DEFAULT '{}'::jsonb;
```

`file_metadata`는 JSONB 타입이며, 형식은 다음과 같습니다:
```json
{
  "https://...supabase.co/storage/v1/object/public/documents/wedding/1769093575636_cbb686a9e854.jpg": "이석_기초수급증명서_20260122224222.jpg",
  "https://...supabase.co/storage/v1/object/public/documents/wedding/1769093581234_abc123def456.jpg": "이석_장애인 등록증 또는 복지카드_20260122224234.jpg"
}
```

## 파일 업로드 플로우

1. **프론트엔드 (DocumentUploadStep.tsx)**
   - 파일 선택 시 `generateAutoFileName()`으로 한글 파일명 생성
   - `FormData`에 `fileName` 필드로 전달
   - `/api/upload`로 POST 요청
   - 응답에서 `result.originalFileName`과 `result.url`을 받아 `newFileMetadata` 객체에 저장
   - `onFileUploaded` 콜백으로 `fileUrls`와 `fileMetadata` 전달

2. **업로드 API (app/api/upload/route.ts)**
   - `formData.get('fileName')`으로 한글 파일명 받음
   - UUID 기반 파일명으로 Supabase Storage에 저장
   - 응답에 `originalFileName`과 `url` 반환

3. **저장 API (app/api/applications/route.ts 또는 [id]/route.ts)**
   - `formData.fileMetadata`를 받아서 DB에 저장
   - `file_metadata: fileMetadata`로 저장

## 확인된 문제점

1. **POST API (신청서 생성)**: `fileMetadata`를 받아서 저장하지만 실제로는 빈 객체로 저장됨
2. **PUT API (신청서 업데이트)**: `fileMetadata`를 받아서 병합하지만 실제로는 빈 객체로 저장됨
3. **프론트엔드**: `newFileMetadata`를 수집하고 `onFileUploaded`에 전달하지만 DB에 저장되지 않음

## 디버깅 로그 확인 사항

브라우저 콘솔에서 다음 로그들을 확인했습니다:
- `Added to newFileMetadata:` - 파일 업로드 후 메타데이터 수집 확인
- `Merged fileMetadata:` - 병합된 메타데이터 확인
- `File Metadata:` - API에 전달되는 메타데이터 확인

하지만 실제 DB에는 빈 객체로 저장됩니다.

## 요청 사항

다음 파일들을 검토하여 `file_metadata`가 제대로 저장되지 않는 원인을 찾아주세요:

1. `components/steps/DocumentUploadStep.tsx` - 파일 업로드 및 메타데이터 수집 로직
2. `app/api/upload/route.ts` - 업로드 API에서 originalFileName 반환
3. `components/ApplicationForm.tsx` - saveFileUrls 함수에서 fileMetadata 전달
4. `app/api/applications/route.ts` - POST API에서 file_metadata 저장
5. `app/api/applications/[id]/route.ts` - PUT API에서 file_metadata 업데이트
6. `components/admin/ApplicationDetail.tsx` - 관리자 모드에서 file_metadata 조회

특히 다음을 확인해주세요:
- `fileMetadata`가 올바르게 전달되는지
- Supabase에 저장될 때 JSONB 형식이 올바른지
- 타입 변환 문제가 없는지
- 비동기 처리 타이밍 문제가 없는지

## 추가 정보

- Supabase 클라이언트는 `@/lib/supabase/server`에서 생성
- JSONB 컬럼에 저장할 때 특별한 변환이 필요한지 확인 필요
- Next.js API Route에서 JSONB 저장 시 주의사항 확인 필요
