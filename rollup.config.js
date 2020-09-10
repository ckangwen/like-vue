import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import alias from 'rollup-plugin-alias'


const name = 'render-component-with-props'
const generateVueFilepath = name => `./src/vue/${name}/example/`
export default {
  input: generateVueFilepath(name) + 'index.ts',
  output: {
    file: generateVueFilepath(name) + 'index.js',
    format: 'iife'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    alias({
      resolve: ['.ts', '.js'],
      entries: [
        { find: '@', replacement: 'src' }
      ]
    }),
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    })
  ]
}