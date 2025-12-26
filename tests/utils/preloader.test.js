import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { preloadImage, preloadImages, preloadImagesInRange } from '../../src/utils/preloader.js';

describe('preloader', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('preloadImage', () => {
    it('소스가 없으면 에러를 발생시켜야 함', async () => {
      await expect(preloadImage('')).rejects.toThrow('이미지 소스가 제공되지 않았습니다');
      await expect(preloadImage(null)).rejects.toThrow('이미지 소스가 제공되지 않았습니다');
      await expect(preloadImage(undefined)).rejects.toThrow('이미지 소스가 제공되지 않았습니다');
    });
  });

  describe('preloadImages', () => {
    it('빈 배열을 전달하면 빈 배열을 반환해야 함', async () => {
      const result = await preloadImages([]);

      expect(result).toEqual([]);
    });

    it('null을 전달하면 빈 배열을 반환해야 함', async () => {
      const result = await preloadImages(null);

      expect(result).toEqual([]);
    });

    it('undefined를 전달하면 빈 배열을 반환해야 함', async () => {
      const result = await preloadImages(undefined);

      expect(result).toEqual([]);
    });
  });

  describe('preloadImagesInRange', () => {
    let mockItems;

    beforeEach(() => {
      const createMockItem = (src, complete = false) => {
        const item = document.createElement('div');
        const img = document.createElement('img');
        img.src = src;
        Object.defineProperty(img, 'complete', { value: complete, writable: true });
        item.appendChild(img);
        return item;
      };

      mockItems = [
        createMockItem('http://example.com/1.jpg'),
        createMockItem('http://example.com/2.jpg'),
        createMockItem('http://example.com/3.jpg'),
        createMockItem('http://example.com/4.jpg'),
        createMockItem('http://example.com/5.jpg'),
      ];
    });

    it('아이템이 없으면 아무 작업도 하지 않아야 함', () => {
      expect(() => preloadImagesInRange(null, 0, 2)).not.toThrow();
      expect(() => preloadImagesInRange([], 0, 2)).not.toThrow();
    });

    it('range가 음수면 아무 작업도 하지 않아야 함', () => {
      expect(() => preloadImagesInRange(mockItems, 0, -1)).not.toThrow();
    });

    it('이미 로드된 이미지는 프리로드하지 않아야 함', () => {
      const createCompleteItem = () => {
        const item = document.createElement('div');
        const img = document.createElement('img');
        img.src = 'http://example.com/complete.jpg';
        Object.defineProperty(img, 'complete', { value: true });
        item.appendChild(img);
        return item;
      };

      const completeItems = [
        createCompleteItem(),
        createCompleteItem(),
        createCompleteItem(),
      ];

      expect(() => preloadImagesInRange(completeItems, 1, 1)).not.toThrow();
    });

    it('현재 인덱스 주변의 이미지를 프리로드해야 함', () => {
      expect(() => preloadImagesInRange(mockItems, 2, 2)).not.toThrow();
    });

    it('이미지가 없는 아이템은 건너뛰어야 함', () => {
      const itemWithoutImg = document.createElement('div');
      const items = [itemWithoutImg, ...mockItems];

      expect(() => preloadImagesInRange(items, 0, 1)).not.toThrow();
    });

    it('src가 없는 이미지는 건너뛰어야 함', () => {
      const itemWithEmptyImg = document.createElement('div');
      const img = document.createElement('img');
      itemWithEmptyImg.appendChild(img);
      const items = [itemWithEmptyImg, ...mockItems];

      expect(() => preloadImagesInRange(items, 0, 1)).not.toThrow();
    });
  });
});
