import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UIManager } from '../../src/modules/UIManager.js';

describe('UIManager', () => {
  let mockCarousel;
  let uiManager;

  beforeEach(() => {
    const createItem = () => {
      const item = document.createElement('div');
      item.className = 'peek-carousel__item';
      return item;
    };

    const createIndicator = () => {
      const indicator = document.createElement('button');
      indicator.className = 'indicator peek-carousel__indicator';
      return indicator;
    };

    mockCarousel = {
      container: document.createElement('div'),
      items: [createItem(), createItem(), createItem()],
      indicators: [createIndicator(), createIndicator(), createIndicator()],
      elements: {
        autoRotateBtn: document.createElement('button'),
      },
      state: { currentIndex: 0 },
      options: {
        layoutMode: 'stack',
        autoRotateInterval: 2500,
      },
      autoRotate: {
        isActive: false,
      },
    };

    uiManager = new UIManager(mockCarousel);
  });

  describe('updateActiveStates', () => {
    it('현재 아이템에 활성 클래스를 추가해야 함', () => {
      uiManager.updateActiveStates(1);

      expect(mockCarousel.items[1].classList.contains('peek-carousel__item--active')).toBe(true);
      expect(mockCarousel.items[1].getAttribute('aria-current')).toBe('true');
    });

    it('이전 아이템에서 활성 클래스를 제거해야 함', () => {
      mockCarousel.items[0].classList.add('peek-carousel__item--active');

      uiManager.updateActiveStates(1);

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--active')).toBe(false);
    });

    it('현재 인디케이터에 활성 클래스를 추가해야 함', () => {
      uiManager.updateActiveStates(1);

      expect(mockCarousel.indicators[1].classList.contains('peek-carousel__indicator--active')).toBe(true);
      expect(mockCarousel.indicators[1].getAttribute('aria-selected')).toBe('true');
      expect(mockCarousel.indicators[1].getAttribute('tabindex')).toBe('0');
    });

    it('비활성 인디케이터에 tabindex -1을 설정해야 함', () => {
      uiManager.updateActiveStates(1);

      expect(mockCarousel.indicators[0].getAttribute('tabindex')).toBe('-1');
      expect(mockCarousel.indicators[2].getAttribute('tabindex')).toBe('-1');
    });

    it('자동 회전 활성 시 프로그레스를 업데이트해야 함', () => {
      mockCarousel.autoRotate.isActive = true;
      const updateProgressSpy = vi.spyOn(uiManager, 'updateIndicatorProgress');

      uiManager.updateActiveStates(1);

      expect(updateProgressSpy).toHaveBeenCalledWith(mockCarousel.indicators[1]);
    });

    it('완료 클래스를 제거해야 함', () => {
      mockCarousel.indicators[1].classList.add('peek-carousel__indicator--completed');

      uiManager.updateActiveStates(1);

      expect(mockCarousel.indicators[1].classList.contains('peek-carousel__indicator--completed')).toBe(false);
    });
  });

  describe('updateIndicatorProgress', () => {
    it('프로그레스 지속 시간 CSS 변수를 설정해야 함', () => {
      const indicator = mockCarousel.indicators[0];

      uiManager.updateIndicatorProgress(indicator);

      expect(indicator.style.getPropertyValue('--progress-duration')).toBe('2500ms');
    });
  });

  describe('clearPeekItems', () => {
    it('모든 아이템에서 prev/next 클래스를 제거해야 함', () => {
      mockCarousel.items[0].classList.add('peek-carousel__item--prev');
      mockCarousel.items[2].classList.add('peek-carousel__item--next');

      uiManager.clearPeekItems();

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--prev')).toBe(false);
      expect(mockCarousel.items[2].classList.contains('peek-carousel__item--next')).toBe(false);
    });
  });

  describe('setPeekItems', () => {
    it('prev/next 아이템에 해당 클래스를 추가해야 함', () => {
      uiManager.setPeekItems(0, 2);

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--prev')).toBe(true);
      expect(mockCarousel.items[2].classList.contains('peek-carousel__item--next')).toBe(true);
    });

    it('유효하지 않은 인덱스는 무시해야 함', () => {
      expect(() => uiManager.setPeekItems(-1, 10)).not.toThrow();
    });
  });

  describe('updateAutoRotateButton', () => {
    it('활성 상태일 때 버튼에 활성 클래스를 추가해야 함', () => {
      uiManager.updateAutoRotateButton(true);

      expect(mockCarousel.elements.autoRotateBtn.classList.contains('peek-carousel__btn--active')).toBe(true);
      expect(mockCarousel.elements.autoRotateBtn.getAttribute('aria-pressed')).toBe('true');
    });

    it('비활성 상태일 때 버튼에서 활성 클래스를 제거해야 함', () => {
      mockCarousel.elements.autoRotateBtn.classList.add('peek-carousel__btn--active');

      uiManager.updateAutoRotateButton(false);

      expect(mockCarousel.elements.autoRotateBtn.classList.contains('peek-carousel__btn--active')).toBe(false);
      expect(mockCarousel.elements.autoRotateBtn.getAttribute('aria-pressed')).toBe('false');
    });

    it('버튼이 없으면 에러 없이 처리해야 함', () => {
      mockCarousel.elements.autoRotateBtn = null;

      expect(() => uiManager.updateAutoRotateButton(true)).not.toThrow();
    });
  });

  describe('addDraggingClass', () => {
    it('왼쪽 방향으로 드래그 클래스를 추가해야 함', () => {
      uiManager.addDraggingClass(0, 'left');

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--dragging-left')).toBe(true);
    });

    it('오른쪽 방향으로 드래그 클래스를 추가해야 함', () => {
      uiManager.addDraggingClass(0, 'right');

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--dragging-right')).toBe(true);
    });

    it('기존 드래그 클래스를 제거하고 새 클래스를 추가해야 함', () => {
      mockCarousel.items[0].classList.add('peek-carousel__item--dragging-left');

      uiManager.addDraggingClass(0, 'right');

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--dragging-left')).toBe(false);
      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--dragging-right')).toBe(true);
    });

    it('유효하지 않은 인덱스는 무시해야 함', () => {
      expect(() => uiManager.addDraggingClass(10, 'left')).not.toThrow();
    });
  });

  describe('removeDraggingClass', () => {
    it('드래그 클래스를 제거해야 함', () => {
      mockCarousel.items[0].classList.add('peek-carousel__item--dragging-left');
      mockCarousel.items[0].classList.add('peek-carousel__item--dragging-right');

      uiManager.removeDraggingClass(0);

      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--dragging-left')).toBe(false);
      expect(mockCarousel.items[0].classList.contains('peek-carousel__item--dragging-right')).toBe(false);
    });

    it('유효하지 않은 인덱스는 무시해야 함', () => {
      expect(() => uiManager.removeDraggingClass(10)).not.toThrow();
    });
  });

  describe('round', () => {
    it('기본 2자리로 반올림해야 함', () => {
      expect(uiManager.round(3.14159)).toBe(3.14);
      expect(uiManager.round(2.999)).toBe(3);
    });

    it('지정된 자릿수로 반올림해야 함', () => {
      expect(uiManager.round(3.14159, 3)).toBe(3.142);
      expect(uiManager.round(3.14159, 0)).toBe(3);
    });
  });

  describe('applyEasing', () => {
    it('easeOutQuad 이징을 적용해야 함', () => {
      expect(uiManager.applyEasing(0)).toBe(0);
      expect(uiManager.applyEasing(1)).toBe(1);
      expect(uiManager.applyEasing(0.5)).toBe(0.75);
    });

    it('음수 값도 처리해야 함', () => {
      expect(uiManager.applyEasing(-0.5)).toBe(-0.75);
    });
  });

  describe('updateDragTransform', () => {
    it('stack 모드에서 드래그 오프셋과 회전을 설정해야 함', () => {
      mockCarousel.options.layoutMode = 'stack';

      uiManager.updateDragTransform(100);

      expect(mockCarousel.container.style.getPropertyValue('--drag-offset')).not.toBe('0px');
      expect(mockCarousel.container.style.getPropertyValue('--drag-rotation')).not.toBe('0deg');
    });

    it('radial 모드에서 Y축 회전을 설정해야 함', () => {
      mockCarousel.options.layoutMode = 'radial';

      uiManager.updateDragTransform(100);

      expect(mockCarousel.container.style.getPropertyValue('--drag-rotation-y')).not.toBe('0deg');
    });

    it('classic 모드에서 드래그 오프셋을 설정해야 함', () => {
      mockCarousel.options.layoutMode = 'classic';

      uiManager.updateDragTransform(100);

      expect(mockCarousel.container.style.getPropertyValue('--drag-offset')).not.toBe('0px');
    });

    it('stack 모드에서 최대 드래그를 제한해야 함', () => {
      mockCarousel.options.layoutMode = 'stack';

      uiManager.updateDragTransform(500);
      const offset1 = mockCarousel.container.style.getPropertyValue('--drag-offset');

      uiManager.updateDragTransform(1000);
      const offset2 = mockCarousel.container.style.getPropertyValue('--drag-offset');

      expect(offset1).toBe(offset2);
    });
  });

  describe('clearDragTransform', () => {
    it('모든 드래그 변환을 초기화해야 함', () => {
      mockCarousel.container.style.setProperty('--drag-offset', '50px');
      mockCarousel.container.style.setProperty('--drag-rotation', '10deg');
      mockCarousel.container.style.setProperty('--drag-rotation-y', '20deg');

      uiManager.clearDragTransform();

      expect(mockCarousel.container.style.getPropertyValue('--drag-offset')).toBe('0px');
      expect(mockCarousel.container.style.getPropertyValue('--drag-rotation')).toBe('0deg');
      expect(mockCarousel.container.style.getPropertyValue('--drag-rotation-y')).toBe('0deg');
    });
  });

  describe('destroy', () => {
    it('에러 없이 호출되어야 함', () => {
      expect(() => uiManager.destroy()).not.toThrow();
    });
  });
});
