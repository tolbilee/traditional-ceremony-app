# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입 및 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL과 Anon Key 확인 (Settings > API)

## 2. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 SQL을 실행하세요:

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

## 3. Storage 버킷 생성

1. Supabase 대시보드에서 Storage 메뉴로 이동
2. "New bucket" 클릭
3. 버킷 이름: `documents`
4. Public bucket: **체크** (또는 필요에 따라 비공개)
5. File size limit: 10MB (또는 적절한 크기)
6. Allowed MIME types: `image/*` (또는 필요한 타입)

## 4. Row Level Security (RLS) 설정 (선택사항)

보안을 위해 RLS 정책을 설정할 수 있습니다:

```sql
-- RLS 활성화
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (또는 필요에 따라 수정)
CREATE POLICY "Allow public read access" ON applications
FOR SELECT USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Allow public insert" ON applications
FOR INSERT WITH CHECK (true);

-- 자신의 데이터만 수정 가능 (이름 + 생년월일로 식별)
CREATE POLICY "Allow update own data" ON applications
FOR UPDATE USING (
  user_name = current_setting('app.user_name', true) AND
  birth_date = current_setting('app.birth_date', true)
);
```

## 5. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=documents
```

## 6. 테스트

애플리케이션을 실행하고 신청 프로세스를 테스트해보세요:

```bash
npm run dev
```
