#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const execa = require('execa')
const shell = require('shelljs')
const noop = require('licia/noop')
const clone = require('licia/clone')
const extend = require('licia/extend')
const fs = require('licia/fs')

yargs
  .usage('Usage: <command> <component>')
  .command('format', 'format code', noop, format)
  .command('dev', 'start webpack-dev-server', noop, dev)
  .command('build', 'build package', noop, build)
  .command('lint', 'lint code', noop, lint)
  .help('h').argv

async function format(argv) {
  const component = getComponent(argv)
  if (!component) return

  await runScript('prettier', [
    `src/${component}/*.{ts,js,html,json}`,
    '--write',
  ])
}

async function dev(argv) {
  const component = getComponent(argv)
  if (!component) return

  await runScript('webpack', [
    '--config',
    `./src/${component}/webpack.config.js`,
    '--mode=development',
    '--watch',
  ])
}

async function lint(argv) {
  const component = getComponent(argv)
  if (!component) return

  await runScript('tslint', [`src/${component}/*.ts`])
}

async function build(argv) {
  const component = getComponent(argv)
  if (!component) return

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
}

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
