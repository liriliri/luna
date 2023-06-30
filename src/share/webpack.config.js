const path = require('path')
const prefixer = require('postcss-prefixer')
const autoprefixer = require('autoprefixer')
const clean = require('postcss-clean')
const camelCase = require('licia/camelCase')
const upperFirst = require('licia/upperFirst')
const each = require('licia/each')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = function (
  name,
  { useIcon = false, hasStyle = true, dependencies = [], analyzer = false } = {}
) {
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: [
        prefixer({
          prefix: `luna-${name}-`,
          ignore: [`luna-`],
        }),
        autoprefixer,
        clean(),
      ],
    },
  }

  const entry = [`./src/${name}/index.ts`]
  if (hasStyle) {
    entry.unshift(`./src/${name}/style.scss`)
  }
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
    const plugins = [
      new MiniCssExtractPlugin({
        filename: `luna-${name}.css`,
      }),
    ]

    if (analyzer) {
      plugins.push(new BundleAnalyzerPlugin())
    }

    return {
      mode: options.mode,
      entry,
      devtool: 'source-map',
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
      plugins,
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
