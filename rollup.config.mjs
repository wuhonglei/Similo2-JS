// @ts-check

import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import { cleandir } from 'rollup-plugin-cleandir';

/** @type {import('rollup').InputPluginOption} */
const plugins = [
  nodeResolve(),
  typescript(),
  commonjs({
    include: /node_modules/, // 指定要处理的模块范围
  }),
];

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'umd',
      name: 'Similo',
      sourcemap: true, // Enable source map generation
    },
    plugins: [cleandir('lib'), ...plugins],
  },
  {
    input: 'src/property.ts',
    output: {
      file: 'lib/property.js',
      format: 'umd',
      name: 'Similo',
      sourcemap: true, // Enable source map generation
    },
    plugins,
  },
  {
    input: 'src/similarity.ts',
    output: {
      file: 'lib/similarity.js',
      format: 'umd',
      name: 'Similo',
      sourcemap: true, // Enable source map generation
    },
    plugins,
  },
]);
