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
    }
  ],
  webpackFinal: config => {
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
