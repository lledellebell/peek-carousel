import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventHandler } from '../../src/modules/EventHandler.js';

describe('EventHandler', () => {
  let mockCarousel;
  let eventHandler;

  beforeEach(() => {
    const mockElement = document.createElement('div');
    mockElement.style.cursor = '';

    mockCarousel = {
      container: document.createElement('div'),
      elements: {
        carousel: mockElement,
        prevBtn: document.createElement('button'),
        nextBtn: document.createElement('button'),
        autoRotateBtn: document.createElement('button'),
      },
      items: [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ],
      indicators: [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ],
      state: { currentIndex: 0 },
      totalItems: 3,
      options: {
        enableKeyboard: true,
        enableWheel: true,
        enableTouch: true,
        enableMouse: true,
        swipeThreshold: 50,
        dragThreshold: 80,
      },
      navigator: {
        next: vi.fn(),
        prev: vi.fn(),
        goTo: vi.fn(),
        rotate: vi.fn(),
        handleItemClick: vi.fn(),
        handleIndicatorClick: vi.fn(),
      },
      autoRotate: {
        stop: vi.fn(),
        toggle: vi.fn(),
      },
      animator: {
        updateCarousel: vi.fn(),
        stopMomentum: vi.fn(),
        startMomentum: vi.fn(),
      },
      ui: {
        updateDragTransform: vi.fn(),
        addDraggingClass: vi.fn(),
        removeDraggingClass: vi.fn(),
        clearDragTransform: vi.fn(),
      },
    };

    eventHandler = new EventHandler(mockCarousel);
  });

  describe('생성자', () => {
    it('초기 상태를 올바르게 설정해야 함', () => {
      expect(eventHandler.carousel).toBe(mockCarousel);
      expect(eventHandler.boundHandlers).toBeInstanceOf(Map);
      expect(eventHandler.touch.startX).toBe(0);
      expect(eventHandler.drag.active).toBe(false);
      expect(eventHandler.wheel.isScrolling).toBe(false);
    });
  });

  describe('init', () => {
    it('모든 이벤트 핸들러를 초기화해야 함', () => {
      const initNavSpy = vi.spyOn(eventHandler, 'initNavigationButtons');
      const initKeyboardSpy = vi.spyOn(eventHandler, 'initKeyboard');
      const initWheelSpy = vi.spyOn(eventHandler, 'initWheel');
      const initItemClickSpy = vi.spyOn(eventHandler, 'initItemClick');
      const initIndicatorClickSpy = vi.spyOn(eventHandler, 'initIndicatorClick');
      const initTouchSpy = vi.spyOn(eventHandler, 'initTouch');
      const initMouseSpy = vi.spyOn(eventHandler, 'initMouse');
      const initResizeSpy = vi.spyOn(eventHandler, 'initResize');

      eventHandler.init();

      expect(initNavSpy).toHaveBeenCalled();
      expect(initKeyboardSpy).toHaveBeenCalled();
      expect(initWheelSpy).toHaveBeenCalled();
      expect(initItemClickSpy).toHaveBeenCalled();
      expect(initIndicatorClickSpy).toHaveBeenCalled();
      expect(initTouchSpy).toHaveBeenCalled();
      expect(initMouseSpy).toHaveBeenCalled();
      expect(initResizeSpy).toHaveBeenCalled();
    });
  });

  describe('stopAutoRotateAndNavigate', () => {
    it('자동 회전을 중지하고 네비게이션 함수를 호출해야 함', () => {
      const navigationFn = vi.fn();

      eventHandler.stopAutoRotateAndNavigate(navigationFn);

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(navigationFn).toHaveBeenCalled();
    });
  });

  describe('completeCurrentIndicator', () => {
    it('활성 인디케이터에 완료 클래스를 추가해야 함', () => {
      const indicator = mockCarousel.indicators[0];
      indicator.classList.add('peek-carousel__indicator--active');

      eventHandler.completeCurrentIndicator();

      expect(indicator.classList.contains('peek-carousel__indicator--completed')).toBe(true);
    });

    it('비활성 인디케이터에는 완료 클래스를 추가하지 않아야 함', () => {
      const indicator = mockCarousel.indicators[0];

      eventHandler.completeCurrentIndicator();

      expect(indicator.classList.contains('peek-carousel__indicator--completed')).toBe(false);
    });
  });

  describe('resetDragState', () => {
    it('드래그 상태를 초기화해야 함', () => {
      eventHandler.resetDragState(0);

      expect(mockCarousel.ui.removeDraggingClass).toHaveBeenCalledWith(0);
      expect(mockCarousel.ui.clearDragTransform).toHaveBeenCalled();
    });
  });

  describe('updateDraggingClass', () => {
    it('오른쪽 드래그 시 right 클래스를 추가해야 함', () => {
      eventHandler.updateDraggingClass(20, 0, 10);

      expect(mockCarousel.ui.addDraggingClass).toHaveBeenCalledWith(0, 'right');
    });

    it('왼쪽 드래그 시 left 클래스를 추가해야 함', () => {
      eventHandler.updateDraggingClass(-20, 0, 10);

      expect(mockCarousel.ui.addDraggingClass).toHaveBeenCalledWith(0, 'left');
    });

    it('임계값 이하 드래그 시 클래스를 추가하지 않아야 함', () => {
      eventHandler.updateDraggingClass(5, 0, 10);

      expect(mockCarousel.ui.addDraggingClass).not.toHaveBeenCalled();
    });
  });

  describe('initDragState', () => {
    it('드래그 상태를 초기화해야 함', () => {
      eventHandler.initDragState(100);

      expect(eventHandler.drag.active).toBe(true);
      expect(eventHandler.drag.startX).toBe(100);
      expect(eventHandler.drag.currentX).toBe(100);
      expect(eventHandler.drag.lastX).toBe(100);
      expect(eventHandler.drag.velocity).toBe(0);
    });
  });

  describe('resetMouseCursor', () => {
    it('커서를 grab으로 설정해야 함', () => {
      eventHandler.resetMouseCursor();

      expect(mockCarousel.elements.carousel.style.cursor).toBe('grab');
    });
  });

  describe('calculateWheelDelta', () => {
    it('수평 스크롤 시 음수 deltaX를 반환해야 함', () => {
      const event = { deltaX: 50, deltaY: 10 };

      const result = eventHandler.calculateWheelDelta(event);

      expect(result).toBe(-50);
    });

    it('수직 스크롤 시 deltaY를 반환해야 함', () => {
      const event = { deltaX: 10, deltaY: 50 };

      const result = eventHandler.calculateWheelDelta(event);

      expect(result).toBe(50);
    });
  });

  describe('resetWheelState', () => {
    it('휠 상태를 초기화해야 함', () => {
      eventHandler.wheel.isScrolling = true;
      eventHandler.wheel.accumulatedDelta = 100;

      eventHandler.resetWheelState();

      expect(eventHandler.wheel.isScrolling).toBe(false);
      expect(eventHandler.wheel.accumulatedDelta).toBe(0);
    });
  });

  describe('initNavigationButtons', () => {
    it('이전 버튼 클릭 시 prev를 호출해야 함', () => {
      eventHandler.initNavigationButtons();

      mockCarousel.elements.prevBtn.click();

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(mockCarousel.navigator.prev).toHaveBeenCalled();
    });

    it('다음 버튼 클릭 시 next를 호출해야 함', () => {
      eventHandler.initNavigationButtons();

      mockCarousel.elements.nextBtn.click();

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(mockCarousel.navigator.next).toHaveBeenCalled();
    });

    it('자동 회전 버튼 클릭 시 toggle을 호출해야 함', () => {
      eventHandler.initNavigationButtons();

      mockCarousel.elements.autoRotateBtn.click();

      expect(mockCarousel.autoRotate.toggle).toHaveBeenCalled();
    });

    it('버튼이 없으면 에러 없이 처리해야 함', () => {
      mockCarousel.elements.prevBtn = null;
      mockCarousel.elements.nextBtn = null;
      mockCarousel.elements.autoRotateBtn = null;

      expect(() => eventHandler.initNavigationButtons()).not.toThrow();
    });
  });

  describe('initKeyboard', () => {
    it('enableKeyboard가 false면 핸들러를 등록하지 않아야 함', () => {
      mockCarousel.options.enableKeyboard = false;
      const addHandlerSpy = vi.spyOn(eventHandler, 'addHandler');

      eventHandler.initKeyboard();

      expect(addHandlerSpy).not.toHaveBeenCalled();
    });

    it('ArrowLeft 키로 이전으로 이동해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      document.dispatchEvent(event);

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(mockCarousel.navigator.prev).toHaveBeenCalled();
    });

    it('ArrowRight 키로 다음으로 이동해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(event);

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(mockCarousel.navigator.next).toHaveBeenCalled();
    });

    it('Home 키로 첫 번째로 이동해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: 'Home' });
      document.dispatchEvent(event);

      expect(mockCarousel.navigator.goTo).toHaveBeenCalledWith(0);
    });

    it('End 키로 마지막으로 이동해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: 'End' });
      document.dispatchEvent(event);

      expect(mockCarousel.navigator.goTo).toHaveBeenCalledWith(2);
    });

    it('Space 키로 자동 회전을 토글해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      expect(mockCarousel.autoRotate.toggle).toHaveBeenCalled();
    });

    it('숫자 키로 해당 인덱스로 이동해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: '2' });
      document.dispatchEvent(event);

      expect(mockCarousel.navigator.goTo).toHaveBeenCalledWith(1);
    });

    it('범위를 벗어난 숫자 키는 무시해야 함', () => {
      eventHandler.initKeyboard();

      const event = new KeyboardEvent('keydown', { key: '9' });
      document.dispatchEvent(event);

      expect(mockCarousel.navigator.goTo).not.toHaveBeenCalled();
    });
  });

  describe('initWheel', () => {
    it('enableWheel이 false면 핸들러를 등록하지 않아야 함', () => {
      mockCarousel.options.enableWheel = false;
      const addHandlerSpy = vi.spyOn(eventHandler, 'addHandler');

      eventHandler.initWheel();

      expect(addHandlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('initItemClick', () => {
    it('아이템 클릭 시 handleItemClick을 호출해야 함', () => {
      eventHandler.initItemClick();

      mockCarousel.items[1].click();

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(mockCarousel.navigator.handleItemClick).toHaveBeenCalledWith(1);
    });
  });

  describe('initIndicatorClick', () => {
    it('인디케이터 클릭 시 handleIndicatorClick을 호출해야 함', () => {
      eventHandler.initIndicatorClick();

      mockCarousel.indicators[2].click();

      expect(mockCarousel.autoRotate.stop).toHaveBeenCalled();
      expect(mockCarousel.navigator.handleIndicatorClick).toHaveBeenCalledWith(2);
    });
  });

  describe('initTouch', () => {
    it('enableTouch가 false면 핸들러를 등록하지 않아야 함', () => {
      mockCarousel.options.enableTouch = false;
      const addHandlerSpy = vi.spyOn(eventHandler, 'addHandler');

      eventHandler.initTouch();

      expect(addHandlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('initMouse', () => {
    it('enableMouse가 false면 핸들러를 등록하지 않아야 함', () => {
      mockCarousel.options.enableMouse = false;
      const addHandlerSpy = vi.spyOn(eventHandler, 'addHandler');

      eventHandler.initMouse();

      expect(addHandlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('addHandler', () => {
    it('이벤트 핸들러를 등록하고 맵에 저장해야 함', () => {
      const element = document.createElement('div');
      const handler = vi.fn();

      eventHandler.addHandler(element, 'click', handler);

      expect(eventHandler.boundHandlers.size).toBe(1);

      element.click();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('모든 이벤트 핸들러를 제거해야 함', () => {
      const element = document.createElement('div');
      const handler = vi.fn();
      eventHandler.addHandler(element, 'click', handler);

      eventHandler.destroy();

      expect(eventHandler.boundHandlers.size).toBe(0);
      expect(eventHandler.carousel).toBeNull();
    });

    it('휠 타임아웃을 정리해야 함', () => {
      eventHandler.wheel.scrollTimeout = setTimeout(() => {}, 1000);
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      eventHandler.destroy();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(eventHandler.wheel.scrollTimeout).toBeNull();
    });
  });
});
