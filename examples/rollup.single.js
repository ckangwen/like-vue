import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias'
import nodeResolve from 'rollup-plugin-node-resolve'
import { join } from 'path'

const filepath = join(__dirname, './router/basic')

export default {
  input: join(filepath, 'index.ts'),
  output: {
    file: join(filepath, 'index.js'),
    format: 'iife'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    alias({
      resolve: ['.ts', '.js'],
      entries: [
        { find: '@', replacement: join(__dirname, '../src') }
      ]
    }),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    }),
    nodeResolve()
  ]
}