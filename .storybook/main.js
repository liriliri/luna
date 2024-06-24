const path = require('path')
const map = require('licia/map')
const each = require('licia/each')
const keys = require('licia/keys')

const components = keys(require('../index.json'))

const stories = map(components, (component) => `../src/${component}/story.js`)

module.exports = {
  stories,
  addons: [
    'storybook-readme/register',
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
  babel: async (options) => {
    options.presets.push([
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ])

    return options
  },
  webpackFinal: (config) => {
    const rules = config.module.rules

    each(rules, (rule) => {
      if (rule.test.toString() === '/\\.(mjs|jsx?)$/') {
        rule.use[0].options.sourceType = 'unambiguous'
      }
    })

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
    return config
  },
  staticDirs: ['../public'],
}
