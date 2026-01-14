# Supabase Storage 설정 가이드

## 증빙서류 파일 업로드가 작동하지 않는 경우

### 1. Storage 버킷 생성 확인

1. Supabase 대시보드 접속
2. 왼쪽 메뉴에서 **"Storage"** 클릭
3. 버킷 목록 확인
4. `documents` 버킷이 없으면 생성:
   - **"New bucket"** 클릭
   - **Name**: `documents` (정확히 이 이름)
   - **Public bucket**: ✅ 체크 (반드시 체크!)
   - **File size limit**: 10MB (또는 적절한 크기)
   - **Allowed MIME types**: `image/*` (또는 필요한 타입)
   - **"Create bucket"** 클릭

### 2. Storage RLS 정책 설정

Storage 버킷도 RLS 정책이 필요합니다!

#### 2-1. Storage RLS 정책 확인

1. Storage 메뉴에서 `documents` 버킷 클릭
2. **"Policies"** 탭 클릭
3. 정책이 없으면 추가 필요

#### 2-2. INSERT 정책 추가 (파일 업로드 허용)

1. **"New Policy"** 클릭
2. 정책 설정:
   - **Policy Name**: `Allow public upload`
   - **Allowed Operation**: `INSERT`
   - **Policy Definition**:
     ```sql
     true
     ```
   - **"Review"** → **"Save policy"**

#### 2-3. SELECT 정책 추가 (파일 조회 허용)

1. **"New Policy"** 클릭
2. 정책 설정:
   - **Policy Name**: `Allow public read`
   - **Allowed Operation**: `SELECT`
   - **Policy Definition**:
     ```sql
     true
     ```
   - **"Review"** → **"Save policy"**

#### 2-4. UPDATE 정책 추가 (파일 수정 허용, 선택사항)

1. **"New Policy"** 클릭
2. 정책 설정:
   - **Policy Name**: `Allow public update`
   - **Allowed Operation**: `UPDATE`
   - **Policy Definition**:
     ```sql
     true
     ```
   - **"Review"** → **"Save policy"**

#### 2-5. DELETE 정책 추가 (파일 삭제 허용, 선택사항)

1. **"New Policy"** 클릭
2. 정책 설정:
   - **Policy Name**: `Allow public delete`
   - **Allowed Operation**: `DELETE`
   - **Policy Definition**:
     ```sql
     true
     ```
   - **"Review"** → **"Save policy"**

### 3. 빠른 해결 (개발 환경)

개발 환경에서 빠르게 테스트하려면:

1. Storage 메뉴 → `documents` 버킷
2. **"Settings"** 탭
3. **"Public bucket"** 체크 확인
4. **"Policies"** 탭에서 모든 정책이 `true`로 설정되어 있는지 확인

### 4. 환경 변수 확인

`.env.local` 파일에 다음이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
```

### 5. 테스트 방법

1. 브라우저 개발자 도구(F12) 열기
2. Console 탭 확인
3. 파일 업로드 시도
4. 에러 메시지 확인:
   - "Bucket not found" → 버킷 생성 필요
   - "new row violates row-level security" → RLS 정책 추가 필요
   - "permission denied" → 정책 권한 확인 필요

### 6. 일반적인 오류 해결

#### "Bucket not found"
- **원인**: Storage 버킷이 생성되지 않음
- **해결**: `documents` 버킷 생성

#### "new row violates row-level security policy"
- **원인**: Storage RLS 정책이 INSERT를 막고 있음
- **해결**: INSERT 정책 추가 (위 2-2 참조)

#### "permission denied for bucket"
- **원인**: 버킷이 private이거나 정책이 없음
- **해결**: 버킷을 public으로 설정하고 정책 추가

#### "File size exceeds limit"
- **원인**: 파일 크기가 제한을 초과
- **해결**: 버킷 설정에서 파일 크기 제한 증가

### 7. 프로덕션 환경 권장 설정

프로덕션에서는 보안을 위해 더 엄격한 정책을 권장합니다:

```sql
-- INSERT: 인증된 사용자만 업로드
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- SELECT: 모든 사용자가 조회 가능 (이미지 공개)
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');
```

### 8. 디버깅 팁

1. **브라우저 콘솔 확인**: 파일 업로드 시 에러 메시지 확인
2. **Supabase 로그 확인**: 대시보드 → Logs → API Logs
3. **Storage 파일 확인**: Storage → documents 버킷에서 파일 확인
4. **네트워크 탭 확인**: 개발자 도구 → Network 탭에서 API 요청 확인
