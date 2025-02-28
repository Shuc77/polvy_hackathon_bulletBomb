/**
 * @file 自动引入 js 的配置
 */
const { devMode, inSdkInjectMode } = require('./build-config');

/** externals 列表 */
exports.externalConfigs = devMode
  ? {}
  : {
      vue: 'Vue',
    };

/**
 * 引入配置
 * @PLV-WARN {@link inSdkInjectMode} 模式默认会提取 vue，但不会补充引入链接
 * */
exports.tagConfigs =
  devMode || inSdkInjectMode
    ? []
    : [
        /** Vue */
        {
          path: 'https://s4.videocc.net/library/vue/2.x/vue-2.7.16.runtime.min.js',
          usePublicPath: false,
          append: false,
        },
      ];
