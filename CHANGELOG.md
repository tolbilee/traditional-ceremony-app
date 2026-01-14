# 변경 사항 (Changelog)

## master_plan.md 기준 전체 수정 완료

### ✅ 완료된 작업

1. **지원 유형 수정**
   - 북한이탈주민, 국가유공자 추가
   - 한부모, 고령자 제거
   - 증빙서류 목록 업데이트

2. **메인 화면 개선**
   - 각 섹션에 4개 메뉴 추가
   - 전통혼례: 온라인 신청, 프로그램 소개, 공연 및 이벤트 소개, 식사메뉴 소개
   - 돌잔치: 온라인 신청, 프로그램 소개, 이벤트 소개, 식사메뉴 소개
   - 각 메뉴별 페이지 생성

3. **신청 프로세스 재구성**
   - 5단계 → 6단계로 변경
   - 개인정보이용동의서를 별도 단계로 분리
   - 순서: 날짜 지정 → 지원유형 선택 → 신청서 작성 → 개인정보이용동의서 → 증빙서류 첨부 → 신청 완료

4. **신청서 필드 구체화**
   - 전통혼례 (7-1): 신랑/신부 정보, 대표 정보, 대상 구분, 신청동기 등
   - 돌잔치 (7-3): 부/모 정보, 아이 정보, 대표 정보, 혼인 여부, 자녀 양육여부 등
   - 각 필드에 대한 검증 로직 추가

5. **개인정보이용동의서 구현**
   - master_plan 7-2 형식으로 구현
   - 개인정보 수집·이용 동의
   - 민감정보 수집 및 이용 동의
   - 날짜 및 성명 자동 기입

6. **수정 모드 구현**
   - 기존 입력값을 빨간색으로 표시
   - 수정 페이지 라우팅
   - 업데이트 API 구현
   - 증빙서류 삭제/추가 기능

7. **기타 개선사항**
   - 타입 정의 개선 (WeddingApplicationData, DoljanchiApplicationData)
   - 에러 처리 개선
   - 사용자 경험 개선

### 📝 주요 변경 파일

- `types/index.ts`: 타입 정의 업데이트
- `lib/utils/constants.ts`: 지원 유형 및 증빙서류 업데이트
- `components/MainScreen.tsx`: 메뉴 구조 변경
- `components/ApplicationForm.tsx`: 프로세스 재구성
- `components/steps/ApplicationDataStep.tsx`: 신청서 필드 구체화
- `components/steps/PrivacyConsentStep.tsx`: 새로 생성
- `components/steps/CompletionStep.tsx`: 새로 생성
- `app/api/applications/[id]/route.ts`: 수정 API 추가

### 🎯 다음 단계 (선택사항)

- 관리자 대시보드 구현
- PDF 생성 기능 구현
- 콘텐츠 페이지 내용 작성
- 추가 테스트 및 버그 수정

