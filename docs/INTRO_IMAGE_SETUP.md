# 인트로 화면 배경 이미지 추가 가이드

## 개요
인트로 화면에 배경 이미지를 추가하는 방법을 설명합니다.

## 방법 1: public 폴더에 이미지 파일 추가 (권장)

### 1단계: 이미지 파일 준비
1. 배경 이미지를 준비합니다 (JPG, PNG, WebP 형식 권장)
2. 파일 크기를 최적화합니다 (모바일 환경을 고려하여 500KB-2MB 권장)
3. 해상도: 1920x1080 또는 1280x720 권장
4. 가로형 이미지 권장 (세로형은 잘릴 수 있음)

### 2단계: 파일 배치
1. 프로젝트 루트의 `public` 폴더에 `images` 폴더를 생성합니다
2. 이미지 파일을 `public/images/intro-background.jpg` 경로에 저장합니다

```
public/
  └── images/
      └── intro-background.jpg
```

### 3단계: 코드 활성화
`components/IntroScreen.tsx` 파일에서 주석 처리된 부분을 활성화합니다:

```tsx
<Image
  src="/images/intro-background.jpg"
  alt="인트로 배경"
  fill
  className="object-cover"
  priority
  quality={90}
/>
```

## 방법 2: 외부 URL 사용

외부 호스팅 서비스(CDN, Supabase Storage 등)를 사용하는 경우:

```tsx
<Image
  src="https://your-cdn.com/images/intro-background.jpg"
  alt="인트로 배경"
  fill
  className="object-cover"
  priority
  quality={90}
/>
```

## 방법 3: 일반 img 태그 사용 (Next.js Image 최적화 불필요한 경우)

```tsx
<img
  src="/images/intro-background.jpg"
  alt="인트로 배경"
  className="absolute inset-0 h-full w-full object-cover"
/>
```

## 이미지 최적화 팁

1. **파일 크기 최적화**
   - TinyPNG, Squoosh 등을 사용하여 압축
   - WebP 형식 사용 권장 (더 작은 파일 크기)

2. **해상도 권장사항**
   - 데스크톱: 1920x1080
   - 모바일: 1280x720
   - 반응형을 위해 다양한 크기 제공 고려

3. **형식 권장사항**
   - JPG: 사진에 적합, 파일 크기 작음
   - PNG: 투명도 필요 시
   - WebP: 최신 브라우저 지원, 가장 작은 파일 크기

## 현재 설정

현재 코드는 이미지 파일이 없을 경우 그라데이션 배경을 표시합니다.
이미지 파일을 추가하고 주석을 해제하면 자동으로 배경 이미지가 표시됩니다.

## Image 컴포넌트 속성 설명

- `fill`: 부모 컨테이너를 채우도록 설정
- `object-cover`: 이미지 비율을 유지하면서 영역을 채움
- `priority`: 페이지 로드 시 우선적으로 로드
- `quality={90}`: 이미지 품질 (1-100, 기본값 75)
