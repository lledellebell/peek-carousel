import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ICONS, getIcon, injectIcon, injectAutoRotateIcons } from '../../src/utils/icons.js';

describe('icons', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('ICONS', () => {
    it('prev 아이콘이 정의되어 있어야 함', () => {
      expect(ICONS.prev).toBeDefined();
      expect(ICONS.prev.path).toBeDefined();
    });

    it('next 아이콘이 정의되어 있어야 함', () => {
      expect(ICONS.next).toBeDefined();
      expect(ICONS.next.path).toBeDefined();
    });

    it('play 아이콘이 정의되어 있어야 함', () => {
      expect(ICONS.play).toBeDefined();
      expect(ICONS.play.path).toBeDefined();
    });

    it('pause 아이콘이 정의되어 있어야 함', () => {
      expect(ICONS.pause).toBeDefined();
      expect(ICONS.pause.path).toBeDefined();
    });
  });

  describe('getIcon', () => {
    it('존재하는 아이콘에 대해 SVG 문자열을 반환해야 함', () => {
      const svg = getIcon('prev');

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain(ICONS.prev.path);
    });

    it('존재하지 않는 아이콘에 대해 빈 문자열을 반환해야 함', () => {
      const svg = getIcon('nonexistent');

      expect(svg).toBe('');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'PeekCarousel: 아이콘 "nonexistent"을 찾을 수 없습니다',
      );
    });

    it('사용자 정의 옵션을 적용해야 함', () => {
      const svg = getIcon('prev', { width: 32, height: 32 });

      expect(svg).toContain('width="32"');
      expect(svg).toContain('height="32"');
    });

    it('캐시된 아이콘을 반환해야 함', () => {
      const svg1 = getIcon('next');
      const svg2 = getIcon('next');

      expect(svg1).toBe(svg2);
    });

    it('play 아이콘은 fill 옵션이 적용되어야 함', () => {
      const svg = getIcon('play');

      expect(svg).toContain('fill="currentColor"');
    });

    it('pause 아이콘은 stroke none이어야 함', () => {
      const svg = getIcon('pause');

      expect(svg).toContain('stroke="none"');
    });
  });

  describe('injectIcon', () => {
    it('버튼에 아이콘을 주입해야 함', () => {
      const button = document.createElement('button');

      injectIcon(button, 'prev');

      expect(button.innerHTML).toContain('<svg');
    });

    it('이미 SVG가 있으면 주입하지 않아야 함', () => {
      const button = document.createElement('button');
      button.innerHTML = '<svg></svg>';
      const originalHTML = button.innerHTML;

      injectIcon(button, 'prev');

      expect(button.innerHTML).toBe(originalHTML);
    });

    it('버튼이 null이면 아무 작업도 하지 않아야 함', () => {
      expect(() => injectIcon(null, 'prev')).not.toThrow();
    });

    it('버튼이 HTMLElement가 아니면 아무 작업도 하지 않아야 함', () => {
      expect(() => injectIcon('not-element', 'prev')).not.toThrow();
    });

    it('존재하지 않는 아이콘은 주입하지 않아야 함', () => {
      const button = document.createElement('button');

      injectIcon(button, 'nonexistent');

      expect(button.innerHTML).toBe('');
    });

    it('사용자 정의 옵션으로 아이콘을 주입해야 함', () => {
      const button = document.createElement('button');

      injectIcon(button, 'prev', { width: 48 });

      expect(button.innerHTML).toContain('width="48"');
    });
  });

  describe('injectAutoRotateIcons', () => {
    it('버튼에 play와 pause 아이콘을 주입해야 함', () => {
      const button = document.createElement('button');

      injectAutoRotateIcons(button);

      expect(button.innerHTML).toContain('play-icon');
      expect(button.innerHTML).toContain('pause-icon');
      expect(button.querySelectorAll('svg').length).toBe(2);
    });

    it('이미 SVG가 있으면 주입하지 않아야 함', () => {
      const button = document.createElement('button');
      button.innerHTML = '<svg></svg>';
      const originalHTML = button.innerHTML;

      injectAutoRotateIcons(button);

      expect(button.innerHTML).toBe(originalHTML);
    });

    it('버튼이 null이면 아무 작업도 하지 않아야 함', () => {
      expect(() => injectAutoRotateIcons(null)).not.toThrow();
    });

    it('버튼이 HTMLElement가 아니면 아무 작업도 하지 않아야 함', () => {
      expect(() => injectAutoRotateIcons('not-element')).not.toThrow();
    });
  });
});
