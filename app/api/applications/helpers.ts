/**
 * 한글 문자열 정규화 함수
 * UTF-8 인코딩을 보장하여 한글이 깨지지 않도록 처리
 */
export function normalizeString(str: any): string {
  if (typeof str !== 'string') return String(str ?? '');
  try {
    return decodeURIComponent(encodeURIComponent(str));
  } catch {
    return str;
  }
}

/**
 * application_data JSONB 필드의 한글 데이터 정규화 함수
 * 중첩된 객체와 배열을 재귀적으로 처리
 */
export function normalizeApplicationData(data: any): any {
  if (!data || typeof data !== 'object') return data ?? {};
  const normalized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      normalized[key] = normalizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      normalized[key] = normalizeApplicationData(value);
    } else if (Array.isArray(value)) {
      normalized[key] = value.map((item: any) => 
        typeof item === 'string' ? normalizeString(item) : 
        typeof item === 'object' ? normalizeApplicationData(item) : item
      );
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}
