# 🚀 초보자를 위한 완벽한 설치 가이드

코딩 지식 없이도 따라할 수 있는 단계별 가이드입니다.

---

## 📋 준비물 체크리스트

- [ ] 인터넷 연결
- [ ] 이메일 주소 (Supabase, Netlify 가입용)
- [ ] GitHub 계정 (또는 GitLab, Bitbucket)

---

## 1단계: Supabase 계정 만들기 및 프로젝트 생성

### 1-1. Supabase 가입하기

1. 웹 브라우저를 열고 https://supabase.com 접속
2. 오른쪽 위 **"Start your project"** 또는 **"Sign in"** 클릭
3. **"Sign up"** 클릭
4. GitHub 계정으로 가입하거나 이메일로 가입
   - GitHub로 가입: "Continue with GitHub" 클릭 → GitHub 로그인
   - 이메일로 가입: 이메일과 비밀번호 입력 → 확인 이메일 확인

### 1-2. 새 프로젝트 만들기

1. Supabase 대시보드에서 **"New Project"** 버튼 클릭
2. 다음 정보 입력:
   - **Name**: `traditional-ceremony` (원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (꼭 기억하세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국에 가까운 곳)
   - **Pricing Plan**: Free 선택
3. **"Create new project"** 클릭
4. 프로젝트 생성 완료까지 2-3분 대기

### 1-3. API 키 확인하기

1. 프로젝트가 생성되면 왼쪽 메뉴에서 **"Settings"** (톱니바퀴 아이콘) 클릭
2. **"API"** 메뉴 클릭
3. 다음 두 가지를 복사해서 메모장에 저장:
   - **Project URL**: `https://xxxxx.supabase.co` 형태
   - **anon public** 키: 긴 문자열 (JWT 토큰)

---

## 2단계: 데이터베이스 테이블 만들기

### 2-1. SQL Editor 열기

1. Supabase 대시보드 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 2-2. SQL 코드 복사 및 실행

1. 아래 코드를 모두 복사합니다:

```sql
-- applications 테이블 생성
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('wedding', 'doljanchi')),
  user_name VARCHAR(100) NOT NULL,
  birth_date VARCHAR(6) NOT NULL,
  schedule_1 JSONB NOT NULL,
  schedule_2 JSONB,
  support_type VARCHAR(50) NOT NULL,
  application_data JSONB NOT NULL,
  consent_status BOOLEAN NOT NULL DEFAULT false,
  file_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_applications_user ON applications(user_name, birth_date);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

2. SQL Editor의 빈 칸에 붙여넣기
3. 오른쪽 아래 **"Run"** 버튼 클릭 (또는 Ctrl+Enter)
4. "Success. No rows returned" 메시지 확인

---

## 3단계: 파일 저장소(Storage) 만들기

### 3-1. Storage 메뉴 열기

1. 왼쪽 메뉴에서 **"Storage"** 클릭
2. **"Create a new bucket"** 버튼 클릭

### 3-2. 버킷 설정

1. 다음 정보 입력:
   - **Name**: `documents` (정확히 이 이름으로!)
   - **Public bucket**: ✅ 체크 (체크박스 클릭)
2. **"Create bucket"** 클릭

---

## 4단계: 환경 변수 파일 만들기

### 4-1. 프로젝트 폴더 찾기

1. 파일 탐색기 열기 (Windows 키 + E)
2. 다음 경로로 이동:
   ```
   C:\Users\tolbi\traditional-ceremony-app
   ```

### 4-2. 환경 변수 파일 만들기

1. `traditional-ceremony-app` 폴더 안에서 마우스 오른쪽 클릭
2. **"새로 만들기"** → **"텍스트 문서"** 클릭
3. 파일 이름을 `.env.local`로 변경
   - ⚠️ 주의: `.txt` 확장자를 지우고 `.env.local`로 정확히 입력
   - "확장자를 변경하면 파일을 사용할 수 없게 될 수 있습니다" 경고가 나오면 **"예"** 클릭

### 4-3. 환경 변수 입력

1. `.env.local` 파일을 메모장으로 열기
2. 아래 내용을 복사해서 붙여넣기 (괄호 안의 값은 1-3단계에서 복사한 값으로 교체):

```
NEXT_PUBLIC_SUPABASE_URL=https://여기에-프로젝트-URL-붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에-anon-키-붙여넣기
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
SUPABASE_SERVICE_ROLE_KEY=여기에-service-role-키-붙여넣기
```

**서비스 역할 키 확인 방법:**
1. Supabase 대시보드 → **Settings** → **API**
2. **"service_role"** 키 복사 (⚠️ 절대 공개하지 마세요!)
3. 위의 환경 변수에 추가

**예시:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
```

3. 파일 저장 (Ctrl+S)

---

## 5단계: 프로그램 실행하기

### 5-1. 터미널(명령 프롬프트) 열기

1. Windows 키 누르기
2. "cmd" 또는 "PowerShell" 입력
3. **"명령 프롬프트"** 또는 **"Windows PowerShell"** 클릭

### 5-2. 프로젝트 폴더로 이동

터미널에 다음 명령어 입력 후 Enter:

```bash
cd C:\Users\tolbi\traditional-ceremony-app
```

### 5-3. 프로그램 실행

다음 명령어 입력 후 Enter:

```bash
npm run dev
```

**처음 실행 시:**
- 다운로드가 시작되면 기다리기 (2-5분 소요)
- "ready" 또는 "Local: http://localhost:3000" 메시지가 나오면 성공!

### 5-4. 웹사이트 확인하기

1. 웹 브라우저 열기
2. 주소창에 입력: `http://localhost:3000`
3. 인트로 화면이 보이면 성공! 🎉

---

## 6단계: GitHub에 업로드하기 (배포 전 준비)

### 6-1. GitHub 계정 만들기

1. https://github.com 접속
2. **"Sign up"** 클릭
3. 사용자 이름, 이메일, 비밀번호 입력
4. 이메일 인증 완료

### 6-2. 새 저장소 만들기

1. GitHub에 로그인
2. 오른쪽 위 **"+"** 클릭 → **"New repository"** 클릭
3. 다음 정보 입력:
   - **Repository name**: `traditional-ceremony-app`
   - **Description**: "전통혼례 및 돌잔치 신청 시스템"
   - **Public** 선택
   - **"Create repository"** 클릭

### 6-3. Git 설치 확인

터미널에서 다음 명령어 입력:

```bash
git --version
```

**만약 "git을 찾을 수 없습니다" 오류가 나면:**
1. https://git-scm.com/download/win 접속
2. "Download for Windows" 클릭
3. 다운로드한 파일 실행하여 설치 (모두 기본 설정으로 Next 클릭)
4. 컴퓨터 재시작

### 6-4. 코드 업로드하기

터미널에서 다음 명령어들을 순서대로 입력 (각각 Enter):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tolbilee/traditional-ceremony-app.git
git push -u origin main
```

**주의:** `당신의-사용자명` 부분을 실제 GitHub 사용자 이름으로 변경하세요!

---

## 7단계: Netlify에 배포하기

### 7-1. Netlify 가입하기

1. https://www.netlify.com 접속
2. **"Sign up"** 클릭
3. GitHub 계정으로 가입 (권장)

### 7-2. 사이트 만들기

1. Netlify 대시보드에서 **"Add new site"** 클릭
2. **"Import an existing project"** 클릭
3. **"GitHub"** 클릭
4. GitHub 로그인 및 권한 승인
5. `traditional-ceremony-app` 저장소 선택
6. 다음 설정 확인:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
7. **"Deploy site"** 클릭

### 7-3. 환경 변수 설정

1. 배포가 시작되면 **"Site settings"** 클릭
2. 왼쪽 메뉴에서 **"Environment variables"** 클릭
3. **"Add a variable"** 클릭하여 다음 3개 추가:

   **변수 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: (Supabase에서 복사한 Project URL)

   **변수 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (Supabase에서 복사한 anon key)

   **변수 3:**
   - Key: `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
   - Value: `documents`

4. 각 변수 입력 후 **"Save"** 클릭

### 7-4. 재배포하기

1. **"Deploys"** 탭 클릭
2. **"Trigger deploy"** → **"Deploy site"** 클릭
3. 배포 완료 대기 (2-5분)

### 7-5. 사이트 확인하기

1. 배포 완료 후 제공된 URL 클릭 (예: `https://random-name-123.netlify.app`)
2. 웹사이트가 정상 작동하는지 확인!

---

## ✅ 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 테이블 생성 완료
- [ ] Storage 버킷 생성 완료
- [ ] `.env.local` 파일 생성 및 환경 변수 입력 완료
- [ ] 로컬에서 `npm run dev` 실행 성공
- [ ] GitHub에 코드 업로드 완료
- [ ] Netlify에 배포 완료
- [ ] 배포된 사이트 정상 작동 확인

---

## 🆘 문제 해결

### "npm을 찾을 수 없습니다" 오류
- Node.js가 설치되지 않았습니다
- https://nodejs.org 접속하여 LTS 버전 다운로드 및 설치
- 설치 후 컴퓨터 재시작

### "포트 3000이 이미 사용 중입니다" 오류
- 다른 프로그램이 3000번 포트를 사용 중
- 터미널에서 `Ctrl+C`로 서버 중지 후 다시 시작

### 환경 변수 오류
- `.env.local` 파일이 정확한 위치에 있는지 확인
- 파일 이름이 `.env.local`인지 확인 (`.env.local.txt` 아님!)
- Supabase URL과 키가 정확히 복사되었는지 확인

### 배포 실패
- Netlify의 빌드 로그 확인 (Deploys 탭 → 실패한 배포 클릭)
- 환경 변수가 모두 설정되었는지 확인
- GitHub 저장소가 Public인지 확인

---

## 📞 추가 도움이 필요하시면

각 단계에서 막히는 부분이 있으면:
1. 어떤 단계에서 문제가 발생했는지
2. 정확한 오류 메시지
3. 스크린샷 (가능하면)

이 정보를 알려주시면 더 구체적으로 도와드릴 수 있습니다!

