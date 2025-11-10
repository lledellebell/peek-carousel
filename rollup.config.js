import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const input = 'src/core/PeekCarousel.js';
const name = 'PeekCarousel';

const banner = `/**
 * PeekCarousel - Peek 효과를 가진 캐러셀
 * @version 1.0.0
 * @license MIT
 * @author lledellebell
 */`;

const plugins = [
  resolve(),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
  }),
];

export default [
  {
    input,
    output: {
      file: 'dist/peek-carousel.esm.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    plugins,
  },
  {
    input,
    output: {
      file: 'dist/peek-carousel.esm.min.js',
      format: 'esm',
      banner,
      sourcemap: true,
    },
    plugins: [...plugins, terser()],
  },
  {
    input,
    output: {
      file: 'dist/peek-carousel.js',
      format: 'umd',
      name,
      banner,
      sourcemap: true,
      exports: 'default',
    },
    plugins,
  },
  {
    input,
    output: {
      file: 'dist/peek-carousel.min.js',
      format: 'umd',
      name,
      banner,
      sourcemap: true,
      exports: 'default',
    },
    plugins: [...plugins, terser()],
  },
];
