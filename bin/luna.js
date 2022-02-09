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
const map = require('licia/map')
const promisify = require('licia/promisify')
const endWith = require('licia/endWith')
const rmdir = promisify(require('licia/rmdir'))
const concat = require('licia/concat')
const startWith = require('licia/startWith')
const onExit = require('signal-exit')
const fs = require('licia/fs')

const format = wrap(async function (component) {
  await runScript('lsla', [
    'prettier',
    `src/${component}/**/*.{ts,js,html,json,css,scss}`,
    '--write',
  ])
})

const dev = wrap(async function (component) {
  await createWebpackConfig(component)
  rmWebpackConfig(component)

  await runScript('webpack', [
    '--config',
    `./src/${component}/webpack.config.js`,
    '--mode=development',
    '--watch',
  ])
})

const test = wrap(async function (component, argv) {
  await createWebpackConfig(component)
  rmWebpackConfig(component)
  await createKarmaConf(component)
  rmKarmaConf(component)

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

const build = wrap(async function (component) {
  try {
    await rmdir(resolve(`../dist/${component}`))
  } catch (e) {
    /* eslint-disable no-empty */
  }

  await createWebpackConfig(component)
  rmWebpackConfig(component)

  await runScript('webpack', [
    '--config',
    `src/${component}/webpack.config.js`,
    '--mode=production',
  ])

  const pkg = cloneDeep(require('../package.json'))
  if (!startWith(pkg.name, 'luna-')) {
    pkg.name = `luna-${pkg.name}`
  }
  delete pkg.scripts
  delete pkg.bin
  delete pkg.luna
  pkg.main = `cjs/${component}/index.js`
  const componentPkg = require(`../src/${component}/package.json`)
  extendDeep(pkg, componentPkg)
  delete pkg.devDependencies

  await fs.writeFile(
    resolve(`../dist/${component}/package.json`),
    JSON.stringify(pkg, null, 2),
    'utf8'
  )

  const files = await fs.readdir(resolve(`../src/${component}`))
  const tsFiles = map(
    filter(files, (file) => endWith(file, '.ts')),
    (file) => `./src/${component}/${file}`
  )

  await runScript(
    'tsc',
    concat(
      [
        '--target',
        'es2020',
        '--esModuleInterop',
        '-d',
        '--module',
        'commonjs',
        '--outDir',
        `dist/${component}/cjs/`,
      ],
      tsFiles
    )
  )

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
  await fs.writeFile(
    resolve(`../src/${component}/webpack.config.js`),
    webpackConfigTpl,
    'utf8'
  )
}

function rmWebpackConfig(component) {
  onExit(async () => {
    await fs.unlink(resolve(`../src/${component}/webpack.config.js`))
  })
}

const karmaConfTpl = `${readConfigTpl}
module.exports = require('../share/karma.conf')(config.name)
`

async function createKarmaConf(component) {
  await fs.writeFile(
    resolve(`../src/${component}/karma.conf.js`),
    karmaConfTpl,
    'utf8'
  )
}

async function rmKarmaConf(component) {
  onExit(async () => {
    await fs.unlink(resolve(`../src/${component}/karma.conf.js`))
  })
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
  .fail(function () {
    process.exit(1)
  })
  .help('h').argv
