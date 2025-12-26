import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Animator } from '../../src/modules/Animator.js';

describe('Animator', () => {
  let mockCarousel;
  let animator;

  beforeEach(() => {
    const createItem = () => {
      const item = document.createElement('div');
      item.className = 'peek-carousel__item';
      return item;
    };

    mockCarousel = {
      container: document.createElement('div'),
      items: [createItem(), createItem(), createItem(), createItem(), createItem()],
      state: {
        currentIndex: 0,
        angleUnit: 72,
      },
      totalItems: 5,
      options: {
        layoutMode: 'stack',
      },
      ui: {
        updateActiveStates: vi.fn(),
        setPeekItems: vi.fn(),
      },
      navigator: {
        rotate: vi.fn(),
      },
    };

    Object.defineProperty(mockCarousel.container, 'offsetWidth', {
      value: 1000,
      configurable: true,
    });

    animator = new Animator(mockCarousel);
  });

  afterEach(() => {
    if (animator) {
      animator.stopMomentum();
    }
  });

  describe('생성자', () => {
    it('초기 상태를 올바르게 설정해야 함', () => {
      expect(animator.carousel).toBe(mockCarousel);
      expect(animator.momentumAnimation).toBeNull();
      expect(animator.isAnimating).toBe(false);
    });
  });

  describe('normalizeAngleDiff', () => {
    it('각도 차이를 -180 ~ 180 범위로 정규화해야 함', () => {
      expect(animator.normalizeAngleDiff(0)).toBe(0);
      expect(animator.normalizeAngleDiff(90)).toBe(90);
      expect(animator.normalizeAngleDiff(-90)).toBe(-90);
      expect(animator.normalizeAngleDiff(270)).toBe(-90);
      expect(animator.normalizeAngleDiff(-270)).toBe(-270);
    });
  });

  describe('round', () => {
    it('기본 2자리로 반올림해야 함', () => {
      expect(animator.round(3.14159)).toBe(3.14);
      expect(animator.round(2.999)).toBe(3);
    });

    it('지정된 자릿수로 반올림해야 함', () => {
      expect(animator.round(3.14159, 3)).toBe(3.142);
    });
  });

  describe('getAdjacentIndices', () => {
    it('인접 인덱스를 반환해야 함', () => {
      const { prev, next } = animator.getAdjacentIndices(2);

      expect(prev).toBe(1);
      expect(next).toBe(3);
    });

    it('첫 번째 인덱스에서 순환해야 함', () => {
      const { prev, next } = animator.getAdjacentIndices(0);

      expect(prev).toBe(4);
      expect(next).toBe(1);
    });

    it('마지막 인덱스에서 순환해야 함', () => {
      const { prev, next } = animator.getAdjacentIndices(4);

      expect(prev).toBe(3);
      expect(next).toBe(0);
    });
  });

  describe('setCarouselRotation', () => {
    it('CSS 변수로 회전 각도를 설정해야 함', () => {
      animator.setCarouselRotation(45);

      expect(mockCarousel.container.style.getPropertyValue('--carousel-rotation')).toBe('45deg');
    });

    it('소수점을 반올림해야 함', () => {
      animator.setCarouselRotation(45.6789);

      expect(mockCarousel.container.style.getPropertyValue('--carousel-rotation')).toBe('45.68deg');
    });
  });

  describe('setCSSVariables', () => {
    it('여러 CSS 변수를 설정해야 함', () => {
      const element = document.createElement('div');

      animator.setCSSVariables(element, {
        '--var1': '10px',
        '--var2': '20deg',
      });

      expect(element.style.getPropertyValue('--var1')).toBe('10px');
      expect(element.style.getPropertyValue('--var2')).toBe('20deg');
    });
  });

  describe('updateRadialRotation', () => {
    it('현재 인덱스에 따라 회전을 설정해야 함', () => {
      mockCarousel.state.angleUnit = 72;

      animator.updateRadialRotation(2);

      expect(mockCarousel.container.style.getPropertyValue('--carousel-rotation')).toBe('-144deg');
    });

    it('회전값이 없을 때 목표 각도를 직접 설정해야 함', () => {
      animator.updateRadialRotation(1);

      expect(mockCarousel.container.style.getPropertyValue('--carousel-rotation')).toBe('-72deg');
    });

    it('최단 경로로 회전해야 함', () => {
      mockCarousel.container.style.setProperty('--carousel-rotation', '-288deg');
      mockCarousel.state.angleUnit = 72;

      animator.updateRadialRotation(0);

      const rotation = parseFloat(mockCarousel.container.style.getPropertyValue('--carousel-rotation'));
      expect(rotation).toBe(-360);
    });
  });

  describe('updateCarousel', () => {
    it('stack 모드에서 회전을 0으로 설정해야 함', () => {
      mockCarousel.options.layoutMode = 'stack';

      animator.updateCarousel();

      expect(mockCarousel.container.style.getPropertyValue('--carousel-rotation')).toBe('0deg');
      expect(mockCarousel.ui.updateActiveStates).toHaveBeenCalled();
    });

    it('classic 모드에서 회전을 0으로 설정해야 함', () => {
      mockCarousel.options.layoutMode = 'classic';

      animator.updateCarousel();

      expect(mockCarousel.container.style.getPropertyValue('--carousel-rotation')).toBe('0deg');
    });

    it('radial 모드에서 updateRadialRotation을 호출해야 함', () => {
      mockCarousel.options.layoutMode = 'radial';
      const updateRadialSpy = vi.spyOn(animator, 'updateRadialRotation');

      animator.updateCarousel();

      expect(updateRadialSpy).toHaveBeenCalled();
    });
  });

  describe('updateActiveItem', () => {
    it('radial 모드에서 radial 위치를 업데이트해야 함', () => {
      mockCarousel.options.layoutMode = 'radial';
      const updateRadialSpy = vi.spyOn(animator, 'updateRadialPositions');

      animator.updateActiveItem();

      expect(updateRadialSpy).toHaveBeenCalled();
    });

    it('classic 모드에서 classic 위치를 업데이트해야 함', () => {
      mockCarousel.options.layoutMode = 'classic';
      const updateClassicSpy = vi.spyOn(animator, 'updateClassicPositions');

      animator.updateActiveItem();

      expect(updateClassicSpy).toHaveBeenCalled();
    });

    it('stack 모드에서 stack 위치를 업데이트해야 함', () => {
      mockCarousel.options.layoutMode = 'stack';
      const updateStackSpy = vi.spyOn(animator, 'updateStackPositions');

      animator.updateActiveItem();

      expect(updateStackSpy).toHaveBeenCalled();
    });
  });

  describe('updateRadialPositions', () => {
    it('각 아이템에 각도와 반경을 설정해야 함', () => {
      animator.updateRadialPositions(0);

      for (let i = 0; i < mockCarousel.items.length; i++) {
        expect(mockCarousel.items[i].style.getPropertyValue('--item-angle')).not.toBe('');
        expect(mockCarousel.items[i].style.getPropertyValue('--item-radius')).toBe('400px');
      }
    });

    it('peek 아이템을 설정해야 함', () => {
      animator.updateRadialPositions(2);

      expect(mockCarousel.ui.setPeekItems).toHaveBeenCalledWith(1, 3);
    });
  });

  describe('updateStackPositions', () => {
    it('현재 아이템에 center 클래스를 추가해야 함', () => {
      animator.updateStackPositions(2);

      expect(mockCarousel.items[2].classList.contains('peek-carousel__item--center')).toBe(true);
    });

    it('이전 아이템에 prev 클래스를 추가해야 함', () => {
      animator.updateStackPositions(2);

      expect(mockCarousel.items[1].classList.contains('peek-carousel__item--prev')).toBe(true);
    });

    it('다음 아이템에 next 클래스를 추가해야 함', () => {
      animator.updateStackPositions(2);

      expect(mockCarousel.items[3].classList.contains('peek-carousel__item--next')).toBe(true);
    });

    it('나머지 아이템에 hidden 클래스를 추가해야 함', () => {
      animator.updateStackPositions(2);

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--hidden')).toBe(true);
      expect(mockCarousel.items[4].classList.contains('peek-carousel__item--hidden')).toBe(true);
    });
  });

  describe('calculateClassicSpacing', () => {
    it('컨테이너 너비에 따라 간격을 계산해야 함', () => {
      const spacing = animator.calculateClassicSpacing(1000);

      expect(typeof spacing).toBe('number');
      expect(spacing).toBeGreaterThan(0);
    });

    it('모바일 너비에서 더 큰 간격을 반환해야 함', () => {
      const desktopSpacing = animator.calculateClassicSpacing(1000);
      const mobileSpacing = animator.calculateClassicSpacing(500);

      expect(mobileSpacing).toBeGreaterThan(desktopSpacing);
    });
  });

  describe('getClassicItemPosition', () => {
    it('현재 아이템은 중앙에 위치해야 함', () => {
      const position = animator.getClassicItemPosition(2, 2, 30);

      expect(position.x).toBe(50);
      expect(position.scale).toBe(1);
    });

    it('이전 아이템은 왼쪽에 위치해야 함', () => {
      const position = animator.getClassicItemPosition(1, 2, 30);

      expect(position.x).toBe(20);
      expect(position.scale).toBe(1);
    });

    it('다음 아이템은 오른쪽에 위치해야 함', () => {
      const position = animator.getClassicItemPosition(3, 2, 30);

      expect(position.x).toBe(80);
      expect(position.scale).toBe(1);
    });

    it('숨겨진 아이템은 더 멀리 위치해야 함', () => {
      const position = animator.getClassicItemPosition(0, 2, 30);

      expect(position.x).toBe(-10);
      expect(position.scale).toBe(0.85);
    });
  });

  describe('updateClassicPositions', () => {
    it('각 아이템에 위치와 스케일을 설정해야 함', () => {
      animator.updateClassicPositions(2);

      for (let i = 0; i < mockCarousel.items.length; i++) {
        expect(mockCarousel.items[i].style.getPropertyValue('--item-x')).not.toBe('');
        expect(mockCarousel.items[i].style.getPropertyValue('--item-scale')).not.toBe('');
      }
    });

    it('peek 아이템을 설정해야 함', () => {
      animator.updateClassicPositions(2);

      expect(mockCarousel.ui.setPeekItems).toHaveBeenCalledWith(1, 3);
    });
  });

  describe('startMomentum', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('애니메이션 상태를 활성화해야 함', () => {
      animator.startMomentum(2);

      expect(animator.isAnimating).toBe(true);
    });

    it('기존 모멘텀을 중지해야 함', () => {
      const stopSpy = vi.spyOn(animator, 'stopMomentum');

      animator.startMomentum(2);

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('stopMomentum', () => {
    it('애니메이션을 중지해야 함', () => {
      animator.momentumAnimation = 123;
      animator.isAnimating = true;

      animator.stopMomentum();

      expect(animator.momentumAnimation).toBeNull();
      expect(animator.isAnimating).toBe(false);
    });

    it('애니메이션이 없을 때도 안전하게 처리해야 함', () => {
      expect(() => animator.stopMomentum()).not.toThrow();
    });
  });
});
