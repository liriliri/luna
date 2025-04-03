#!/usr/bin/env node

const program = require('commander')
const fs = require('licia/fs')
const dataUrl = require('licia/dataUrl')
const mime = require('licia/mime')
const convertBin = require('licia/convertBin')
const path = require('path')
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
    `src/${component}/**/*.{ts,tsx,js,html,json,css,scss}`,
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

const genAsset = wrap(async function (component) {
  const input = resolve(`../src/${component}/asset`)
  const files = await fs.readdir(input)
  const output = {}
  for (let i = 0, len = files.length; i < len; i++) {
    const file = files[i]
    const buf = await fs.readFile(path.resolve(input, file))
    const ext = path.extname(file).slice(1)
    const mimeType = mime(ext)
    output[file] = dataUrl.stringify(convertBin(buf, 'base64'), mimeType)
  }
  const outputStr = `export default ${JSON.stringify(output, null, 2)}`
  await fs.writeFile(resolve(`../src/${component}/asset.ts`), outputStr)
})

const genIcon = wrap(async function (component) {
  await runScript('lsla', [
    'genIcon',
    '--input',
    `src/${component}/`,
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
  .command('genAsset [component]')
  .description('generate asset file')
  .action(genAsset)

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
