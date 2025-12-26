import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Navigator } from '../../src/modules/Navigator.js';

describe('Navigator', () => {
  let mockCarousel;
  let navigator;

  beforeEach(() => {
    mockCarousel = {
      state: { currentIndex: 0 },
      totalItems: 5,
      options: {
        layoutMode: 'stack',
        preloadRange: 2,
      },
      animator: {
        updateCarousel: vi.fn(),
      },
      updateCounter: vi.fn(),
      preloadImages: vi.fn(),
    };
    navigator = new Navigator(mockCarousel);
  });

  describe('currentIndex getter/setter', () => {
    it('현재 인덱스를 반환해야 함', () => {
      mockCarousel.state.currentIndex = 2;

      expect(navigator.currentIndex).toBe(2);
    });

    it('인덱스를 정규화하여 설정해야 함', () => {
      navigator.currentIndex = 7;

      expect(mockCarousel.state.currentIndex).toBe(2);
    });

    it('음수 인덱스를 정규화해야 함', () => {
      navigator.currentIndex = -1;

      expect(mockCarousel.state.currentIndex).toBe(4);
    });
  });

  describe('getShortestDistance', () => {
    it('순방향이 짧을 때 양수를 반환해야 함', () => {
      const distance = navigator.getShortestDistance(0, 2);

      expect(distance).toBe(2);
    });

    it('역방향이 짧을 때 음수를 반환해야 함', () => {
      const distance = navigator.getShortestDistance(0, 4);

      expect(distance).toBe(-1);
    });

    it('동일한 인덱스에서 0을 반환해야 함', () => {
      const distance = navigator.getShortestDistance(2, 2);

      expect(distance).toBe(0);
    });

    it('순환을 고려하여 계산해야 함', () => {
      const distance = navigator.getShortestDistance(4, 1);

      expect(distance).toBe(2);
    });
  });

  describe('isNearby', () => {
    it('거리가 2 이하면 true를 반환해야 함', () => {
      expect(navigator.isNearby(0, 1)).toBe(true);
      expect(navigator.isNearby(0, 2)).toBe(true);
    });

    it('거리가 2 초과면 false를 반환해야 함', () => {
      mockCarousel.totalItems = 10;
      navigator = new Navigator(mockCarousel);

      expect(navigator.isNearby(0, 5)).toBe(false);
    });

    it('순환 거리도 고려해야 함', () => {
      expect(navigator.isNearby(0, 4)).toBe(true);
    });
  });

  describe('next', () => {
    it('인덱스를 1 증가시켜야 함', () => {
      mockCarousel.state.currentIndex = 0;

      navigator.next();

      expect(mockCarousel.state.currentIndex).toBe(1);
    });

    it('마지막에서 첫 번째로 순환해야 함', () => {
      mockCarousel.state.currentIndex = 4;

      navigator.next();

      expect(mockCarousel.state.currentIndex).toBe(0);
    });

    it('네비게이션 후 업데이트를 호출해야 함', () => {
      navigator.next();

      expect(mockCarousel.animator.updateCarousel).toHaveBeenCalled();
      expect(mockCarousel.updateCounter).toHaveBeenCalled();
      expect(mockCarousel.preloadImages).toHaveBeenCalled();
    });
  });

  describe('prev', () => {
    it('인덱스를 1 감소시켜야 함', () => {
      mockCarousel.state.currentIndex = 2;

      navigator.prev();

      expect(mockCarousel.state.currentIndex).toBe(1);
    });

    it('첫 번째에서 마지막으로 순환해야 함', () => {
      mockCarousel.state.currentIndex = 0;

      navigator.prev();

      expect(mockCarousel.state.currentIndex).toBe(4);
    });
  });

  describe('goTo', () => {
    it('지정된 인덱스로 이동해야 함', () => {
      navigator.goTo(3);

      expect(mockCarousel.state.currentIndex).toBe(3);
      expect(mockCarousel.animator.updateCarousel).toHaveBeenCalled();
    });

    it('동일한 인덱스면 아무 작업도 하지 않아야 함', () => {
      mockCarousel.state.currentIndex = 2;

      navigator.goTo(2);

      expect(mockCarousel.animator.updateCarousel).not.toHaveBeenCalled();
    });

    it('범위를 벗어난 인덱스를 정규화해야 함', () => {
      navigator.goTo(7);

      expect(mockCarousel.state.currentIndex).toBe(2);
    });
  });

  describe('navigateIfDifferent', () => {
    it('다른 인덱스면 콜백을 호출하고 true를 반환해야 함', () => {
      const callback = vi.fn();
      mockCarousel.state.currentIndex = 0;

      const result = navigator.navigateIfDifferent(2, callback);

      expect(callback).toHaveBeenCalledWith(2);
      expect(result).toBe(true);
    });

    it('동일한 인덱스면 콜백을 호출하지 않고 false를 반환해야 함', () => {
      const callback = vi.fn();
      mockCarousel.state.currentIndex = 2;

      const result = navigator.navigateIfDifferent(2, callback);

      expect(callback).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('handleItemClick', () => {
    it('stack 모드에서 인접 아이템 클릭 시 회전해야 함', () => {
      mockCarousel.state.currentIndex = 0;
      mockCarousel.options.layoutMode = 'stack';
      const rotateSpy = vi.spyOn(navigator, 'rotate');

      navigator.handleItemClick(1);

      expect(rotateSpy).toHaveBeenCalledWith(1);
    });

    it('stack 모드에서 먼 아이템 클릭 시 goTo를 사용해야 함', () => {
      mockCarousel.totalItems = 10;
      mockCarousel.state.currentIndex = 0;
      mockCarousel.options.layoutMode = 'stack';
      navigator = new Navigator(mockCarousel);
      const goToSpy = vi.spyOn(navigator, 'goTo');

      navigator.handleItemClick(6);

      expect(goToSpy).toHaveBeenCalledWith(6);
    });

    it('radial 모드에서 클릭 시 회전해야 함', () => {
      mockCarousel.state.currentIndex = 0;
      mockCarousel.options.layoutMode = 'radial';
      const rotateSpy = vi.spyOn(navigator, 'rotate');

      navigator.handleItemClick(2);

      expect(rotateSpy).toHaveBeenCalled();
    });

    it('동일한 아이템 클릭 시 아무 작업도 하지 않아야 함', () => {
      mockCarousel.state.currentIndex = 2;
      const rotateSpy = vi.spyOn(navigator, 'rotate');
      const goToSpy = vi.spyOn(navigator, 'goTo');

      navigator.handleItemClick(2);

      expect(rotateSpy).not.toHaveBeenCalled();
      expect(goToSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleIndicatorClick', () => {
    it('stack 모드에서 goTo를 사용해야 함', () => {
      mockCarousel.state.currentIndex = 0;
      mockCarousel.options.layoutMode = 'stack';
      const goToSpy = vi.spyOn(navigator, 'goTo');

      navigator.handleIndicatorClick(3);

      expect(goToSpy).toHaveBeenCalledWith(3);
    });

    it('radial 모드에서 회전을 사용해야 함', () => {
      mockCarousel.state.currentIndex = 0;
      mockCarousel.options.layoutMode = 'radial';
      const rotateSpy = vi.spyOn(navigator, 'rotate');

      navigator.handleIndicatorClick(2);

      expect(rotateSpy).toHaveBeenCalledWith(2);
    });

    it('동일한 인덱스 클릭 시 아무 작업도 하지 않아야 함', () => {
      mockCarousel.state.currentIndex = 2;
      const goToSpy = vi.spyOn(navigator, 'goTo');
      const rotateSpy = vi.spyOn(navigator, 'rotate');

      navigator.handleIndicatorClick(2);

      expect(goToSpy).not.toHaveBeenCalled();
      expect(rotateSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateAfterNavigation', () => {
    it('preloadRange가 0이면 preloadImages를 호출하지 않아야 함', () => {
      mockCarousel.options.preloadRange = 0;
      navigator = new Navigator(mockCarousel);

      navigator.next();

      expect(mockCarousel.preloadImages).not.toHaveBeenCalled();
    });
  });
});
