import { KEYS, BREAKPOINTS } from '../core/constants.js';
import { isMobile } from '../utils/helpers.js';

const WHEEL_CONFIG = Object.freeze({
  threshold: 50,
  timeout: 150,
  cooldown: 100,
});

const DRAG_CONFIG = Object.freeze({
  touchThreshold: 15,
  mouseThreshold: 10,
  velocityThreshold: 0.5,
});

const RESIZE_DEBOUNCE = 100;

let handlerId = 0;

export class EventHandler {
  constructor(carousel) {
    this.carousel = carousel;
    this.boundHandlers = new Map();
    this.resizeTimer = null;

    this.touch = {
      startX: 0,
      endX: 0,
    };

    this.drag = {
      active: false,
      startX: 0,
      currentX: 0,
      lastX: 0,
      lastTime: 0,
      velocity: 0,
    };

    this.wheel = {
      isScrolling: false,
      scrollTimeout: null,
      lastWheelTime: 0,
      accumulatedDelta: 0,
    };
  }

  init() {
    this.initNavigationButtons();
    this.initKeyboard();
    this.initWheel();
    this.initItemClick();
    this.initIndicatorClick();
    this.initTouch();
    this.initMouse();
    this.initResize();
  }

  stopAutoRotateAndNavigate(navigationFn) {
    this.completeCurrentIndicator();
    this.carousel.autoRotate.stop();
    navigationFn();
  }

  completeCurrentIndicator() {
    const currentIndicator = this.carousel.indicators[this.carousel.state.currentIndex];
    if (currentIndicator && currentIndicator.classList.contains('peek-carousel__indicator--active')) {
      currentIndicator.classList.add('peek-carousel__indicator--completed');
    }
  }

  resetDragState(index) {
    this.carousel.ui.removeDraggingClass(index);
    this.carousel.ui.clearDragTransform();
  }

  updateDraggingClass(dragDistance, currentIndex, threshold) {
    if (dragDistance > threshold) {
      this.carousel.ui.addDraggingClass(currentIndex, 'right');
    } else if (dragDistance < -threshold) {
      this.carousel.ui.addDraggingClass(currentIndex, 'left');
    }
  }

  initDragState(clientX) {
    this.drag.active = true;
    this.drag.startX = clientX;
    this.drag.currentX = clientX;
    this.drag.lastX = clientX;
    this.drag.lastTime = Date.now();
    this.drag.velocity = 0;
  }

  resetMouseCursor() {
    this.carousel.elements.carousel.style.cursor = 'grab';
  }

  calculateWheelDelta(e) {
    const deltaX = Math.abs(e.deltaX);
    const deltaY = Math.abs(e.deltaY);
    const isHorizontal = deltaX > deltaY;

    // [개발참고] 수평: 왼쪽(-) = 다음, 오른쪽(+) = 이전
    //            수직: 아래(+) = 다음, 위(-) = 이전
    return isHorizontal ? -e.deltaX : e.deltaY;
  }

  resetWheelState() {
    this.wheel.isScrolling = false;
    this.wheel.accumulatedDelta = 0;
  }

  initNavigationButtons() {
    const { prevBtn, nextBtn, autoRotateBtn } = this.carousel.elements;

    if (prevBtn) {
      this.addHandler(prevBtn, 'click', () => {
        this.stopAutoRotateAndNavigate(() => this.carousel.navigator.prev());
      });
    }

    if (nextBtn) {
      this.addHandler(nextBtn, 'click', () => {
        this.stopAutoRotateAndNavigate(() => this.carousel.navigator.next());
      });
    }

    if (autoRotateBtn) {
      this.addHandler(autoRotateBtn, 'click', () => {
        this.carousel.autoRotate.toggle();
      });
    }
  }

  initKeyboard() {
    if (!this.carousel.options.enableKeyboard) return;

    const handler = (e) => {
      const { navigator, autoRotate, totalItems } = this.carousel;

      switch (e.key) {
        case KEYS.arrowLeft:
          autoRotate.stop();
          navigator.prev();
          break;

        case KEYS.arrowRight:
          autoRotate.stop();
          navigator.next();
          break;

        case KEYS.home:
          e.preventDefault();
          autoRotate.stop();
          navigator.goTo(0);
          break;

        case KEYS.end:
          e.preventDefault();
          autoRotate.stop();
          navigator.goTo(totalItems - 1);
          break;

        case KEYS.space:
          e.preventDefault();
          autoRotate.toggle();
          break;

        default:
          const numKey = parseInt(e.key);
          if (numKey >= 1 && numKey <= totalItems) {
            e.preventDefault();
            autoRotate.stop();
            navigator.goTo(numKey - 1);
          }
      }
    };

    this.addHandler(document, 'keydown', handler);
  }

  initWheel() {
    if (!this.carousel.options.enableWheel) return;

    const handler = (e) => {
      const deltaX = Math.abs(e.deltaX);
      const deltaY = Math.abs(e.deltaY);

      if (deltaX < 1 && deltaY < 1) {
        return;
      }

      if (deltaX === deltaY) {
        return;
      }

      e.preventDefault();

      const currentTime = Date.now();

      if (currentTime - this.wheel.lastWheelTime < WHEEL_CONFIG.cooldown) {
        return;
      }

      if (!this.wheel.isScrolling) {
        this.wheel.isScrolling = true;
        this.wheel.accumulatedDelta = 0;
        this.carousel.autoRotate.stop();
        this.carousel.animator.stopMomentum();
      }

      this.wheel.accumulatedDelta += this.calculateWheelDelta(e);

      if (Math.abs(this.wheel.accumulatedDelta) >= WHEEL_CONFIG.threshold) {
        const direction = this.wheel.accumulatedDelta > 0 ? 1 : -1;
        this.carousel.navigator.rotate(direction);

        this.wheel.accumulatedDelta = 0;
        this.wheel.lastWheelTime = currentTime;
      }

      clearTimeout(this.wheel.scrollTimeout);
      this.wheel.scrollTimeout = setTimeout(() => {
        this.resetWheelState();
      }, WHEEL_CONFIG.timeout);
    };

    this.addHandler(
      this.carousel.elements.carousel,
      'wheel',
      handler,
      { passive: false }
    );
  }

  initItemClick() {
    const { items } = this.carousel;
    for (let i = 0; i < items.length; i++) {
      this.addHandler(items[i], 'click', () => {
        this.carousel.autoRotate.stop();
        this.carousel.navigator.handleItemClick(i);
      });
    }
  }

  initIndicatorClick() {
    const { indicators } = this.carousel;
    for (let i = 0; i < indicators.length; i++) {
      this.addHandler(indicators[i], 'click', () => {
        this.carousel.autoRotate.stop();
        this.carousel.navigator.handleIndicatorClick(i);
      });
    }
  }

  initTouch() {
    if (!this.carousel.options.enableTouch) return;

    this.addHandler(this.carousel.elements.carousel, 'touchstart', (e) => {
      this.touch.startX = e.changedTouches[0].screenX;
    });

    this.addHandler(this.carousel.elements.carousel, 'touchmove', (e) => {
      const touchCurrentX = e.changedTouches[0].screenX;
      const dragDistance = touchCurrentX - this.touch.startX;
      const { currentIndex } = this.carousel.state;

      this.carousel.ui.updateDragTransform(dragDistance);
      this.updateDraggingClass(dragDistance, currentIndex, DRAG_CONFIG.touchThreshold);
    });

    this.addHandler(this.carousel.elements.carousel, 'touchend', (e) => {
      this.touch.endX = e.changedTouches[0].screenX;
      const swipeDistance = this.touch.endX - this.touch.startX;
      const { swipeThreshold } = this.carousel.options;
      const { currentIndex } = this.carousel.state;

      this.resetDragState(currentIndex);

      if (swipeDistance < -swipeThreshold) {
        this.carousel.autoRotate.stop();
        this.carousel.navigator.next();
      } else if (swipeDistance > swipeThreshold) {
        this.carousel.autoRotate.stop();
        this.carousel.navigator.prev();
      }
    });
  }

  initMouse() {
    if (!this.carousel.options.enableMouse) return;

    this.addHandler(this.carousel.elements.carousel, 'mousedown', (e) => {
      if (isMobile()) return;

      this.initDragState(e.clientX);
      this.carousel.autoRotate.stop();
      this.carousel.animator.stopMomentum();
      this.carousel.elements.carousel.style.cursor = 'grabbing';
      e.preventDefault();
    });

    this.addHandler(document, 'mousemove', (e) => {
      if (!this.drag.active) return;

      const currentTime = Date.now();
      const deltaTime = currentTime - this.drag.lastTime;
      const deltaX = e.clientX - this.drag.lastX;

      if (deltaTime > 0) {
        this.drag.velocity = deltaX / deltaTime;
      }

      this.drag.currentX = e.clientX;
      this.drag.lastX = e.clientX;
      this.drag.lastTime = currentTime;

      const dragDistance = this.drag.currentX - this.drag.startX;
      const { currentIndex } = this.carousel.state;

      this.carousel.ui.updateDragTransform(dragDistance);
      this.updateDraggingClass(dragDistance, currentIndex, DRAG_CONFIG.mouseThreshold);

      if (Math.abs(dragDistance) > this.carousel.options.dragThreshold) {
        const direction = dragDistance > 0 ? -1 : 1;
        this.carousel.navigator.rotate(direction);
        this.drag.startX = this.drag.currentX;
        this.resetDragState(currentIndex);
      }
    });

    this.addHandler(document, 'mouseup', () => {
      if (!this.drag.active) return;

      this.drag.active = false;
      this.resetMouseCursor();

      const { currentIndex } = this.carousel.state;
      this.resetDragState(currentIndex);

      if (Math.abs(this.drag.velocity) > DRAG_CONFIG.velocityThreshold) {
        this.carousel.animator.startMomentum(this.drag.velocity);
      }
    });

    this.addHandler(this.carousel.elements.carousel, 'mouseleave', () => {
      if (this.drag.active) {
        this.drag.active = false;
        this.resetMouseCursor();

        const { currentIndex } = this.carousel.state;
        this.resetDragState(currentIndex);
      }
    });

    if (window.innerWidth > BREAKPOINTS.mobile) {
      this.resetMouseCursor();
    }
  }

  initResize() {
    const handler = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.carousel) {
          this.carousel.animator.updateCarousel();
        }
      }, RESIZE_DEBOUNCE);
    };

    this.addHandler(window, 'resize', handler);
  }

  addHandler(element, event, handler, options) {
    element.addEventListener(event, handler, options);

    const key = `${event}-${++handlerId}`;
    this.boundHandlers.set(key, { element, event, handler, options });
  }

  destroy() {
    if (this.wheel.scrollTimeout) {
      clearTimeout(this.wheel.scrollTimeout);
      this.wheel.scrollTimeout = null;
    }

    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }

    for (const { element, event, handler, options } of this.boundHandlers.values()) {
      element.removeEventListener(event, handler, options);
    }
    this.boundHandlers.clear();

    this.drag.active = false;
    this.drag.velocity = 0;
    this.wheel.isScrolling = false;
    this.wheel.accumulatedDelta = 0;

    this.carousel = null;
  }
}
