/**
 * @file 一些静态资源的默认地址（包括通过 require 引入到图片）
 */

/** 默认的频道 logo */
export const DEFAULT_CHANNEL_LOGO = 'https://s1.videocc.net/default-img/channel/default-logo.png';

/** 默认观众头像 */
export const DEFAULT_VIEWER_AVATAR = 'https://s1.videocc.net/default-img/avatar/viewer.png';

/** 默认引导页封面图 */
export const DEFAULT_SPLASH_IMG = 'https://s1.videocc.net/default-img/channel/default-splash.png';

/** 默认引导页大图封面图 */
export const DEFAULT_SPLASH_FULL_IMG = require('@/assets/images/splash/default-splash-full-img.jpg');

/** 默认 SVGA 文件目录 */
export const DEFAULT_SVGA_DIRECTORY = 'https://s1.videocc.net/default-img/donate-svga/';

/** 默认的浏览器 ico */
export { default as DEFAULT_BROWSER_ICON } from '@/assets/favicons/polyv.ico';

/** 默认分享图标 - QQ */
export const DEFAULT_SHARE_QQ_ICON: string = require('@/assets/images/share/qq.png');

/** 默认分享图标 - QQ 空间 */
export const DEFAULT_SHARE_QZONE_ICON: string = require('@/assets/images/share/qzone.png');

/** 默认分享图标 - 微博 */
export const DEFAULT_SHARE_WEIBO_ICON: string = require('@/assets/images/share/weibo.png');

/** 默认选择的手机区号 */
export const DEFAULT_PHONE_NUMBER_AREA_CODE = '+86';

/** 默认唯一登录校验频率 */
export const DEFAULT_VERIFY_QUERY_FREQUENCY = 30;
