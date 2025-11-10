const loadingCache = new Map();

export function preloadImage(src) {
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

export function preloadImages(sources) {
  if (!sources || sources.length === 0) {
    return Promise.resolve([]);
  }

  const uniqueSources = [...new Set(sources)];
  return Promise.all(uniqueSources.map(src => preloadImage(src)));
}

export function preloadImagesInRange(items, currentIndex, range) {
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
