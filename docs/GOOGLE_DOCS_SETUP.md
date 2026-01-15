# 구글 독스 PDF 생성 설정 가이드

## 개요
이 가이드는 구글 독스 템플릿과 Google Apps Script를 사용하여 PDF를 생성하는 방법을 설명합니다.

## 1단계: 구글 독스 템플릿 생성

1. Google Drive에 접속하여 새 Google Docs 문서를 생성합니다.
2. 신청서 양식을 디자인합니다 (예: 전통혼례 신청서, 돌잔치 신청서).
3. 데이터가 들어갈 위치에 플레이스홀더를 추가합니다:
   - `{{신청자이름}}`
   - `{{생년월일}}`
   - `{{주소}}`
   - `{{전화번호}}`
   - `{{이메일}}`
   - `{{희망일시}}`
   - `{{지원유형}}`
   - 등등...

4. 문서를 "템플릿"으로 저장하고 문서 ID를 복사합니다.
   - URL에서 `https://docs.google.com/document/d/[DOCUMENT_ID]/edit` 부분의 `DOCUMENT_ID`를 복사합니다.

## 2단계: Google Apps Script 작성

1. 구글 독스 템플릿 문서에서 `확장 프로그램` > `Apps Script`를 클릭합니다.
2. 아래 스크립트를 작성합니다:

```javascript
// 설정: 템플릿 문서 ID를 여기에 입력
const TEMPLATE_DOC_ID = 'YOUR_TEMPLATE_DOCUMENT_ID';

// 웹 앱으로 배포된 함수
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 템플릿 복사
    const templateDoc = DocumentApp.openById(TEMPLATE_DOC_ID);
    const newDoc = templateDoc.makeCopy('신청서_' + data.applicationId);
    const body = newDoc.getBody();
    
    // 플레이스홀더 치환
    replacePlaceholders(body, data);
    
    // PDF로 내보내기
    const pdfBlob = newDoc.getAs('application/pdf');
    const pdfUrl = DriveApp.createFile(pdfBlob).getUrl();
    
    // 임시 문서 삭제 (선택사항)
    DriveApp.getFileById(newDoc.getId()).setTrashed(true);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      pdfUrl: pdfUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 플레이스홀더 치환 함수
function replacePlaceholders(body, data) {
  // 전통혼례 데이터
  if (data.type === 'wedding') {
    body.replaceText('{{신청자이름}}', data.userName || '');
    body.replaceText('{{생년월일}}', data.birthDate || '');
    body.replaceText('{{주소}}', data.applicationData?.representative?.address || '');
    body.replaceText('{{전화번호}}', data.applicationData?.representative?.phone || '');
    body.replaceText('{{이메일}}', data.applicationData?.representative?.email || '');
    body.replaceText('{{희망일시}}', data.schedule1?.date + ' ' + data.schedule1?.time || '');
    body.replaceText('{{지원유형}}', getSupportTypeLabel(data.supportType) || '');
    body.replaceText('{{신랑이름}}', data.applicationData?.groom?.name || '');
    body.replaceText('{{신부이름}}', data.applicationData?.bride?.name || '');
    // ... 더 많은 필드
  }
  
  // 돌잔치 데이터
  if (data.type === 'doljanchi') {
    body.replaceText('{{신청자이름}}', data.userName || '');
    body.replaceText('{{생년월일}}', data.birthDate || '');
    body.replaceText('{{주소}}', data.applicationData?.representative?.address || '');
    body.replaceText('{{전화번호}}', data.applicationData?.representative?.phone || '');
    body.replaceText('{{이메일}}', data.applicationData?.representative?.email || '');
    body.replaceText('{{희망일시}}', data.schedule1?.date + ' ' + data.schedule1?.time || '');
    body.replaceText('{{지원유형}}', getDoljanchiSupportTypeLabel(data.supportType) || '');
    body.replaceText('{{부모이름}}', data.applicationData?.parent?.name || '');
    body.replaceText('{{아이이름}}', data.applicationData?.child?.name || '');
    // ... 더 많은 필드
  }
}

// 지원 유형 한글 변환
function getSupportTypeLabel(type) {
  const labels = {
    'basic_livelihood': '기초수급자',
    'multicultural': '다문화가정',
    'disabled': '장애인',
    'north_korean_defector': '북한이탈주민',
    'national_merit': '국가유공자'
  };
  return labels[type] || type;
}

function getDoljanchiSupportTypeLabel(type) {
  const labels = {
    'doljanchi': '돌잔치',
    'doljanchi_welfare_facility': '찾아가는 돌잔치(복지시설)',
    'doljanchi_orphanage': '찾아가는 돌잔치(영아원)'
  };
  return labels[type] || type;
}
```

3. `배포` > `새 배포`를 클릭합니다.
4. 유형을 `웹 앱`으로 선택합니다.
5. 실행 사용자를 `나`로 설정합니다.
6. 액세스 권한을 `모든 사용자`로 설정합니다.
7. 배포하고 웹 앱 URL을 복사합니다.

## 3단계: 환경 변수 설정

Netlify 대시보드에서 다음 환경 변수를 추가합니다:
- `GOOGLE_APPS_SCRIPT_URL`: Google Apps Script 웹 앱 URL

## 4단계: API Route 생성

`app/api/applications/[id]/google-docs-pdf/route.ts` 파일을 생성하여 Google Apps Script를 호출합니다.
