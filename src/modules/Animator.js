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

    // [개발참고] 최단 경로 계산: -180 ~ 180 범위로 정규화
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

  getClassicItemPosition(itemIndex, currentIndex, itemSpacing) {
    const { prev, next } = this.getAdjacentIndices(currentIndex);

    if (itemIndex === currentIndex) {
      return {
        x: CLASSIC_POSITIONS.center.x,
        scale: CLASSIC_POSITIONS.center.scale,
      };
    }

    if (itemIndex === prev) {
      return {
        x: CLASSIC_POSITIONS.center.x - itemSpacing,
        scale: CLASSIC_POSITIONS.peek.scale,
      };
    }

    if (itemIndex === next) {
      return {
        x: CLASSIC_POSITIONS.center.x + itemSpacing,
        scale: CLASSIC_POSITIONS.peek.scale,
      };
    }

    const distanceFromCurrent = itemIndex - currentIndex;
    return {
      x: distanceFromCurrent < 0
        ? CLASSIC_POSITIONS.center.x - itemSpacing * 2
        : CLASSIC_POSITIONS.center.x + itemSpacing * 2,
      scale: CLASSIC_POSITIONS.hidden.scale,
    };
  }

  updateClassicPositions(currentIndex) {
    const { prev, next } = this.getAdjacentIndices(currentIndex);
    const containerWidth = this.carousel.container.offsetWidth;
    const itemSpacing = this.calculateClassicSpacing(containerWidth);

    for (let i = 0; i < this.carousel.items.length; i++) {
      const item = this.carousel.items[i];
      const { x, scale } = this.getClassicItemPosition(i, currentIndex, itemSpacing);

      this.setCSSVariables(item, {
        '--item-x': `${this.round(x, 2)}%`,
        '--item-scale': String(scale),
      });
    }

    this.carousel.ui.setPeekItems(prev, next);
  }

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
