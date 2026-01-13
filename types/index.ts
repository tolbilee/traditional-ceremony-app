// 애플리케이션 타입 정의

export type CeremonyType = 'wedding' | 'doljanchi'; // 혼례 / 돌잔치

export type SupportType =
  | 'basic_livelihood' // 기초수급자
  | 'multicultural' // 다문화가정
  | 'disabled' // 장애인
  | 'north_korean_defector' // 북한이탈주민
  | 'national_merit'; // 국가유공자

export type TimeSlot = '12:00' | '15:00' | '18:00';

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

export type ApplicationData = WeddingApplicationData | DoljanchiApplicationData;

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
  files: File[];
}

// 증빙서류 타입 (지원 유형별로 다른 서류 필요)
export interface RequiredDocument {
  supportType: SupportType;
  documentName: string;
  description: string;
}
