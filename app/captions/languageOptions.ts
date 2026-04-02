export type CaptionLanguageOption = {
  code: string;
  label: string;
};

// Alphabetical order (English naming), label in Korean.
export const CAPTION_LANGUAGE_OPTIONS: CaptionLanguageOption[] = [
  { code: 'australian', label: '오스트레일리아어' },
  { code: 'belgian', label: '벨기에어' },
  { code: 'bulgarian', label: '불가리아어' },
  { code: 'chilean', label: '칠레어' },
  { code: 'chinese', label: '중국어' },
  { code: 'english', label: '영어' },
  { code: 'french', label: '프랑스어' },
  { code: 'german', label: '독일어' },
  { code: 'greek', label: '그리스어' },
  { code: 'indian', label: '인도어' },
  { code: 'iranian', label: '이란어' },
  { code: 'japanese', label: '일본어' },
  { code: 'kazakh', label: '카자흐스탄어' },
  { code: 'korean', label: '한국어' },
  { code: 'laotian', label: '라오스어' },
  { code: 'mexican', label: '멕시코어' },
  { code: 'moldovan', label: '몰도바어' },
  { code: 'moroccan', label: '모로코어' },
  { code: 'philippine', label: '필리핀어' },
  { code: 'romanian', label: '루마니아어' },
  { code: 'russian', label: '러시아어' },
  { code: 'thai', label: '태국어' },
  { code: 'vietnamese', label: '베트남어' },
];

export const DEFAULT_OPERATOR_LANGUAGE_CODE = 'korean';
