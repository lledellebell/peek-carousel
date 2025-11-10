# PeekCarousel

[![package version](https://badgen.net/badge/version/1.0.0/blue)](https://github.com/lledellebell/peek-carousel/packages)
[![package name](https://badgen.net/badge/package/@lledellebell%2Fpeek-carousel/blue)](https://github.com/lledellebell/peek-carousel/packages)
[![bundle size](https://badgen.net/badge/bundle%20size/155KB/green)](https://github.com/lledellebell/peek-carousel/packages)
[![license](https://badgen.net/badge/license/MIT/blue)](https://opensource.org/licenses/MIT)

[![stars](https://badgen.net/github/stars/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/stargazers)
[![issues](https://badgen.net/github/open-issues/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/issues)
[![forks](https://badgen.net/github/forks/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/network/members)
[![last commit](https://badgen.net/github/last-commit/lledellebell/peek-carousel)](https://github.com/lledellebell/peek-carousel/commits)

[![JavaScript](https://badgen.net/badge/JavaScript/ES6+/yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SCSS](https://badgen.net/badge/SCSS/Sass/pink)](https://sass-lang.com/)
[![dependencies](https://badgen.net/badge/dependencies/0/green)](https://github.com/lledellebell/peek-carousel/packages)

iPhone 17 Pro 제품 소개 페이지의 스와이프 인터랙션에서 영감을 받은 모듈형 캐러셀 라이브러리. 현재 활성 아이템 양옆으로 다음/이전 아이템이 살짝 보이는 'Peek 효과'를 제공하여 직관적인 내비게이션을 지원합니다. 세 가지 레이아웃 모드(Stack/Card, Radial Rotation, Classic Slide)를 지원하며, 부드러운 전환 효과, 터치/드래그 지원, 완전한 접근성을 제공합니다.

![PeekCarousel Demo](./public/assets/share_image.png)

**[라이브 데모 보기](https://lledellebell.github.io/peek-carousel/examples/example-built.html)**

> [English](./README.en.md)

## 특징

- **3가지 레이아웃 모드** - Stack/Card, Radial Rotation, Classic Slide
- **완전한 인터랙션 지원** - 터치/드래그, 키보드, 마우스 휠 내비게이션
- **제로 의존성** - 순수 바닐라 JavaScript로 구현
- **완전한 접근성** - ARIA 지원 및 키보드 내비게이션

## 설치

```bash
npm install @lledellebell/peek-carousel
```

```javascript
import PeekCarousel from '@lledellebell/peek-carousel';
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
  layoutMode: 'stack', // 'stack', 'radial', 'classic'
  autoRotate: false
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

## 브라우저 지원

- Chrome/Edge (최신)
- Firefox (최신)
- Safari (최신)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

## 사용 예제

```javascript
// 기본 사용
const carousel = new PeekCarousel('#myCarousel');

// 레이아웃 모드 변경
new PeekCarousel('#myCarousel', { layoutMode: 'radial' });

// 자동 회전 활성화
new PeekCarousel('#myCarousel', { autoRotate: true });
```

## 커스터마이징

CSS 클래스를 오버라이드하여 스타일을 커스터마이징할 수 있습니다:

```css
.peek-carousel__btn { /* 버튼 스타일 */ }
.peek-carousel__indicator--active::before { /* 인디케이터 스타일 */ }
```

## 개발

```bash
git clone https://github.com/lledellebell/peek-carousel.git
npm install
npm run build
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
