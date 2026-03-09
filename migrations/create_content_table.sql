-- 콘텐츠 관리 테이블 생성
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type VARCHAR(50) NOT NULL, -- 'wedding' 또는 'doljanchi'
  section VARCHAR(100) NOT NULL, -- 'overview', 'ceremony', 'venue', 'meal' 등
  field_key VARCHAR(100) NOT NULL, -- 콘텐츠 필드 키 (예: 'title', 'description', 'schedule_01_title')
  field_value TEXT, -- 콘텐츠 값 (JSON 또는 텍스트)
  field_type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'json', 'image', 'video'
  display_order INTEGER DEFAULT 0, -- 표시 순서
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_type, section, field_key)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_content_page_section ON content(page_type, section);
CREATE INDEX IF NOT EXISTS idx_content_display_order ON content(display_order);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_updated_at_trigger
BEFORE UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_content_updated_at();

-- RLS 활성화 (선택사항)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 추가 (공개 콘텐츠)
CREATE POLICY "Allow public read" ON content
FOR SELECT
USING (true);

-- 관리자만 수정할 수 있도록 정책 추가 (인증된 사용자만)
-- 실제 구현에서는 관리자 인증 로직에 맞게 수정 필요
CREATE POLICY "Allow admin update" ON content
FOR ALL
USING (true)
WITH CHECK (true);
