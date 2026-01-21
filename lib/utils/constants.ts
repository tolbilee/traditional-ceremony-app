import { RequiredDocument, SupportType } from '@/types';

// 지원 유형별 증빙서류 정보
export const REQUIRED_DOCUMENTS: Record<SupportType, RequiredDocument> = {
  basic_livelihood: {
    supportType: 'basic_livelihood',
    documentName: '기초수급증명서',
    description: '기초수급증명서를 촬영하여 첨부해주세요.',
  },
  near_poor: {
    supportType: 'near_poor',
    documentName: '차상위계층확인서 또는 차상위본인부담경감대상자 증명서',
    description: '차상위계층확인서 또는 차상위본인부담경감대상자 증명서를 촬영하여 첨부해주세요.',
  },
  multicultural: {
    supportType: 'multicultural',
    documentName: '가족관계증명서',
    description: '가족관계증명서를 촬영하여 첨부해주세요.',
  },
  disabled: {
    supportType: 'disabled',
    documentName: '장애인 등록증 또는 복지카드',
    description: '장애인 등록증 또는 복지카드를 촬영하여 첨부해주세요.',
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
    documentName: '사업자등록증, 입소사실확인서, 한부모가족증명서',
    description: '사업자등록증, 입소사실확인서, 한부모가족증명서를 촬영하여 첨부해주세요.',
  },
  doljanchi_orphanage: {
    supportType: 'doljanchi_orphanage',
    documentName: '사업자등록증, 입소사실확인서, 한부모가족증명서',
    description: '사업자등록증, 입소사실확인서, 한부모가족증명서를 촬영하여 첨부해주세요.',
  },
};

// 전통혼례 특이 케이스 증빙서류 (targetCategory에 따라)
export const WEDDING_SPECIAL_DOCUMENTS: Record<string, RequiredDocument> = {
  marriage_certificate: {
    supportType: 'basic_livelihood' as SupportType, // 임시 타입 (실제로는 지원유형이 아님)
    documentName: '혼인관계증명서',
    description: '혼인관계증명서를 촬영하여 첨부해주세요.',
  },
  family_register: {
    supportType: 'basic_livelihood' as SupportType, // 임시 타입 (실제로는 지원유형이 아님)
    documentName: '주민등록등본',
    description: '주민등록등본을 촬영하여 첨부해주세요.',
  },
};

// 찾아가는 돌잔치 특이 케이스 증빙서류 (4-6-2 * 주의사항: 각각 개별 업로드)
export const VISITING_DOLJANCHI_SPECIAL_DOCUMENTS: Record<string, RequiredDocument> = {
  business_registration: {
    supportType: 'doljanchi_welfare_facility' as SupportType, // 임시 타입
    documentName: '사업자등록증',
    description: '사업자등록증을 촬영하여 첨부해주세요.',
  },
  admission_confirmation: {
    supportType: 'doljanchi_welfare_facility' as SupportType, // 임시 타입
    documentName: '입소사실확인서',
    description: '입소사실확인서를 촬영하여 첨부해주세요.',
  },
  single_parent_certificate: {
    supportType: 'doljanchi_welfare_facility' as SupportType, // 임시 타입
    documentName: '한부모가족증명서',
    description: '한부모가족증명서를 촬영하여 첨부해주세요.',
  },
};

// 지원 유형 한글명 (전통혼례)
export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  basic_livelihood: '기초생활수급자',
  near_poor: '차상위계층',
  multicultural: '다문화가정',
  disabled: '장애인',
  north_korean_defector: '새터민',
  national_merit: '유공자',
  doljanchi: '한부모가족',
  doljanchi_welfare_facility: '한부모가족 복지시설',
  doljanchi_orphanage: '영아원',
};

// 돌잔치 지원 유형 한글명
export const DOLJANCHI_SUPPORT_TYPE_LABELS: Record<'doljanchi' | 'doljanchi_welfare_facility' | 'doljanchi_orphanage', string> = {
  doljanchi: '한부모가족',
  doljanchi_welfare_facility: '한부모가족 복지시설',
  doljanchi_orphanage: '영아원',
};

// 시간대 옵션
export const TIME_SLOTS = ['12:00', '15:00'] as const;

// 전화 문의 번호
export const INQUIRY_PHONE = '02-3011-9295';

