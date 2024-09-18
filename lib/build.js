const shell = require('shelljs')
const extendDeep = require('licia/extendDeep')
const cloneDeep = require('licia/cloneDeep')
const each = require('licia/each')
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
  createTsConfig,
  stringify,
  createWebpackConfig,
  getFullDependencies,
} = require('./util')

module.exports = wrap(async function (component) {
  try {
    await rmdir(resolve(`../dist/${component}`))
  } catch (e) {
    /* eslint-disable no-empty */
  }

  await createWebpackConfig(component)

  process.env.NODE_OPTIONS = '--openssl-legacy-provider'
  await runScript('webpack', [
    '--config',
    `src/${component}/webpack.config.js`,
    '--mode=production',
  ])

  const pkg = cloneDeep(require('../package.json'))
  delete pkg.scripts
  delete pkg.bin
  pkg.main = `cjs/${component}/index.js`
  pkg.module = `esm/${component}/index.js`
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
    if (!isEmpty(peerDependencies)) {
      pkg.peerDependencies = peerDependencies
    }
    pkg.exports = {
      '.': `./esm/${component}/index.js`,
      './css': `./luna-${component}.css`,
      [`./luna-${component}.css`]: `./luna-${component}.css`,
      [`./luna-${component}.js`]: `./luna-${component}.js`,
      './package.json': './package.json',
    }
    if (config.react) {
      pkg.exports['./react'] = `./esm/${component}/react.js`
    }
    if (config.vue) {
      pkg.exports['./vue'] = `./esm/${component}/vue.js`
    }
  }

  await fs.writeFile(
    resolve(`../dist/${component}/package.json`),
    stringify(pkg),
    'utf8'
  )

  await buildCjs(component)
  await buildEsm(component)

  shell.cp(
    resolve(`../src/${component}/README.md`),
    resolve(`../dist/${component}`)
  )
})

async function buildCjs(component) {
  await createTsConfig(component)

  await runScript('tsc', ['--project', `src/${component}/tsconfig.json`])
  const dependencies = getFullDependencies(component)
  for (let i = 0, len = dependencies.length; i < len; i++) {
    const dependency = dependencies[i]
    await rmdir(resolve(`../dist/${component}/cjs/${dependency}`))
  }
}

async function buildEsm(component) {
  await createTsConfig(component, true)

  await runScript('tsc', ['--project', `src/${component}/tsconfig.json`])
  const dependencies = getFullDependencies(component)
  for (let i = 0, len = dependencies.length; i < len; i++) {
    const dependency = dependencies[i]
    await rmdir(resolve(`../dist/${component}/esm/${dependency}`))
  }
}
