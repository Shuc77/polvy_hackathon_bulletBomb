const webpackVueConfig = require('./build/webpack.vue.config');
const {
  devServerPort,
  devServerHost,
  devServerProxy,
  publicPath,
  devMode,
  // transpileDependencies,
  outputDir,
} = require('./build/build-config');
const path = require('path');

/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  crossorigin: 'anonymous', // @PLV-WARN 跨域处理

  pages: {
    index: {
      entry:
        process.env.VUE_APP_MAIN_MODE === 'Feed'
          ? path.resolve(__dirname, './src/feed-main.ts')
          : path.resolve(__dirname, './src/main.ts'),
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

  // 只有在本地调试 IE 和构建模式下，才设置为 true
  transpileDependencies: !devMode,

  devServer: {
    host: devServerHost,
    port: devServerPort,
    hot: true,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // https: true,
    client: {
      overlay: {
        runtimeErrors: false,
        warnings: false,
        errors: true,
      },
    },
    proxy: devServerProxy,
    static: {
      publicPath: '/',
      directory: path.resolve(__dirname, './external/'),
    },
  },

  productionSourceMap: false,
};
