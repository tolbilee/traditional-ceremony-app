# 문제 해결 가이드

## 데이터가 Supabase에 저장되지 않는 경우

### 1. 브라우저 콘솔 확인

1. 브라우저에서 F12 키를 눌러 개발자 도구 열기
2. "Console" 탭 클릭
3. 신청을 다시 시도
4. 빨간색 에러 메시지 확인
5. 에러 메시지를 복사해서 확인

### 2. Supabase RLS 정책 확인 (가장 흔한 원인)

**RLS가 활성화되어 있으면 데이터 저장이 실패합니다.**

#### 빠른 해결 (개발/테스트용)

1. Supabase 대시보드 접속: https://supabase.com
2. 프로젝트 선택
3. 왼쪽 메뉴 → "Table Editor"
4. `applications` 테이블 클릭
5. "Settings" 탭 클릭
6. **"Enable Row Level Security" 체크 해제**
7. 저장

#### 프로덕션용 정책 설정

1. `applications` 테이블 → "Policies" 탭
2. "New Policy" 클릭
3. 정책 설정:
   - **Policy Name**: `Allow public insert`
   - **Allowed Operation**: `INSERT`
   - **Policy Definition**: 
     ```sql
     true
     ```
4. 저장

### 3. 환경 변수 확인

`.env.local` 파일에 다음이 올바르게 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
```

**중요**: 
- `NEXT_PUBLIC_` 접두사가 있어야 합니다
- 값에 따옴표가 없어야 합니다
- 공백이 없어야 합니다

### 4. Supabase 테이블 구조 확인

`applications` 테이블이 다음 컬럼을 가지고 있는지 확인:

- `id` (UUID, Primary Key, Auto-generated)
- `type` (text)
- `user_name` (text)
- `birth_date` (text)
- `schedule_1` (jsonb)
- `schedule_2` (jsonb, nullable)
- `support_type` (text)
- `application_data` (jsonb)
- `consent_status` (boolean)
- `file_urls` (text[], nullable)
- `created_at` (timestamp, Auto-generated)
- `updated_at` (timestamp, nullable)

### 5. 네트워크 탭 확인

1. 브라우저 개발자 도구 → "Network" 탭
2. 신청 제출
3. `/api/applications` 요청 찾기
4. 클릭하여 상세 정보 확인
5. "Response" 탭에서 서버 응답 확인
6. "Headers" 탭에서 요청 데이터 확인

### 6. 일반적인 오류 메시지

#### "new row violates row-level security policy"
- **원인**: RLS 정책이 INSERT를 막고 있음
- **해결**: RLS 비활성화 또는 INSERT 정책 추가

#### "permission denied for table applications"
- **원인**: 테이블 접근 권한 없음
- **해결**: RLS 정책 추가 또는 서비스 역할 키 사용

#### "relation 'applications' does not exist"
- **원인**: 테이블이 생성되지 않음
- **해결**: Supabase에서 테이블 생성

#### "invalid input syntax for type jsonb"
- **원인**: JSON 데이터 형식 오류
- **해결**: application_data 필드 형식 확인

### 7. 로컬 테스트

로컬에서 테스트하려면:

```bash
npm run dev
```

터미널에서 서버 로그를 확인하세요. 상세한 디버깅 정보가 출력됩니다.

### 8. Supabase 로그 확인

1. Supabase 대시보드 → "Logs" → "API Logs"
2. 최근 요청 확인
3. 에러 메시지 확인

## 여전히 해결되지 않는 경우

1. 브라우저 콘솔의 전체 에러 메시지 복사
2. 서버 로그 (터미널)의 에러 메시지 복사
3. Supabase 대시보드의 에러 메시지 확인
4. 위 정보를 모두 모아서 확인

