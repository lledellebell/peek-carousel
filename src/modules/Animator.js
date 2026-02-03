import { normalizeIndex } from '../utils/helpers.js';
import { CLASS_NAMES } from '../core/constants.js';

const RADIAL_RADIUS = 400;

const CLASSIC_POSITIONS = Object.freeze({
  center: { x: 50, scale: 1 },
  peek: { scale: 1 },
  hidden: { scale: 0.85 },
});

const CLASSIC_SPACING = Object.freeze({
  gapPercent: 5,
  additionalMobile: 40,
  additionalDesktop: 15,
  mobileBreakpoint: 768,
});

const MOMENTUM_CONFIG = Object.freeze({
  friction: 0.92,
  minVelocity: 0.05,
  navigationThreshold: 1.5,
  dampingFactor: 0.6,
});

const STACK_POSITION_CLASSES = [
  CLASS_NAMES.itemCenter,
  CLASS_NAMES.itemPrev,
  CLASS_NAMES.itemNext,
  CLASS_NAMES.itemHidden,
];

export class Animator {
  constructor(carousel) {
    this.carousel = carousel;
    this.momentumAnimation = null;
    this.isAnimating = false;
    this.previousIndex = null;
  }

  normalizeAngleDiff(diff) {
    return ((diff + 180) % 360) - 180;
  }

  round(value, decimals = 2) {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  }

  getAdjacentIndices(currentIndex) {
    return {
      prev: normalizeIndex(currentIndex - 1, this.carousel.totalItems),
      next: normalizeIndex(currentIndex + 1, this.carousel.totalItems),
    };
  }

  setCarouselRotation(angle) {
    const rounded = this.round(angle, 2);
    this.carousel.container.style.setProperty('--carousel-rotation', `${rounded}deg`);
  }

  setCSSVariables(element, variables) {
    for (const [key, value] of Object.entries(variables)) {
      element.style.setProperty(key, value);
    }
  }

  updateRadialRotation(currentIndex) {
    const targetAngle = -this.carousel.state.angleUnit * currentIndex;
    const currentRotation = this.carousel.container.style.getPropertyValue('--carousel-rotation');

    if (!currentRotation || currentRotation === '0deg') {
      this.setCarouselRotation(targetAngle);
      return;
    }

    const currentAngle = parseFloat(currentRotation);
    const diff = this.normalizeAngleDiff(targetAngle - currentAngle);
    const finalAngle = currentAngle + diff;
    this.setCarouselRotation(finalAngle);
  }

  updateCarousel() {
    const { currentIndex } = this.carousel.state;
    const { layoutMode } = this.carousel.options;

    if (layoutMode === 'stack' || layoutMode === 'classic') {
      this.setCarouselRotation(0);
    } else if (layoutMode === 'radial') {
      this.updateRadialRotation(currentIndex);
    }

    this.updateActiveItem();
  }

  updateActiveItem() {
    const { currentIndex } = this.carousel.state;
    const { layoutMode } = this.carousel.options;

    this.carousel.ui.updateActiveStates(currentIndex);

    if (layoutMode === 'radial') {
      this.updateRadialPositions(currentIndex);
    } else if (layoutMode === 'classic') {
      this.updateClassicPositions(currentIndex);
    } else {
      this.updateStackPositions(currentIndex);
    }
  }

  updateRadialPositions(currentIndex) {
    const { angleUnit } = this.carousel.state;

    for (let i = 0; i < this.carousel.items.length; i++) {
      const item = this.carousel.items[i];
      const angle = angleUnit * i;

      this.setCSSVariables(item, {
        '--item-angle': `${this.round(angle, 2)}deg`,
        '--item-radius': `${RADIAL_RADIUS}px`,
      });
    }

    const { prev, next } = this.getAdjacentIndices(currentIndex);
    this.carousel.ui.setPeekItems(prev, next);
  }

  updateStackPositions(currentIndex) {
    const { prev, next } = this.getAdjacentIndices(currentIndex);

    for (let i = 0; i < this.carousel.items.length; i++) {
      const item = this.carousel.items[i];

      item.classList.remove(...STACK_POSITION_CLASSES);

      if (i === currentIndex) {
        item.classList.add(CLASS_NAMES.itemCenter);
      } else if (i === prev) {
        item.classList.add(CLASS_NAMES.itemPrev);
      } else if (i === next) {
        item.classList.add(CLASS_NAMES.itemNext);
      } else {
        item.classList.add(CLASS_NAMES.itemHidden);
      }
    }
  }

  calculateClassicSpacing(containerWidth) {
    const itemWidth = Math.max(300, Math.min(containerWidth * 0.35, 500));
    const isMobile = containerWidth <= CLASSIC_SPACING.mobileBreakpoint;

    const itemHalfPercent = (itemWidth / containerWidth) * 50;
    const baseSpacing = itemHalfPercent + CLASSIC_SPACING.gapPercent;
    const additionalSpacing = isMobile
      ? CLASSIC_SPACING.additionalMobile
      : CLASSIC_SPACING.additionalDesktop;

    return baseSpacing + additionalSpacing;
  }

  // ==========================================
  // Classic Mode - Seamless Infinite Scroll
  // ==========================================

  getWrapInfo(prevIndex, currentIndex) {
    if (prevIndex === null) return { isWrap: false, direction: 0 };

    const total = this.carousel.totalItems;
    const isForwardWrap = prevIndex === total - 1 && currentIndex === 0;
    const isBackwardWrap = prevIndex === 0 && currentIndex === total - 1;

    if (isForwardWrap) return { isWrap: true, direction: 1 };
    if (isBackwardWrap) return { isWrap: true, direction: -1 };

    return { isWrap: false, direction: currentIndex > prevIndex ? 1 : -1 };
  }

  getClassicItemPosition(itemIndex, currentIndex, itemSpacing, wrapDirection = 0) {
    const { prev, next } = this.getAdjacentIndices(currentIndex);
    const total = this.carousel.totalItems;

    if (itemIndex === currentIndex) {
      return {
        x: CLASSIC_POSITIONS.center.x,
        scale: CLASSIC_POSITIONS.center.scale,
        isCenter: true,
      };
    }

    if (itemIndex === prev) {
      return {
        x: CLASSIC_POSITIONS.center.x - itemSpacing,
        scale: CLASSIC_POSITIONS.peek.scale,
        isPrev: true,
      };
    }

    if (itemIndex === next) {
      return {
        x: CLASSIC_POSITIONS.center.x + itemSpacing,
        scale: CLASSIC_POSITIONS.peek.scale,
        isNext: true,
      };
    }

    // For other items, calculate based on circular distance
    const forwardDist = (itemIndex - currentIndex + total) % total;
    const backwardDist = (currentIndex - itemIndex + total) % total;
    const isOnRight = forwardDist < backwardDist;

    return {
      x: isOnRight
        ? CLASSIC_POSITIONS.center.x + itemSpacing * 2
        : CLASSIC_POSITIONS.center.x - itemSpacing * 2,
      scale: CLASSIC_POSITIONS.hidden.scale,
      isHidden: true,
    };
  }

  updateClassicPositions(currentIndex) {
    const { prev, next } = this.getAdjacentIndices(currentIndex);
    const containerWidth = this.carousel.container.offsetWidth;
    const itemSpacing = this.calculateClassicSpacing(containerWidth);
    const { isWrap, direction } = this.getWrapInfo(this.previousIndex, currentIndex);

    const items = this.carousel.items;

    // Get previous prev/next for transition handling
    const prevAdj = this.previousIndex !== null
      ? this.getAdjacentIndices(this.previousIndex)
      : { prev: null, next: null };

    // For wrapping, only disable transitions on items that would cross the screen
    if (isWrap) {
      // Items that should animate: current, prev, next, previousIndex, and previous prev/next
      const animatingItems = new Set([
        currentIndex,
        prev,
        next,
        this.previousIndex,
        prevAdj.prev,
        prevAdj.next,
      ].filter(i => i !== null));

      for (let i = 0; i < items.length; i++) {
        if (!animatingItems.has(i)) {
          items[i].style.transition = 'none';
        }
      }
      // Force reflow
      this.carousel.container.offsetHeight;
    }

    // Update all items to their final positions
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const pos = this.getClassicItemPosition(i, currentIndex, itemSpacing);

      this.setCSSVariables(item, {
        '--item-x': `${this.round(pos.x, 2)}%`,
        '--item-scale': String(pos.scale),
      });

      // Update visibility and opacity
      if (pos.isCenter) {
        item.style.opacity = '1';
        item.style.visibility = 'visible';
        item.style.zIndex = '100';
      } else if (pos.isPrev || pos.isNext) {
        item.style.opacity = '0.6';
        item.style.visibility = 'visible';
        item.style.zIndex = '50';
      } else {
        item.style.opacity = '0';
        item.style.visibility = 'hidden';
        item.style.zIndex = '0';
      }
    }

    // Re-enable transitions
    if (isWrap) {
      requestAnimationFrame(() => {
        for (let i = 0; i < items.length; i++) {
          items[i].style.transition = '';
        }
      });
    }

    this.previousIndex = currentIndex;
    this.carousel.ui.setPeekItems(prev, next);
  }

  // ==========================================
  // Momentum
  // ==========================================

  startMomentum(velocity) {
    this.stopMomentum();

    let currentVelocity = velocity;

    const momentumStep = () => {
      currentVelocity *= MOMENTUM_CONFIG.friction;

      if (Math.abs(currentVelocity) < MOMENTUM_CONFIG.minVelocity) {
        this.stopMomentum();
        return;
      }

      if (Math.abs(currentVelocity) > MOMENTUM_CONFIG.navigationThreshold) {
        const direction = currentVelocity > 0 ? -1 : 1;
        this.carousel.navigator.rotate(direction);
        currentVelocity *= MOMENTUM_CONFIG.dampingFactor;
      }

      this.momentumAnimation = requestAnimationFrame(momentumStep);
    };

    this.isAnimating = true;
    this.momentumAnimation = requestAnimationFrame(momentumStep);
  }

  stopMomentum() {
    if (this.momentumAnimation) {
      cancelAnimationFrame(this.momentumAnimation);
      this.momentumAnimation = null;
    }
    this.isAnimating = false;
  }
}
