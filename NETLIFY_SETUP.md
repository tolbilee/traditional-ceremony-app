# Netlify 배포 가이드

## 1. Netlify 계정 생성 및 프로젝트 연결

1. [Netlify](https://www.netlify.com)에 가입 및 로그인
2. "Add new site" > "Import an existing project" 선택
3. GitHub/GitLab/Bitbucket 저장소 연결
4. 또는 드래그 앤 드롭으로 배포

## 2. 빌드 설정

Netlify 대시보드에서 다음 설정을 입력:

### Build settings
- **Build command**: `npm run build`
- **Publish directory**: `.next`

또는 `netlify.toml` 파일을 프로젝트 루트에 생성:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## 3. 환경 변수 설정

Netlify 대시보드 > Site settings > Environment variables에서 다음 변수 추가:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`: Storage 버킷 이름 (기본값: `documents`)

## 4. Next.js 플러그인 설치 (권장)

Netlify에서 Next.js를 최적화하기 위해 플러그인을 설치하세요:

1. Netlify 대시보드 > Site settings > Build & deploy > Build plugins
2. "Add plugin" 클릭
3. "@netlify/plugin-nextjs" 검색 및 설치

또는 `package.json`에 추가:

```json
{
  "devDependencies": {
    "@netlify/plugin-nextjs": "^4.0.0"
  }
}
```

## 5. 배포 확인

1. 코드를 Git 저장소에 푸시하면 자동으로 배포가 시작됩니다
2. Netlify 대시보드에서 배포 상태 확인
3. 배포 완료 후 제공된 URL로 접속하여 테스트

## 6. 커스텀 도메인 설정 (선택사항)

1. Netlify 대시보드 > Domain settings
2. "Add custom domain" 클릭
3. 도메인 입력 및 DNS 설정 안내 따르기

## 7. 환경별 설정

프로덕션과 스테이징 환경을 분리하려면:

1. Netlify 대시보드 > Site settings > Environment variables
2. 각 환경(Production, Deploy previews, Branch deploys)별로 다른 환경 변수 설정 가능

## 트러블슈팅

### 빌드 실패
- Node.js 버전 확인 (Netlify는 기본적으로 Node 18 사용)
- `package.json`에 `engines` 필드 추가:
  ```json
  {
    "engines": {
      "node": ">=20.9.0"
    }
  }
  ```

### 환경 변수 미적용
- 변수명 앞에 `NEXT_PUBLIC_` 접두사 확인
- 빌드 후 재배포 필요

### 이미지 최적화 문제
- Next.js Image 컴포넌트 사용 시 `next.config.js`에 이미지 도메인 추가:
  ```js
  module.exports = {
    images: {
      domains: ['your-supabase-project.supabase.co'],
    },
  };
  ```
