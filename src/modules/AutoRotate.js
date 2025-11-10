export class AutoRotate {
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
