# PeekCarousel

[![npm version](https://badgen.net/npm/v/peek-carousel)](https://www.npmjs.com/package/peek-carousel)
[![npm downloads](https://badgen.net/npm/dm/peek-carousel)](https://www.npmjs.com/package/peek-carousel)
[![bundle size](https://badgen.net/bundlephobia/minzip/peek-carousel)](https://bundlephobia.com/package/peek-carousel)
[![license](https://badgen.net/npm/license/peek-carousel)](https://opensource.org/licenses/MIT)

[![stars](https://badgen.net/github/stars/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/stargazers)
[![issues](https://badgen.net/github/open-issues/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/issues)
[![forks](https://badgen.net/github/forks/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/network/members)
[![last commit](https://badgen.net/github/last-commit/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/commits)

[![JavaScript](https://badgen.net/badge/JavaScript/ES6+/yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SCSS](https://badgen.net/badge/SCSS/Sass/pink)](https://sass-lang.com/)
[![dependencies](https://badgen.net/badge/dependencies/0/green)](https://www.npmjs.com/package/peek-carousel)

iPhone 17 Pro 제품 소개 페이지의 스와이프 인터랙션에서 영감을 받은 모듈형 캐러셀 라이브러리. 현재 활성 아이템 양옆으로 다음/이전 아이템이 살짝 보이는 'Peek 효과'를 제공하여 직관적인 내비게이션을 지원합니다. 세 가지 레이아웃 모드(Stack/Card, Radial Rotation, Classic Slide)를 지원하며, 부드러운 전환 효과, 터치/드래그 지원, 완전한 접근성을 제공합니다.

> [English](./README.en.md)

## 특징

- **세 가지 레이아웃 모드**
  - **Stack/Card 모드**: 중앙 카드와 좌우 미리보기(peek) 효과
  - **Radial Rotation 모드**: 3D 원형 회전 캐러셀
  - **Classic Slide 모드**: 수평 슬라이드 레이아웃, 중앙 활성 아이템과 좌우 peek 표시
- **모듈형 아키텍처** - ES6 모듈로 구성된 확장 가능한 구조
- **자동 아이콘 삽입** - 네비게이션 및 자동 회전 버튼 아이콘 자동 제공
- **완전한 반응형** - 모든 디바이스에서 최적화된 경험
- **터치 & 드래그** - 스와이프 및 드래그 지원, 모멘텀 스크롤
- **키보드 내비게이션** - 화살표 키, Home/End, Space, 숫자 키(1-N)
- **자동 회전** - 선택적 자동 캐러셀 회전 및 진행 표시
- **접근성** - 완전한 ARIA 지원 및 키보드 내비게이션
- **성능 최적화** - 이미지 프리로딩, 관성 스크롤, 최단 경로 회전
- **커스터마이징** - SCSS 변수로 쉬운 테마 설정
- **의존성 없음** - 순수 바닐라 JavaScript
- **다양한 빌드 형식** - ESM, UMD, 압축 버전 제공

## 설치

### NPM

```bash
npm install peek-carousel
```

### CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/peek-carousel/dist/peek-carousel.min.css">

<!-- JavaScript (UMD) -->
<script src="https://unpkg.com/peek-carousel/dist/peek-carousel.min.js"></script>
```

### ES Module

```javascript
import PeekCarousel from 'peek-carousel';
```

### 수동 설치

최신 릴리즈를 다운로드하고 파일을 포함하세요:

```html
<!-- CSS -->
<link rel="stylesheet" href="path/to/dist/peek-carousel.min.css">

<!-- JavaScript (UMD) -->
<script src="path/to/dist/peek-carousel.min.js"></script>
```

또는 ES Module 사용:

```javascript
import PeekCarousel from './dist/peek-carousel.esm.min.js';
```

## 빠른 시작

### 1. HTML 구조

```html
<div class="peek-carousel" id="myCarousel">
  <div class="peek-carousel__track">
    <!-- 캐러셀 아이템 -->
    <div class="peek-carousel__item">
      <figure class="peek-carousel__figure">
        <img class="peek-carousel__image" src="image1.jpg" alt="이미지 1" width="650" height="490" />
        <figcaption class="peek-carousel__caption">
          <span class="peek-carousel__caption-title">이미지 1</span>
          <span class="peek-carousel__caption-subtitle">설명</span>
        </figcaption>
      </figure>
    </div>

    <div class="peek-carousel__item">
      <figure class="peek-carousel__figure">
        <img class="peek-carousel__image" src="image2.jpg" alt="이미지 2" width="650" height="490" />
        <figcaption class="peek-carousel__caption">
          <span class="peek-carousel__caption-title">이미지 2</span>
          <span class="peek-carousel__caption-subtitle">설명</span>
        </figcaption>
      </figure>
    </div>

    <!-- 더 많은 아이템... -->
  </div>
</div>

<!-- 네비게이션 버튼, 인디케이터, 자동 회전 버튼, 카운터는 자동으로 생성됩니다 -->
```

### 2. JavaScript 초기화

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  startIndex: 1,
  layoutMode: 'stack', // 'stack', 'radial', or 'classic'
  autoRotate: false,
  autoRotateInterval: 3000,
  swipeThreshold: 50,
  dragThreshold: 80,
  preloadRange: 2,
  enableKeyboard: true,
  enableWheel: true,
  enableTouch: true,
  enableMouse: true
});
```

## 설정 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `startIndex` | `number` | `1` | 시작 슬라이드 인덱스 (0부터 시작) |
| `layoutMode` | `string` | `'stack'` | 레이아웃 모드: `'stack'` (Stack/Card), `'radial'` (원형 회전), 또는 `'classic'` (클래식 슬라이드) |
| `autoRotate` | `boolean` | `false` | 초기화 시 자동 회전 활성화 |
| `autoRotateInterval` | `number` | `2500` | 자동 회전 간격 (밀리초) |
| `swipeThreshold` | `number` | `50` | 스와이프 임계값 거리 (픽셀) |
| `dragThreshold` | `number` | `80` | 드래그 임계값 거리 (픽셀) |
| `preloadRange` | `number` | `2` | 현재 아이템 주변에 미리 로드할 이미지 수 |
| `enableKeyboard` | `boolean` | `true` | 키보드 내비게이션 활성화 |
| `enableWheel` | `boolean` | `true` | 마우스 휠 내비게이션 활성화 |
| `enableTouch` | `boolean` | `true` | 터치/스와이프 내비게이션 활성화 |
| `enableMouse` | `boolean` | `true` | 마우스 드래그 내비게이션 활성화 |

## API 메서드

### 네비게이션

```javascript
// 다음 슬라이드로 이동
carousel.next();

// 이전 슬라이드로 이동
carousel.prev();

// 특정 슬라이드로 이동 (0부터 시작하는 인덱스)
carousel.goTo(2);
```

### 자동 회전

```javascript
// 자동 회전 시작
carousel.startAutoRotate();

// 자동 회전 중지
carousel.stopAutoRotate();

// 자동 회전 토글
carousel.toggleAutoRotate();
```

### 정리

```javascript
// 캐러셀 제거 및 이벤트 리스너 정리
carousel.destroy();
```

### 속성

```javascript
// 현재 슬라이드 인덱스 가져오기
console.log(carousel.currentIndex);

// 전체 슬라이드 수 가져오기
console.log(carousel.totalItems);

// 자동 회전 상태 확인
console.log(carousel.isAutoRotating);
```

## 키보드 내비게이션

| 키 | 동작 |
|----|------|
| `←` / `→` | 이전 / 다음 슬라이드 |
| `Home` | 첫 번째 슬라이드로 이동 |
| `End` | 마지막 슬라이드로 이동 |
| `1` - `N` | 특정 슬라이드로 이동 (1부터 시작) |
| `Space` | 자동 회전 토글 |

## 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

## 사용 예제

### 기본 사용

```javascript
const carousel = new PeekCarousel('#myCarousel');
```

### Radial 모드 사용

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  layoutMode: 'radial' // 3D 원형 회전
});
```

### Classic 슬라이드 모드 사용

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  layoutMode: 'classic' // 수평 슬라이드 레이아웃
});
```

### 자동 회전 활성화

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  autoRotate: true,
  autoRotateInterval: 5000
});
```

### 동적 레이아웃 모드 전환

```javascript
const carousel = new PeekCarousel('#myCarousel');

// 레이아웃 모드 변경
carousel.options.layoutMode = 'radial'; // 또는 'classic'
carousel.updateLayoutClass();
carousel.animator.updateCarousel();
```

### 인터랙션 비활성화

```javascript
const carousel = new PeekCarousel('#myCarousel', {
  enableKeyboard: false,
  enableWheel: false,
  enableMouse: false
});
```

### 프로그래밍 방식 제어

```javascript
const carousel = new PeekCarousel('#myCarousel');

// 프로그래밍 방식으로 네비게이션
document.getElementById('customNext').addEventListener('click', () => {
  carousel.next();
});

// 특정 슬라이드로 이동
document.getElementById('jumpToSlide3').addEventListener('click', () => {
  carousel.goTo(2); // 0부터 시작하는 인덱스
});
```

## 커스터마이징

CSS로 스타일을 오버라이드하여 캐러셀을 커스터마이징할 수 있습니다:

```css
/* 버튼 스타일 */
.peek-carousel__btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 인디케이터 스타일 */
.peek-carousel__indicator--active::before {
  background: #667eea;
}

/* 모드별 스타일 */
.peek-carousel--stack .peek-carousel__item { /* ... */ }
.peek-carousel--radial .peek-carousel__item { /* ... */ }
.peek-carousel--classic .peek-carousel__item { /* ... */ }
```

## 개발

### 빌드 설정

```bash
# 저장소 클론
git clone https://github.com/lledellebell/peek-carousel.git
cd peek-carousel

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 개발 서버 시작 (Python)
python -m http.server 8080

# http://localhost:8080/examples/example-built.html 열기
```

## 기여

기여를 환영합니다! Pull Request를 자유롭게 제출해 주세요.

## 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요

## 크레딧

iPhone 17 Pro 제품 소개 페이지의 스와이프 인터랙션에서 영감을 받았습니다.

- [이미지1](./public/motivation0.png)

## 변경 로그

변경 사항은 [GitHub Releases](https://github.com/lledellebell/peek-carousel/releases)를 참조하세요.
