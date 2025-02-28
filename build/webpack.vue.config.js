const path = require('path');
const webpack = require('webpack');

const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const { ExtractIndexWebpackAssetPlugin } = require('./extract-index-asset-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const {
  sassResources,
  alias,
  tsConfigFile,
  defineConstants,
  devMode,
  inSdkInjectMode,
  outputDir,
} = require('./build-config');
const { externalConfigs, tagConfigs } = require('./tag-config');

const srcPath = path.resolve(__dirname, '../src');
const include = [srcPath];

/** @type {import('webpack').Configuration} */
let webpackVueConfig = {
  resolve: {
    extensions: ['.js', '.mjs', '.ts', '.vue', '.css', '.scss'],
    alias: {
      ...alias,
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: ['\\.vue$'],
              configFile: tsConfigFile,
              happyPackMode: true,
            },
          },
        ],
        exclude: /node_modules/,
        include: srcPath,
      },
      {
        test: /\.tsx$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
        include: srcPath,
      },
      {
        test: /\.ico$/i,
        type: 'assets/resource',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        include,
        use: [
          {
            loader: 'sass-resources-loader',
            options: {
              resources: sassResources.map(function (item) {
                return path.join(srcPath, item);
              }),
            },
          },
        ],
      },
      {
        test: /\.svga$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/svga/[name][hash:8].[ext]',
        },
        exclude: /node_modules/,
      },
    ],
  },

  externals: externalConfigs,

  plugins: [
    new webpack.DefinePlugin(defineConstants),

    new HtmlWebpackTagsPlugin({
      tags: tagConfigs,
    }),

    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     configFile: tsConfigFile,
    //     extensions: {
    //       vue: {
    //         enabled: true,
    //         compiler: require.resolve('vue/compiler-sfc'),
    //       },
    //       diagnosticOptions: {
    //         semantic: true,
    //       },
    //     },
    //   },
    // }),

    new ESLintPlugin({
      lintDirtyModulesOnly: devMode,
      extensions: ['js', 'ts', 'vue'],
    }),

    new StyleLintPlugin({
      lintDirtyModulesOnly: devMode,
      files: ['**/*.{vue,css,scss}'],
    }),

    inSdkInjectMode
      ? new ExtractIndexWebpackAssetPlugin({
          outputPath: path.resolve(__dirname, '../external/sdk-inject-project/lib'),
          fileName: 'inject-assets.js',
          buildModule: 'esm',
          indexAssetVarKey: 'injectAssets',
        })
      : new ExtractIndexWebpackAssetPlugin({
          outputPath: path.resolve(__dirname, `../${outputDir}`),
          fileName: 'index-assets.js',
          buildModule: 'umd',
          indexAssetVarKey: 'indexAssets',
        }),
  ],

  optimization: {
    splitChunks: {
      minSize: 0.5 * 1024 * 1024,
    },
  },
};

if (process.env.USE_ANALYZER) {
  webpackVueConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
    }),
  );

  const smp = new SpeedMeasurePlugin();
  webpackVueConfig = smp.wrap(webpackVueConfig);
}

module.exports = webpackVueConfig;
