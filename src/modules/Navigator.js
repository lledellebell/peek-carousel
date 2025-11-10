import { normalizeIndex } from '../utils/helpers.js';

const PROXIMITY_THRESHOLD = 2;

export class Navigator {
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
    this.navigateIfDifferent(index, (normalizedIndex) => {
      const { layoutMode } = this.carousel.options;

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
    this.navigateIfDifferent(index, (normalizedIndex) => {
      const { layoutMode } = this.carousel.options;

      if (layoutMode === 'radial') {
        const shortestDist = this.getShortestDistance(this.currentIndex, normalizedIndex);
        this.rotate(shortestDist);
      } else {
        this.goTo(normalizedIndex);
      }
    });
  }
}
