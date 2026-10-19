const path = require('path')
const prefixer = require('postcss-prefixer')
const autoprefixer = require('autoprefixer')
const CleanCSS = require('clean-css')
const postcss = require('postcss')
const camelCase = require('licia/camelCase')
const upperFirst = require('licia/upperFirst')
const each = require('licia/each')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

function cleanCss() {
  return {
    postcssPlugin: 'postcss-clean',
    Once(css, { result }) {
      const minified = new CleanCSS().minify(css.toString())
      result.root = postcss.parse(minified.styles)
    },
  }
}
cleanCss.postcss = true

module.exports = function (
  name,
  { useIcon = false, hasStyle = true, dependencies = [], analyzer = false } = {}
) {
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          prefixer({
            prefix: `luna-${name}-`,
            ignore: [/luna-/],
          }),
          autoprefixer(),
          cleanCss(),
        ],
      },
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
      target: ['web', 'es5'],
      entry,
      devtool: 'source-map',
      output: {
        filename: `luna-${name}.js`,
        path: path.resolve(__dirname, `../../dist/${name}`),
        publicPath: '/assets/',
        library: {
          name: `Luna${upperFirst(camelCase(name))}`,
          type: 'umd',
        },
        globalObject: 'this',
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
            test: /\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              postcssLoader,
              'sass-loader',
            ],
          },
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', postcssLoader],
          },
        ],
      },
      externals,
    }
  }
}
