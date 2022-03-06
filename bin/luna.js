#!/usr/bin/env node

const yargs = require('yargs')
const noop = require('licia/noop')
const fs = require('licia/fs')
const {
  runScript,
  wrap,
  resolve,
  readComponentConfig,
  stringify,
  createWebpackConfig,
  createKarmaConf,
} = require('../lib/util')
const doc = require('../lib/doc')
const build = require('../lib/build')

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
  .command('doc', 'generate readme', noop, doc)
  .fail(function () {
    process.exit(1)
  })
  .help('h').argv
