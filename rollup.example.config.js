import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default {
  input: 'examples/example.js',
  output: {
    file: 'examples/example.bundle.min.js',
    format: 'iife',
    name: 'ExampleApp'
  },
  plugins: [
    postcss({
      inject: true,
      minimize: true,
      sourceMap: false,
      config: false,
      plugins: [
        autoprefixer({
          overrideBrowserslist: [
            '> 1%',
            'last 2 versions',
            'not dead',
            'not IE 11'
          ],
          grid: 'autoplace'
        }),
        cssnano({
          preset: 'default'
        })
      ]
    }),
    nodeResolve(),
    terser()
  ]
};
