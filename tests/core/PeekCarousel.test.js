import { describe, it, expect, vi, beforeEach } from 'vitest';
import PeekCarousel from '../../src/core/PeekCarousel.js';
import { createCarouselFixture, cleanupCarouselFixture } from '../setup.js';

describe('PeekCarousel', () => {
  let container;

  beforeEach(() => {
    container = createCarouselFixture({ itemCount: 5 });
  });

  describe('생성자 (Constructor)', () => {
    it('유효한 셀렉터로 캐러셀을 생성해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(carousel).toBeInstanceOf(PeekCarousel);
      expect(carousel.totalItems).toBe(5);
    });

    it('HTMLElement로 캐러셀을 생성해야 함', () => {
      const carousel = new PeekCarousel(container);

      expect(carousel).toBeInstanceOf(PeekCarousel);
      expect(carousel.container).toBe(container);
    });

    it('유효하지 않은 셀렉터로 에러를 발생시켜야 함', () => {
      expect(() => new PeekCarousel('#nonexistent')).toThrow(
        'PeekCarousel: 셀렉터 "#nonexistent"에 해당하는 컨테이너를 찾을 수 없습니다',
      );
    });

    it('아이템이 없으면 에러를 발생시켜야 함', () => {
      cleanupCarouselFixture();
      const emptyContainer = document.createElement('div');
      emptyContainer.id = 'empty-carousel';
      emptyContainer.innerHTML = '<div class="peek-carousel__track"></div>';
      document.body.appendChild(emptyContainer);

      expect(() => new PeekCarousel('#empty-carousel')).toThrow(
        'PeekCarousel: 캐러셀 아이템을 찾을 수 없습니다',
      );
    });

    it('기본 옵션으로 초기화되어야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(carousel.options.layoutMode).toBe('stack');
      expect(carousel.options.autoRotate).toBe(false);
      expect(carousel.options.showNavigation).toBe(true);
      expect(carousel.options.showCounter).toBe(true);
      expect(carousel.options.showIndicators).toBe(true);
    });

    it('사용자 정의 옵션을 적용해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', {
        layoutMode: 'radial',
        autoRotate: true,
        startIndex: 2,
      });

      expect(carousel.options.layoutMode).toBe('radial');
      expect(carousel.options.autoRotate).toBe(true);
      expect(carousel.currentIndex).toBe(2);
    });
  });

  describe('UI 요소 생성', () => {
    it('네비게이션 버튼을 생성해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(carousel.elements.prevBtn).not.toBeNull();
      expect(carousel.elements.nextBtn).not.toBeNull();
      expect(carousel.elements.prevBtn.getAttribute('aria-label')).toBe('Previous');
      expect(carousel.elements.nextBtn.getAttribute('aria-label')).toBe('Next');
    });

    it('showNavigation: false일 때 네비게이션을 생성하지 않아야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', {
        showNavigation: false,
      });

      expect(carousel.elements.prevBtn).toBeNull();
      expect(carousel.elements.nextBtn).toBeNull();
    });

    it('인디케이터를 생성해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(carousel.indicators.length).toBe(5);
      for (let i = 0; i < carousel.indicators.length; i++) {
        expect(carousel.indicators[i].getAttribute('role')).toBe('tab');
      }
    });

    it('카운터를 생성해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(carousel.counterElement).not.toBeNull();
      expect(carousel.counterElement.getAttribute('aria-live')).toBe('polite');
    });

    it('자동 회전 버튼을 생성해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(carousel.elements.autoRotateBtn).not.toBeNull();
      expect(carousel.elements.autoRotateBtn.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Public API - 네비게이션', () => {
    it('next()로 다음 아이템으로 이동해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { startIndex: 0 });

      carousel.next();

      expect(carousel.currentIndex).toBe(1);
    });

    it('prev()로 이전 아이템으로 이동해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { startIndex: 2 });

      carousel.prev();

      expect(carousel.currentIndex).toBe(1);
    });

    it('goTo()로 특정 인덱스로 이동해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { startIndex: 0 });

      carousel.goTo(3);

      expect(carousel.currentIndex).toBe(3);
    });

    it('마지막 아이템에서 next()로 첫 아이템으로 순환해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { startIndex: 4 });

      carousel.next();

      expect(carousel.currentIndex).toBe(0);
    });

    it('첫 아이템에서 prev()로 마지막 아이템으로 순환해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { startIndex: 0 });

      carousel.prev();

      expect(carousel.currentIndex).toBe(4);
    });
  });

  describe('Public API - 자동 회전', () => {
    it('startAutoRotate()로 자동 회전을 시작해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      carousel.startAutoRotate();

      expect(carousel.isAutoRotating).toBe(true);
    });

    it('stopAutoRotate()로 자동 회전을 중지해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { autoRotate: true });

      carousel.stopAutoRotate();

      expect(carousel.isAutoRotating).toBe(false);
    });

    it('toggleAutoRotate()로 자동 회전을 토글해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      carousel.toggleAutoRotate();
      expect(carousel.isAutoRotating).toBe(true);

      carousel.toggleAutoRotate();
      expect(carousel.isAutoRotating).toBe(false);
    });
  });

  describe('레이아웃 모드', () => {
    it('stack 모드 클래스를 추가해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { layoutMode: 'stack' });

      expect(container.classList.contains('peek-carousel--stack')).toBe(true);
    });

    it('radial 모드 클래스를 추가해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { layoutMode: 'radial' });

      expect(container.classList.contains('peek-carousel--radial')).toBe(true);
    });

    it('classic 모드 클래스를 추가해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { layoutMode: 'classic' });

      expect(container.classList.contains('peek-carousel--classic')).toBe(true);
    });
  });

  describe('destroy()', () => {
    it('destroy() 호출 시 이벤트 핸들러를 정리해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');
      const eventHandlerDestroySpy = vi.spyOn(carousel.eventHandler, 'destroy');
      const uiDestroySpy = vi.spyOn(carousel.ui, 'destroy');

      carousel.destroy();

      expect(eventHandlerDestroySpy).toHaveBeenCalled();
      expect(uiDestroySpy).toHaveBeenCalled();
    });

    it('자동 회전 중일 때 destroy()로 자동 회전을 중지해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', { autoRotate: true });
      const autoRotateDestroySpy = vi.spyOn(carousel.autoRotate, 'destroy');

      carousel.destroy();

      expect(autoRotateDestroySpy).toHaveBeenCalled();
    });
  });

  describe('CSS 변수 초기화', () => {
    it('CSS 변수를 초기화해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel');

      expect(container.style.getPropertyValue('--carousel-rotation')).toBe('0deg');
      expect(container.style.getPropertyValue('--drag-offset')).toBe('0px');
    });
  });

  describe('이미지 로딩 속성', () => {
    it('인접 이미지에 eager 로딩을 설정해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', {
        startIndex: 2,
        preloadRange: 1,
      });

      const items = container.querySelectorAll('.peek-carousel__item');
      const img1 = items[1].querySelector('img');
      const img2 = items[2].querySelector('img');
      const img3 = items[3].querySelector('img');

      expect(img1.getAttribute('loading')).toBe('eager');
      expect(img2.getAttribute('loading')).toBe('eager');
      expect(img3.getAttribute('loading')).toBe('eager');
    });

    it('멀리 있는 이미지에 lazy 로딩을 설정해야 함', () => {
      const carousel = new PeekCarousel('#test-carousel', {
        startIndex: 0,
        preloadRange: 1,
      });

      const items = container.querySelectorAll('.peek-carousel__item');
      const img3 = items[3].querySelector('img');
      const img4 = items[4].querySelector('img');

      expect(img3.getAttribute('loading')).toBe('lazy');
      expect(img4.getAttribute('loading')).toBe('lazy');
    });
  });
});
