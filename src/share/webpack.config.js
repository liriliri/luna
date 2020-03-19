const path = require('path')
const prefixer = require('postcss-prefixer')
const camelCase = require('licia/camelCase')
const upperFirst = require('licia/upperFirst')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = function(name) {
  return {
    entry: `./src/${name}/index.ts`,
    devtool: 'source-map',
    devServer: {
      contentBase: `./src/${name}`,
      port: 3000
    },
    output: {
      filename: `luna-${name}.js`,
      path: path.resolve(__dirname, `../../dist/${name}`),
      publicPath: '/assets/',
      library: `Luna${upperFirst(camelCase(name))}`,
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: `luna-${name}.css`
      })
    ],
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader'
        },
        {
          test: /\.scss/,
          loaders: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  prefixer({
                    prefix: `luna-${name}-`,
                    ignore: [`luna-${name}`]
                  })
                ]
              }
            },
            'sass-loader'
          ]
        }
      ]
    }
  }
}
