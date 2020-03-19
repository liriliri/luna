const prefixer = require('postcss-prefixer')

module.exports = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss/,
        loaders: [
          'style-loader',
          'css-loader', 
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                prefixer({
                  prefix: 'eruda-'
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
