# 🔐 관리자 모드 구현 가이드

## 📋 개요

관리자 모드는 신청자 데이터를 확인하고 관리할 수 있는 웹 인터페이스입니다.

---

## 🎯 구현 목표

1. **신청자 목록 조회**: 모든 신청 내역을 한눈에 확인
2. **신청서 상세 보기**: 개별 신청서의 모든 정보 확인
3. **PDF 출력 기능**: A4 사이즈 문서로 신청서 출력
4. **검색 및 필터링**: 날짜, 유형, 상태별 검색

---

## 📝 단계별 구현 가이드

### 1단계: 관리자 인증 시스템 구축

#### 1-1. 관리자 계정 관리 방법 선택

**옵션 A: Supabase Auth 사용 (권장)**
- Supabase 대시보드에서 관리자 계정 생성
- 이메일/비밀번호 로그인
- RLS 정책으로 관리자만 접근 가능

**옵션 B: 간단한 비밀번호 인증**
- 환경 변수에 관리자 비밀번호 저장
- 간단한 로그인 폼으로 인증
- 세션/쿠키로 관리

**옵션 C: IP 화이트리스트 (가장 간단)**
- 특정 IP에서만 접근 가능
- 별도 로그인 불필요

#### 1-2. 관리자 라우트 생성

```
app/
  admin/
    login/
      page.tsx          # 관리자 로그인 페이지
    dashboard/
      page.tsx          # 대시보드 (신청자 목록)
    applications/
      [id]/
        page.tsx        # 신청서 상세 보기
        pdf/
          route.ts      # PDF 생성 API
```

---

### 2단계: 관리자 대시보드 (신청자 목록)

#### 2-1. 필요한 기능

- [ ] 신청자 목록 표시 (테이블 형태)
- [ ] 페이지네이션 (한 페이지에 20-50개씩)
- [ ] 정렬 기능 (날짜순, 이름순)
- [ ] 필터링 (전통혼례/돌잔치, 지원유형)
- [ ] 검색 기능 (이름, 전화번호)
- [ ] 신청 상태 표시 (신청완료, 검토중, 승인, 반려)

#### 2-2. 데이터 구조

```typescript
// 관리자용 신청자 목록 데이터
interface AdminApplicationListItem {
  id: string;
  type: 'wedding' | 'doljanchi';
  user_name: string;
  birth_date: string;
  support_type: string;
  schedule_1: Schedule;
  created_at: string;
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected';
}
```

#### 2-3. UI 구성

```
┌─────────────────────────────────────┐
│  관리자 대시보드                      │
├─────────────────────────────────────┤
│ [필터] [검색] [정렬]                  │
├─────────────────────────────────────┤
│ ID | 유형 | 이름 | 날짜 | 상태 | [보기]│
│ ...                                  │
├─────────────────────────────────────┤
│ [이전] [1] [2] [3] ... [다음]        │
└─────────────────────────────────────┘
```

---

### 3단계: 신청서 상세 보기

#### 3-1. 필요한 정보 표시

**기본 정보:**
- 신청 ID
- 신청 유형 (전통혼례/돌잔치)
- 신청일시
- 신청 상태

**신청자 정보:**
- 이름, 생년월일
- 전화번호, 주소, 이메일
- 지원 유형

**일정 정보:**
- 1순위 날짜 및 시간
- 2순위 날짜 및 시간

**신청서 내용:**
- 전통혼례: 신랑/신부 정보, 대상 구분, 신청동기
- 돌잔치: 부/모/아이 정보, 혼인 여부, 신청동기

**증빙서류:**
- 업로드된 파일 목록
- 파일 미리보기 및 다운로드

**동의서:**
- 개인정보 동의 여부
- 민감정보 동의 여부

#### 3-2. 액션 버튼

- [ ] PDF 출력하기
- [ ] 상태 변경 (승인/반려)
- [ ] 수정 요청 전화하기
- [ ] 삭제 (신중하게)

---

### 4단계: PDF 생성 기능

#### 4-1. PDF 라이브러리 선택

이미 설치된 라이브러리:
- `jspdf`: PDF 생성
- `jspdf-autotable`: 테이블 생성

#### 4-2. PDF 템플릿 설계

**A4 사이즈 (210mm x 297mm)**
- 배경 이미지/템플릿 (선택사항)
- 신청 데이터를 지정된 좌표에 배치

**필요한 정보:**
- 신청서 양식 (별첨 7-1, 7-3)
- 개인정보이용동의서 (별첨 7-2)

#### 4-3. PDF 생성 API

```
GET /admin/applications/[id]/pdf
```

**구현 방법:**
1. 서버 사이드에서 PDF 생성
2. 신청 데이터를 템플릿에 맞게 배치
3. PDF 파일로 변환하여 반환

---

### 5단계: 보안 설정

#### 5-1. 접근 제어

- [ ] 관리자만 접근 가능하도록 미들웨어 설정
- [ ] RLS 정책 설정 (Supabase)
- [ ] 환경 변수로 관리자 정보 관리

#### 5-2. API 보안

- [ ] 관리자 인증 확인
- [ ] Rate limiting (과도한 요청 방지)
- [ ] 로그 기록

---

## 🛠️ 구현 순서 추천

### Phase 1: 기본 구조 (1-2일)
1. 관리자 로그인 페이지
2. 관리자 대시보드 레이아웃
3. 기본 인증 시스템

### Phase 2: 목록 및 상세 (2-3일)
4. 신청자 목록 조회
5. 신청서 상세 보기
6. 검색 및 필터링

### Phase 3: PDF 기능 (2-3일)
7. PDF 템플릿 디자인
8. PDF 생성 API
9. PDF 다운로드 기능

### Phase 4: 고급 기능 (선택사항)
10. 상태 관리 (승인/반려)
11. 통계 대시보드
12. 엑셀 내보내기

---

## 📁 파일 구조 예시

```
app/
  admin/
    layout.tsx                    # 관리자 레이아웃 (인증 체크)
    login/
      page.tsx                    # 로그인 페이지
    dashboard/
      page.tsx                    # 대시보드 (목록)
    applications/
      [id]/
        page.tsx                  # 상세 보기
        pdf/
          route.ts                # PDF 생성 API
    api/
      applications/
        route.ts                  # 관리자용 API (목록 조회)
        [id]/
          route.ts                # 관리자용 API (상세, 수정)

components/
  admin/
    AdminLayout.tsx               # 관리자 레이아웃 컴포넌트
    ApplicationList.tsx           # 신청자 목록 테이블
    ApplicationDetail.tsx         # 신청서 상세 보기
    PDFGenerator.tsx              # PDF 생성 컴포넌트
    StatusBadge.tsx               # 상태 뱃지
    SearchFilter.tsx              # 검색 및 필터

lib/
  admin/
    auth.ts                       # 관리자 인증 로직
    pdf/
      template.ts                 # PDF 템플릿
      generator.ts                # PDF 생성 함수
```

---

## 🔑 핵심 구현 포인트

### 1. 인증 시스템

**간단한 방법 (비밀번호 기반):**
```typescript
// lib/admin/auth.ts
export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
```

**Supabase Auth 사용:**
- Supabase 대시보드에서 관리자 계정 생성
- 이메일/비밀번호로 로그인
- 세션 관리

### 2. 데이터 조회

```typescript
// app/admin/api/applications/route.ts
export async function GET(request: NextRequest) {
  // 관리자 인증 확인
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  return NextResponse.json({ data });
}
```

### 3. PDF 생성

```typescript
// lib/admin/pdf/generator.ts
import jsPDF from 'jspdf';

export function generateApplicationPDF(application: Application): Blob {
  const doc = new jsPDF();
  
  // 배경 이미지 (선택사항)
  // doc.addImage(backgroundImage, 'PNG', 0, 0, 210, 297);
  
  // 신청 데이터 배치
  doc.setFontSize(12);
  doc.text(`신청자: ${application.user_name}`, 20, 30);
  // ... 더 많은 필드
  
  return doc.output('blob');
}
```

---

## 📊 데이터베이스 확장 (선택사항)

### 신청 상태 관리

```sql
-- applications 테이블에 status 컬럼 추가
ALTER TABLE applications 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending';

-- 상태 값: pending, reviewing, approved, rejected
```

---

## 🎨 UI/UX 고려사항

### 관리자 화면 특징
- **데스크톱 최적화**: 관리자는 주로 PC에서 사용
- **명확한 정보 표시**: 테이블 형태로 많은 정보 표시
- **빠른 액션**: 자주 사용하는 기능을 쉽게 접근

### 반응형 디자인
- 데스크톱: 전체 기능
- 태블릿: 주요 기능
- 모바일: 간단한 조회만

---

## ✅ 체크리스트

### 필수 기능
- [ ] 관리자 로그인
- [ ] 신청자 목록 조회
- [ ] 신청서 상세 보기
- [ ] PDF 출력

### 선택 기능
- [ ] 신청 상태 관리
- [ ] 검색 및 필터링
- [ ] 통계 대시보드
- [ ] 엑셀 내보내기
- [ ] 알림 기능

---

## 🚀 빠른 시작 (최소 구현)

가장 빠르게 시작하려면:

1. **간단한 비밀번호 인증** 구현
2. **신청자 목록 페이지** 생성
3. **신청서 상세 페이지** 생성
4. **PDF 생성 API** 구현

이 4가지만 구현해도 기본적인 관리자 모드가 완성됩니다!

---

## 📞 다음 단계

원하시는 구현 방식을 알려주시면:
- 구체적인 코드 작성
- 단계별 상세 가이드
- 특정 기능 우선 구현

어떤 방식으로 진행할까요?
