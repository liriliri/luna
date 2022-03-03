#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')
const execa = require('execa')
const shell = require('shelljs')
const concat = require('licia/concat')
const map = require('licia/map')
const noop = require('licia/noop')
const clone = require('licia/clone')
const extendDeep = require('licia/extendDeep')
const cloneDeep = require('licia/cloneDeep')
const extend = require('licia/extend')
const each = require('licia/each')
const filter = require('licia/filter')
const promisify = require('licia/promisify')
const reverse = require('licia/reverse')
const endWith = require('licia/endWith')
const rmdir = promisify(require('licia/rmdir'))
const startWith = require('licia/startWith')
const defaults = require('licia/defaults')
const onExit = require('signal-exit')
const fs = require('licia/fs')
const isEmpty = require('licia/isEmpty')
const upperFirst = require('licia/upperFirst')
const camelCase = require('licia/camelCase')
const trim = require('licia/trim')

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

const doc = wrap(async function (component) {
  await runScript('typedoc', [
    `src/${component}/index.ts`,
    '--excludeNotDocumented',
    '--json',
    `src/${component}/typedoc.json`,
  ])

  const typedoc = JSON.parse(
    await fs.readFile(resolve(`../src/${component}/typedoc.json`))
  )
  let componentClass
  let optionsInterface
  const children = typedoc.children
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i]
    if (child.name === 'default') {
      componentClass = child
    }
    if (child.name === 'IOptions') {
      optionsInterface = child
    }
  }

  const componentConfig = readComponentConfig(component)

  let readme = `# Luna ${map(component.split('-'), (name) =>
    upperFirst(name)
  ).join(' ')}\n`
  readme += `\n${componentClass.comment.shortText}\n`
  readme += `\n## Demo\n\nhttps://luna.liriliri.io/?path=/story/${component}\n`
  readme += '\n## Install\n\nAdd the following script and style to your page.\n'

  const jsFiles = [component],
    cssFiles = [component]
  let dependencies = componentConfig.dependencies
  while (!isEmpty(dependencies)) {
    let newDependencies = []
    each(dependencies, (dependency) => {
      jsFiles.unshift(dependency)
      const componentConfig = readComponentConfig(dependency)
      if (componentConfig.style) {
        cssFiles.unshift(dependency)
      }
      if (componentConfig.dependencies) {
        newDependencies = concat(newDependencies, componentConfig.dependencies)
      }
    })
    dependencies = newDependencies
  }

  readme += '\n```html\n'
  if (!isEmpty(cssFiles)) {
    readme +=
      map(
        cssFiles,
        (component) =>
          `<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-${component}/luna-${component}.css" />`
      ).join('\n') + '\n'
  }
  readme += map(
    jsFiles,
    (component) =>
      `<script src="//cdn.jsdelivr.net/npm/luna-${component}/luna-${component}.js"></script>`
  ).join('\n')
  readme += '\n```\n'

  readme += '\nYou can also get it on npm.\n'
  readme += '\n```bash\n'
  readme += `npm install ${reverse(
    map(jsFiles, (component) => `luna-${component}`)
  ).join(' ')} --save`
  readme += '\n```\n'

  readme += '\n```javascript\n'
  if (!isEmpty(cssFiles)) {
    readme +=
      map(
        cssFiles,
        (component) => `import 'luna-${component}/luna-${component}.css'`
      ).join('\n') + '\n'
  }
  readme += `import Luna${upperFirst(
    camelCase(component)
  )} from 'luna-${component}'`
  readme += '\n```\n'

  let example = ''
  const tags = componentClass.comment.tags
  for (let i = 0, len = tags.length; i < len; i++) {
    const tag = tags[i]
    if (tag.tag === 'example') {
      example = tag.text
      break
    }
  }

  if (example) {
    readme += '\n## Usage\n\n```javascript\n'
    readme += trim(example)
    readme += '\n```\n'
  }

  if (optionsInterface) {
    readme += '\n## Configuration\n\n'
    each(optionsInterface.children, (child) => {
      readme += `* ${child.name}(${formatType(child.type)}): ${
        child.comment.shortText
      }\n`
    })
  }

  readme += '\n## Api\n'
  try {
    each(componentClass.children, (child) => {
      if (child.name === 'constructor') {
        return
      }
      readme += `\n### ${formatMethod(child.signatures[0])}\n`
      readme += `\n${child.signatures[0].comment.shortText}\n`
    })
  } catch (e) {
    console.log(e)
  }

  await fs.writeFile(resolve(`../src/${component}/README.md`), readme, 'utf8')
})

function formatMethod(child) {
  return `${child.name}(${formatParameters(child.parameters)}): ${formatType(
    child.type
  )}`
}

function formatParameters(parameters = []) {
  return map(
    parameters,
    (parameter) => `${parameter.name}: ${formatType(parameter.type)}`
  )
}

function formatType(type) {
  if (type.type === 'union') {
    return map(type.types, (type) => type.name).join('|')
  }

  return type.name
}

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
  .command('doc', 'generate readme', noop, doc)
  .fail(function () {
    process.exit(1)
  })
  .help('h').argv
