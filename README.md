# 2026 한국의 집 전통혼례 및 돌잔치 온라인 신청 시스템

사회적 배려 대상자를 위한 전통혼례 및 돌잔치 온라인 신청 모바일 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend/DB**: Supabase (PostgreSQL, Storage, Auth)
- **Animation**: Framer Motion
- **PDF**: jsPDF, jsPDF-AutoTable
- **Date Handling**: date-fns
- **Validation**: Zod
- **Deployment**: Netlify

## 주요 기능

### 1. 사용자 기능
- **인트로 화면**: 부드러운 애니메이션으로 시작
- **메인 화면**: 전통혼례/돌잔치 선택
- **온라인 신청 프로세스**:
  1. 날짜 및 시간 선택 (2026년 일요일만 선택 가능)
  2. 지원 유형 선택 (기초수급자, 다문화, 장애인, 한부모, 고령자)
  3. 신청서 작성 (성명, 생년월일, 연락처, 주소 등)
  4. 증빙서류 첨부 (카메라 촬영 또는 갤러리 선택)
  5. 동의서 확인 및 제출
- **나의 신청내역**: 이름 + 생년월일(6자리)로 조회 및 수정

### 2. 관리자 기능 (구현 예정)
- 신청자 목록 조회
- 신청서 상세 보기
- PDF 출력 기능

## 프로젝트 구조

```
traditional-ceremony-app/
├── app/                    # Next.js App Router
│   ├── apply/[type]/      # 신청 페이지
│   ├── my-applications/   # 신청내역 조회
│   ├── api/               # API 라우트
│   └── layout.tsx         # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── steps/            # 신청 단계별 컴포넌트
│   ├── IntroScreen.tsx   # 인트로 화면
│   ├── MainScreen.tsx    # 메인 화면
│   └── ...
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트 설정
│   └── utils/            # 유틸리티 함수
├── types/                 # TypeScript 타입 정의
└── public/               # 정적 파일
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**서비스 역할 키 확인 방법:**
- Supabase 대시보드 → Settings → API → "service_role" 키
- ⚠️ 이 키는 절대 클라이언트에 노출되면 안 됩니다!

### 3. Supabase 데이터베이스 설정

Supabase 대시보드에서 다음 테이블을 생성하세요:

```sql
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
```

Storage 버킷 생성:
- 버킷 이름: `documents`
- Public: true (또는 필요에 따라 false)

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 5. 빌드 및 배포

```bash
npm run build
npm start
```

Netlify에 배포할 경우:
1. GitHub 저장소에 코드 푸시
2. Netlify에서 새 사이트 생성
3. 저장소 연결 및 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 환경 변수 추가

## 주요 특징

### 접근성
- 큰 터치 영역 (최소 44x44px)
- 고대비 색상 사용
- 명확한 라벨 및 안내 문구
- 단순한 UI/UX

### 모바일 최적화
- 반응형 디자인
- 터치 친화적 인터페이스
- 카메라 직접 촬영 지원

### 보안
- 비회원 인증 (이름 + 생년월일)
- Supabase RLS (Row Level Security) 정책 권장
- 파일 업로드 검증

## 향후 개발 계획

- [ ] 관리자 대시보드 구현
- [ ] PDF 생성 기능 구현
- [ ] 신청 수정 기능 구현
- [ ] 이메일 알림 기능
- [ ] 다국어 지원 (한국어, 영어, 중국어 등)

## 라이선스

이 프로젝트는 내부 사용을 위한 것입니다.
