export const CLASS_NAMES = Object.freeze({
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
  pauseIcon: 'pause-icon',
});

export const SELECTORS = Object.freeze({
  carousel: '.peek-carousel__track',
  item: '.peek-carousel__item',
  indicator: '.indicator',
  prevBtn: '.prev-btn',
  nextBtn: '.next-btn',
  autoRotateBtn: '.auto-rotate-btn',
  playIcon: '.play-icon',
  pauseIcon: '.pause-icon',
  image: 'img',
});

export const ARIA = Object.freeze({
  current: 'aria-current',
  selected: 'aria-selected',
  pressed: 'aria-pressed',
  label: 'aria-label',
  tabindex: 'tabindex',
});

export const BREAKPOINTS = Object.freeze({
  mobile: 768, // [개발참고] px
});

export const DURATIONS = Object.freeze({
  transition: 500, // [개발참고] ms
  progressReset: 10, // [개발참고] ms
});

export const KEYS = Object.freeze({
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  home: 'Home',
  end: 'End',
  space: ' ',
});
