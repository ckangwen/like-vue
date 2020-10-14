const { prompt } = require('enquirer')
const { files, genConfig } = require('./config')
const { build } = require('./build')

async function main() {
  const { plugin } = await prompt({
    type: 'select',
    name: 'plugin',
    message: 'Select the plugin to be packaged',
    choices: Object.keys(files)
  })

  const options = genConfig(plugin)

  build(options)
}

main().catch((err) => console.error(err))
