export type CaptionLanguageOption = {
  code: string;
  label: string;
};

// Alphabetical order (English naming), label in Korean.
export const CAPTION_LANGUAGE_OPTIONS: CaptionLanguageOption[] = [
  { code: 'arabic', label: '아랍어' },
  { code: 'bulgarian', label: '불가리아어' },
  { code: 'chinese', label: '중국어(간체)' },
  { code: 'chinese_traditional', label: '중국어(번체)' },
  { code: 'dutch', label: '네덜란드어' },
  { code: 'english', label: '영어' },
  { code: 'filipino', label: '필리핀어' },
  { code: 'french', label: '프랑스어' },
  { code: 'german', label: '독일어' },
  { code: 'greek', label: '그리스어' },
  { code: 'hindi', label: '힌디어' },
  { code: 'japanese', label: '일본어' },
  { code: 'kazakh', label: '카자흐어' },
  { code: 'korean', label: '한글' },
  { code: 'lao', label: '라오어' },
  { code: 'persian', label: '페르시아어' },
  { code: 'romanian', label: '루마니아어' },
  { code: 'russian', label: '러시아어' },
  { code: 'spanish', label: '스페인어' },
  { code: 'thai', label: '태국어' },
  { code: 'vietnamese', label: '베트남어' },
];

export const DEFAULT_OPERATOR_LANGUAGE_CODE = 'korean';
