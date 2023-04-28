/**
 * @file 包信息
 */

/* eslint-env node */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */

const path = require('path');
const pkgJSON = require('../package');

const { formatDate } = require('@polyv/utils/dist/cjs/date');

/** 当前是否为开发模式 */
const devMode = (exports.devMode = process.env.NODE_ENV !== 'production');

let publicPath = process.env.VUE_APP_BUILD_MODE === 'STATIC' ? './' : '/';



exports.publicPath = publicPath;

/** 项目构建时间 */
const projectBuildTime = (exports.projectBuildTime = formatDate(new Date(), 'YYYY-MM-DD hh:mm:ss'));

/** 项目版本号 */
const projectVersion = (exports.projectVersion = pkgJSON.version);

/**
 * 获取观看页 SDK 环境变量
 * */
function getWatchSdkEnv() {
  if (devMode) return 'test';
  
  return 'prod';
}

/** 注入的全局常量 */
exports.defineConstants = {
  /** 项目构建时间 */
  PROJECT_BUILD_TIME: JSON.stringify(projectBuildTime),
  /** 项目版本号 */
  PROJECT_VERSION: JSON.stringify(projectVersion),
  /** 观看页 SDK 加载的环境 */
  WATCH_SDK_ENV: JSON.stringify(getWatchSdkEnv()),
};

/** ts 配置文件 */
exports.tsConfigFile = path.resolve(
  __dirname,
  devMode ? '../tsconfig.json' : '../tsconfig.build.json',
);

/** 需要编译的包名 */
exports.transpileDependencies = [
  'pinia',
  '@vue/devtools-api',
  '@just4',
  'lodash-es',
  'js-base64',
  '@polyv/utils',
];

/** 需要配置到 sass-resources-loader 的资源 */
exports.sassResources = ['assets/styles/variables.scss', 'assets/styles/mixins.scss'];

let devAlias = {};


/** 别名 */
exports.alias = {
  '@': path.resolve(__dirname, '../src'),
  '@utils-ts': path.resolve(__dirname, '../node_modules/@polyv/utils/dist/es'),
  ...devAlias,
};

/** 开发服务器端口号 */
exports.devServerPort = 15020;

/** 开发服务器局域网ip */
exports.devServerHost = '0.0.0.0';

/** 本地开发服务器代理 */
exports.devServerProxy = {
  '^/(v2|error-verify)': {
    target: 'http://live.polyv.cn', // 测试环境
    changeOrigin: true,
    onProxyReq(proxyReq) {
      proxyReq.setHeader('host', 'live.polyv.cn');
    },
    onProxyRes(proxyRes) {
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        const newCookie = cookies.map(item => {
          return item.replace(/;\s*Domain=([^;])+/, '');
        });
        proxyRes.headers['set-cookie'] = newCookie;
      }
    },
  },
};

/** 生产环境构建文件的目录 */
let outputDir = process.env.VUE_APP_BUILD_MODE === 'STATIC' ? 'dist-static' : 'dist';

exports.outputDir = outputDir;
