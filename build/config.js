import path from 'path'
import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias'
import nodeResolve from 'rollup-plugin-node-resolve'
import buble from 'rollup-plugin-buble'

const resolve = (filepath) => path.resolve(__dirname, '../', filepath)
const banner =
`/*!
  * vue-like
  * (c) ${new Date().getFullYear()} ckangwen
  * @license MIT
  */`

const configs = [
  {
    file: resolve('dist/vue-like.js'),
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve('dist/vue-like.min.js'),
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve('dist/vue-like.common.js'),
    format: 'cjs',
    env: 'development'
  },
  {
    file: resolve('dist/vue-like.esm.js'),
    format: 'es',
    env: 'development'
  },
  {
    file: resolve('dist/vue-like.esm.browser.js'),
    format: 'es',
    env: 'development',
    transpile: false
  },
  {
    file: resolve('dist/vue-like.esm.browser.min.js'),
    format: 'es',
    env: 'production',
    transpile: false
  }
]

function genConfig(options) {
  const config = {
    input: {
      input: resolve('src/index.ts'),
      plugins: [
        alias({
          resolve: ['.ts', '.js'],
          entries: [
            { find: '@', replacement: path.join(__dirname, '../src') }
          ]
        }),
        typescript({
          exclude: "node_modules/**",
          typescript: require("typescript")
        }),
        nodeResolve()
      ]
    },
    output: {
      file: options.file,
      format: options.format,
      banner
    }
  }

  if (options.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(options.env)
    }))
  }

  if (opts.transpile !== false) {
    config.input.plugins.push(buble())
  }

  return config
}

module.exports = configs.map(genConfig)