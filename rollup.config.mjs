import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'lib/bundle.js',
    format: 'umd',
    name: 'Silimon',
    sourcemap: true, // Enable source map generation
  },
  plugins: [
    nodeResolve(),
    typescript(),
    commonjs({
      include: /node_modules/, // 指定要处理的模块范围
    }),
  ],
});
