const path = require('path')
const each = require('licia/each')
const contain = require('licia/contain')
const endWith = require('licia/endWith')
const { getFullDependencies, readComponentConfig } = require('../../lib/util')

const headless = contain(process.argv, '--headless')

module.exports = function (name, { useIcon = false, hasStyle = true } = {}) {
  const webpackCfg = require(`../${name}/webpack.config.js`)(
    {},
    { mode: 'development' }
  )
  const scssRule = webpackCfg.module.rules[1]
  scssRule.loaders.shift()
  scssRule.loaders.unshift('style-loader')
  const cssRule = webpackCfg.module.rules[2]
  cssRule.loaders.shift()
  cssRule.loaders.unshift('style-loader')
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
  files.push('test.js')

  const postcssLoader = cssRule.loaders[2]
  const postcssOptions = postcssLoader.options

  const styles = []
  if (hasStyle) {
    styles.push('style.scss')
  }
  if (useIcon) {
    styles.push('icon.css')
  }
  each(styles, (style) => {
    const file = `../${name}/${style}`
    files.unshift(file)
    const preprocessor = ['postcss']
    if (endWith(style, 'scss')) {
      preprocessor.unshift('scss')
    }
    preprocessors[file] = preprocessor
  })

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
        'karma-scss-preprocessor',
        '@metahub/karma-postcss-preprocessor',
      ],
      coverageIstanbulReporter: {
        reports: ['html', 'lcovonly', 'text', 'text-summary'],
        dir: path.join(__dirname, `../../coverage/${name}`),
      },
      reporters: ['progress', 'coverage-istanbul'],
      webpack: webpackCfg,
      postcssPreprocessor: {
        options: postcssOptions,
      },
      preprocessors,
      browsers: [headless ? 'ChromeHeadless' : 'Chrome'],
      browserNoActivityTimeout: 100000,
      singleRun: headless,
      concurrency: Infinity,
    })
  }
}
