export function isMobile() {
  return window.innerWidth <= 768;
}

export function normalizeIndex(index, length) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function clamp(value, min, max) {
  if (min > max) [min, max] = [max, min];
  return Math.min(Math.max(value, min), max);
}

export function debounce(func, wait) {
  if (typeof func !== 'function') {
    throw new TypeError('첫 번째 인자는 함수여야 합니다');
  }

  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  if (typeof func !== 'function') {
    throw new TypeError('첫 번째 인자는 함수여야 합니다');
  }

  let inThrottle;
  return function executedFunction(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
