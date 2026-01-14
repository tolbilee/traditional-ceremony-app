import { RequiredDocument, SupportType } from '@/types';

// 지원 유형별 증빙서류 정보
export const REQUIRED_DOCUMENTS: Record<SupportType, RequiredDocument> = {
  basic_livelihood: {
    supportType: 'basic_livelihood',
    documentName: '기초수급증명서',
    description: '기초수급증명서를 촬영하여 첨부해주세요.',
  },
  multicultural: {
    supportType: 'multicultural',
    documentName: '국적이 표시된 공통 증빙서류',
    description: '국적이 표시된 공통 증빙서류를 촬영하여 첨부해주세요.',
  },
  disabled: {
    supportType: 'disabled',
    documentName: '장애인복지카드',
    description: '장애인복지카드를 촬영하여 첨부해주세요.',
  },
  north_korean_defector: {
    supportType: 'north_korean_defector',
    documentName: '북한이탈주민등록확인서',
    description: '북한이탈주민등록확인서를 촬영하여 첨부해주세요.',
  },
  national_merit: {
    supportType: 'national_merit',
    documentName: '유공자증명서',
    description: '유공자증명서를 촬영하여 첨부해주세요.',
  },
};

// 지원 유형 한글명
export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  basic_livelihood: '기초수급자',
  multicultural: '다문화가정',
  disabled: '장애인',
  north_korean_defector: '북한이탈주민',
  national_merit: '국가유공자',
};

// 시간대 옵션
export const TIME_SLOTS = ['12:00', '15:00', '18:00'] as const;

// 전화 문의 번호
export const INQUIRY_PHONE = '02-1234-5678'; // 실제 번호로 변경 필요

