import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isMobile, normalizeIndex, clamp, debounce, throttle } from '../../src/utils/helpers.js';

describe('helpers', () => {
  describe('isMobile', () => {
    const originalInnerWidth = window.innerWidth;

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        writable: true,
      });
    });

    it('화면 너비가 768px 이하면 true를 반환해야 함', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });

      expect(isMobile()).toBe(true);
    });

    it('화면 너비가 768px 초과면 false를 반환해야 함', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

      expect(isMobile()).toBe(false);
    });

    it('화면 너비가 정확히 768px면 true를 반환해야 함', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });

      expect(isMobile()).toBe(true);
    });
  });

  describe('normalizeIndex', () => {
    it('범위 내 인덱스는 그대로 반환해야 함', () => {
      expect(normalizeIndex(2, 5)).toBe(2);
      expect(normalizeIndex(0, 5)).toBe(0);
      expect(normalizeIndex(4, 5)).toBe(4);
    });

    it('양수 오버플로우를 정규화해야 함', () => {
      expect(normalizeIndex(5, 5)).toBe(0);
      expect(normalizeIndex(7, 5)).toBe(2);
      expect(normalizeIndex(10, 5)).toBe(0);
    });

    it('음수 인덱스를 정규화해야 함', () => {
      expect(normalizeIndex(-1, 5)).toBe(4);
      expect(normalizeIndex(-2, 5)).toBe(3);
      expect(normalizeIndex(-5, 5)).toBe(0);
      expect(normalizeIndex(-6, 5)).toBe(4);
    });

    it('length가 0 이하면 0을 반환해야 함', () => {
      expect(normalizeIndex(3, 0)).toBe(0);
      expect(normalizeIndex(3, -1)).toBe(0);
    });

    it('length가 1이면 항상 0을 반환해야 함', () => {
      expect(normalizeIndex(0, 1)).toBe(0);
      expect(normalizeIndex(5, 1)).toBe(0);
      expect(normalizeIndex(-3, 1)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('범위 내 값은 그대로 반환해야 함', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('최소값보다 작으면 최소값을 반환해야 함', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(-100, 0, 10)).toBe(0);
    });

    it('최대값보다 크면 최대값을 반환해야 함', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });

    it('min이 max보다 클 때 자동으로 교환해야 함', () => {
      expect(clamp(5, 10, 0)).toBe(5);
      expect(clamp(-5, 10, 0)).toBe(0);
      expect(clamp(15, 10, 0)).toBe(10);
    });

    it('음수 범위에서도 작동해야 함', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('함수가 아닌 인자를 전달하면 에러를 발생시켜야 함', () => {
      expect(() => debounce('not a function', 100)).toThrow(TypeError);
      expect(() => debounce('not a function', 100)).toThrow('첫 번째 인자는 함수여야 합니다');
    });

    it('지연 시간 후에 함수를 실행해야 함', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('연속 호출 시 마지막 호출만 실행해야 함', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(50);
      debouncedFn('second');
      vi.advanceTimersByTime(50);
      debouncedFn('third');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('인자를 올바르게 전달해야 함', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('함수가 아닌 인자를 전달하면 에러를 발생시켜야 함', () => {
      expect(() => throttle('not a function', 100)).toThrow(TypeError);
      expect(() => throttle('not a function', 100)).toThrow('첫 번째 인자는 함수여야 합니다');
    });

    it('첫 번째 호출을 즉시 실행해야 함', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('제한 시간 내 연속 호출을 무시해야 함', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('제한 시간 후에는 다시 호출할 수 있어야 함', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      vi.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('인자를 올바르게 전달해야 함', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1', 'arg2');

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});
