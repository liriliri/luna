const concat = require('licia/concat')
const reverse = require('licia/reverse')
const upperFirst = require('licia/upperFirst')
const camelCase = require('licia/camelCase')
const trim = require('licia/trim')
const map = require('licia/map')
const each = require('licia/each')
const isEmpty = require('licia/isEmpty')
const fs = require('licia/fs')
const some = require('licia/some')
const {
  wrap,
  runScript,
  resolve,
  unlinkOnExit,
  readComponentConfig,
} = require('./util')

module.exports = wrap(async function (component) {
  await runScript('typedoc', [
    `src/${component}/index.ts`,
    '--excludeNotDocumented',
    '--json',
    `src/${component}/typedoc.json`,
  ])
  const typedocPath = resolve(`../src/${component}/typedoc.json`)
  unlinkOnExit(typedocPath)

  const typedoc = JSON.parse(await fs.readFile(typedocPath))
  let componentClass
  let optionsInterface
  const types = []
  const children = typedoc.children
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i]
    switch (child.name) {
      case 'default':
        componentClass = child
        break
      case 'IOptions':
        optionsInterface = child
        break
      default:
        types.push(child)
    }
  }

  const componentConfig = readComponentConfig(component)

  let readme = `# Luna ${map(component.split('-'), (name) =>
    upperFirst(name)
  ).join(' ')}\n`
  readme += `\n${componentClass.comment.shortText}\n`
  readme += `\n## Demo\n\nhttps://luna.liriliri.io/?path=/story/${component}\n`
  readme += '\n## Install\n\nAdd the following script and style to your page.\n'

  const jsFiles = [component]
  const cssFiles = []
  if (componentConfig.style) {
    cssFiles.push(component)
  }
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
    readme += formatInterface(optionsInterface)
  }

  let api = ''
  each(componentClass.children, (child) => {
    if (child.name === 'constructor') {
      return
    }
    api += `\n### ${formatMethod(child.signatures[0])}\n`
    api += `\n${child.signatures[0].comment.shortText}\n`
  })

  if (api) {
    readme += '\n## Api\n' + api
  }

  if (!isEmpty(types)) {
    readme += '\n## Types\n'
    each(types, (type) => {
      readme += `\n### ${type.name}\n\n`
      readme += formatInterface(type)
    })
  }

  readme = readme.replace(/LunaComponent/g, 'Luna' + upperFirst(camelCase(component)))

  await fs.writeFile(resolve(`../src/${component}/README.md`), readme, 'utf8')
})

function formatInterface(interface) {
  let ret = ''

  each(interface.children, (child) => {
    if (child.kindString === 'Method') {
      ret += `* ${child.name}(function): ${child.signatures[0].comment.shortText}` 
    } else {
      ret += `* ${child.name}(${formatType(child.type)}): ${
        child.comment.shortText
      }\n`
    }
  })

  return ret
}

function formatMethod(child) {
  let ret = `${child.name}(${formatParameters(child.parameters).join(
    ', '
  )}): ${formatType(child.type)}`
  if (isStatic(child)) {
    ret = 'static ' + ret
  }
  return ret
}

function formatParameters(parameters = []) {
  return map(
    parameters,
    (parameter) =>
      `${parameter.name}${parameter.flags.isOptional ? '?' : ''}: ${formatType(
        parameter.type
      )}`
  )
}

function isStatic(child) {
  if (child.comment.tags) {
    return some(child.comment.tags, tag => tag.tag === 'static')
  }

  return false
}

function formatType(type) {
  if (type.type === 'union') {
    return map(type.types, formatType).join(' | ')
  }
  if (type.type === 'array') {
    return formatType(type.elementType) + '[]'
  }
  if (type.type === 'reflection') {
    return 'object'
  }
  if (type.type === 'literal') {
    return `'${type.value}'`
  }

  if (type.name === 'default') {
    return 'LunaComponent'
  }

  return type.name
}
