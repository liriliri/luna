const path = require('path')
const each = require('licia/each')
const contain = require('licia/contain')
const { getFullDependencies, readComponentConfig } = require('../../lib/util')

const headless = contain(process.argv, '--headless')

module.exports = function (name) {
  const webpackCfg = require(`../${name}/webpack.config.js`)(
    {},
    { mode: 'development' }
  )
  webpackCfg.module.rules.push({
    test: /\.ts$/,
    exclude: /node_modules|share/,
    loader: '@jsdevtools/coverage-istanbul-loader',
    enforce: 'post',
    options: {
      esModules: true,
    },
  })

  const preprocessors = {
    'test.js': ['webpack', 'sourcemap'],
  }

  const files = []

  const dependencies = getFullDependencies(name)
  each(dependencies, (dependency) => {
    const componentConfig = readComponentConfig(dependency)
    if (componentConfig.style) {
      files.push(`../../dist/${dependency}/luna-${dependency}.css`)
    }
    files.push(`../../dist/${dependency}/luna-${dependency}.js`)
  })
  files.push(`../../dist/${name}/luna-${name}.css`)
  files.push('test.js')

  return function (config) {
    config.set({
      basePath: `../${name}`,
      files,
      client: {
        headless,
      },
      frameworks: ['mocha', 'chai', 'jquery-3.4.0'],
      plugins: [
        'karma-jquery',
        'karma-chai',
        'karma-mocha',
        'karma-webpack',
        'karma-sourcemap-loader',
        'karma-chrome-launcher',
        'karma-coverage-istanbul-reporter',
      ],
      coverageIstanbulReporter: {
        reports: ['html', 'lcovonly', 'text', 'text-summary'],
        dir: path.join(__dirname, `../../coverage/${name}`),
      },
      reporters: ['progress', 'coverage-istanbul'],
      webpack: webpackCfg,
      preprocessors,
      browsers: [headless ? 'ChromeHeadless' : 'Chrome'],
      browserNoActivityTimeout: 100000,
      singleRun: headless,
      concurrency: Infinity,
    })
  }
}
