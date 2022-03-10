const execa = require('execa')
const path = require('path')
const extend = require('licia/extend')
const clone = require('licia/clone')
const each = require('licia/each')
const filter = require('licia/filter')
const endWith = require('licia/endWith')
const onExit = require('signal-exit')
const defaults = require('licia/defaults')
const fs = require('licia/fs')

exports.runScript = function (name, args, options = {}) {
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

exports.wrap = function (fn, condition) {
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
    try {
      for (let component of components) {
        await fn(component, argv)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

const resolve = (exports.resolve = function (p) {
  return path.resolve(__dirname, p)
})

const unlinkOnExit = (exports.unlinkOnExit = function (p) {
  onExit(() => require('fs').unlinkSync(p))
})

exports.readComponentConfig = function (component) {
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

function getComponent(argv) {
  const _ = clone(argv._)
  _.shift()
  const component = _.shift()

  return component
}

const stringify = (exports.stringify = function (obj) {
  return JSON.stringify(obj, null, 2)
})

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

exports.createWebpackConfig = async function (component) {
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

exports.createKarmaConf = async function (component) {
  const output = resolve(`../src/${component}/karma.conf.js`)
  await fs.writeFile(output, karmaConfTpl, 'utf8')
  unlinkOnExit(output)
}

exports.createTsConfig = async function (component) {
  let files = await fs.readdir(resolve(`../src/${component}`))
  files = filter(files, (file) => endWith(file, '.ts'))

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
