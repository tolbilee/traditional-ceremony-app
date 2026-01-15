/**
 * 한글 폰트 로더 유틸리티
 * 
 * 사용 방법:
 * 1. public/fonts/ 폴더에 한글 폰트 파일(.ttf)을 추가하세요
 *    - 예: NanumGothic-Regular.ttf, Pretendard-Regular.ttf 등
 * 
 * 2. 폰트 파일을 Base64로 변환하여 아래 FONT_BASE64 상수에 넣으세요
 *    - 온라인 변환 도구: https://base64.guru/converter/encode/file
 *    - 또는 Node.js 스크립트로 변환:
 *      const fs = require('fs');
 *      const fontBuffer = fs.readFileSync('public/fonts/NanumGothic-Regular.ttf');
 *      const fontBase64 = fontBuffer.toString('base64');
 *      console.log(fontBase64);
 * 
 * 3. FONT_NAME과 FONT_FILE_NAME을 폰트에 맞게 수정하세요
 */

// TODO: 아래 값을 실제 폰트 파일에 맞게 수정하세요
// 폰트 파일을 Base64로 변환한 문자열을 여기에 넣으세요
// 예: const FONT_BASE64 = 'AAEAAAAOAIAAAwBgT1MvMj...'; (매우 긴 문자열)
export const FONT_BASE64 = '';

// 폰트 이름 (VFS에 등록할 이름)
export const FONT_FILE_NAME = 'NanumGothic-Regular.ttf';

// 폰트 패밀리 이름 (setFont에서 사용)
export const FONT_NAME = 'NanumGothic';

/**
 * jsPDF 인스턴스에 한글 폰트를 등록하는 함수
 * @param doc jsPDF 인스턴스
 */
export function registerKoreanFont(doc: any): void {
  if (!FONT_BASE64) {
    console.warn('한글 폰트가 등록되지 않았습니다. FONT_BASE64를 설정해주세요.');
    return;
  }

  try {
    // 1. 가상 파일 시스템(VFS)에 폰트 추가
    doc.addFileToVFS(FONT_FILE_NAME, FONT_BASE64);
    
    // 2. 폰트 등록
    doc.addFont(FONT_FILE_NAME, FONT_NAME, 'normal');
    
    // 3. 폰트 설정
    doc.setFont(FONT_NAME, 'normal');
    
    console.log('한글 폰트가 성공적으로 등록되었습니다:', FONT_NAME);
  } catch (error) {
    console.error('한글 폰트 등록 실패:', error);
  }
}
