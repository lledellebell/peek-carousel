import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoRotate } from '../../src/modules/AutoRotate.js';

describe('AutoRotate', () => {
  let mockCarousel;
  let autoRotate;

  beforeEach(() => {
    vi.useFakeTimers();

    mockCarousel = {
      options: {
        autoRotateInterval: 2500,
      },
      navigator: {
        next: vi.fn(),
      },
      ui: {
        updateAutoRotateButton: vi.fn(),
      },
    };

    autoRotate = new AutoRotate(mockCarousel);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('생성자', () => {
    it('초기 상태를 올바르게 설정해야 함', () => {
      expect(autoRotate.carousel).toBe(mockCarousel);
      expect(autoRotate.interval).toBeNull();
      expect(autoRotate.isActive).toBe(false);
    });
  });

  describe('setActiveState', () => {
    it('활성 상태를 설정하고 UI를 업데이트해야 함', () => {
      autoRotate.setActiveState(true);

      expect(autoRotate.isActive).toBe(true);
      expect(mockCarousel.ui.updateAutoRotateButton).toHaveBeenCalledWith(true);
    });

    it('비활성 상태를 설정하고 UI를 업데이트해야 함', () => {
      autoRotate.setActiveState(false);

      expect(autoRotate.isActive).toBe(false);
      expect(mockCarousel.ui.updateAutoRotateButton).toHaveBeenCalledWith(false);
    });
  });

  describe('toggle', () => {
    it('비활성 상태에서 활성화해야 함', () => {
      autoRotate.toggle();

      expect(autoRotate.isActive).toBe(true);
    });

    it('활성 상태에서 비활성화해야 함', () => {
      autoRotate.start();

      autoRotate.toggle();

      expect(autoRotate.isActive).toBe(false);
    });
  });

  describe('start', () => {
    it('자동 회전을 시작해야 함', () => {
      autoRotate.start();

      expect(autoRotate.isActive).toBe(true);
      expect(autoRotate.interval).not.toBeNull();
    });

    it('이미 활성 상태면 아무 작업도 하지 않아야 함', () => {
      autoRotate.start();
      const firstInterval = autoRotate.interval;

      autoRotate.start();

      expect(autoRotate.interval).toBe(firstInterval);
    });

    it('설정된 간격으로 next를 호출해야 함', () => {
      autoRotate.start();

      vi.advanceTimersByTime(2500);

      expect(mockCarousel.navigator.next).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(2500);

      expect(mockCarousel.navigator.next).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('자동 회전을 중지해야 함', () => {
      autoRotate.start();

      autoRotate.stop();

      expect(autoRotate.isActive).toBe(false);
      expect(autoRotate.interval).toBeNull();
    });

    it('비활성 상태면 아무 작업도 하지 않아야 함', () => {
      const updateSpy = mockCarousel.ui.updateAutoRotateButton;

      autoRotate.stop();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('중지 후 더 이상 next를 호출하지 않아야 함', () => {
      autoRotate.start();
      vi.advanceTimersByTime(2500);
      expect(mockCarousel.navigator.next).toHaveBeenCalledTimes(1);

      autoRotate.stop();
      vi.advanceTimersByTime(5000);

      expect(mockCarousel.navigator.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    it('자동 회전을 중지하고 참조를 정리해야 함', () => {
      autoRotate.start();

      autoRotate.destroy();

      expect(autoRotate.isActive).toBe(false);
      expect(autoRotate.interval).toBeNull();
      expect(autoRotate.carousel).toBeNull();
    });
  });
});
