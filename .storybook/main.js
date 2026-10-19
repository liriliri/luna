const fs = require('fs')
const path = require('path')
const map = require('licia/map')
const each = require('licia/each')
const keys = require('licia/keys')
const spaceCase = require('licia/spaceCase')
const upperFirst = require('licia/upperFirst')
const webpack = require('webpack')

const components = keys(require('../index.json'))

const stories = map(components, (component) => `../src/${component}/story.js`)

function storyTitle(name) {
  return map(spaceCase(name).split(' '), upperFirst).join(' ')
}

const storyIndexer = {
  test: /story\.js$/,
  createIndex(fileName) {
    const code = fs.readFileSync(fileName, 'utf8')
    const nameMatch = code.match(/story\(\s*['"]([^'"]+)['"]/)
    const exportMatch = code.match(/export const \{([^}]+)\} = def/)
    if (!nameMatch || !exportMatch) {
      throw new Error(`Cannot index ${fileName}`)
    }

    const title = storyTitle(nameMatch[1])
    const exportNames = exportMatch[1]
      .split(',')
      .map((part) => {
        const bits = part.trim().split(':')
        return (bits[1] || bits[0]).trim()
      })
      .filter(Boolean)

    return exportNames.map((exportName) => ({
      type: 'story',
      importPath: fileName,
      exportName,
      title,
      tags: ['autodocs'],
    }))
  },
}

module.exports = {
  stories,
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-knobs',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/story\.js/],
          exclude: /share/,
          include: [path.resolve(__dirname, '../src')],
        },
        loaderOptions: {
          injectDecorator: false,
          injectStoryParameters: false,
        },
      },
    },
  ],
  framework: {
    name: '@storybook/html-webpack5',
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  docs: {
    autodocs: 'tag',
  },
  swc: async () => ({
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }),
  webpackFinal: (config) => {
    each(components, (component) => {
      config.resolve.alias[`luna-${component}`] = path.resolve(
        __dirname,
        `../dist/${component}/luna-${component}.js`
      )
      each(['css', 'js'], (extension) => {
        config.resolve.alias[`luna-${component}.${extension}`] = path.resolve(
          __dirname,
          `../dist/${component}/luna-${component}.${extension}`
        )
      })
    })

    config.plugins.push(
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      })
    )

    return config
  },
  staticDirs: ['../public'],
  experimental_indexers: async (existingIndexers) => {
    const rest = (existingIndexers || []).filter(
      (indexer) => !indexer.test.test('src/notification/story.js')
    )
    return [storyIndexer, ...rest]
  },
}
