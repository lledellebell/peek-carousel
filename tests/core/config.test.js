import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateOptions, DEFAULT_OPTIONS, LAYOUT_MODES } from '../../src/core/config.js';

describe('config', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('LAYOUT_MODES', () => {
    it('올바른 레이아웃 모드 상수를 정의해야 함', () => {
      expect(LAYOUT_MODES.STACK).toBe('stack');
      expect(LAYOUT_MODES.RADIAL).toBe('radial');
      expect(LAYOUT_MODES.CLASSIC).toBe('classic');
    });

    it('불변 객체여야 함', () => {
      expect(Object.isFrozen(LAYOUT_MODES)).toBe(true);
    });
  });

  describe('DEFAULT_OPTIONS', () => {
    it('올바른 기본값을 정의해야 함', () => {
      expect(DEFAULT_OPTIONS.startIndex).toBe(1);
      expect(DEFAULT_OPTIONS.layoutMode).toBe('stack');
      expect(DEFAULT_OPTIONS.autoRotate).toBe(false);
      expect(DEFAULT_OPTIONS.autoRotateInterval).toBe(2500);
      expect(DEFAULT_OPTIONS.preloadRange).toBe(2);
      expect(DEFAULT_OPTIONS.swipeThreshold).toBe(50);
      expect(DEFAULT_OPTIONS.dragThreshold).toBe(80);
      expect(DEFAULT_OPTIONS.enableKeyboard).toBe(true);
      expect(DEFAULT_OPTIONS.enableWheel).toBe(true);
      expect(DEFAULT_OPTIONS.enableTouch).toBe(true);
      expect(DEFAULT_OPTIONS.enableMouse).toBe(true);
      expect(DEFAULT_OPTIONS.showNavigation).toBe(true);
      expect(DEFAULT_OPTIONS.showCounter).toBe(true);
      expect(DEFAULT_OPTIONS.showIndicators).toBe(true);
      expect(DEFAULT_OPTIONS.showAutoRotateButton).toBe(true);
    });

    it('불변 객체여야 함', () => {
      expect(Object.isFrozen(DEFAULT_OPTIONS)).toBe(true);
    });
  });

  describe('validateOptions', () => {
    it('빈 객체에 기본값을 적용해야 함', () => {
      const result = validateOptions({});

      expect(result).toEqual(DEFAULT_OPTIONS);
    });

    it('유효한 사용자 정의 옵션을 유지해야 함', () => {
      const customOptions = {
        startIndex: 3,
        layoutMode: 'radial',
        autoRotate: true,
        autoRotateInterval: 3000,
      };

      const result = validateOptions(customOptions);

      expect(result.startIndex).toBe(3);
      expect(result.layoutMode).toBe('radial');
      expect(result.autoRotate).toBe(true);
      expect(result.autoRotateInterval).toBe(3000);
    });

    it('음수 startIndex를 기본값 1로 수정해야 함', () => {
      const result = validateOptions({ startIndex: -5 });

      expect(result.startIndex).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'PeekCarousel: startIndex는 0 이상이어야 합니다. 기본값 1 사용',
      );
    });

    it('유효하지 않은 layoutMode를 stack으로 수정해야 함', () => {
      const result = validateOptions({ layoutMode: 'invalid' });

      expect(result.layoutMode).toBe('stack');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'PeekCarousel: 유효하지 않은 layoutMode "invalid". 기본값 "stack" 사용',
      );
    });

    it('100ms 미만의 autoRotateInterval을 기본값 2500으로 수정해야 함', () => {
      const result = validateOptions({ autoRotateInterval: 50 });

      expect(result.autoRotateInterval).toBe(2500);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'PeekCarousel: autoRotateInterval은 100ms 이상이어야 합니다. 기본값 2500 사용',
      );
    });

    it('음수 preloadRange를 기본값 2로 수정해야 함', () => {
      const result = validateOptions({ preloadRange: -1 });

      expect(result.preloadRange).toBe(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'PeekCarousel: preloadRange는 0 이상이어야 합니다. 기본값 2 사용',
      );
    });

    it('유효한 layoutMode 값들을 모두 허용해야 함', () => {
      const stackResult = validateOptions({ layoutMode: 'stack' });
      const radialResult = validateOptions({ layoutMode: 'radial' });
      const classicResult = validateOptions({ layoutMode: 'classic' });

      expect(stackResult.layoutMode).toBe('stack');
      expect(radialResult.layoutMode).toBe('radial');
      expect(classicResult.layoutMode).toBe('classic');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('정확히 100ms인 autoRotateInterval을 허용해야 함', () => {
      const result = validateOptions({ autoRotateInterval: 100 });

      expect(result.autoRotateInterval).toBe(100);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('정확히 0인 startIndex를 허용해야 함', () => {
      const result = validateOptions({ startIndex: 0 });

      expect(result.startIndex).toBe(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('정확히 0인 preloadRange를 허용해야 함', () => {
      const result = validateOptions({ preloadRange: 0 });

      expect(result.preloadRange).toBe(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
