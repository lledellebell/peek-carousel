export interface PeekCarouselOptions {
  startIndex?: number;
  layoutMode?: 'stack' | 'radial' | 'classic';
  autoRotate?: boolean;
  autoRotateInterval?: number;
  swipeThreshold?: number;
  dragThreshold?: number;
  preloadRange?: number;
  enableKeyboard?: boolean;
  enableWheel?: boolean;
  enableTouch?: boolean;
  enableMouse?: boolean;
  showNavigation?: boolean;
  showCounter?: boolean;
  showIndicators?: boolean;
  showAutoRotateButton?: boolean;
}

export default class PeekCarousel {
  currentIndex: number;
  totalItems: number;
  isAutoRotating: boolean;

  constructor(selector: string | HTMLElement, options?: PeekCarouselOptions);

  next(): void;
  prev(): void;
  goTo(index: number): void;
  startAutoRotate(): void;
  stopAutoRotate(): void;
  toggleAutoRotate(): void;
  updateLayoutClass(): void;
  destroy(): void;
}
