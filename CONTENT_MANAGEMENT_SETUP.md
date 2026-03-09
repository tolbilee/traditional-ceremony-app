# 콘텐츠 관리 시스템 설정 가이드

## 개요

전통혼례와 돌잔치 콘텐츠를 관리자 페이지에서 수정할 수 있도록 설정되었습니다.

## 1. 데이터베이스 마이그레이션

먼저 Supabase에서 콘텐츠 관리 테이블을 생성해야 합니다.

### 마이그레이션 실행

1. Supabase 대시보드 접속
2. SQL Editor로 이동
3. `migrations/create_content_table.sql` 파일의 내용을 실행

또는 직접 SQL Editor에서 다음을 실행:

```sql
-- migrations/create_content_table.sql 파일 내용 실행
```

## 2. 관리자 페이지 접속

1. `/admin/login`에서 관리자 로그인
2. 관리자 대시보드에서 **"콘텐츠 관리"** 버튼 클릭
3. 또는 `/admin/content`로 직접 접속

## 3. 콘텐츠 편집 방법

### 페이지 선택
- **전통혼례**: 전통혼례 관련 콘텐츠 편집
- **돌잔치**: 돌잔치 관련 콘텐츠 편집

### 섹션별 편집
각 페이지는 다음 섹션으로 구성됩니다:

#### 전통혼례
- **모집개요**: 모집 인원, 일시, 모집 대상, 지원 내용 등
- **전통혼례 안내**: 진행 순서별 제목, 시간, 설명
- **장소안내**: 장소명, 주소, 설명
- **식사안내**: 식사 제목, 부제목, 설명, 하객 수

#### 돌잔치
- **모집개요**: TYPE 1, TYPE 2별 정보
- **돌잔치 안내**: 진행 순서별 제목, 시간, 설명
- **장소안내**: 장소명, 주소, 설명, 찾아가는 돌잔치 정보
- **식사·답례품**: 식사 정보, 떡케이크, 답례떡 정보

### 편집 및 저장
1. 원하는 섹션 선택
2. 각 필드의 내용 수정
3. **"저장"** 버튼 클릭

## 4. API 엔드포인트

### 콘텐츠 조회
```
GET /api/content?page_type=wedding&section=overview
```

### 콘텐츠 업데이트 (관리자만)
```
PUT /api/content
Content-Type: application/json

{
  "page_type": "wedding",
  "section": "overview",
  "updates": {
    "recruitment_count": "60팀 선정",
    "schedule_time": "매주 일요일 12시 / 15시"
  }
}
```

## 5. 프론트엔드 페이지 연동 (향후 작업)

현재는 관리자 페이지에서 콘텐츠를 편집할 수 있지만, 
실제 사용자 페이지(`/wedding/program`, `/doljanchi/program`)는 아직 하드코딩된 콘텐츠를 사용합니다.

동적 콘텐츠로 변경하려면:
1. 각 페이지에서 `/api/content` API를 호출하여 콘텐츠를 가져옴
2. 하드코딩된 텍스트를 API에서 가져온 데이터로 대체

## 6. 초기 콘텐츠 입력

관리자 페이지에서 콘텐츠를 처음 입력할 때는:
1. 각 섹션별로 필드를 하나씩 입력
2. 또는 SQL을 통해 초기 데이터를 일괄 입력

초기 데이터 입력 예시:
```sql
INSERT INTO content (page_type, section, field_key, field_value, field_type, display_order)
VALUES 
  ('wedding', 'overview', 'recruitment_count', '60팀 선정', 'text', 1),
  ('wedding', 'overview', 'schedule_time', '매주 일요일 12시 / 15시', 'text', 2),
  ...
```

## 7. 주의사항

- 콘텐츠 수정은 관리자만 가능합니다
- 저장 전에 내용을 확인하세요
- HTML 태그가 포함된 콘텐츠는 `field_type`을 `html`로 설정할 수 있습니다
- JSON 형태의 복잡한 데이터는 `field_type`을 `json`으로 설정하세요

## 8. 문제 해결

### 콘텐츠가 표시되지 않는 경우
1. 데이터베이스에 해당 필드가 있는지 확인
2. API 응답 확인 (브라우저 개발자 도구 Network 탭)
3. 관리자 인증 상태 확인

### 저장이 안 되는 경우
1. 관리자 로그인 상태 확인
2. 필수 필드(`page_type`, `section`, `updates`) 확인
3. 서버 로그 확인
