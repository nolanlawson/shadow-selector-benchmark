import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import virtual from '@rollup/plugin-virtual'
import replace from '@rollup/plugin-replace'
import inject from '@rollup/plugin-inject'
import {terser} from 'rollup-plugin-terser'

const mode = process.env.NODE_ENV ?? 'production'

export default [
  {
    input: './src/index.js',
    plugins: [
      resolve(),
      commonjs(),
    ],
    output: {
      format: 'esm',
      file: './dist/index.js',
      sourcemap: true
    }
  },
  {
    input: './src/worker.js',
    plugins: [
      virtual({
        'emitter': `export { EventEmitter as default } from 'events'`
      }),
      {
        name: 'node-builtins',
        resolveId(id) {
          switch (id) {
            case 'fs':
              return require.resolve('browserify-fs')
            case 'tty':
              return require.resolve('tty-browserify')
            case 'path':
              return require.resolve('path-browserify')
          }
          return null
        }
      },
      resolve({
        preferBuiltins: false
      }),
      commonjs(),
      json(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'global.setTimeout': 'globalThis.setTimeout',
        'global.clearTimeout': 'globalThis.clearTimeout',
        'global.performance': 'globalThis.performance',
        preventAssignment: true,
      }),
      inject({
        modules: {
          Buffer: ['buffer', 'Buffer'],
          process: 'process-es6'
        },
      }),
      mode === 'production' && terser()
    ],
    output: {
      name: 'worker',
      format: 'iife',
      file: './dist/worker.js',
      sourcemap: true
    },
  }
]