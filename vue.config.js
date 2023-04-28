const webpackVueConfig = require('./build/webpack.vue.config');
const {
  devServerPort,
  devServerHost,
  devServerProxy,
  publicPath,
  transpileDependencies,
  outputDir,
} = require('./build/build-config');
const { coreJsImports } = require('./build/core-import');
const path = require('path');

/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  pages: {
    index: {
      entry: [...coreJsImports, path.resolve(__dirname, './src/main.ts')],
      template: path.resolve(__dirname, './public/index.html'),
      filename: 'index.html',
    },
  },

  publicPath,

  outputDir,

  assetsDir: 'assets',

  configureWebpack: webpackVueConfig,

  chainWebpack: config => {
    // 观看页应用大部分 chunk 是不太需要 prefetch 的，为了减少带宽和请求数，可以去掉
    config.plugins.delete('prefetch-index');

    // 某些移动端设备对文件编码识别有误，把非 ascii 字符都转成 unicode 编码
    config.optimization.minimizer('terser').tap(item => {
      item[0].terserOptions.output = item[0].terserOptions.output || {};
      item[0].terserOptions.output.ascii_only = true;
      return item;
    });
  },

  transpileDependencies,

  devServer: {
    host: devServerHost,
    port: devServerPort,
    disableHostCheck: true,
    hot: true,
    // https: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    stats: 'minimal',

    proxy: devServerProxy,
    contentBase: path.resolve(__dirname, './map-file/'),
  },

  productionSourceMap: false,
};
