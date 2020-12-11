const path = require('path')
const each = require('licia/each')

module.exports = function (name) {
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
    loader: 'istanbul-instrumenter-loader',
    enforce: 'post',
    options: {
      esModules: true,
    },
  })

  const files = ['test.js']

  each(webpackCfg.externals, (external, key) => {
    const name = key.replace('luna-', '')
    files.unshift(`../../dist/${name}/${key}.css`)
    files.unshift(`../../dist/${name}/${key}.js`)
  })

  return function (config) {
    config.set({
      basePath: `../${name}`,
      files,
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
      preprocessors: {
        'test.js': ['webpack', 'sourcemap'],
      },
      browsers: ['ChromeHeadless'],
      browserNoActivityTimeout: 100000,
      singleRun: true,
      concurrency: Infinity,
    })
  }
}
