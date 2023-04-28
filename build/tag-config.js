/**
 * @file 自动引入 js 的配置
 */
const { devMode } = require('./build-config');

/** externals 列表 */
exports.externalConfigs = devMode
  ? {}
  : {
      vue: 'Vue',
    };

/** 引入配置 */
exports.tagConfigs = devMode
  ? []
  : [
      /** Vue */
      {
        path: 'https://s4.videocc.net/library/vue/2.x/vue-2.7.14.runtime.min.js',
        usePublicPath: false,
        append: false,
      },
    ];
