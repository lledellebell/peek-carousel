import { validateOptions } from './config.js';
import { SELECTORS, CLASS_NAMES } from './constants.js';
import { getElement, getElements } from '../utils/dom.js';
import { preloadImagesInRange } from '../utils/preloader.js';
import { injectIcon, injectAutoRotateIcons } from '../utils/icons.js';
import { Navigator } from '../modules/Navigator.js';
import { Animator } from '../modules/Animator.js';
import { AutoRotate } from '../modules/AutoRotate.js';
import { EventHandler } from '../modules/EventHandler.js';
import { UIManager } from '../modules/UIManager.js';

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
      angleUnit: FULL_CIRCLE_DEGREES / this.totalItems,
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
      nav: null,
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
    const { prevBtn, nextBtn, autoRotateBtn } = this.elements;

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
    const { startIndex } = this.options;
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

export default PeekCarousel;
