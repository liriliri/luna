const path = require('path')
const prefixer = require('postcss-prefixer')
const autoprefixer = require('autoprefixer')
const clean = require('postcss-clean')
const camelCase = require('licia/camelCase')
const upperFirst = require('licia/upperFirst')
const each = require('licia/each')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = function (name, { useIcon = false, dependencies = [] } = {}) {
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: [
        prefixer({
          prefix: `luna-${name}-`,
          ignore: [`luna-${name}`],
        }),
        autoprefixer,
        clean(),
      ],
    },
  }

  const entry = [`./src/${name}/style.scss`, `./src/${name}/index.ts`]

  if (useIcon) {
    entry.unshift(`./src/${name}/icon.css`)
  }

  const externals = {}
  each(dependencies, (dependency) => {
    const pkgName = 'luna-' + dependency
    externals[pkgName] = {
      root: 'Luna' + upperFirst(camelCase(dependency)),
      commonjs: pkgName,
      commonjs2: pkgName,
      amd: pkgName,
    }
  })

  return function (env, options) {
    return {
      mode: options.mode,
      entry,
      devtool:
        options.mode === 'production' ? 'source-map' : 'inline-source-map',
      output: {
        filename: `luna-${name}.js`,
        path: path.resolve(__dirname, `../../dist/${name}`),
        publicPath: '/assets/',
        library: `Luna${upperFirst(camelCase(name))}`,
        libraryTarget: 'umd',
      },
      resolve: {
        extensions: ['.ts', '.js'],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: `luna-${name}.css`,
        }),
      ],
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
          },
          {
            test: /\.scss/,
            loaders: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              postcssLoader,
              'sass-loader',
            ],
          },
          {
            test: /\.css/,
            loaders: [MiniCssExtractPlugin.loader, 'css-loader', postcssLoader],
          },
        ],
      },
      externals,
    }
  }
}
