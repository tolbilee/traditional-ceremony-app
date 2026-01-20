// 애플리케이션 타입 정의

export type CeremonyType = 'wedding' | 'doljanchi'; // 혼례 / 돌잔치

export type SupportType =
  | 'basic_livelihood' // 기초수급자
  | 'near_poor' // 차상위계층
  | 'multicultural' // 다문화가정
  | 'disabled' // 장애인
  | 'north_korean_defector' // 북한이탈주민
  | 'national_merit' // 국가유공자
  | 'doljanchi' // 돌잔치
  | 'doljanchi_welfare_facility' // 찾아가는 돌잔치(복지시설)
  | 'doljanchi_orphanage'; // 찾아가는 돌잔치(영아원)

export type TimeSlot = '12:00' | '15:00' | '17:00' | '협의 후 결정';

export interface Schedule {
  date: string; // YYYY-MM-DD 형식
  time: TimeSlot;
}

// 전통혼례 신청서 데이터 (7-1)
export interface WeddingApplicationData {
  // 참가자 정보
  groom: {
    name: string;
    birthDate: string; // YYMMDD
    nationality: string;
  };
  bride: {
    name: string;
    birthDate: string; // YYMMDD
    nationality: string;
  };
  representative: {
    address: string;
    phone: string;
    email: string;
  };
  supportType: string; // 자동 입력
  documentSubmitted: boolean; // 자동 입력
  
  // 진행 정보
  targetCategory: 'pre_marriage' | 'married_no_ceremony_no_registration' | 'married_no_ceremony_registered' | 'other';
  preferredDateTime: string; // 자동 입력
  applicationReason: string; // 최대 1,000자
}

// 돌잔치 신청서 데이터 (7-3)
export interface DoljanchiApplicationData {
  // 참가자 정보
  parent: {
    name: string;
    birthDate: string; // YYMMDD
    gender: 'male' | 'female';
  };
  child: {
    name: string;
    birthDate: string; // YYMMDD
    gender: 'male' | 'female';
  };
  representative: {
    address: string;
    phone: string;
    email: string;
  };
  supportType: string; // 자동 입력
  documentSubmitted: boolean; // 자동 입력
  
  // 진행 정보
  parentMarried: 'yes' | 'no';
  parentRaisingChild: 'yes' | 'no';
  preferredDateTime: string; // 자동 입력
  applicationReason: string; // 최대 1,000자
}

// 찾아가는 돌잔치 신청서 데이터 (7-4)
export interface VisitingDoljanchiApplicationData {
  // 참가자 정보
  // 대상자 (7-4-1: 팀 추가 기능 및 콤마 구분 입력 지원)
  targets: Array<{
    name: string; // 콤마로 구분된 여러명 또는 단일명 (예: "김철수, 이영희, 박순희")
    birthDate: string; // 콤마로 구분된 여러명 또는 단일명 (예: "240101, 240307, 240528")
    gender: string; // 콤마로 구분된 여러명 또는 단일명 (예: "남, 여, 여")
    targetType: string; // 대상유형 (한부모가족 복지시설, 영아원) - 자동 입력
    additionalTypes: string; // 추가유형 (기초생활수급자, 차상위계층, 장애인, 유공자, 새터민) - 자동 입력
  }>;
  // 복지시설
  facility: {
    name: string; // 시설명
    representative: string; // 대표자 이름
    address: string; // 주소
    businessNumber: string; // 사업자번호 (10자리)
    website: string; // 홈페이지
    manager: string; // 담당자 이름
    phone: string; // 전화번호
    email: string; // 이메일
  };
  supportType: string; // 자동 입력
  documentSubmitted: boolean; // 자동 입력
  
  // 진행 정보
  preferredDateTime: string; // 자동 입력
  applicationReason: string; // 최대 1,000자
}

export type ApplicationData = WeddingApplicationData | DoljanchiApplicationData | VisitingDoljanchiApplicationData;

export interface Application {
  id: string; // UUID
  type: CeremonyType;
  user_name: string; // 신청자 성명 (로그인 식별자 1)
  birth_date: string; // 생년월일 6자리 (로그인 식별자 2)
  schedule_1: Schedule; // 1순위 날짜 및 시간
  schedule_2?: Schedule; // 2순위 날짜 및 시간 (선택)
  support_type: SupportType;
  application_data: ApplicationData;
  consent_status: boolean; // 개인정보/민감정보 동의 여부
  file_urls: string[]; // 증빙서류 스토리지 주소 배열
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationFormData {
  type: CeremonyType;
  userName: string;
  birthDate: string;
  schedule1: Schedule;
  schedule2?: Schedule;
  supportType: SupportType;
  applicationData: ApplicationData;
  consentStatus: boolean;
  files?: File[];
  fileUrls?: string[]; // 업로드된 파일 URL들
}

// 증빙서류 타입 (지원 유형별로 다른 서류 필요)
export interface RequiredDocument {
  supportType: SupportType;
  documentName: string;
  description: string;
}

