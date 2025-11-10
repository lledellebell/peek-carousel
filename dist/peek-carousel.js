/**
 * PeekCarousel - Peek 효과를 가진 캐러셀
 * @version 1.0.0
 * @license MIT
 * @author lledellebell
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PeekCarousel = factory());
})(this, (function () { 'use strict';

  const LAYOUT_MODES = Object.freeze({
    STACK: 'stack',
    RADIAL: 'radial',
    CLASSIC: 'classic'
  });
  const DEFAULT_OPTIONS = Object.freeze({
    startIndex: 1,
    layoutMode: LAYOUT_MODES.STACK,
    autoRotate: false,
    autoRotateInterval: 2500,
    preloadRange: 2,
    swipeThreshold: 50,
    dragThreshold: 80,
    enableKeyboard: true,
    enableWheel: true,
    enableTouch: true,
    enableMouse: true,
    showNavigation: true,
    showCounter: true,
    showIndicators: true,
    showAutoRotateButton: true
  });
  function validateOptions(options) {
    const validated = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    if (validated.startIndex < 0) {
      console.warn('PeekCarousel: startIndex는 0 이상이어야 합니다. 기본값 1 사용');
      validated.startIndex = 1;
    }
    if (!Object.values(LAYOUT_MODES).includes(validated.layoutMode)) {
      console.warn(`PeekCarousel: 유효하지 않은 layoutMode "${validated.layoutMode}". 기본값 "stack" 사용`);
      validated.layoutMode = LAYOUT_MODES.STACK;
    }
    if (validated.autoRotateInterval < 100) {
      console.warn('PeekCarousel: autoRotateInterval은 100ms 이상이어야 합니다. 기본값 2500 사용');
      validated.autoRotateInterval = 2500;
    }
    if (validated.preloadRange < 0) {
      console.warn('PeekCarousel: preloadRange는 0 이상이어야 합니다. 기본값 2 사용');
      validated.preloadRange = 2;
    }
    return validated;
  }

  const CLASS_NAMES = Object.freeze({
    carousel: 'peek-carousel',
    track: 'peek-carousel__track',
    item: 'peek-carousel__item',
    itemActive: 'peek-carousel__item--active',
    itemPrev: 'peek-carousel__item--prev',
    itemNext: 'peek-carousel__item--next',
    itemCenter: 'peek-carousel__item--center',
    itemHidden: 'peek-carousel__item--hidden',
    itemDraggingLeft: 'peek-carousel__item--dragging-left',
    itemDraggingRight: 'peek-carousel__item--dragging-right',
    figure: 'peek-carousel__figure',
    image: 'peek-carousel__image',
    caption: 'peek-carousel__caption',
    nav: 'peek-carousel__nav',
    navBtn: 'nav-btn',
    btn: 'peek-carousel__btn',
    prevBtn: 'prev-btn',
    nextBtn: 'next-btn',
    autoRotateBtn: 'auto-rotate-btn',
    btnAutoRotate: 'peek-carousel__btn--auto-rotate',
    btnActive: 'peek-carousel__btn--active',
    controls: 'peek-carousel__controls',
    indicators: 'peek-carousel__indicators',
    indicator: 'indicator',
    indicatorPeek: 'peek-carousel__indicator',
    indicatorActive: 'peek-carousel__indicator--active',
    indicatorProgress: 'peek-carousel__indicator--progress',
    indicatorCompleted: 'peek-carousel__indicator--completed',
    counter: 'peek-carousel__counter',
    counterCurrent: 'peek-carousel__counter-current',
    counterSeparator: 'peek-carousel__counter-separator',
    counterTotal: 'peek-carousel__counter-total',
    playIcon: 'play-icon',
    pauseIcon: 'pause-icon'
  });
  const SELECTORS = Object.freeze({
    carousel: '.peek-carousel__track',
    item: '.peek-carousel__item',
    indicator: '.indicator',
    prevBtn: '.prev-btn',
    nextBtn: '.next-btn',
    autoRotateBtn: '.auto-rotate-btn',
    playIcon: '.play-icon',
    pauseIcon: '.pause-icon',
    image: 'img'
  });
  const ARIA = Object.freeze({
    current: 'aria-current',
    selected: 'aria-selected',
    pressed: 'aria-pressed',
    label: 'aria-label',
    tabindex: 'tabindex'
  });
  const BREAKPOINTS = Object.freeze({
    mobile: 768 // [개발참고] px
  });
  const DURATIONS = Object.freeze({
    transition: 500,
    // [개발참고] ms
    progressReset: 10 // [개발참고] ms
  });
  const KEYS = Object.freeze({
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    home: 'Home',
    end: 'End',
    space: ' '
  });

  function getElement(selector) {
    if (typeof selector === 'string') {
      return document.querySelector(selector);
    }
    return selector instanceof HTMLElement ? selector : null;
  }
  function getElements(selector, parent = document) {
    if (typeof selector !== 'string') return [];
    return Array.from(parent.querySelectorAll(selector));
  }
  function addClass(element, ...classes) {
    if (element instanceof HTMLElement && classes.length > 0) {
      element.classList.add(...classes);
    }
  }
  function removeClass(element, ...classes) {
    if (element instanceof HTMLElement && classes.length > 0) {
      element.classList.remove(...classes);
    }
  }
  function setCSSVar(element, property, value) {
    if (element instanceof HTMLElement && property) {
      element.style.setProperty(property, value);
    }
  }
  function setAttribute(element, name, value) {
    if (element instanceof HTMLElement && name) {
      element.setAttribute(name, value);
    }
  }

  const loadingCache = new Map();
  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('이미지 소스가 제공되지 않았습니다'));
        return;
      }
      if (loadingCache.has(src)) {
        return loadingCache.get(src);
      }
      const img = new Image();
      const promise = new Promise((res, rej) => {
        img.onload = () => {
          loadingCache.delete(src);
          res(img);
        };
        img.onerror = () => {
          loadingCache.delete(src);
          rej(new Error(`이미지 로드 실패: ${src}`));
        };
        img.src = src;
      });
      loadingCache.set(src, promise);
      promise.then(resolve, reject);
    });
  }
  function preloadImages(sources) {
    if (!sources || sources.length === 0) {
      return Promise.resolve([]);
    }
    const uniqueSources = [...new Set(sources)];
    return Promise.all(uniqueSources.map(src => preloadImage(src)));
  }
  function preloadImagesInRange(items, currentIndex, range) {
    if (!items || items.length === 0 || range < 0) {
      return;
    }
    const totalItems = items.length;
    const imagesToPreload = new Set();
    for (let distance = 1; distance <= range; distance++) {
      const prevIndex = (currentIndex - distance + totalItems) % totalItems;
      const nextIndex = (currentIndex + distance) % totalItems;
      const prevImg = items[prevIndex]?.querySelector('img');
      const nextImg = items[nextIndex]?.querySelector('img');
      if (prevImg && prevImg.src && !prevImg.complete) {
        imagesToPreload.add(prevImg.src);
      }
      if (nextImg && nextImg.src && !nextImg.complete) {
        imagesToPreload.add(nextImg.src);
      }
    }
    if (imagesToPreload.size > 0) {
      preloadImages([...imagesToPreload]).catch(err => {
        console.warn('일부 이미지 프리로드 실패:', err);
      });
    }
  }

  const iconCache = new Map();
  function createSVGIcon(path, options = {}) {
    const {
      width = 24,
      height = 24,
      viewBox = '0 0 24 24',
      fill = 'none',
      stroke = 'currentColor',
      strokeWidth = 2,
      strokeLinecap = 'round',
      strokeLinejoin = 'round',
      className = ''
    } = options;
    const cacheKey = `${path}-${JSON.stringify(options)}`;
    if (iconCache.has(cacheKey)) {
      return iconCache.get(cacheKey);
    }
    const svg = `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="${fill}" xmlns="http://www.w3.org/2000/svg" class="${className}"><path d="${path}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="${strokeLinecap}" stroke-linejoin="${strokeLinejoin}"/></svg>`;
    iconCache.set(cacheKey, svg);
    return svg;
  }
  const ICONS = {
    prev: {
      path: 'M15 18L9 12L15 6',
      options: {}
    },
    next: {
      path: 'M9 18L15 12L9 6',
      options: {}
    },
    play: {
      path: 'M8 6.5v11l9-5.5z',
      options: {
        fill: 'currentColor',
        stroke: 'currentColor',
        strokeWidth: 0,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    },
    pause: {
      path: 'M7 5.5C7 5.22386 7.22386 5 7.5 5H9.5C9.77614 5 10 5.22386 10 5.5V18.5C10 18.7761 9.77614 19 9.5 19H7.5C7.22386 19 7 18.7761 7 18.5V5.5ZM14 5.5C14 5.22386 14.2239 5 14.5 5H16.5C16.7761 5 17 5.22386 17 5.5V18.5C17 18.7761 16.7761 19 16.5 19H14.5C14.2239 19 14 18.7761 14 18.5V5.5Z',
      options: {
        fill: 'currentColor',
        stroke: 'none'
      }
    }
  };
  function getIcon(iconName, customOptions = {}) {
    const icon = ICONS[iconName];
    if (!icon) {
      console.warn(`PeekCarousel: 아이콘 "${iconName}"을 찾을 수 없습니다`);
      return '';
    }
    const options = {
      ...icon.options,
      ...customOptions
    };
    return createSVGIcon(icon.path, options);
  }
  function injectIcon(button, iconName, options = {}) {
    if (!button || !(button instanceof HTMLElement)) return;
    if (button.querySelector('svg')) {
      return;
    }
    const iconHTML = getIcon(iconName, options);
    if (iconHTML) {
      button.innerHTML = iconHTML;
    }
  }
  function injectAutoRotateIcons(button) {
    if (!button || !(button instanceof HTMLElement)) return;
    if (button.querySelector('svg')) {
      return;
    }
    const playHTML = getIcon('play', {
      className: 'play-icon'
    });
    const pauseHTML = getIcon('pause', {
      className: 'pause-icon'
    });
    if (playHTML && pauseHTML) {
      button.innerHTML = playHTML + pauseHTML;
    }
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }
  function normalizeIndex(index, length) {
    if (length <= 0) return 0;
    return (index % length + length) % length;
  }

  const PROXIMITY_THRESHOLD = 2;
  class Navigator {
    constructor(carousel) {
      this.carousel = carousel;
    }
    get currentIndex() {
      return this.carousel.state.currentIndex;
    }
    set currentIndex(value) {
      this.carousel.state.currentIndex = normalizeIndex(value, this.carousel.totalItems);
    }
    getShortestDistance(from, to) {
      const total = this.carousel.totalItems;
      const normalizedTo = normalizeIndex(to, total);
      const normalizedFrom = normalizeIndex(from, total);
      const forwardDist = (normalizedTo - normalizedFrom + total) % total;
      const backwardDist = (normalizedFrom - normalizedTo + total) % total;
      return forwardDist <= backwardDist ? forwardDist : -backwardDist;
    }
    isNearby(from, to) {
      const distance = Math.abs(this.getShortestDistance(from, to));
      return distance <= PROXIMITY_THRESHOLD;
    }
    updateAfterNavigation() {
      this.carousel.animator.updateCarousel();
      this.carousel.updateCounter();
      if (this.carousel.options.preloadRange > 0) {
        this.carousel.preloadImages();
      }
    }
    rotate(direction) {
      this.currentIndex = this.currentIndex + direction;
      this.updateAfterNavigation();
    }
    next() {
      this.rotate(1);
    }
    prev() {
      this.rotate(-1);
    }
    goTo(index) {
      const normalizedIndex = normalizeIndex(index, this.carousel.totalItems);
      if (normalizedIndex === this.currentIndex) return;
      this.currentIndex = normalizedIndex;
      this.updateAfterNavigation();
    }
    navigateIfDifferent(targetIndex, callback) {
      const normalizedIndex = normalizeIndex(targetIndex, this.carousel.totalItems);
      if (normalizedIndex === this.currentIndex) return false;
      callback(normalizedIndex);
      return true;
    }
    handleItemClick(index) {
      this.navigateIfDifferent(index, normalizedIndex => {
        const {
          layoutMode
        } = this.carousel.options;
        if (layoutMode === 'radial') {
          this.handleRadialItemClick(normalizedIndex);
        } else {
          this.handleStackItemClick(normalizedIndex);
        }
      });
    }
    handleRadialItemClick(normalizedIndex) {
      const shortestDist = this.getShortestDistance(this.currentIndex, normalizedIndex);
      if (Math.abs(shortestDist) > 1) {
        const direction = shortestDist > 0 ? 1 : -1;
        this.rotate(direction);
      } else {
        this.rotate(shortestDist);
      }
    }
    handleStackItemClick(normalizedIndex) {
      if (this.isNearby(this.currentIndex, normalizedIndex)) {
        const shortestDist = this.getShortestDistance(this.currentIndex, normalizedIndex);
        this.rotate(shortestDist);
      } else {
        this.goTo(normalizedIndex);
      }
    }
    handleIndicatorClick(index) {
      this.navigateIfDifferent(index, normalizedIndex => {
        const {
          layoutMode
        } = this.carousel.options;
        if (layoutMode === 'radial') {
          const shortestDist = this.getShortestDistance(this.currentIndex, normalizedIndex);
          this.rotate(shortestDist);
        } else {
          this.goTo(normalizedIndex);
        }
      });
    }
  }

  const RADIAL_RADIUS = 400;
  const CLASSIC_POSITIONS = Object.freeze({
    center: {
      x: 50,
      scale: 1
    },
    peek: {
      scale: 1
    },
    hidden: {
      scale: 0.85
    }
  });
  const CLASSIC_SPACING = Object.freeze({
    gapPercent: 5,
    additionalMobile: 40,
    additionalDesktop: 15,
    mobileBreakpoint: 768
  });
  const MOMENTUM_CONFIG = Object.freeze({
    friction: 0.92,
    minVelocity: 0.05,
    navigationThreshold: 1.5,
    dampingFactor: 0.6
  });
  const STACK_POSITION_CLASSES = [CLASS_NAMES.itemCenter, CLASS_NAMES.itemPrev, CLASS_NAMES.itemNext, CLASS_NAMES.itemHidden];
  class Animator {
    constructor(carousel) {
      this.carousel = carousel;
      this.momentumAnimation = null;
      this.isAnimating = false;
    }
    normalizeAngleDiff(diff) {
      return (diff + 180) % 360 - 180;
    }
    round(value, decimals = 2) {
      return Math.round(value * 10 ** decimals) / 10 ** decimals;
    }
    getAdjacentIndices(currentIndex) {
      return {
        prev: normalizeIndex(currentIndex - 1, this.carousel.totalItems),
        next: normalizeIndex(currentIndex + 1, this.carousel.totalItems)
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
      const {
        currentIndex
      } = this.carousel.state;
      const {
        layoutMode
      } = this.carousel.options;
      if (layoutMode === 'stack' || layoutMode === 'classic') {
        this.setCarouselRotation(0);
      } else if (layoutMode === 'radial') {
        this.updateRadialRotation(currentIndex);
      }
      this.updateActiveItem();
    }
    updateActiveItem() {
      const {
        currentIndex
      } = this.carousel.state;
      const {
        layoutMode
      } = this.carousel.options;
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
      const {
        angleUnit
      } = this.carousel.state;
      for (let i = 0; i < this.carousel.items.length; i++) {
        const item = this.carousel.items[i];
        const angle = angleUnit * i;
        this.setCSSVariables(item, {
          '--item-angle': `${this.round(angle, 2)}deg`,
          '--item-radius': `${RADIAL_RADIUS}px`
        });
      }
      const {
        prev,
        next
      } = this.getAdjacentIndices(currentIndex);
      this.carousel.ui.setPeekItems(prev, next);
    }
    updateStackPositions(currentIndex) {
      const {
        prev,
        next
      } = this.getAdjacentIndices(currentIndex);
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
      const itemHalfPercent = itemWidth / containerWidth * 50;
      const baseSpacing = itemHalfPercent + CLASSIC_SPACING.gapPercent;
      const additionalSpacing = isMobile ? CLASSIC_SPACING.additionalMobile : CLASSIC_SPACING.additionalDesktop;
      return baseSpacing + additionalSpacing;
    }
    getClassicItemPosition(itemIndex, currentIndex, itemSpacing) {
      const {
        prev,
        next
      } = this.getAdjacentIndices(currentIndex);
      if (itemIndex === currentIndex) {
        return {
          x: CLASSIC_POSITIONS.center.x,
          scale: CLASSIC_POSITIONS.center.scale
        };
      }
      if (itemIndex === prev) {
        return {
          x: CLASSIC_POSITIONS.center.x - itemSpacing,
          scale: CLASSIC_POSITIONS.peek.scale
        };
      }
      if (itemIndex === next) {
        return {
          x: CLASSIC_POSITIONS.center.x + itemSpacing,
          scale: CLASSIC_POSITIONS.peek.scale
        };
      }
      const distanceFromCurrent = itemIndex - currentIndex;
      return {
        x: distanceFromCurrent < 0 ? CLASSIC_POSITIONS.center.x - itemSpacing * 2 : CLASSIC_POSITIONS.center.x + itemSpacing * 2,
        scale: CLASSIC_POSITIONS.hidden.scale
      };
    }
    updateClassicPositions(currentIndex) {
      const {
        prev,
        next
      } = this.getAdjacentIndices(currentIndex);
      const containerWidth = this.carousel.container.offsetWidth;
      const itemSpacing = this.calculateClassicSpacing(containerWidth);
      for (let i = 0; i < this.carousel.items.length; i++) {
        const item = this.carousel.items[i];
        const {
          x,
          scale
        } = this.getClassicItemPosition(i, currentIndex, itemSpacing);
        this.setCSSVariables(item, {
          '--item-x': `${this.round(x, 2)}%`,
          '--item-scale': String(scale)
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

  class AutoRotate {
    constructor(carousel) {
      this.carousel = carousel;
      this.interval = null;
      this.isActive = false;
    }
    setActiveState(isActive) {
      this.isActive = isActive;
      this.carousel.ui.updateAutoRotateButton(isActive);
    }
    toggle() {
      this.isActive ? this.stop() : this.start();
    }
    start() {
      if (this.isActive) return;
      this.setActiveState(true);
      const rotateInterval = this.carousel.options.autoRotateInterval;
      this.interval = setInterval(() => {
        this.carousel.navigator.next();
      }, rotateInterval);
    }
    stop() {
      if (!this.isActive) return;
      this.setActiveState(false);
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
    destroy() {
      this.stop();
      this.carousel = null;
    }
  }

  const WHEEL_CONFIG = Object.freeze({
    threshold: 50,
    timeout: 150,
    cooldown: 100
  });
  const DRAG_CONFIG = Object.freeze({
    touchThreshold: 15,
    mouseThreshold: 10,
    velocityThreshold: 0.5
  });
  const RESIZE_DEBOUNCE = 100;
  class EventHandler {
    constructor(carousel) {
      this.carousel = carousel;
      this.boundHandlers = new Map();
      this.touch = {
        startX: 0,
        endX: 0
      };
      this.drag = {
        active: false,
        startX: 0,
        currentX: 0,
        lastX: 0,
        lastTime: 0,
        velocity: 0
      };
      this.wheel = {
        isScrolling: false,
        scrollTimeout: null,
        lastWheelTime: 0,
        accumulatedDelta: 0
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
      const {
        prevBtn,
        nextBtn,
        autoRotateBtn
      } = this.carousel.elements;
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
      const handler = e => {
        const {
          navigator,
          autoRotate,
          totalItems
        } = this.carousel;
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
      const handler = e => {
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
      this.addHandler(this.carousel.elements.carousel, 'wheel', handler, {
        passive: false
      });
    }
    initItemClick() {
      const {
        items
      } = this.carousel;
      for (let i = 0; i < items.length; i++) {
        this.addHandler(items[i], 'click', () => {
          this.carousel.autoRotate.stop();
          this.carousel.navigator.handleItemClick(i);
        });
      }
    }
    initIndicatorClick() {
      const {
        indicators
      } = this.carousel;
      for (let i = 0; i < indicators.length; i++) {
        this.addHandler(indicators[i], 'click', () => {
          this.carousel.autoRotate.stop();
          this.carousel.navigator.handleIndicatorClick(i);
        });
      }
    }
    initTouch() {
      if (!this.carousel.options.enableTouch) return;
      this.addHandler(this.carousel.elements.carousel, 'touchstart', e => {
        this.touch.startX = e.changedTouches[0].screenX;
      });
      this.addHandler(this.carousel.elements.carousel, 'touchmove', e => {
        const touchCurrentX = e.changedTouches[0].screenX;
        const dragDistance = touchCurrentX - this.touch.startX;
        const {
          currentIndex
        } = this.carousel.state;
        this.carousel.ui.updateDragTransform(dragDistance);
        this.updateDraggingClass(dragDistance, currentIndex, DRAG_CONFIG.touchThreshold);
      });
      this.addHandler(this.carousel.elements.carousel, 'touchend', e => {
        this.touch.endX = e.changedTouches[0].screenX;
        const swipeDistance = this.touch.endX - this.touch.startX;
        const {
          swipeThreshold
        } = this.carousel.options;
        const {
          currentIndex
        } = this.carousel.state;
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
      this.addHandler(this.carousel.elements.carousel, 'mousedown', e => {
        if (isMobile()) return;
        this.initDragState(e.clientX);
        this.carousel.autoRotate.stop();
        this.carousel.animator.stopMomentum();
        this.carousel.elements.carousel.style.cursor = 'grabbing';
        e.preventDefault();
      });
      this.addHandler(document, 'mousemove', e => {
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
        const {
          currentIndex
        } = this.carousel.state;
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
        const {
          currentIndex
        } = this.carousel.state;
        this.resetDragState(currentIndex);
        if (Math.abs(this.drag.velocity) > DRAG_CONFIG.velocityThreshold) {
          this.carousel.animator.startMomentum(this.drag.velocity);
        }
      });
      this.addHandler(this.carousel.elements.carousel, 'mouseleave', () => {
        if (this.drag.active) {
          this.drag.active = false;
          this.resetMouseCursor();
          const {
            currentIndex
          } = this.carousel.state;
          this.resetDragState(currentIndex);
        }
      });
      if (window.innerWidth > BREAKPOINTS.mobile) {
        this.resetMouseCursor();
      }
    }
    initResize() {
      let resizeTimer;
      const handler = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.carousel.animator.updateCarousel();
        }, RESIZE_DEBOUNCE);
      };
      this.addHandler(window, 'resize', handler);
    }
    addHandler(element, event, handler, options) {
      element.addEventListener(event, handler, options);
      const key = `${event}-${Date.now()}-${Math.random()}`;
      this.boundHandlers.set(key, {
        element,
        event,
        handler,
        options
      });
    }
    destroy() {
      if (this.wheel.scrollTimeout) {
        clearTimeout(this.wheel.scrollTimeout);
        this.wheel.scrollTimeout = null;
      }
      for (const {
        element,
        event,
        handler,
        options
      } of this.boundHandlers.values()) {
        element.removeEventListener(event, handler, options);
      }
      this.boundHandlers.clear();
      this.carousel = null;
    }
  }

  const DRAG_TRANSFORM_CONFIG = Object.freeze({
    stack: {
      maxDrag: 200,
      offsetMultiplier: 100,
      rotationMultiplier: 3
    },
    radial: {
      rotationSensitivity: 0.2
    },
    classic: {
      dragSensitivity: 0.5
    }
  });
  class UIManager {
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
        removeClass(indicator, CLASS_NAMES.indicatorActive, CLASS_NAMES.indicatorProgress);
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
      setCSSVar(indicator, '--progress-duration', `${this.carousel.options.autoRotateInterval}ms`);
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
      const {
        autoRotateBtn
      } = this.carousel.elements;
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
      const {
        layoutMode
      } = this.carousel.options;
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
    destroy() {}
  }

  const FULL_CIRCLE_DEGREES = 360;
  class PeekCarousel {
    constructor(selector, options = {}) {
      this.container = getElement(selector);
      if (!this.container) {
        throw new Error(`PeekCarousel: 셀렉터 "${selector}"에 해당하는 컨테이너를 찾을 수 없습니다`);
      }
      this.options = validateOptions(options);
      this.initElements();
      if (this.items.length === 0) {
        throw new Error('PeekCarousel: 캐러셀 아이템을 찾을 수 없습니다');
      }
      this.state = {
        currentIndex: this.options.startIndex,
        angleUnit: FULL_CIRCLE_DEGREES / this.totalItems
      };
      this.initModules();
      this.init();
    }
    initElements() {
      this.elements = {
        carousel: this.container.querySelector(SELECTORS.carousel),
        prevBtn: null,
        nextBtn: null,
        autoRotateBtn: null,
        controls: null,
        nav: null
      };
      this.items = getElements(SELECTORS.item, this.container);
      this.totalItems = this.items.length;
      this.indicators = [];
    }
    initModules() {
      this.navigator = new Navigator(this);
      this.animator = new Animator(this);
      this.autoRotate = new AutoRotate(this);
      this.eventHandler = new EventHandler(this);
      this.ui = new UIManager(this);
    }
    init() {
      this.updateLayoutClass();
      this.createNavigation();
      this.createControls();
      this.injectIcons();
      this.createCounter();
      this.setImageLoadingAttributes();
      this.initCSSVariables();
      this.eventHandler.init();
      this.animator.updateCarousel();
      if (this.options.autoRotate) {
        this.autoRotate.start();
      }
      if (this.options.preloadRange > 0) {
        this.preloadImages();
      }
    }
    initCSSVariables() {
      this.container.style.setProperty('--carousel-rotation', '0deg');
      this.container.style.setProperty('--drag-offset', '0px');
      this.container.style.setProperty('--drag-rotation', '0deg');
      this.container.style.setProperty('--drag-rotation-y', '0deg');
    }
    createNavigation() {
      if (!this.options.showNavigation) return;
      const existingNav = this.container.querySelector(`.${CLASS_NAMES.nav}`);
      if (existingNav) {
        this.elements.nav = existingNav;
        this.elements.prevBtn = existingNav.querySelector(SELECTORS.prevBtn);
        this.elements.nextBtn = existingNav.querySelector(SELECTORS.nextBtn);
        return;
      }
      const nav = document.createElement('div');
      nav.className = CLASS_NAMES.nav;
      const prevBtn = document.createElement('button');
      prevBtn.className = `${CLASS_NAMES.navBtn} ${CLASS_NAMES.btn} ${CLASS_NAMES.prevBtn}`;
      prevBtn.setAttribute('aria-label', 'Previous');
      const nextBtn = document.createElement('button');
      nextBtn.className = `${CLASS_NAMES.navBtn} ${CLASS_NAMES.btn} ${CLASS_NAMES.nextBtn}`;
      nextBtn.setAttribute('aria-label', 'Next');
      nav.appendChild(prevBtn);
      nav.appendChild(nextBtn);
      this.container.appendChild(nav);
      this.elements.nav = nav;
      this.elements.prevBtn = prevBtn;
      this.elements.nextBtn = nextBtn;
    }
    createControls() {
      if (!this.options.showIndicators && !this.options.showAutoRotateButton) return;
      const existingControls = this.container.querySelector(`.${CLASS_NAMES.controls}`);
      if (existingControls) {
        this.elements.controls = existingControls;
        const indicatorsWrapper = existingControls.querySelector(`.${CLASS_NAMES.indicators}`);
        if (indicatorsWrapper && this.options.showIndicators) {
          indicatorsWrapper.innerHTML = '';
          this.createIndicators(indicatorsWrapper);
        }
        this.elements.autoRotateBtn = existingControls.querySelector(SELECTORS.autoRotateBtn);
        return;
      }
      const controls = document.createElement('div');
      controls.className = CLASS_NAMES.controls;
      if (this.options.showIndicators) {
        const indicatorsWrapper = document.createElement('div');
        indicatorsWrapper.className = CLASS_NAMES.indicators;
        this.createIndicators(indicatorsWrapper);
        controls.appendChild(indicatorsWrapper);
      }
      if (this.options.showAutoRotateButton) {
        const autoRotateBtn = document.createElement('button');
        autoRotateBtn.className = `${CLASS_NAMES.autoRotateBtn} ${CLASS_NAMES.btn} ${CLASS_NAMES.btnAutoRotate}`;
        autoRotateBtn.setAttribute('aria-label', 'Toggle auto-rotate');
        autoRotateBtn.setAttribute('aria-pressed', 'false');
        controls.appendChild(autoRotateBtn);
        this.elements.autoRotateBtn = autoRotateBtn;
      }
      this.container.appendChild(controls);
      this.elements.controls = controls;
    }
    createIndicators(wrapper) {
      this.indicators = [];
      for (let i = 0; i < this.totalItems; i++) {
        const indicator = document.createElement('button');
        const isActive = i === this.state.currentIndex;
        indicator.className = CLASS_NAMES.indicator;
        indicator.classList.add(CLASS_NAMES.indicatorPeek);
        indicator.setAttribute('role', 'tab');
        indicator.setAttribute('aria-label', `Image ${i + 1}`);
        indicator.setAttribute('aria-selected', isActive ? 'true' : 'false');
        indicator.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive) {
          indicator.classList.add(CLASS_NAMES.indicatorActive);
        }
        wrapper.appendChild(indicator);
        this.indicators.push(indicator);
      }
    }
    injectIcons() {
      const {
        prevBtn,
        nextBtn,
        autoRotateBtn
      } = this.elements;
      if (prevBtn) injectIcon(prevBtn, 'prev');
      if (nextBtn) injectIcon(nextBtn, 'next');
      if (autoRotateBtn) injectAutoRotateIcons(autoRotateBtn);
    }
    createCounter() {
      if (!this.options.showCounter) return;
      const existingCounter = this.container.querySelector(`.${CLASS_NAMES.counter}`);
      if (existingCounter) {
        this.counterElement = existingCounter;
        this.updateCounter();
        return;
      }
      const counter = document.createElement('div');
      counter.className = CLASS_NAMES.counter;
      counter.setAttribute('aria-live', 'polite');
      counter.setAttribute('aria-atomic', 'true');
      counter.innerHTML = `
      <span class="${CLASS_NAMES.counterCurrent}">${this.state.currentIndex + 1}</span>
      <span class="${CLASS_NAMES.counterSeparator}">/</span>
      <span class="${CLASS_NAMES.counterTotal}">${this.totalItems}</span>
    `;
      this.container.appendChild(counter);
      this.counterElement = counter;
    }
    updateCounter() {
      if (!this.counterElement) return;
      const currentSpan = this.counterElement.querySelector(`.${CLASS_NAMES.counterCurrent}`);
      if (currentSpan) {
        currentSpan.textContent = this.state.currentIndex + 1;
      }
    }
    setImageLoadingAttributes() {
      const {
        startIndex
      } = this.options;
      const preloadRange = this.options.preloadRange || 1;
      for (let index = 0; index < this.items.length; index++) {
        const item = this.items[index];
        const img = item.querySelector(`.${CLASS_NAMES.image}`);
        if (!img || img.hasAttribute('loading')) continue;
        const distance = Math.abs(index - startIndex);
        const isNearby = distance <= preloadRange;
        img.setAttribute('loading', isNearby ? 'eager' : 'lazy');
      }
    }
    updateLayoutClass() {
      const currentMode = this.currentLayoutMode;
      const newMode = this.options.layoutMode;
      if (currentMode && currentMode !== newMode) {
        this.container.classList.remove(`peek-carousel--${currentMode}`);
      }
      this.container.classList.add(`peek-carousel--${newMode}`);
      this.currentLayoutMode = newMode;
    }
    preloadImages() {
      preloadImagesInRange(this.items, this.state.currentIndex, this.options.preloadRange);
    }

    // [개발참고] Public API
    next() {
      this.navigator.next();
    }
    prev() {
      this.navigator.prev();
    }
    goTo(index) {
      this.navigator.goTo(index);
    }
    startAutoRotate() {
      this.autoRotate.start();
    }
    stopAutoRotate() {
      this.autoRotate.stop();
    }
    toggleAutoRotate() {
      this.autoRotate.toggle();
    }
    destroy() {
      this.autoRotate.destroy();
      this.animator.stopMomentum();
      this.eventHandler.destroy();
      this.ui.destroy();
    }
    get currentIndex() {
      return this.state.currentIndex;
    }
    get isAutoRotating() {
      return this.autoRotate.isActive;
    }
  }

  return PeekCarousel;

}));
//# sourceMappingURL=peek-carousel.js.map
