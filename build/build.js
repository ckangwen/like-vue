import { existsSync, mkdirSync, writeFile } from 'fs'
import { relative } from 'path'
import { gzip } from 'zlib'
import { minify } from 'terser'
import { rollup as _rollup } from 'rollup'
import configs from './config'

if (!existsSync('dist')) {
  mkdirSync('dist')
}

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built])
      .then(() => {
        built++
        if (built < total) {
          next()
        }
      })
      .catch(logError)
  }

  next()
}

function buildEntry ({ input, output }) {
  const { file, banner } = output
  const isProd = /min\.js$/.test(file)
  return _rollup(input)
    .then(bundle => bundle.generate(output))
    .then(bundle => {
      const code = bundle.output[0].code
      if (isProd) {
        const minified =
          (banner ? banner + '\n' : '') +
          minify(code, {
            toplevel: true,
            output: {
              ascii_only: true
            },
            compress: {
              pure_funcs: ['makeMap']
            }
          }).code
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(
        blue(relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || '')
      )
      resolve()
    }

    writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

build(configs)
