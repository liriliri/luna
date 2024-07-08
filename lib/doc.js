const reverse = require('licia/reverse')
const upperFirst = require('licia/upperFirst')
const camelCase = require('licia/camelCase')
const trim = require('licia/trim')
const map = require('licia/map')
const each = require('licia/each')
const isEmpty = require('licia/isEmpty')
const fs = require('licia/fs')
const some = require('licia/some')
const startWith = require('licia/startWith')
const {
  wrap,
  runScript,
  resolve,
  unlinkOnExit,
  readComponentConfig,
  getFullDependencies,
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

  let readme = `# Luna ${map(component.split('-'), (name) =>
    upperFirst(name)
  ).join(' ')}\n`
  readme += `\n${componentClass.comment.summary[0].text}\n`
  readme += `\n## Demo\n\nhttps://luna.liriliri.io/?path=/story/${component}\n`
  readme += '\n## Install\n\nAdd the following script and style to your page.\n'

  const jsFiles = []
  const cssFiles = []
  const dependencies = getFullDependencies(component)
  dependencies.push(component)
  each(dependencies, (dependency) => {
    jsFiles.push(dependency)
    const componentConfig = readComponentConfig(dependency)
    if (componentConfig.style) {
      cssFiles.push(dependency)
    }
  })

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
  const tags = componentClass.comment.blockTags
  if (tags) {
    for (let i = 0, len = tags.length; i < len; i++) {
      const tag = tags[i]
      if (tag.tag === '@example') {
        const code = tag.content[0].text
        const lines = code.split('\n').filter((line) => !startWith(line, '```'))
        example = lines.join('\n')
        break
      }
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
    api += `\n${child.signatures[0].comment.summary[0].text}\n`
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

  await fs.writeFile(resolve(`../src/${component}/README.md`), readme, 'utf8')
})

function formatInterface(interface) {
  let ret = ''

  if (!interface.children) {
    return ret
  }

  each(interface.children, (child) => {
    if (child.kindString === 'Method') {
      ret += `* ${child.name}(function): ${child.signatures[0].comment.shortText}`
    } else {
      ret += `* ${child.name}(${formatType(child.type)}): ${
        child.comment.summary[0].text
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
  return map(parameters, (parameter) => {
    let isOptional = parameter.flags.isOptional
    if (parameter.defaultValue) {
      isOptional = true
    }

    return `${parameter.name}${isOptional ? '?' : ''}: ${formatType(
      parameter.type
    )}`
  })
}

function isStatic(child) {
  if (child.comment.tags) {
    return some(child.comment.tags, (tag) => tag.tag === 'static')
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
    if (type.value === null) {
      return 'null'
    }
    return `'${type.value}'`
  }

  if (type.name === 'default') {
    return 'LunaComponent'
  }

  if (type.typeArguments) {
    return type.name + '<' + map(type.typeArguments, formatType) + '>'
  }

  return type.name
}
