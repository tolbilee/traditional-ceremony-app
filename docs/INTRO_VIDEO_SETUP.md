# 인트로 화면 영상 추가 가이드

## 개요
인트로 화면에 영상을 추가하는 방법을 설명합니다.

## 방법 1: public 폴더에 영상 파일 추가 (권장)

### 1단계: 영상 파일 준비
1. 영상 파일을 준비합니다 (MP4, WebM 형식 권장)
2. 파일 크기를 최적화합니다 (모바일 환경을 고려하여 5-10MB 이하 권장)
3. 해상도: 1920x1080 또는 1280x720 권장

### 2단계: 파일 배치
1. 프로젝트 루트의 `public` 폴더에 `videos` 폴더를 생성합니다
2. 영상 파일을 `public/videos/intro-video.mp4` 경로에 저장합니다

```
public/
  └── videos/
      └── intro-video.mp4
```

### 3단계: 코드 수정
`components/IntroScreen.tsx` 파일에서 주석 처리된 부분을 활성화합니다:

```tsx
<video
  ref={videoRef}
  className="h-full w-full object-cover"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
>
  <source src="/videos/intro-video.mp4" type="video/mp4" />
  {/* WebM 형식도 함께 제공하면 더 좋습니다 */}
  <source src="/videos/intro-video.webm" type="video/webm" />
</video>
```

## 방법 2: 외부 URL 사용

외부 호스팅 서비스(YouTube, Vimeo, Cloudflare Stream 등)를 사용하는 경우:

```tsx
<video
  ref={videoRef}
  className="h-full w-full object-cover"
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
>
  <source src="https://your-cdn.com/videos/intro-video.mp4" type="video/mp4" />
</video>
```

## 방법 3: YouTube 영상 사용 (iframe)

YouTube 영상을 사용하려면:

```tsx
<div className="absolute inset-0 overflow-hidden">
  <iframe
    className="h-full w-full"
    src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&loop=1&playlist=YOUR_VIDEO_ID&controls=0&mute=1&modestbranding=1"
    allow="autoplay"
    frameBorder="0"
  />
</div>
```

## 영상 최적화 팁

1. **파일 크기 최적화**
   - HandBrake, FFmpeg 등을 사용하여 압축
   - H.264 코덱 사용 권장
   - 비트레이트: 2-5 Mbps 권장

2. **형식 권장사항**
   - MP4 (H.264): 가장 널리 지원됨
   - WebM: 더 작은 파일 크기, 일부 브라우저에서만 지원

3. **모바일 최적화**
   - 짧은 영상 사용 (5-10초 권장)
   - 저해상도 버전도 함께 제공 고려

## 현재 설정

현재 코드는 영상 파일이 없을 경우 그라데이션 배경을 표시합니다.
영상 파일을 추가하면 자동으로 영상이 재생됩니다.

## 영상 속성 설명

- `autoPlay`: 페이지 로드 시 자동 재생
- `loop`: 영상 반복 재생
- `muted`: 음소거 (자동 재생을 위해 필요)
- `playsInline`: 모바일에서 인라인 재생
- `preload="auto"`: 영상 미리 로드
