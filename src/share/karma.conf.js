const path = require('path')

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
  delete webpackCfg.output
  webpackCfg.module.rules.push({
    test: /\.ts$/,
    exclude: /node_modules/,
    loader: 'istanbul-instrumenter-loader',
    enforce: 'post',
    options: {
      esModules: true,
    },
  })

  return function (config) {
    config.set({
      basePath: `../${name}`,
      files: ['test.js'],
      frameworks: ['mocha', 'chai'],
      plugins: [
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
      singleRun: true,
      concurrency: Infinity,
    })
  }
}
