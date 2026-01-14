# Supabase RLS (Row Level Security) 설정 가이드

## 문제 상황

관리자 모드에서 신청 데이터가 보이지 않는 경우, Supabase의 RLS (Row Level Security) 정책 때문일 수 있습니다.

## 해결 방법

### 1. Supabase 대시보드 접속
1. https://supabase.com 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "Table Editor" 클릭

### 2. applications 테이블 확인
1. `applications` 테이블 클릭
2. "Policies" 탭 확인

### 3. RLS 정책 설정

#### 옵션 A: RLS 비활성화 (개발/테스트용)
1. "Table Editor" → `applications` 테이블
2. "Settings" 탭
3. "Enable Row Level Security" 체크 해제
4. 저장

⚠️ **주의**: 프로덕션 환경에서는 보안을 위해 RLS를 활성화하고 적절한 정책을 설정해야 합니다.

#### 옵션 B: 관리자 접근 정책 추가 (권장)

1. `applications` 테이블 → "Policies" 탭
2. "New Policy" 클릭
3. 정책 설정:
   - **Policy Name**: `Allow admin read all`
   - **Allowed Operation**: `SELECT`
   - **Policy Definition**: 
     ```sql
     true
     ```
   - 저장

4. 추가 정책 (필요시):
   - **Policy Name**: `Allow admin insert`
   - **Allowed Operation**: `INSERT`
   - **Policy Definition**: 
     ```sql
     true
     ```

### 4. 서비스 역할 키 사용 (고급)

관리자 모드에서 서비스 역할 키를 사용하면 RLS를 우회할 수 있습니다.

**주의**: 서비스 역할 키는 절대 클라이언트에 노출되면 안 됩니다!

1. Supabase 대시보드 → "Settings" → "API"
2. "service_role" 키 복사
3. 서버 사이드에서만 사용:
   ```typescript
   // lib/supabase/admin.ts (새 파일)
   import { createClient } from '@supabase/supabase-js';
   
   export function createAdminClient() {
     return createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!, // 서비스 역할 키
       {
         auth: {
           autoRefreshToken: false,
           persistSession: false
         }
       }
     );
   }
   ```

### 5. 테스트

1. 신청자 모드에서 테스트 신청 생성
2. 관리자 모드에서 데이터 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 일반적인 오류 메시지

### "new row violates row-level security policy"
- **원인**: RLS 정책이 INSERT를 막고 있음
- **해결**: INSERT 정책 추가 또는 RLS 비활성화

### "permission denied for table applications"
- **원인**: 테이블 접근 권한 없음
- **해결**: RLS 정책 추가 또는 서비스 역할 키 사용

### "relation 'applications' does not exist"
- **원인**: 테이블 이름 오타 또는 테이블이 생성되지 않음
- **해결**: Supabase에서 테이블 생성 확인

## 빠른 해결 (개발 환경)

개발 환경에서 빠르게 테스트하려면:

1. Supabase 대시보드 → Table Editor → applications
2. Settings → "Enable Row Level Security" 체크 해제
3. 저장

이렇게 하면 모든 사용자가 모든 데이터에 접근할 수 있습니다.

## 프로덕션 환경 권장 설정

프로덕션에서는 다음 정책을 권장합니다:

1. **SELECT 정책**: 관리자만 모든 데이터 조회
2. **INSERT 정책**: 인증된 사용자만 신청 생성
3. **UPDATE 정책**: 본인 신청만 수정 가능
4. **DELETE 정책**: 관리자만 삭제 가능

