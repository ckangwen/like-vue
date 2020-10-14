const fs = require('fs')
const { configs, files } = require('./config')
const { build } = require('./build')

const mkdir = (dirname) => {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname)
  }
}
async function initDir() {
  await Promise.all(Object.keys(files).map(async function(name) {
    if (name === 'vue-like') {
      await mkdir('dist')
    } else {
      await mkdir(`dist/${name}`)
    }
  }))
}
initDir()

build(configs)
