#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const execa = require('execa')
const shell = require('shelljs')
const noop = require('licia/noop')
const clone = require('licia/clone')
const extend = require('licia/extend')
const each = require('licia/each')
const fs = require('licia/fs')

const format = wrap(async function (component) {
  await runScript('lsla', [
    'prettier',
    `src/${component}/*.{ts,js,html,json}`,
    '--write',
  ])
})

const dev = wrap(async function (component) {
  await runScript('webpack', [
    '--config',
    `./src/${component}/webpack.config.js`,
    '--mode=development',
    '--watch',
  ])
})

const lint = wrap(async function (component) {
  await runScript('tslint', [`src/${component}/*.ts`])
})

const genIcon = wrap(async function (component) {
  await runScript('lsla', [
    'genIcon',
    '--input',
    `src/${component}/icon`,
    '--output',
    `src/${component}/icon.css`,
    '--name',
    `${component}-icon`,
  ])
  await runScript('lsla', ['prettier', `src/${component}/icon.css`, '--write'])
}, 'icon')

const build = wrap(async function (component) {
  await runScript('webpack', [
    '--config',
    `src/${component}/webpack.config.js`,
    '--mode=production',
  ])

  const pkg = require('../package.json')
  delete pkg.scripts
  delete pkg.devDependencies
  delete pkg.bin
  pkg.main = `luna-${component}.js`
  const componentPkg = require(`../src/${component}/package.json`)
  extend(pkg, componentPkg)

  await fs.writeFile(
    resolve(`../dist/${component}/package.json`),
    JSON.stringify(pkg, null, 2),
    'utf8'
  )

  shell.cp(
    resolve(`../src/${component}/README.md`),
    resolve(`../dist/${component}`)
  )
}, 'build')

function resolve(p) {
  return path.resolve(__dirname, p)
}

function getComponent(argv) {
  const _ = clone(argv._)
  _.shift()
  const component = _.shift()

  if (!component) {
    console.log('A component name must be given.')
  }

  return component
}

function runScript(name, args) {
  return execa(name, args, {
    preferLocal: true,
    cwd: resolve('../'),
    stdio: 'inherit',
  })
}

function wrap(fn, condition) {
  return async function (argv) {
    let components = []
    if (argv.all) {
      each(require('../index.json'), (val, key) => {
        if (condition && !val[condition]) {
          return
        }
        
        components.push(key)
      })
    } else {
      const component = getComponent(argv)
      if (!component) {
        console.log('Component is not specified')
        return
      }
      components.push(component)
    }
    for (let component of components) {
      await fn(component)
    }
  }
}

yargs
  .usage('Usage: <command> <component>')
  .command('format', 'format code', noop, format)
  .command('dev', 'start webpack-dev-server', noop, dev)
  .command('build', 'build package', noop, build)
  .command('lint', 'lint code', noop, lint)
  .command('genIcon', 'generate icon file', noop, genIcon)
  .option('all', {
    alias: 'a',
    type: 'boolean',
    description: 'Run with all components',
  })
  .help('h').argv
