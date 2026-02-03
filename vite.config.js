import { defineConfig } from 'vite';
import banner from 'vite-plugin-banner';

const bannerContent = `/**
 * PeekCarousel - Peek 효과를 가진 캐러셀
 * @version 1.0.0
 * @license MIT
 * @author lledellebell
 */`;

export default defineConfig({
  build: {
    lib: {
      entry: 'src/core/PeekCarousel.js',
      name: 'PeekCarousel',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'peek-carousel.esm.js';
        if (format === 'umd') return 'peek-carousel.js';
        return `peek-carousel.${format}.js`;
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'peek-carousel.css';
          }
          return assetInfo.name;
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
    postcss: './postcss.config.js',
  },
  plugins: [
    banner(bannerContent),
  ],
});
