const path = require('path')
const glob = require('glob')
const map = require('licia/map')
const each = require('licia/each')

const components = glob.sync('*', {
  cwd: path.resolve(__dirname, '../dist'),
})

const stories = map(components, (component) => `../src/${component}/stories.js`)

module.exports = {
  stories,
  addons: [
    '@storybook/addon-knobs/register',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/stories\.js/],
          include: [path.resolve(__dirname, '../src')],
        },
      },
    },
    '@storybook/addon-backgrounds/register',
    'storybook-readme/register',
  ],
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
}
