const execa = require('execa')
const path = require('path')
const extend = require('licia/extend')
const clone = require('licia/clone')
const each = require('licia/each')
const onExit = require('signal-exit')
const defaults = require('licia/defaults')

exports.runScript = function (name, args, options = {}) {
  return execa(
    name,
    args,
    extend(
      {
        preferLocal: true,
        cwd: exports.resolve('../'),
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
    for (let component of components) {
      await fn(component, argv)
    }
  }
}

exports.resolve = function (p) {
  return path.resolve(__dirname, p)
}

exports.unlinkOnExit = function (p) {
  onExit(() => require('fs').unlinkSync(p))
}

exports.readComponentConfig = function (component) {
  const pkg = require(exports.resolve(`../src/${component}/package.json`))

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
