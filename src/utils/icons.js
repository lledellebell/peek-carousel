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
    className = '',
  } = options;

  const cacheKey = `${path}-${JSON.stringify(options)}`;
  if (iconCache.has(cacheKey)) {
    return iconCache.get(cacheKey);
  }

  const svg = `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="${fill}" xmlns="http://www.w3.org/2000/svg" class="${className}"><path d="${path}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="${strokeLinecap}" stroke-linejoin="${strokeLinejoin}"/></svg>`;

  iconCache.set(cacheKey, svg);
  return svg;
}

export const ICONS = {
  prev: {
    path: 'M15 18L9 12L15 6',
    options: {},
  },
  next: {
    path: 'M9 18L15 12L9 6',
    options: {},
  },
  play: {
    path: 'M8 6.5v11l9-5.5z',
    options: {
      fill: 'currentColor',
      stroke: 'currentColor',
      strokeWidth: 0,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
  },
  pause: {
    path: 'M7 5.5C7 5.22386 7.22386 5 7.5 5H9.5C9.77614 5 10 5.22386 10 5.5V18.5C10 18.7761 9.77614 19 9.5 19H7.5C7.22386 19 7 18.7761 7 18.5V5.5ZM14 5.5C14 5.22386 14.2239 5 14.5 5H16.5C16.7761 5 17 5.22386 17 5.5V18.5C17 18.7761 16.7761 19 16.5 19H14.5C14.2239 19 14 18.7761 14 18.5V5.5Z',
    options: {
      fill: 'currentColor',
      stroke: 'none',
    },
  },
};

export function getIcon(iconName, customOptions = {}) {
  const icon = ICONS[iconName];
  if (!icon) {
    console.warn(`PeekCarousel: 아이콘 "${iconName}"을 찾을 수 없습니다`);
    return '';
  }

  const options = { ...icon.options, ...customOptions };
  return createSVGIcon(icon.path, options);
}

export function injectIcon(button, iconName, options = {}) {
  if (!button || !(button instanceof HTMLElement)) return;

  if (button.querySelector('svg')) {
    return;
  }

  const iconHTML = getIcon(iconName, options);
  if (iconHTML) {
    button.innerHTML = iconHTML;
  }
}

export function injectAutoRotateIcons(button) {
  if (!button || !(button instanceof HTMLElement)) return;

  if (button.querySelector('svg')) {
    return;
  }

  const playHTML = getIcon('play', { className: 'play-icon' });
  const pauseHTML = getIcon('pause', { className: 'pause-icon' });

  if (playHTML && pauseHTML) {
    button.innerHTML = playHTML + pauseHTML;
  }
}
