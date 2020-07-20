const path = require('path')
const glob = require('glob')
const map = require('licia/map')
const each = require('licia/each')

const components = glob.sync('*', {
  cwd: path.resolve(__dirname, '../dist')
})

const stories = map(components, component => `../src/${component}/stories.js`)

module.exports = {
  stories,
  addons: [
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/stories\.js/],
          include: [path.resolve(__dirname, '../src')]
        }
      }
    },
    '@storybook/addon-backgrounds/register',
    '@storybook/addon-knobs/register'
  ],
  webpackFinal: config => {
    const rules = config.module.rules

    each(rules, rule => {
      if (rule.test.toString() === '/\\.(mjs|jsx?)$/') {
        rule.use[0].options.sourceType = 'unambiguous'
      }
    })

    each(components, component => {
      each(['css', 'js'], extension => {
        config.resolve.alias[`${component}.${extension}`] = path.resolve(
          __dirname,
          `../dist/${component}/luna-${component}.${extension}`
        )
      })
    })
    return config
  }
}
