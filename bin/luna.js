#!/usr/bin/env node

const program = require('commander')
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

const test = wrap(async function (component, options) {
  await createWebpackConfig(component)
  await createKarmaConf(component)

  const args = ['start', `./src/${component}/karma.conf.js`]
  if (options.headless !== false) {
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

program.command('format [component]').description('format code').action(format)

program
  .command('dev <component>')
  .description('start webpack-dev-server')
  .action(dev)

program.command('build [component]').description('build package').action(build)

program.command('lint [component]').description('lint code').action(lint)

program
  .command('genIcon [component]')
  .description('generate icon file')
  .action(genIcon)

program
  .command('test [component]')
  .option('--no-headless', 'do not use headless mode')
  .description('run test')
  .action(test)

program
  .command('install [component]')
  .description('install dependencies')
  .action(install)

program.command('update').description('update index.json').action(update)

program.command('doc [component]').description('generate readme').action(doc)

program.parse(process.argv)
