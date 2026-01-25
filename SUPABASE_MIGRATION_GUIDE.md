# Supabase에서 deleted_at 컬럼 추가하기

## 📋 단계별 가이드

### 1단계: Supabase 대시보드 접속
1. 웹 브라우저를 엽니다
2. 주소창에 입력: `https://supabase.com/dashboard`
3. 로그인합니다 (이메일과 비밀번호)

### 2단계: 프로젝트 선택
1. 대시보드에서 **프로젝트 목록**이 보입니다
2. **traditional-ceremony-app** 프로젝트를 클릭합니다
   - 또는 해당 프로젝트 이름을 클릭합니다

### 3단계: SQL Editor 열기
1. 왼쪽 사이드바 메뉴를 확인합니다
2. **"SQL Editor"** 메뉴를 찾아 클릭합니다
   - 아이콘: 📝 또는 "SQL Editor" 텍스트
3. SQL Editor 페이지가 열립니다

### 4단계: 새 쿼리 작성
1. SQL Editor 화면에서 **"New query"** 버튼을 클릭합니다
   - 또는 빈 쿼리 입력창이 보이면 바로 입력합니다

### 5단계: SQL 코드 복사 및 붙여넣기
아래 SQL 코드를 **전체 복사**합니다:

```sql
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON applications(deleted_at);

COMMENT ON COLUMN applications.deleted_at IS 'Timestamp when the application was moved to trash. NULL means the application is active.';
```

2. SQL Editor의 입력창에 **붙여넣기** (Ctrl + V)

### 6단계: SQL 실행
1. SQL 코드가 입력창에 잘 들어갔는지 확인합니다
2. 화면 하단 또는 우측 상단의 **"Run"** 버튼을 클릭합니다
   - 또는 **Ctrl + Enter** 키를 누릅니다

### 7단계: 실행 결과 확인
1. 실행이 완료되면 아래에 결과가 표시됩니다
2. 성공 메시지가 보이면 완료입니다!
   - 예: "Success. No rows returned" 또는 "Success"

### 8단계: 확인 (선택사항)
1. 왼쪽 메뉴에서 **"Table Editor"** 클릭
2. **"applications"** 테이블 클릭
3. 컬럼 목록에서 **"deleted_at"** 컬럼이 추가되었는지 확인

---

## ✅ 완료 후 할 일

1. **브라우저에서 어드민 대시보드 새로고침**
   - `http://localhost:3000/admin/dashboard` 접속
   - F5 또는 Ctrl + R로 새로고침

2. **삭제 기능 테스트**
   - 신청서 목록에서 삭제 버튼 클릭
   - 휴지통으로 이동되는지 확인

---

## ⚠️ 문제 해결

### "permission denied" 오류가 나는 경우
- Supabase 대시보드에서 올바른 프로젝트를 선택했는지 확인
- 프로젝트 소유자 권한이 있는지 확인

### "table does not exist" 오류가 나는 경우
- 테이블 이름이 정확한지 확인 (소문자: `applications`)
- Table Editor에서 테이블이 존재하는지 확인

### SQL이 실행되지 않는 경우
- SQL 코드 전체가 선택되어 있는지 확인
- 세미콜론(;)이 있는지 확인
- SQL Editor가 올바르게 열렸는지 확인

---

## 📝 참고

- `IF NOT EXISTS` 옵션이 있어서 이미 컬럼이 있어도 오류가 나지 않습니다
- 여러 번 실행해도 안전합니다
- 이 SQL은 데이터를 삭제하지 않고 컬럼만 추가합니다
