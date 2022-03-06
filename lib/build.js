const shell = require('shelljs')
const extendDeep = require('licia/extendDeep')
const cloneDeep = require('licia/cloneDeep')
const each = require('licia/each')
const filter = require('licia/filter')
const endWith = require('licia/endWith')
const promisify = require('licia/promisify')
const rmdir = promisify(require('licia/rmdir'))
const startWith = require('licia/startWith')
const isEmpty = require('licia/isEmpty')
const fs = require('licia/fs')
const {
  wrap,
  resolve,
  runScript,
  readComponentConfig,
  unlinkOnExit,
  stringify,
  createWebpackConfig,
} = require('./util')

module.exports = wrap(async function (component) {
  try {
    await rmdir(resolve(`../dist/${component}`))
  } catch (e) {
    /* eslint-disable no-empty */
  }

  await createWebpackConfig(component)

  await runScript('webpack', [
    '--config',
    `src/${component}/webpack.config.js`,
    '--mode=production',
  ])

  const pkg = cloneDeep(require('../package.json'))
  delete pkg.scripts
  delete pkg.bin
  pkg.main = `cjs/${component}/index.js`
  const componentPkg = require(`../src/${component}/package.json`)
  extendDeep(pkg, componentPkg)
  if (!startWith(pkg.name, 'luna-')) {
    pkg.name = `luna-${pkg.name}`
  }
  delete pkg.devDependencies
  delete pkg.luna
  const config = readComponentConfig(component)
  if (!isEmpty(config)) {
    const peerDependencies = {}
    each(config.dependencies, (dependency) => {
      const config = readComponentConfig(dependency)
      peerDependencies[`luna-${dependency}`] = `^${config.version}`
    })
    pkg.peerDependencies = peerDependencies
  }

  await fs.writeFile(
    resolve(`../dist/${component}/package.json`),
    stringify(pkg),
    'utf8'
  )

  const files = await fs.readdir(resolve(`../src/${component}`))
  const tsFiles = filter(files, (file) => endWith(file, '.ts'))

  await createTsConfig(component, tsFiles)

  await runScript('tsc', ['--project', `src/${component}/tsconfig.json`])
  const dependencies = config.dependencies
  for (let i = 0, len = dependencies.length; i < len; i++) {
    const dependency = dependencies[i]
    await rmdir(resolve(`../dist/${component}/cjs/${dependency}`))
  }

  shell.cp(
    resolve(`../src/${component}/README.md`),
    resolve(`../dist/${component}`)
  )
})

async function createTsConfig(component, files) {
  const tsConfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      target: 'es2020',
      declaration: true,
      outDir: `../../dist/${component}/cjs/`,
    },
    files,
  }
  const output = resolve(`../src/${component}/tsconfig.json`)
  await fs.writeFile(output, stringify(tsConfig), 'utf8')
  unlinkOnExit(output)
}
