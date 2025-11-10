export const LAYOUT_MODES = Object.freeze({
  STACK: 'stack',
  RADIAL: 'radial',
  CLASSIC: 'classic',
});

export const DEFAULT_OPTIONS = Object.freeze({
  startIndex: 1,
  layoutMode: LAYOUT_MODES.STACK,
  autoRotate: false,
  autoRotateInterval: 2500,
  preloadRange: 2,
  swipeThreshold: 50,
  dragThreshold: 80,
  enableKeyboard: true,
  enableWheel: true,
  enableTouch: true,
  enableMouse: true,
  showNavigation: true,
  showCounter: true,
  showIndicators: true,
  showAutoRotateButton: true,
});

export function validateOptions(options) {
  const validated = { ...DEFAULT_OPTIONS, ...options };

  if (validated.startIndex < 0) {
    console.warn('PeekCarousel: startIndex는 0 이상이어야 합니다. 기본값 1 사용');
    validated.startIndex = 1;
  }

  if (!Object.values(LAYOUT_MODES).includes(validated.layoutMode)) {
    console.warn(`PeekCarousel: 유효하지 않은 layoutMode "${validated.layoutMode}". 기본값 "stack" 사용`);
    validated.layoutMode = LAYOUT_MODES.STACK;
  }

  if (validated.autoRotateInterval < 100) {
    console.warn('PeekCarousel: autoRotateInterval은 100ms 이상이어야 합니다. 기본값 2500 사용');
    validated.autoRotateInterval = 2500;
  }

  if (validated.preloadRange < 0) {
    console.warn('PeekCarousel: preloadRange는 0 이상이어야 합니다. 기본값 2 사용');
    validated.preloadRange = 2;
  }

  return validated;
}
