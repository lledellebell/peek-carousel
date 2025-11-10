import { CLASS_NAMES, ARIA, DURATIONS } from '../core/constants.js';
import { addClass, removeClass, setAttribute, setCSSVar } from '../utils/dom.js';

const DRAG_TRANSFORM_CONFIG = Object.freeze({
  stack: {
    maxDrag: 200,
    offsetMultiplier: 100,
    rotationMultiplier: 3,
  },
  radial: {
    rotationSensitivity: 0.2,
  },
  classic: {
    dragSensitivity: 0.5,
  },
});

export class UIManager {
  constructor(carousel) {
    this.carousel = carousel;
  }

  updateActiveStates(currentIndex) {
    for (let i = 0; i < this.carousel.items.length; i++) {
      const item = this.carousel.items[i];
      removeClass(item, CLASS_NAMES.itemActive, CLASS_NAMES.itemPrev, CLASS_NAMES.itemNext);
      item.removeAttribute(ARIA.current);
    }

    for (let i = 0; i < this.carousel.indicators.length; i++) {
      const indicator = this.carousel.indicators[i];
      removeClass(
        indicator,
        CLASS_NAMES.indicatorActive,
        CLASS_NAMES.indicatorProgress
      );
      setAttribute(indicator, ARIA.selected, 'false');
      setAttribute(indicator, ARIA.tabindex, '-1');
    }

    const currentItem = this.carousel.items[currentIndex];
    const currentIndicator = this.carousel.indicators[currentIndex];

    if (currentItem) {
      addClass(currentItem, CLASS_NAMES.itemActive);
      setAttribute(currentItem, ARIA.current, 'true');
    }

    if (currentIndicator) {
      removeClass(currentIndicator, CLASS_NAMES.indicatorCompleted);
      addClass(currentIndicator, CLASS_NAMES.indicatorActive);
      setAttribute(currentIndicator, ARIA.selected, 'true');
      setAttribute(currentIndicator, ARIA.tabindex, '0');

      if (this.carousel.autoRotate.isActive) {
        this.updateIndicatorProgress(currentIndicator);
      }
    }
  }

  updateIndicatorProgress(indicator) {
    setCSSVar(
      indicator,
      '--progress-duration',
      `${this.carousel.options.autoRotateInterval}ms`
    );

    setTimeout(() => {
      if (indicator) {
        addClass(indicator, CLASS_NAMES.indicatorProgress);
      }
    }, DURATIONS.progressReset);
  }

  clearPeekItems() {
    for (let i = 0; i < this.carousel.items.length; i++) {
      const item = this.carousel.items[i];
      removeClass(item, CLASS_NAMES.itemPrev, CLASS_NAMES.itemNext);
    }
  }

  setPeekItems(prevIndex, nextIndex) {
    const prevItem = this.carousel.items[prevIndex];
    const nextItem = this.carousel.items[nextIndex];

    if (prevItem) addClass(prevItem, CLASS_NAMES.itemPrev);
    if (nextItem) addClass(nextItem, CLASS_NAMES.itemNext);
  }

  updateAutoRotateButton(isActive) {
    const { autoRotateBtn } = this.carousel.elements;
    if (!autoRotateBtn) return;

    if (isActive) {
      addClass(autoRotateBtn, CLASS_NAMES.btnActive);
      setAttribute(autoRotateBtn, ARIA.pressed, 'true');
    } else {
      removeClass(autoRotateBtn, CLASS_NAMES.btnActive);
      setAttribute(autoRotateBtn, ARIA.pressed, 'false');
    }
  }

  addDraggingClass(index, direction) {
    const item = this.carousel.items[index];
    if (!item) return;

    const leftClass = CLASS_NAMES.itemDraggingLeft;
    const rightClass = CLASS_NAMES.itemDraggingRight;

    removeClass(item, leftClass, rightClass);

    if (direction === 'left') {
      addClass(item, leftClass);
    } else if (direction === 'right') {
      addClass(item, rightClass);
    }
  }

  removeDraggingClass(index) {
    const item = this.carousel.items[index];
    if (!item) return;

    removeClass(item, CLASS_NAMES.itemDraggingLeft, CLASS_NAMES.itemDraggingRight);
  }

  round(value, decimals = 2) {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  }

  applyEasing(progress) {
    return progress * (2 - Math.abs(progress));
  }

  updateDragTransform(dragDistance) {
    const { layoutMode } = this.carousel.options;

    if (layoutMode === 'stack') {
      // [개발참고] Stack 모드: 탄성 효과 적용 (easeOutQuad)
      const config = DRAG_TRANSFORM_CONFIG.stack;
      const clampedDrag = Math.max(-config.maxDrag, Math.min(config.maxDrag, dragDistance));
      const progress = clampedDrag / config.maxDrag;
      const easedProgress = this.applyEasing(progress);

      const dragOffset = this.round(easedProgress * config.offsetMultiplier);
      const dragRotation = this.round(easedProgress * config.rotationMultiplier);

      this.carousel.container.style.setProperty('--drag-offset', `${dragOffset}px`);
      this.carousel.container.style.setProperty('--drag-rotation', `${dragRotation}deg`);
    } else if (layoutMode === 'radial') {
      const config = DRAG_TRANSFORM_CONFIG.radial;
      const dragRotation = this.round(dragDistance * config.rotationSensitivity);

      this.carousel.container.style.setProperty('--drag-rotation-y', `${dragRotation}deg`);
    } else if (layoutMode === 'classic') {
      const config = DRAG_TRANSFORM_CONFIG.classic;
      const dragOffset = this.round(dragDistance * config.dragSensitivity);

      this.carousel.container.style.setProperty('--drag-offset', `${dragOffset}px`);
    }
  }

  clearDragTransform() {
    this.carousel.container.style.setProperty('--drag-offset', '0px');
    this.carousel.container.style.setProperty('--drag-rotation', '0deg');
    this.carousel.container.style.setProperty('--drag-rotation-y', '0deg');
  }

  destroy() {
  }
}
