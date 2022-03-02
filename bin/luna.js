#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const execa = require('execa')
const shell = require('shelljs')
const noop = require('licia/noop')
const clone = require('licia/clone')
const extendDeep = require('licia/extendDeep')
const cloneDeep = require('licia/cloneDeep')
const extend = require('licia/extend')
const each = require('licia/each')
const filter = require('licia/filter')
const promisify = require('licia/promisify')
const endWith = require('licia/endWith')
const rmdir = promisify(require('licia/rmdir'))
const startWith = require('licia/startWith')
const defaults = require('licia/defaults')
const onExit = require('signal-exit')
const fs = require('licia/fs')
const isEmpty = require('licia/isEmpty')

const format = wrap(async function (component) {
  await runScript('lsla', [
    'prettier',
    `src/${component}/**/*.{ts,js,html,json,css,scss}`,
    '--write',
  ])
})

const dev = wrap(async function (component) {
  await createWebpackConfig(component)

  await runScript('webpack', [
    '--config',
    `./src/${component}/webpack.config.js`,
    '--mode=development',
    '--watch',
  ])
})

const test = wrap(async function (component, argv) {
  await createWebpackConfig(component)
  await createKarmaConf(component)

  const args = ['start', `./src/${component}/karma.conf.js`]
  if (argv.headless !== false) {
    args.push('--headless')
  }
  await runScript('karma', args)
}, 'test')

const install = wrap(async function (component) {
  await runScript('npm', ['install'], {
    cwd: resolve(`../src/${component}/`),
  })
}, 'install')

const lint = wrap(async function (component) {
  await runScript('eslint', [`src/${component}/**/*.ts`])
})

const genIcon = wrap(async function (component) {
  await runScript('lsla', [
    'genIcon',
    '--input',
    `src/${component}/icon`,
    '--output',
    `src/${component}/icon.css`,
    '--name',
    `luna-${component}-icon`,
  ])
  await runScript('lsla', ['prettier', `src/${component}/icon.css`, '--write'])
}, 'icon')

const update = async function () {
  const dirs = await fs.readdir(resolve('../src'))
  const index = {}
  const tsConfig = JSON.parse(await fs.readFile(resolve('../tsconfig.json')))
  for (let i = 0, len = dirs.length; i < len; i++) {
    const dir = dirs[i]
    if (await fs.exists(resolve(`../src/${dir}/package.json`))) {
      index[dir] = readComponentConfig(dir)
      tsConfig.compilerOptions.paths[`luna-${dir}`] = [`src/${dir}/index`]
    }
  }

  const INDEX_OUTPUT_PATH = resolve('../index.json')
  await fs.writeFile(INDEX_OUTPUT_PATH, stringify(index), 'utf8')
  console.log('Index file generated: ' + INDEX_OUTPUT_PATH)

  await fs.writeFile(resolve('../tsconfig.json'), stringify(tsConfig), 'utf8')
  console.log('Tsconfig file updated')
}

const build = wrap(async function (component) {
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

function resolve(p) {
  return path.resolve(__dirname, p)
}

function getComponent(argv) {
  const _ = clone(argv._)
  _.shift()
  const component = _.shift()

  return component
}

function runScript(name, args, options = {}) {
  return execa(
    name,
    args,
    extend(
      {
        preferLocal: true,
        cwd: resolve('../'),
        stdio: 'inherit',
      },
      options
    )
  )
}

function wrap(fn, condition) {
  return async function (argv) {
    let components = []
    const component = getComponent(argv)
    if (component) {
      components.push(component)
    } else {
      each(require('../index.json'), (val, key) => {
        if (condition && !val[condition]) {
          return
        }

        components.push(key)
      })
    }
    for (let component of components) {
      await fn(component, argv)
    }
  }
}

const readConfigTpl = `const defaults = require('licia/defaults')
const pkg = require('./package.json')
const config = defaults(pkg.luna || {}, {
  name: pkg.name,
  style: true,
  icon: false,
  test: true,
  install: false,
  dependencies: []
})`

const webpackConfigTpl = `${readConfigTpl}
module.exports = require('../share/webpack.config')(config.name, {
  hasStyle: config.style,
  useIcon: config.icon,
  dependencies: config.dependencies,
})
`

async function createWebpackConfig(component) {
  const output = resolve(`../src/${component}/webpack.config.js`)
  await fs.writeFile(output, webpackConfigTpl, 'utf8')
  unlinkOnExit(output)
}

const karmaConfTpl = `${readConfigTpl}
module.exports = require('../share/karma.conf')(config.name, {
  hasStyle: config.style,
  useIcon: config.icon,
  dependencies: config.dependencies,
})
`

async function createKarmaConf(component) {
  const output = resolve(`../src/${component}/karma.conf.js`)
  await fs.writeFile(output, karmaConfTpl, 'utf8')
  unlinkOnExit(output)
}

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

function unlinkOnExit(p) {
  onExit(() => require('fs').unlinkSync(p))
}

function stringify(obj) {
  return JSON.stringify(obj, null, 2)
}

function readComponentConfig(component) {
  const pkg = require(resolve(`../src/${component}/package.json`))

  const config = defaults(pkg.luna || {}, {
    version: pkg.version,
    style: true,
    icon: false,
    test: true,
    install: false,
    dependencies: [],
  })

  return config
}

yargs
  .usage('Usage: <command> <component>')
  .command('format', 'format code', noop, format)
  .command('dev', 'start webpack-dev-server', noop, dev)
  .command('build', 'build package', noop, build)
  .command('lint', 'lint code', noop, lint)
  .command('genIcon', 'generate icon file', noop, genIcon)
  .command('test', 'run test', noop, test)
  .command('install', 'install dependencies', noop, install)
  .command('update', 'update index.json', noop, update)
  .fail(function () {
    process.exit(1)
  })
  .help('h').argv
