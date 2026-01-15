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
  doljanchi: {
    supportType: 'doljanchi',
    documentName: '한부모가족증명서',
    description: '한부모가족증명서를 촬영하여 첨부해주세요.',
  },
  doljanchi_welfare_facility: {
    supportType: 'doljanchi_welfare_facility',
    documentName: '한부모가족증명서, 입소 및 등록서류',
    description: '한부모가족증명서와 입소 및 등록서류를 촬영하여 첨부해주세요.',
  },
  doljanchi_orphanage: {
    supportType: 'doljanchi_orphanage',
    documentName: '입소 및 등록서류',
    description: '입소 및 등록서류를 촬영하여 첨부해주세요.',
  },
};

// 지원 유형 한글명 (전통혼례)
export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  basic_livelihood: '기초수급자',
  multicultural: '다문화가정',
  disabled: '장애인',
  north_korean_defector: '북한이탈주민',
  national_merit: '국가유공자',
  doljanchi: '돌잔치',
  doljanchi_welfare_facility: '찾아가는 돌잔치(복지시설)',
  doljanchi_orphanage: '찾아가는 돌잔치(영아원)',
};

// 돌잔치 지원 유형 한글명
export const DOLJANCHI_SUPPORT_TYPE_LABELS: Record<'doljanchi' | 'doljanchi_welfare_facility' | 'doljanchi_orphanage', string> = {
  doljanchi: '돌잔치',
  doljanchi_welfare_facility: '찾아가는 돌잔치(복지시설)',
  doljanchi_orphanage: '찾아가는 돌잔치(영아원)',
};

// 시간대 옵션
export const TIME_SLOTS = ['12:00', '15:00', '18:00'] as const;

// 전화 문의 번호
export const INQUIRY_PHONE = '02-1234-5678'; // 실제 번호로 변경 필요

