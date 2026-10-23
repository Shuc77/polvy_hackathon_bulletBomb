const path = require('path');
const {
  devServerPort,
  devServerHost,
  devServerProxy,
  publicPath,
  inSdkInjectMode,
  devMode,
  getWatchSdkEnv,
  outputDir,
} = require('./build/build-config');
const { webpackCommonConfig, lintPlugins } = require('./build/webpack-helper/config');
const { genHistoryApiFallbackRewrites } = require('./build/webpack-helper/util');
const createEffectSyncMiddleware = require('./build/effect-sync-middleware');
// 提到 `getLanAddresses` 之前：ESLint 的 no-use-before-define 不认「函数声明会提升」，
// 而函数体里的 `os` 在文件后面才 require —— 这会让整个构建被 lint 卡住
const os = require('os');

/**
 * 取本机所有对外 IPv4，用于在编译完成时一并打印局域网访问地址
 * @desc 服务本身早就绑在 0.0.0.0 上（见 build-config 的 devServerHost），
 *   局域网本来就能访问 —— 只是终端上从来没打出过那个地址，用手机/另一台机器
 *   验多端观看时只能自己 `ipconfig` 找。
 *   过滤 `internal`：那条是 127.0.0.1，打出来反而误导
 */
function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(item => item && (item.family === 'IPv4' || item.family === 4) && !item.internal)
    .map(item => item.address);
}

const webpack = require('webpack');
const { merge } = require('webpack-merge');

const CopyPlugin = require('copy-webpack-plugin');
const { EsbuildPlugin } = require('esbuild-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { LightningCssMinifyPlugin } = require('lightningcss-loader');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CodeInspectorPlugin } = require('code-inspector-plugin');
const { RsdoctorWebpackPlugin } = require('@rsdoctor/webpack-plugin');

/**
 * 本地调试服务配置
 */
const devServer = {
  host: devServerHost,
  port: devServerPort,
  allowedHosts: 'all',
  headers: {
    'Access-Control-Allow-Origin': '*',
  },

  historyApiFallback: {
    disableDotRule: true,
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    rewrites: genHistoryApiFallbackRewrites(publicPath, { index: { filename: 'index.html' } }),
  },
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
  /**
   * 多设备时间轴同步
   * @desc 开发服务器兼任同域网关：观看页把编排 PUT 到 `/__effect-sync`，
   *   其他设备轮询同一份。见 `build/effect-sync-middleware.js`。
   *   unshift 保证它排在 history fallback 之前 —— 否则 GET 会被 SPA 的
   *   index.html 兜底走掉，客户端拿到一段 HTML。
   */
  setupMiddlewares(middlewares) {
    middlewares.unshift({
      name: 'effect-sync',
      middleware: createEffectSyncMiddleware(),
    });

    return middlewares;
  },
};

/**
 * 仅配置入口和输出
 * @type {import('webpack').Configuration}
 */
const commonConfig = {
  entry: {
    index:
      process.env.VUE_APP_MAIN_MODE === 'Feed'
        ? path.resolve(__dirname, './src/feed-main.ts')
        : path.resolve(__dirname, './src/main.ts'),
  },

  output: {
    path: path.resolve(__dirname, outputDir),
    filename: 'assets/js/[name].js',
    publicPath,
    chunkFilename: 'assets/js/[name].js',
  },
};

/** @type {import('webpack').Configuration} */
const devConfig = merge(commonConfig, {
  mode: 'development',

  devServer,

  plugins: [
    new webpack.ProgressPlugin((percentage, message, ...args) => {
      const percent = Math.round(percentage * 100);
      if (percent < 100) {
        console.clear();
        console.info(`🔨 编译中... ${percent}% ${message}`, ...args);
      }
    }),
    {
      apply: compiler => {
        compiler.hooks.done.tap('DonePlugin', stats => {
          if (stats.hasErrors()) {
            console.error('❌ 编译失败！');
            return;
          }

          setTimeout(() => {
            // 获取 host 和 port
            const host = devServer.host || 'localhost';
            const port = devServer.port || 8080;
            const protocol = devServer.https ? 'https' : 'http';

            const url = `${protocol}://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;

            if (inSdkInjectMode) {
              console.log('\x1b[32m%s\x1b[0m', `🎉 编译完成！请访问： ${url}/index.html`);
              console.log(`${url}/sdk-inject-project/dist/polyv-watch-app/inject-sdk.js`);
            } else {
              console.log('\x1b[32m%s\x1b[0m', `🎉 编译完成！请访问： ${url}${publicPath}`);
            }

            // 同一局域网下的手机/另一台机器用这个地址验多端观看
            if (host === '0.0.0.0') {
              getLanAddresses().forEach(address => {
                const lanUrl = `${protocol}://${address}:${port}`;
                console.log(
                  '\x1b[36m%s\x1b[0m',
                  inSdkInjectMode
                    ? `📱 局域网访问： ${lanUrl}/index.html`
                    : `📱 局域网访问： ${lanUrl}${publicPath}`,
                );
              });
            }
          }, 100);
        });
      },
    },
  ]
    .concat(lintPlugins)
    .concat(
      inSdkInjectMode
        ? []
        : [
            CodeInspectorPlugin({
              bundler: 'webpack',
              exclude: path.resolve(__dirname, '../../sdk/.dist'),
            }),
          ],
    ),
});

/** @type {import('webpack').Configuration} */
const prodConfig = merge(commonConfig, {
  mode: 'production',

  devtool: getWatchSdkEnv() === 'prod' ? false : 'source-map',

  output: {
    filename: 'assets/js/[name].[contenthash:8].js',
    chunkFilename: 'assets/js/[name].[contenthash:8].js',
    clean: true,
  },

  optimization: {
    realContentHash: false,
    minimizer: [
      new EsbuildPlugin({
        css: false,
        pure: ['console.log'],
      }),
      new LightningCssMinifyPlugin(),
    ],
  },

  plugins: [
    new webpack.ProgressPlugin({ profile: true }),

    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash:8].css',
      chunkFilename: 'assets/css/[name].[contenthash:8].css',
    }),

    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './public'),
          to: path.join(__dirname, outputDir),
          toType: 'dir',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/.DS_Store', '**/index.html'],
          },
          info: {
            minimized: true,
          },
        },
        {
          from: path.resolve(__dirname, './external/live-buddy'),
          to: path.join(__dirname, outputDir, 'live-buddy'),
          toType: 'dir',
          noErrorOnMissing: true,
          info: {
            minimized: true,
          },
        },
      ],
    }),
  ]
    .concat(lintPlugins)
    .concat(
      process.env.USE_ANALYZER
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
            }),
            new RsdoctorWebpackPlugin(), // 替代 SpeedMeasurePlugin
          ]
        : [],
    ),
});

const webpackConfig = merge(webpackCommonConfig, devMode ? devConfig : prodConfig);

module.exports = webpackConfig;
