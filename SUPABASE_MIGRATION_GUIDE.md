# Supabase 마이그레이션 가이드

## file_metadata 필드 추가 마이그레이션

이 가이드는 `applications` 테이블에 `file_metadata` JSONB 필드를 추가하는 마이그레이션을 실행하는 방법을 설명합니다.

---

## 1단계: Supabase 대시보드 접속

1. 웹 브라우저에서 [Supabase](https://supabase.com) 접속
2. 로그인 (이메일/비밀번호 또는 GitHub 계정)
3. 프로젝트 목록에서 해당 프로젝트 클릭

---

## 2단계: SQL Editor 열기

1. 왼쪽 사이드바에서 **"SQL Editor"** 메뉴 클릭
   - 또는 상단 메뉴에서 **"SQL Editor"** 선택
2. SQL Editor 페이지가 열리면 빈 쿼리 편집기가 표시됩니다

---

## 3단계: 마이그레이션 SQL 복사

프로젝트의 `migrations/add_file_metadata.sql` 파일을 열어서 전체 내용을 복사합니다:

```sql
-- Add file_metadata column to applications table
-- This column stores original file names mapped to storage URLs
-- Format: JSONB object with { "storage_url": "original_filename.jpg" }

ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS file_metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_file_metadata ON applications USING GIN (file_metadata);

-- Comment
COMMENT ON COLUMN applications.file_metadata IS 'Maps storage file URLs to original file names. Format: {"storage_url": "original_filename.jpg"}';
```

**복사 방법:**
- 파일을 메모장이나 텍스트 에디터로 열기
- 전체 내용 선택 (Ctrl+A)
- 복사 (Ctrl+C)

---

## 4단계: SQL Editor에 붙여넣기

1. Supabase SQL Editor의 빈 쿼리 편집기 영역 클릭
2. 복사한 SQL 코드 붙여넣기 (Ctrl+V)
3. 코드가 올바르게 붙여넣어졌는지 확인

---

## 5단계: SQL 실행

### 방법 1: Run 버튼 클릭
1. SQL Editor 오른쪽 하단에 있는 **"Run"** 버튼 클릭
   - 또는 키보드 단축키: **Ctrl+Enter** (Windows/Linux) 또는 **Cmd+Enter** (Mac)

### 방법 2: 키보드 단축키 사용
- **Ctrl+Enter** (Windows/Linux)
- **Cmd+Enter** (Mac)

---

## 6단계: 실행 결과 확인

### 성공적인 경우:
- 오른쪽 하단에 **"Success. No rows returned"** 또는 **"Success"** 메시지 표시
- 초록색 체크 표시 아이콘과 함께 성공 메시지가 나타납니다

### 오류가 발생한 경우:
- 빨간색 오류 메시지가 표시됩니다
- 오류 메시지를 확인하고 문제를 해결해야 합니다

**일반적인 오류:**
- `column "file_metadata" already exists`: 이미 필드가 존재하는 경우 (정상, 무시 가능)
- `permission denied`: 권한 문제 (RLS 정책 확인 필요)

---

## 7단계: 테이블 구조 확인 (선택사항)

마이그레이션이 성공했는지 확인하려면:

1. 왼쪽 사이드바에서 **"Table Editor"** 클릭
2. **"applications"** 테이블 선택
3. 테이블 구조에서 `file_metadata` 컬럼이 추가되었는지 확인

또는 SQL Editor에서 다음 쿼리 실행:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
AND column_name = 'file_metadata';
```

---

## 8단계: 인덱스 확인 (선택사항)

인덱스가 제대로 생성되었는지 확인:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'applications'
AND indexname = 'idx_applications_file_metadata';
```

---

## 문제 해결

### 문제 1: "permission denied" 오류

**원인:** RLS(Row Level Security) 정책으로 인한 권한 문제

**해결 방법:**
1. 왼쪽 사이드바에서 **"Authentication"** → **"Policies"** 클릭
2. `applications` 테이블의 RLS 정책 확인
3. 필요시 RLS를 일시적으로 비활성화하거나 적절한 정책 추가

또는 서비스 역할 키를 사용하여 마이그레이션 실행:
1. **"Settings"** → **"API"** 메뉴로 이동
2. **"service_role"** 키 복사
3. SQL Editor에서 서비스 역할 키로 연결하여 실행

### 문제 2: "column already exists" 오류

**원인:** 이미 `file_metadata` 컬럼이 존재

**해결 방법:**
- 이 오류는 무시해도 됩니다 (IF NOT EXISTS 구문 사용)
- 마이그레이션이 이미 완료된 상태입니다

### 문제 3: SQL Editor가 응답하지 않음

**해결 방법:**
1. 페이지 새로고침 (F5)
2. 다른 브라우저에서 시도
3. Supabase 대시보드 상태 확인: https://status.supabase.com

---

## 마이그레이션 완료 후

마이그레이션이 성공적으로 완료되면:

1. ✅ `file_metadata` JSONB 필드가 `applications` 테이블에 추가됨
2. ✅ 인덱스가 생성되어 쿼리 성능이 향상됨
3. ✅ 새로운 파일 업로드 시 원본 파일명이 자동으로 저장됨
4. ✅ 기존 데이터는 빈 객체 `{}`로 초기화됨

---

## 추가 참고사항

### file_metadata 구조

```json
{
  "https://storage.supabase.co/.../file1.jpg": "이석필_가족관계증명서_20260122.jpg",
  "https://storage.supabase.co/.../file2.jpg": "이석필_기초수급증명서_20260122.jpg"
}
```

### 기존 데이터 마이그레이션 (필요한 경우)

기존 `file_urls`가 있는 경우, 원본 파일명을 추출하여 `file_metadata`에 추가할 수 있습니다:

```sql
-- 주의: 이 쿼리는 예시이며, 실제 데이터 구조에 맞게 수정이 필요합니다
UPDATE applications
SET file_metadata = jsonb_build_object(
  file_urls[1], '기존파일명1.jpg',
  file_urls[2], '기존파일명2.jpg'
)
WHERE file_urls IS NOT NULL AND array_length(file_urls, 1) > 0;
```

---

## 다음 단계

마이그레이션 완료 후:

1. 애플리케이션에서 파일 업로드 테스트
2. 업로드된 파일의 원본 파일명이 올바르게 저장되는지 확인
3. 다운로드 시 원본 파일명이 사용되는지 확인

---

## 도움이 필요하신가요?

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/tables)
- [PostgreSQL JSONB 문서](https://www.postgresql.org/docs/current/datatype-json.html)
