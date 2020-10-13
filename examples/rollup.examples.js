import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias'
import nodeResolve from 'rollup-plugin-node-resolve'

const path = require('path')
const fs = require('fs')

const basePath = path.resolve('./', __dirname)
function getPaths(base) {
  return fs.readdirSync(base).reduce((entries, dir) => {
    const fullDir = path.join(base, dir)
    if (fs.statSync(fullDir).isDirectory()) {
      const childPaths = getPaths(fullDir)
      entries = entries.concat(childPaths.length > 0 ? childPaths : fullDir)
    }
    return entries
  }, [])
}

const plugins = [
  replace({
    'process.env.NODE_ENV': JSON.stringify('development')
  }),
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

const configs = getPaths(basePath).map(dirpath => ({
  input: path.resolve(dirpath, 'index.ts'),
  output: {
    file: path.resolve(dirpath, 'index.js'),
    format: 'iife',
  },
  plugins
}))

export default configs
