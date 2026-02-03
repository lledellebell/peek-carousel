/**
 * PeekCarousel - Peek 효과를 가진 캐러셀
 * @version 1.0.0
 * @license MIT
 * @author lledellebell
 */
const M = Object.freeze({
  STACK: "stack",
  RADIAL: "radial",
  CLASSIC: "classic"
}), P = Object.freeze({
  startIndex: 1,
  layoutMode: M.STACK,
  autoRotate: !1,
  autoRotateInterval: 2500,
  preloadRange: 2,
  swipeThreshold: 50,
  dragThreshold: 80,
  enableKeyboard: !0,
  enableWheel: !0,
  enableTouch: !0,
  enableMouse: !0,
  showNavigation: !0,
  showCounter: !0,
  showIndicators: !0,
  showAutoRotateButton: !0
});
function L(a) {
  const t = { ...P, ...a };
  return t.startIndex < 0 && (console.warn("PeekCarousel: startIndex는 0 이상이어야 합니다. 기본값 1 사용"), t.startIndex = 1), Object.values(M).includes(t.layoutMode) || (console.warn(`PeekCarousel: 유효하지 않은 layoutMode "${t.layoutMode}". 기본값 "stack" 사용`), t.layoutMode = M.STACK), t.autoRotateInterval < 100 && (console.warn("PeekCarousel: autoRotateInterval은 100ms 이상이어야 합니다. 기본값 2500 사용"), t.autoRotateInterval = 2500), t.preloadRange < 0 && (console.warn("PeekCarousel: preloadRange는 0 이상이어야 합니다. 기본값 2 사용"), t.preloadRange = 2), t;
}
const r = Object.freeze({
  carousel: "peek-carousel",
  track: "peek-carousel__track",
  item: "peek-carousel__item",
  itemActive: "peek-carousel__item--active",
  itemPrev: "peek-carousel__item--prev",
  itemNext: "peek-carousel__item--next",
  itemCenter: "peek-carousel__item--center",
  itemHidden: "peek-carousel__item--hidden",
  itemDraggingLeft: "peek-carousel__item--dragging-left",
  itemDraggingRight: "peek-carousel__item--dragging-right",
  figure: "peek-carousel__figure",
  image: "peek-carousel__image",
  caption: "peek-carousel__caption",
  nav: "peek-carousel__nav",
  navBtn: "nav-btn",
  btn: "peek-carousel__btn",
  prevBtn: "prev-btn",
  nextBtn: "next-btn",
  autoRotateBtn: "auto-rotate-btn",
  btnAutoRotate: "peek-carousel__btn--auto-rotate",
  btnActive: "peek-carousel__btn--active",
  controls: "peek-carousel__controls",
  indicators: "peek-carousel__indicators",
  indicator: "indicator",
  indicatorPeek: "peek-carousel__indicator",
  indicatorActive: "peek-carousel__indicator--active",
  indicatorProgress: "peek-carousel__indicator--progress",
  indicatorCompleted: "peek-carousel__indicator--completed",
  counter: "peek-carousel__counter",
  counterCurrent: "peek-carousel__counter-current",
  counterSeparator: "peek-carousel__counter-separator",
  counterTotal: "peek-carousel__counter-total",
  playIcon: "play-icon",
  pauseIcon: "pause-icon"
}), C = Object.freeze({
  carousel: ".peek-carousel__track",
  item: ".peek-carousel__item",
  indicator: ".indicator",
  prevBtn: ".prev-btn",
  nextBtn: ".next-btn",
  autoRotateBtn: ".auto-rotate-btn",
  playIcon: ".play-icon",
  pauseIcon: ".pause-icon",
  image: "img"
}), g = Object.freeze({
  current: "aria-current",
  selected: "aria-selected",
  pressed: "aria-pressed",
  label: "aria-label",
  tabindex: "tabindex"
}), H = Object.freeze({
  mobile: 768
  // [개발참고] px
}), E = Object.freeze({
  transition: 500,
  // [개발참고] ms
  progressReset: 10
  // [개발참고] ms
}), b = Object.freeze({
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  home: "Home",
  end: "End",
  space: " "
});
function N(a) {
  return typeof a == "string" ? document.querySelector(a) : a instanceof HTMLElement ? a : null;
}
function $(a, t = document) {
  return typeof a != "string" ? [] : Array.from(t.querySelectorAll(a));
}
function f(a, ...t) {
  a instanceof HTMLElement && t.length > 0 && a.classList.add(...t);
}
function v(a, ...t) {
  a instanceof HTMLElement && t.length > 0 && a.classList.remove(...t);
}
function B(a, t, e) {
  a instanceof HTMLElement && t && a.style.setProperty(t, e);
}
function I(a, t, e) {
  a instanceof HTMLElement && t && a.setAttribute(t, e);
}
const A = /* @__PURE__ */ new Map();
function O(a) {
  return new Promise((t, e) => {
    if (!a) {
      e(new Error("이미지 소스가 제공되지 않았습니다"));
      return;
    }
    if (A.has(a))
      return A.get(a);
    const s = new Image(), i = new Promise((o, n) => {
      s.onload = () => {
        A.delete(a), o(s);
      }, s.onerror = () => {
        A.delete(a), n(new Error(`이미지 로드 실패: ${a}`));
      }, s.src = a;
    });
    A.set(a, i), i.then(t, e);
  });
}
function z(a) {
  if (!a || a.length === 0)
    return Promise.resolve([]);
  const t = [...new Set(a)];
  return Promise.all(t.map((e) => O(e)));
}
function X(a, t, e) {
  if (!a || a.length === 0 || e < 0)
    return;
  const s = a.length, i = /* @__PURE__ */ new Set();
  for (let o = 1; o <= e; o++) {
    const n = (t - o + s) % s, l = (t + o) % s, u = a[n]?.querySelector("img"), d = a[l]?.querySelector("img");
    u && u.src && !u.complete && i.add(u.src), d && d.src && !d.complete && i.add(d.src);
  }
  i.size > 0 && z([...i]).catch((o) => {
    console.warn("일부 이미지 프리로드 실패:", o);
  });
}
const R = /* @__PURE__ */ new Map();
function j(a, t = {}) {
  const {
    width: e = 24,
    height: s = 24,
    viewBox: i = "0 0 24 24",
    fill: o = "none",
    stroke: n = "currentColor",
    strokeWidth: l = 2,
    strokeLinecap: u = "round",
    strokeLinejoin: d = "round",
    className: h = ""
  } = t, c = `${a}-${JSON.stringify(t)}`;
  if (R.has(c))
    return R.get(c);
  const p = `<svg width="${e}" height="${s}" viewBox="${i}" fill="${o}" xmlns="http://www.w3.org/2000/svg" class="${h}"><path d="${a}" stroke="${n}" stroke-width="${l}" stroke-linecap="${u}" stroke-linejoin="${d}"/></svg>`;
  return R.set(c, p), p;
}
const W = {
  prev: {
    path: "M15 18L9 12L15 6",
    options: {}
  },
  next: {
    path: "M9 18L15 12L9 6",
    options: {}
  },
  play: {
    path: "M8 6.5v11l9-5.5z",
    options: {
      fill: "currentColor",
      stroke: "currentColor",
      strokeWidth: 0,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  },
  pause: {
    path: "M7 5.5C7 5.22386 7.22386 5 7.5 5H9.5C9.77614 5 10 5.22386 10 5.5V18.5C10 18.7761 9.77614 19 9.5 19H7.5C7.22386 19 7 18.7761 7 18.5V5.5ZM14 5.5C14 5.22386 14.2239 5 14.5 5H16.5C16.7761 5 17 5.22386 17 5.5V18.5C17 18.7761 16.7761 19 16.5 19H14.5C14.2239 19 14 18.7761 14 18.5V5.5Z",
    options: {
      fill: "currentColor",
      stroke: "none"
    }
  }
};
function D(a, t = {}) {
  const e = W[a];
  if (!e)
    return console.warn(`PeekCarousel: 아이콘 "${a}"을 찾을 수 없습니다`), "";
  const s = { ...e.options, ...t };
  return j(e.path, s);
}
function _(a, t, e = {}) {
  if (!a || !(a instanceof HTMLElement) || a.querySelector("svg"))
    return;
  const s = D(t, e);
  s && (a.innerHTML = s);
}
function q(a) {
  if (!a || !(a instanceof HTMLElement) || a.querySelector("svg"))
    return;
  const t = D("play", { className: "play-icon" }), e = D("pause", { className: "pause-icon" });
  t && e && (a.innerHTML = t + e);
}
function F() {
  return window.innerWidth <= 768;
}
function y(a, t) {
  return t <= 0 ? 0 : (a % t + t) % t;
}
const V = 2;
class K {
  constructor(t) {
    this.carousel = t;
  }
  get currentIndex() {
    return this.carousel.state.currentIndex;
  }
  set currentIndex(t) {
    this.carousel.state.currentIndex = y(t, this.carousel.totalItems);
  }
  getShortestDistance(t, e) {
    const s = this.carousel.totalItems, i = y(e, s), o = y(t, s), n = (i - o + s) % s, l = (o - i + s) % s;
    return n <= l ? n : -l;
  }
  isNearby(t, e) {
    return Math.abs(this.getShortestDistance(t, e)) <= V;
  }
  updateAfterNavigation() {
    this.carousel.animator.updateCarousel(), this.carousel.updateCounter(), this.carousel.options.preloadRange > 0 && this.carousel.preloadImages();
  }
  rotate(t) {
    this.currentIndex = this.currentIndex + t, this.updateAfterNavigation();
  }
  next() {
    this.rotate(1);
  }
  prev() {
    this.rotate(-1);
  }
  goTo(t) {
    const e = y(t, this.carousel.totalItems);
    e !== this.currentIndex && (this.currentIndex = e, this.updateAfterNavigation());
  }
  navigateIfDifferent(t, e) {
    const s = y(t, this.carousel.totalItems);
    return s === this.currentIndex ? !1 : (e(s), !0);
  }
  handleItemClick(t) {
    this.navigateIfDifferent(t, (e) => {
      const { layoutMode: s } = this.carousel.options;
      s === "radial" ? this.handleRadialItemClick(e) : this.handleStackItemClick(e);
    });
  }
  handleRadialItemClick(t) {
    const e = this.getShortestDistance(this.currentIndex, t);
    if (Math.abs(e) > 1) {
      const s = e > 0 ? 1 : -1;
      this.rotate(s);
    } else
      this.rotate(e);
  }
  handleStackItemClick(t) {
    if (this.isNearby(this.currentIndex, t)) {
      const e = this.getShortestDistance(this.currentIndex, t);
      this.rotate(e);
    } else
      this.goTo(t);
  }
  handleIndicatorClick(t) {
    this.navigateIfDifferent(t, (e) => {
      const { layoutMode: s } = this.carousel.options;
      if (s === "radial") {
        const i = this.getShortestDistance(this.currentIndex, e);
        this.rotate(i);
      } else
        this.goTo(e);
    });
  }
}
const U = 400, m = Object.freeze({
  center: { x: 50, scale: 1 },
  peek: { scale: 1 },
  hidden: { scale: 0.85 }
}), k = Object.freeze({
  gapPercent: 5,
  additionalMobile: 40,
  additionalDesktop: 15,
  mobileBreakpoint: 768
}), S = Object.freeze({
  friction: 0.92,
  minVelocity: 0.05,
  navigationThreshold: 1.5,
  dampingFactor: 0.6
}), G = [
  r.itemCenter,
  r.itemPrev,
  r.itemNext,
  r.itemHidden
];
class Y {
  constructor(t) {
    this.carousel = t, this.momentumAnimation = null, this.isAnimating = !1, this.previousIndex = null;
  }
  normalizeAngleDiff(t) {
    return (t + 180) % 360 - 180;
  }
  round(t, e = 2) {
    return Math.round(t * 10 ** e) / 10 ** e;
  }
  getAdjacentIndices(t) {
    return {
      prev: y(t - 1, this.carousel.totalItems),
      next: y(t + 1, this.carousel.totalItems)
    };
  }
  setCarouselRotation(t) {
    const e = this.round(t, 2);
    this.carousel.container.style.setProperty("--carousel-rotation", `${e}deg`);
  }
  setCSSVariables(t, e) {
    for (const [s, i] of Object.entries(e))
      t.style.setProperty(s, i);
  }
  updateRadialRotation(t) {
    const e = -this.carousel.state.angleUnit * t, s = this.carousel.container.style.getPropertyValue("--carousel-rotation");
    if (!s || s === "0deg") {
      this.setCarouselRotation(e);
      return;
    }
    const i = parseFloat(s), o = this.normalizeAngleDiff(e - i), n = i + o;
    this.setCarouselRotation(n);
  }
  updateCarousel() {
    const { currentIndex: t } = this.carousel.state, { layoutMode: e } = this.carousel.options;
    e === "stack" || e === "classic" ? this.setCarouselRotation(0) : e === "radial" && this.updateRadialRotation(t), this.updateActiveItem();
  }
  updateActiveItem() {
    const { currentIndex: t } = this.carousel.state, { layoutMode: e } = this.carousel.options;
    this.carousel.ui.updateActiveStates(t), e === "radial" ? this.updateRadialPositions(t) : e === "classic" ? this.updateClassicPositions(t) : this.updateStackPositions(t);
  }
  updateRadialPositions(t) {
    const { angleUnit: e } = this.carousel.state;
    for (let o = 0; o < this.carousel.items.length; o++) {
      const n = this.carousel.items[o], l = e * o;
      this.setCSSVariables(n, {
        "--item-angle": `${this.round(l, 2)}deg`,
        "--item-radius": `${U}px`
      });
    }
    const { prev: s, next: i } = this.getAdjacentIndices(t);
    this.carousel.ui.setPeekItems(s, i);
  }
  updateStackPositions(t) {
    const { prev: e, next: s } = this.getAdjacentIndices(t);
    for (let i = 0; i < this.carousel.items.length; i++) {
      const o = this.carousel.items[i];
      o.classList.remove(...G), i === t ? o.classList.add(r.itemCenter) : i === e ? o.classList.add(r.itemPrev) : i === s ? o.classList.add(r.itemNext) : o.classList.add(r.itemHidden);
    }
  }
  calculateClassicSpacing(t) {
    const e = Math.max(300, Math.min(t * 0.35, 500)), s = t <= k.mobileBreakpoint, o = e / t * 50 + k.gapPercent, n = s ? k.additionalMobile : k.additionalDesktop;
    return o + n;
  }
  // ==========================================
  // Classic Mode - Seamless Infinite Scroll
  // ==========================================
  getWrapInfo(t, e) {
    if (t === null) return { isWrap: !1, direction: 0 };
    const s = this.carousel.totalItems, i = t === s - 1 && e === 0, o = t === 0 && e === s - 1;
    return i ? { isWrap: !0, direction: 1 } : o ? { isWrap: !0, direction: -1 } : { isWrap: !1, direction: e > t ? 1 : -1 };
  }
  getClassicItemPosition(t, e, s, i = 0) {
    const { prev: o, next: n } = this.getAdjacentIndices(e), l = this.carousel.totalItems;
    if (t === e)
      return {
        x: m.center.x,
        scale: m.center.scale,
        isCenter: !0
      };
    if (t === o)
      return {
        x: m.center.x - s,
        scale: m.peek.scale,
        isPrev: !0
      };
    if (t === n)
      return {
        x: m.center.x + s,
        scale: m.peek.scale,
        isNext: !0
      };
    const u = (t - e + l) % l, d = (e - t + l) % l;
    return {
      x: u < d ? m.center.x + s * 2 : m.center.x - s * 2,
      scale: m.hidden.scale,
      isHidden: !0
    };
  }
  updateClassicPositions(t) {
    const { prev: e, next: s } = this.getAdjacentIndices(t), i = this.carousel.container.offsetWidth, o = this.calculateClassicSpacing(i), { isWrap: n, direction: l } = this.getWrapInfo(this.previousIndex, t), u = this.carousel.items, d = this.previousIndex !== null ? this.getAdjacentIndices(this.previousIndex) : { prev: null, next: null };
    if (n) {
      const h = new Set([
        t,
        e,
        s,
        this.previousIndex,
        d.prev,
        d.next
      ].filter((c) => c !== null));
      for (let c = 0; c < u.length; c++)
        h.has(c) || (u[c].style.transition = "none");
      this.carousel.container.offsetHeight;
    }
    for (let h = 0; h < u.length; h++) {
      const c = u[h], p = this.getClassicItemPosition(h, t, o);
      this.setCSSVariables(c, {
        "--item-x": `${this.round(p.x, 2)}%`,
        "--item-scale": String(p.scale)
      }), p.isCenter ? (c.style.opacity = "1", c.style.visibility = "visible", c.style.zIndex = "100") : p.isPrev || p.isNext ? (c.style.opacity = "0.6", c.style.visibility = "visible", c.style.zIndex = "50") : (c.style.opacity = "0", c.style.visibility = "hidden", c.style.zIndex = "0");
    }
    n && requestAnimationFrame(() => {
      for (let h = 0; h < u.length; h++)
        u[h].style.transition = "";
    }), this.previousIndex = t, this.carousel.ui.setPeekItems(e, s);
  }
  // ==========================================
  // Momentum
  // ==========================================
  startMomentum(t) {
    this.stopMomentum();
    let e = t;
    const s = () => {
      if (e *= S.friction, Math.abs(e) < S.minVelocity) {
        this.stopMomentum();
        return;
      }
      if (Math.abs(e) > S.navigationThreshold) {
        const i = e > 0 ? -1 : 1;
        this.carousel.navigator.rotate(i), e *= S.dampingFactor;
      }
      this.momentumAnimation = requestAnimationFrame(s);
    };
    this.isAnimating = !0, this.momentumAnimation = requestAnimationFrame(s);
  }
  stopMomentum() {
    this.momentumAnimation && (cancelAnimationFrame(this.momentumAnimation), this.momentumAnimation = null), this.isAnimating = !1;
  }
}
class Z {
  constructor(t) {
    this.carousel = t, this.interval = null, this.isActive = !1;
  }
  setActiveState(t) {
    this.isActive = t, this.carousel.ui.updateAutoRotateButton(t);
  }
  toggle() {
    this.isActive ? this.stop() : this.start();
  }
  start() {
    if (this.isActive) return;
    this.setActiveState(!0);
    const t = this.carousel.options.autoRotateInterval;
    this.interval = setInterval(() => {
      this.carousel.navigator.next();
    }, t);
  }
  stop() {
    this.isActive && (this.setActiveState(!1), this.interval && (clearInterval(this.interval), this.interval = null));
  }
  destroy() {
    this.stop(), this.carousel = null;
  }
}
const x = Object.freeze({
  threshold: 50,
  timeout: 150,
  cooldown: 100
}), w = Object.freeze({
  touchThreshold: 15,
  mouseThreshold: 10,
  velocityThreshold: 0.5
}), J = 100;
let Q = 0;
class tt {
  constructor(t) {
    this.carousel = t, this.boundHandlers = /* @__PURE__ */ new Map(), this.resizeTimer = null, this.touch = {
      startX: 0,
      endX: 0
    }, this.drag = {
      active: !1,
      startX: 0,
      currentX: 0,
      lastX: 0,
      lastTime: 0,
      velocity: 0
    }, this.wheel = {
      isScrolling: !1,
      scrollTimeout: null,
      lastWheelTime: 0,
      accumulatedDelta: 0
    };
  }
  init() {
    this.initNavigationButtons(), this.initKeyboard(), this.initWheel(), this.initItemClick(), this.initIndicatorClick(), this.initTouch(), this.initMouse(), this.initResize();
  }
  stopAutoRotateAndNavigate(t) {
    this.completeCurrentIndicator(), this.carousel.autoRotate.stop(), t();
  }
  completeCurrentIndicator() {
    const t = this.carousel.indicators[this.carousel.state.currentIndex];
    t && t.classList.contains("peek-carousel__indicator--active") && t.classList.add("peek-carousel__indicator--completed");
  }
  resetDragState(t) {
    this.carousel.ui.removeDraggingClass(t), this.carousel.ui.clearDragTransform();
  }
  updateDraggingClass(t, e, s) {
    t > s ? this.carousel.ui.addDraggingClass(e, "right") : t < -s && this.carousel.ui.addDraggingClass(e, "left");
  }
  initDragState(t) {
    this.drag.active = !0, this.drag.startX = t, this.drag.currentX = t, this.drag.lastX = t, this.drag.lastTime = Date.now(), this.drag.velocity = 0;
  }
  resetMouseCursor() {
    this.carousel.elements.carousel.style.cursor = "grab";
  }
  calculateWheelDelta(t) {
    const e = Math.abs(t.deltaX), s = Math.abs(t.deltaY);
    return e > s ? -t.deltaX : t.deltaY;
  }
  resetWheelState() {
    this.wheel.isScrolling = !1, this.wheel.accumulatedDelta = 0;
  }
  initNavigationButtons() {
    const { prevBtn: t, nextBtn: e, autoRotateBtn: s } = this.carousel.elements;
    t && this.addHandler(t, "click", () => {
      this.stopAutoRotateAndNavigate(() => this.carousel.navigator.prev());
    }), e && this.addHandler(e, "click", () => {
      this.stopAutoRotateAndNavigate(() => this.carousel.navigator.next());
    }), s && this.addHandler(s, "click", () => {
      this.carousel.autoRotate.toggle();
    });
  }
  initKeyboard() {
    if (!this.carousel.options.enableKeyboard) return;
    const t = (e) => {
      const { navigator: s, autoRotate: i, totalItems: o } = this.carousel;
      switch (e.key) {
        case b.arrowLeft:
          i.stop(), s.prev();
          break;
        case b.arrowRight:
          i.stop(), s.next();
          break;
        case b.home:
          e.preventDefault(), i.stop(), s.goTo(0);
          break;
        case b.end:
          e.preventDefault(), i.stop(), s.goTo(o - 1);
          break;
        case b.space:
          e.preventDefault(), i.toggle();
          break;
        default:
          const n = parseInt(e.key);
          n >= 1 && n <= o && (e.preventDefault(), i.stop(), s.goTo(n - 1));
      }
    };
    this.addHandler(document, "keydown", t);
  }
  initWheel() {
    if (!this.carousel.options.enableWheel) return;
    const t = (e) => {
      const s = Math.abs(e.deltaX), i = Math.abs(e.deltaY);
      if (s < 1 && i < 1 || s === i)
        return;
      e.preventDefault();
      const o = Date.now();
      if (!(o - this.wheel.lastWheelTime < x.cooldown)) {
        if (this.wheel.isScrolling || (this.wheel.isScrolling = !0, this.wheel.accumulatedDelta = 0, this.carousel.autoRotate.stop(), this.carousel.animator.stopMomentum()), this.wheel.accumulatedDelta += this.calculateWheelDelta(e), Math.abs(this.wheel.accumulatedDelta) >= x.threshold) {
          const n = this.wheel.accumulatedDelta > 0 ? 1 : -1;
          this.carousel.navigator.rotate(n), this.wheel.accumulatedDelta = 0, this.wheel.lastWheelTime = o;
        }
        clearTimeout(this.wheel.scrollTimeout), this.wheel.scrollTimeout = setTimeout(() => {
          this.resetWheelState();
        }, x.timeout);
      }
    };
    this.addHandler(
      this.carousel.elements.carousel,
      "wheel",
      t,
      { passive: !1 }
    );
  }
  initItemClick() {
    const { items: t } = this.carousel;
    for (let e = 0; e < t.length; e++)
      this.addHandler(t[e], "click", () => {
        this.carousel.autoRotate.stop(), this.carousel.navigator.handleItemClick(e);
      });
  }
  initIndicatorClick() {
    const { indicators: t } = this.carousel;
    for (let e = 0; e < t.length; e++)
      this.addHandler(t[e], "click", () => {
        this.carousel.autoRotate.stop(), this.carousel.navigator.handleIndicatorClick(e);
      });
  }
  initTouch() {
    this.carousel.options.enableTouch && (this.addHandler(this.carousel.elements.carousel, "touchstart", (t) => {
      this.touch.startX = t.changedTouches[0].screenX;
    }), this.addHandler(this.carousel.elements.carousel, "touchmove", (t) => {
      const s = t.changedTouches[0].screenX - this.touch.startX, { currentIndex: i } = this.carousel.state;
      this.carousel.ui.updateDragTransform(s), this.updateDraggingClass(s, i, w.touchThreshold);
    }), this.addHandler(this.carousel.elements.carousel, "touchend", (t) => {
      this.touch.endX = t.changedTouches[0].screenX;
      const e = this.touch.endX - this.touch.startX, { swipeThreshold: s } = this.carousel.options, { currentIndex: i } = this.carousel.state;
      this.resetDragState(i), e < -s ? (this.carousel.autoRotate.stop(), this.carousel.navigator.next()) : e > s && (this.carousel.autoRotate.stop(), this.carousel.navigator.prev());
    }));
  }
  initMouse() {
    this.carousel.options.enableMouse && (this.addHandler(this.carousel.elements.carousel, "mousedown", (t) => {
      F() || (this.initDragState(t.clientX), this.carousel.autoRotate.stop(), this.carousel.animator.stopMomentum(), this.carousel.elements.carousel.style.cursor = "grabbing", t.preventDefault());
    }), this.addHandler(document, "mousemove", (t) => {
      if (!this.drag.active) return;
      const e = Date.now(), s = e - this.drag.lastTime, i = t.clientX - this.drag.lastX;
      s > 0 && (this.drag.velocity = i / s), this.drag.currentX = t.clientX, this.drag.lastX = t.clientX, this.drag.lastTime = e;
      const o = this.drag.currentX - this.drag.startX, { currentIndex: n } = this.carousel.state;
      if (this.carousel.ui.updateDragTransform(o), this.updateDraggingClass(o, n, w.mouseThreshold), Math.abs(o) > this.carousel.options.dragThreshold) {
        const l = o > 0 ? -1 : 1;
        this.carousel.navigator.rotate(l), this.drag.startX = this.drag.currentX, this.resetDragState(n);
      }
    }), this.addHandler(document, "mouseup", () => {
      if (!this.drag.active) return;
      this.drag.active = !1, this.resetMouseCursor();
      const { currentIndex: t } = this.carousel.state;
      this.resetDragState(t), Math.abs(this.drag.velocity) > w.velocityThreshold && this.carousel.animator.startMomentum(this.drag.velocity);
    }), this.addHandler(this.carousel.elements.carousel, "mouseleave", () => {
      if (this.drag.active) {
        this.drag.active = !1, this.resetMouseCursor();
        const { currentIndex: t } = this.carousel.state;
        this.resetDragState(t);
      }
    }), window.innerWidth > H.mobile && this.resetMouseCursor());
  }
  initResize() {
    const t = () => {
      clearTimeout(this.resizeTimer), this.resizeTimer = setTimeout(() => {
        this.carousel && this.carousel.animator.updateCarousel();
      }, J);
    };
    this.addHandler(window, "resize", t);
  }
  addHandler(t, e, s, i) {
    t.addEventListener(e, s, i);
    const o = `${e}-${++Q}`;
    this.boundHandlers.set(o, { element: t, event: e, handler: s, options: i });
  }
  destroy() {
    this.wheel.scrollTimeout && (clearTimeout(this.wheel.scrollTimeout), this.wheel.scrollTimeout = null), this.resizeTimer && (clearTimeout(this.resizeTimer), this.resizeTimer = null);
    for (const { element: t, event: e, handler: s, options: i } of this.boundHandlers.values())
      t.removeEventListener(e, s, i);
    this.boundHandlers.clear(), this.drag.active = !1, this.drag.velocity = 0, this.wheel.isScrolling = !1, this.wheel.accumulatedDelta = 0, this.carousel = null;
  }
}
const T = Object.freeze({
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
class et {
  constructor(t) {
    this.carousel = t;
  }
  updateActiveStates(t) {
    for (let i = 0; i < this.carousel.items.length; i++) {
      const o = this.carousel.items[i];
      v(o, r.itemActive, r.itemPrev, r.itemNext), o.removeAttribute(g.current);
    }
    for (let i = 0; i < this.carousel.indicators.length; i++) {
      const o = this.carousel.indicators[i];
      v(
        o,
        r.indicatorActive,
        r.indicatorProgress
      ), I(o, g.selected, "false"), I(o, g.tabindex, "-1");
    }
    const e = this.carousel.items[t], s = this.carousel.indicators[t];
    e && (f(e, r.itemActive), I(e, g.current, "true")), s && (v(s, r.indicatorCompleted), f(s, r.indicatorActive), I(s, g.selected, "true"), I(s, g.tabindex, "0"), this.carousel.autoRotate.isActive && this.updateIndicatorProgress(s));
  }
  updateIndicatorProgress(t) {
    B(
      t,
      "--progress-duration",
      `${this.carousel.options.autoRotateInterval}ms`
    ), setTimeout(() => {
      t && f(t, r.indicatorProgress);
    }, E.progressReset);
  }
  clearPeekItems() {
    for (let t = 0; t < this.carousel.items.length; t++) {
      const e = this.carousel.items[t];
      v(e, r.itemPrev, r.itemNext);
    }
  }
  setPeekItems(t, e) {
    const s = this.carousel.items[t], i = this.carousel.items[e];
    s && f(s, r.itemPrev), i && f(i, r.itemNext);
  }
  updateAutoRotateButton(t) {
    const { autoRotateBtn: e } = this.carousel.elements;
    e && (t ? (f(e, r.btnActive), I(e, g.pressed, "true")) : (v(e, r.btnActive), I(e, g.pressed, "false")));
  }
  addDraggingClass(t, e) {
    const s = this.carousel.items[t];
    if (!s) return;
    const i = r.itemDraggingLeft, o = r.itemDraggingRight;
    v(s, i, o), e === "left" ? f(s, i) : e === "right" && f(s, o);
  }
  removeDraggingClass(t) {
    const e = this.carousel.items[t];
    e && v(e, r.itemDraggingLeft, r.itemDraggingRight);
  }
  round(t, e = 2) {
    return Math.round(t * 10 ** e) / 10 ** e;
  }
  applyEasing(t) {
    return t * (2 - Math.abs(t));
  }
  updateDragTransform(t) {
    const { layoutMode: e } = this.carousel.options;
    if (e === "stack") {
      const s = T.stack, o = Math.max(-s.maxDrag, Math.min(s.maxDrag, t)) / s.maxDrag, n = this.applyEasing(o), l = this.round(n * s.offsetMultiplier), u = this.round(n * s.rotationMultiplier);
      this.carousel.container.style.setProperty("--drag-offset", `${l}px`), this.carousel.container.style.setProperty("--drag-rotation", `${u}deg`);
    } else if (e === "radial") {
      const s = T.radial, i = this.round(t * s.rotationSensitivity);
      this.carousel.container.style.setProperty("--drag-rotation-y", `${i}deg`);
    } else if (e === "classic") {
      const s = T.classic, i = this.round(t * s.dragSensitivity);
      this.carousel.container.style.setProperty("--drag-offset", `${i}px`);
    }
  }
  clearDragTransform() {
    this.carousel.container.style.setProperty("--drag-offset", "0px"), this.carousel.container.style.setProperty("--drag-rotation", "0deg"), this.carousel.container.style.setProperty("--drag-rotation-y", "0deg");
  }
  destroy() {
  }
}
const st = 360;
class it {
  constructor(t, e = {}) {
    if (this.container = N(t), !this.container)
      throw new Error(`PeekCarousel: 셀렉터 "${t}"에 해당하는 컨테이너를 찾을 수 없습니다`);
    if (this.options = L(e), this.initElements(), this.items.length === 0)
      throw new Error("PeekCarousel: 캐러셀 아이템을 찾을 수 없습니다");
    this.state = {
      currentIndex: this.options.startIndex,
      angleUnit: st / this.totalItems
    }, this.initModules(), this.init();
  }
  initElements() {
    this.elements = {
      carousel: this.container.querySelector(C.carousel),
      prevBtn: null,
      nextBtn: null,
      autoRotateBtn: null,
      controls: null,
      nav: null
    }, this.items = $(C.item, this.container), this.totalItems = this.items.length, this.indicators = [];
  }
  initModules() {
    this.navigator = new K(this), this.animator = new Y(this), this.autoRotate = new Z(this), this.eventHandler = new tt(this), this.ui = new et(this);
  }
  init() {
    this.updateLayoutClass(), this.createNavigation(), this.createControls(), this.injectIcons(), this.createCounter(), this.setImageLoadingAttributes(), this.initCSSVariables(), this.eventHandler.init(), this.animator.updateCarousel(), this.options.autoRotate && this.autoRotate.start(), this.options.preloadRange > 0 && this.preloadImages();
  }
  initCSSVariables() {
    this.container.style.setProperty("--carousel-rotation", "0deg"), this.container.style.setProperty("--drag-offset", "0px"), this.container.style.setProperty("--drag-rotation", "0deg"), this.container.style.setProperty("--drag-rotation-y", "0deg");
  }
  createNavigation() {
    if (!this.options.showNavigation) return;
    const t = this.container.querySelector(`.${r.nav}`);
    if (t) {
      this.elements.nav = t, this.elements.prevBtn = t.querySelector(C.prevBtn), this.elements.nextBtn = t.querySelector(C.nextBtn);
      return;
    }
    const e = document.createElement("div");
    e.className = r.nav;
    const s = document.createElement("button");
    s.className = `${r.navBtn} ${r.btn} ${r.prevBtn}`, s.setAttribute("aria-label", "Previous");
    const i = document.createElement("button");
    i.className = `${r.navBtn} ${r.btn} ${r.nextBtn}`, i.setAttribute("aria-label", "Next"), e.appendChild(s), e.appendChild(i), this.container.appendChild(e), this.elements.nav = e, this.elements.prevBtn = s, this.elements.nextBtn = i;
  }
  createControls() {
    if (!this.options.showIndicators && !this.options.showAutoRotateButton) return;
    const t = this.container.querySelector(`.${r.controls}`);
    if (t) {
      this.elements.controls = t;
      const s = t.querySelector(`.${r.indicators}`);
      s && this.options.showIndicators && (s.innerHTML = "", this.createIndicators(s)), this.elements.autoRotateBtn = t.querySelector(C.autoRotateBtn);
      return;
    }
    const e = document.createElement("div");
    if (e.className = r.controls, this.options.showIndicators) {
      const s = document.createElement("div");
      s.className = r.indicators, this.createIndicators(s), e.appendChild(s);
    }
    if (this.options.showAutoRotateButton) {
      const s = document.createElement("button");
      s.className = `${r.autoRotateBtn} ${r.btn} ${r.btnAutoRotate}`, s.setAttribute("aria-label", "Toggle auto-rotate"), s.setAttribute("aria-pressed", "false"), e.appendChild(s), this.elements.autoRotateBtn = s;
    }
    this.container.appendChild(e), this.elements.controls = e;
  }
  createIndicators(t) {
    this.indicators = [];
    for (let e = 0; e < this.totalItems; e++) {
      const s = document.createElement("button"), i = e === this.state.currentIndex;
      s.className = r.indicator, s.classList.add(r.indicatorPeek), s.setAttribute("role", "tab"), s.setAttribute("aria-label", `Image ${e + 1}`), s.setAttribute("aria-selected", i ? "true" : "false"), s.setAttribute("tabindex", i ? "0" : "-1"), i && s.classList.add(r.indicatorActive), t.appendChild(s), this.indicators.push(s);
    }
  }
  injectIcons() {
    const { prevBtn: t, nextBtn: e, autoRotateBtn: s } = this.elements;
    t && _(t, "prev"), e && _(e, "next"), s && q(s);
  }
  createCounter() {
    if (!this.options.showCounter) return;
    const t = this.container.querySelector(`.${r.counter}`);
    if (t) {
      this.counterElement = t, this.updateCounter();
      return;
    }
    const e = document.createElement("div");
    e.className = r.counter, e.setAttribute("aria-live", "polite"), e.setAttribute("aria-atomic", "true"), e.innerHTML = `
      <span class="${r.counterCurrent}">${this.state.currentIndex + 1}</span>
      <span class="${r.counterSeparator}">/</span>
      <span class="${r.counterTotal}">${this.totalItems}</span>
    `, this.container.appendChild(e), this.counterElement = e;
  }
  updateCounter() {
    if (!this.counterElement) return;
    const t = this.counterElement.querySelector(`.${r.counterCurrent}`);
    t && (t.textContent = this.state.currentIndex + 1);
  }
  setImageLoadingAttributes() {
    const { startIndex: t } = this.options, e = this.options.preloadRange || 1;
    for (let s = 0; s < this.items.length; s++) {
      const o = this.items[s].querySelector(`.${r.image}`);
      if (!o || o.hasAttribute("loading")) continue;
      const l = Math.abs(s - t) <= e;
      o.setAttribute("loading", l ? "eager" : "lazy");
    }
  }
  updateLayoutClass() {
    const t = this.currentLayoutMode, e = this.options.layoutMode;
    t && t !== e && this.container.classList.remove(`peek-carousel--${t}`), this.container.classList.add(`peek-carousel--${e}`), this.currentLayoutMode = e;
  }
  preloadImages() {
    X(this.items, this.state.currentIndex, this.options.preloadRange);
  }
  // [개발참고] Public API
  next() {
    this.navigator.next();
  }
  prev() {
    this.navigator.prev();
  }
  goTo(t) {
    this.navigator.goTo(t);
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
    this.autoRotate.destroy(), this.animator.stopMomentum(), this.eventHandler.destroy(), this.ui.destroy();
  }
  get currentIndex() {
    return this.state.currentIndex;
  }
  get isAutoRotating() {
    return this.autoRotate.isActive;
  }
}
export {
  it as default
};
//# sourceMappingURL=peek-carousel.esm.js.map
