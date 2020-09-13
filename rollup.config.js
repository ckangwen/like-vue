import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias'
const path = require('path')


const filepath = './examples/components/'
export default {
  input: filepath + 'index.ts',
  output: {
    file: filepath + 'index.js',
    format: 'iife'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    alias({
      resolve: ['.ts', '.js'],
      entries: [
        { find: '@', replacement: path.join(__dirname, './src') }
      ]
    }),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    })
  ]
}