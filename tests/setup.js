import { vi, afterEach } from 'vitest';

// matchMedia 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// IntersectionObserver 모킹
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// requestAnimationFrame 모킹
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

/**
 * 테스트용 캐러셀 HTML fixture 생성
 * @param {Object} options - 설정 옵션
 * @param {number} options.itemCount - 캐러셀 아이템 개수 (기본값: 5)
 * @param {string} options.id - 컨테이너 ID (기본값: 'test-carousel')
 * @returns {HTMLElement} 캐러셀 컨테이너 엘리먼트
 */
export function createCarouselFixture(options = {}) {
  const { itemCount = 5, id = 'test-carousel' } = options;

  const container = document.createElement('div');
  container.id = id;
  container.className = 'peek-carousel-container';

  let itemsHTML = '';
  for (let i = 0; i < itemCount; i++) {
    itemsHTML += `
      <div class="peek-carousel__item">
        <figure class="peek-carousel__figure">
          <img
            class="peek-carousel__image"
            src="https://example.com/image${i + 1}.jpg"
            alt="Test image ${i + 1}"
          />
          <figcaption class="peek-carousel__caption">Item ${i + 1}</figcaption>
        </figure>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="peek-carousel__track">
      ${itemsHTML}
    </div>
  `;

  document.body.appendChild(container);
  return container;
}

/**
 * 캐러셀 fixture를 DOM에서 제거
 * @param {string} id - 제거할 컨테이너 ID (기본값: 'test-carousel')
 */
export function cleanupCarouselFixture(id = 'test-carousel') {
  const container = document.getElementById(id);
  if (container) {
    container.remove();
  }
}

/**
 * 키보드 이벤트 시뮬레이션
 * @param {string} key - 시뮬레이션할 키
 * @param {Object} options - 추가 이벤트 옵션
 * @returns {KeyboardEvent} 생성된 이벤트
 */
export function simulateKeyDown(key, options = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  document.dispatchEvent(event);
  return event;
}

/**
 * 터치 스와이프 제스처 시뮬레이션
 * @param {HTMLElement} element - 스와이프할 엘리먼트
 * @param {number} startX - 시작 X 좌표
 * @param {number} endX - 종료 X 좌표
 */
export function simulateSwipe(element, startX, endX) {
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [{ clientX: startX, clientY: 100 }],
    changedTouches: [{ clientX: startX, clientY: 100 }],
  });

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    touches: [],
    changedTouches: [{ clientX: endX, clientY: 100 }],
  });

  element.dispatchEvent(touchStart);
  element.dispatchEvent(touchEnd);
}

/**
 * 마우스 드래그 시뮬레이션
 * @param {HTMLElement} element - 드래그할 엘리먼트
 * @param {number} startX - 시작 X 좌표
 * @param {number} endX - 종료 X 좌표
 */
export function simulateDrag(element, startX, endX) {
  const mouseDown = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    clientX: startX,
    clientY: 100,
  });

  const mouseMove = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: endX,
    clientY: 100,
  });

  const mouseUp = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    clientX: endX,
    clientY: 100,
  });

  element.dispatchEvent(mouseDown);
  document.dispatchEvent(mouseMove);
  document.dispatchEvent(mouseUp);
}

/**
 * 다음 애니메이션 프레임 대기
 * @returns {Promise}
 */
export function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * 지정된 시간만큼 대기
 * @param {number} ms - 대기할 밀리초
 * @returns {Promise}
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 각 테스트 후 자동 정리
afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});
