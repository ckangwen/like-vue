const path = require('path')
const typescript = require('rollup-plugin-typescript')
const buble = require('rollup-plugin-buble')
const alias = require('rollup-plugin-alias')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')

const resolve = (filepath) => path.resolve(__dirname, '../', filepath)
const getBanner = (name) => `/*!
* ${name}
* (c) ${new Date().getFullYear()} ckangwen
* @license MIT
*/`

const files = {
  'vue-like': 'src/index.ts',
  'vue-computed': 'src/plugins/computed/index.ts',
  'vue-watch': 'src/plugins/watch/index.ts',
  'vue-component': 'src/plugins/components/index.ts',
  'vue-router': 'src/plugins/router/index.ts',
  'vuex': 'src/plugins/vuex/index.ts'
}

const genOptions = name => {
  name = name === 'vue-like' ? name : `${name}/${name}`
  return [
    {
      file: resolve(`dist/${name}.js`),
      format: 'umd',
      env: 'development'
    },
    {
      file: resolve(`dist/${name}.min.js`),
      format: 'umd',
      env: 'production'
    },
    {
      file: resolve(`dist/${name}.common.js`),
      format: 'cjs',
      env: 'development'
    },
    {
      file: resolve(`dist/${name}.esm.js`),
      format: 'es',
      env: 'development'
    },
    {
      file: resolve(`dist/${name}.esm.browser.js`),
      format: 'es',
      env: 'development',
      transpile: false
    },
    {
      file: resolve(`dist/${name}.esm.browser.min.js`),
      format: 'es',
      env: 'production',
      transpile: false
    }
  ]
}

function genConfig(options, name) {
  const config = {
    input: {
      input: resolve(files[name]),
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
      name: camelize(name),
      banner: getBanner(name)
    }
  }

  if (options.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(options.env)
    }))
  }

  if (options.transpile !== false) {
    config.input.plugins.push(buble())
  }

  return config
}

const camelizeRE = /-(\w)/g
const camelize = (str)=> {
  str = str.charAt(0).toUpperCase() + str.slice(1)
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
}

const configs = Object.keys(files).reduce((arr, name) => {
  const configs = genOptions(name).map(option => genConfig(option, name))
  arr = arr.concat(configs)
  return arr
}, [])

exports.configs = configs
exports.files = files
exports.genConfig = (name) => genOptions(name).map(option => genConfig(option, name))
