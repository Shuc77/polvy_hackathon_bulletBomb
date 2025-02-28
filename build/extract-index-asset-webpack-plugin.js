const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const path = require('path');

const pluginName = 'ExtractIndexWebpackAssetPlugin';

/**
 * Webpack 插件
 * @desc 基于 HtmlWebpackPlugin 获取 html 内容，进一步解析获取静态资源列表，并最终导出一份 js 文件
 */
class ExtractIndexWebpackAssetPlugin {
  __outputPath = path.resolve(__dirname);

  __buildModule = 'umd';

  __indexAssetVarKey = 'indexAssets';

  __fileName = 'index-asset.js';

  constructor(opts) {
    this.__outputPath = opts.outputPath || this.__outputPath;
    this.__buildModule = opts.buildModule || this.__buildModule;
    this.__indexAssetVarKey = opts.indexAssetVarKey || this.__indexAssetVarKey;
    this.__fileName = opts.fileName || this.__fileName;
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, compilation => {
      const htmlPlugins = compiler.options.plugins.filter(plugin => {
        return plugin instanceof HtmlWebpackPlugin;
      });

      if (!htmlPlugins.length) {
        const logger = compilation.getLogger(pluginName);
        logger.error(new Error('NO html-webpack-plugin installed'));
      }

      HtmlWebpackPlugin.getCompilationHooks(compilation).beforeEmit.tapAsync(
        pluginName,
        (htmlPluginData, cb) => {
          const { html } = htmlPluginData;

          // 虽然可以通过插件的 assets 去处理，但是会遗漏掉一些属性
          // 所以还是选择手动解析 html 文本来获取 assets 资源
          let assetsData = this.__getOriginAssetsData(html);
          assetsData = this.__transformAssetsData(assetsData);

          this.__writeAssetFile(assetsData);
          cb(null, htmlPluginData);
        },
      );
    });
  }

  __getOriginAssetsData(htmlContent) {
    // 匹配 html 中的 js 或 css 引用
    const assetsTags = htmlContent.match(/<(?:link|script).*?>/gi) || [];

    return assetsTags.map(assetTag => {
      const asset = { attrs: {} };

      // 匹配标签名
      if (/<(\w+)/.test(assetTag)) {
        asset.tagName = RegExp.$1;
      }

      // 匹配所有属性
      const reAttrs = /\s(\w+)=["']?([^\s<>'"]+)/gi;
      let attr;
      while ((attr = reAttrs.exec(assetTag)) !== null) {
        asset.attrs[attr[1]] = attr[2];
      }

      return asset;
    });
  }

  __transformAssetsData(data) {
    const result = data;
    // 判断是否为预加载资源
    function isPreloadOrPrefetch(item) {
      return item.tagName === 'link' && ['preload', 'prefetch'].indexOf(item.attrs.rel) !== -1;
    }

    // 移除 preload 和 prefetch 的文件
    // 因为 PC 端不需要预加载移动端的文件，反之亦然
    for (let i = 0; i < result.length; ) {
      if (isPreloadOrPrefetch(result[i])) {
        result.splice(i, 1);
      } else {
        i++;
      }
    }
    return result;
  }

  __writeAssetFile(assetsData) {
    if (!fs.existsSync(this.__outputPath)) {
      fs.mkdirSync(this.__outputPath, { recursive: true });
    }

    const prefixVar =
      this.__buildModule === 'umd'
        ? `var ${this.__indexAssetVarKey}`
        : `export const ${this.__indexAssetVarKey}`;

    fs.writeFileSync(
      path.join(this.__outputPath, this.__fileName),
      `${prefixVar} = ${JSON.stringify(assetsData)};`,
      'utf-8',
    );
  }
}

module.exports = { ExtractIndexWebpackAssetPlugin };
