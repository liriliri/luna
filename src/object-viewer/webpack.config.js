const path = require('path')
const extend = require('licia/extend')
const baseConfig = require('../share/webpack.config')

module.exports = extend(baseConfig, {
  entry: './src/object-viewer/index.ts',
  devServer: {
    contentBase: './src/object-viewer',
    port: 3000
  },
  output: {
    filename: 'object-viewer.js',
    path: path.resolve(__dirname, '../../dist/object-viewer'),
    publicPath: '/assets/',
    library: 'LunaObjectViewer',
    libraryTarget: 'umd'
  }
})
