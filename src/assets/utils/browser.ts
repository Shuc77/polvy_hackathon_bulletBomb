import { getCurrentUAInfo } from '@just4/ua-info';

const ua = navigator.userAgent.toLowerCase();

const uaInfo = getCurrentUAInfo();

/** 是否移动端 */
export const isMobile = uaInfo.isPortable;

/** 是否微信（非企业微信） */
export const isWeixin = uaInfo.client.isWx;

/** 是否企业微信 */
export const isWorkWeixin = uaInfo.client.isWxWork;

/** 是否为 QQ 浏览器 */
export const isQQBrowser = uaInfo.client.isQQBrowser;

/** 是否为 UC 浏览器 */
export const isUCBrowser = uaInfo.client.isUCBrowser;

/** 是否为百度 app */
export const isBaiduApp = uaInfo.client.isBaiduApp;

/** 是否安卓 */
export const isAndroid = uaInfo.os.isAndroid;

/** 是否 ios */
export const isIOS = uaInfo.os.isIOS;

/** 是否被 iframe */
export const isIframe = window.self !== window.top;

/** 获取 IOS 版本 */
export function getIosVersion() {
  const ver = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (ver) {
    return parseInt(ver[1], 10);
  } else {
    return null;
  }
}

/** 针对 iOS 13 以上 iPad(ua 与桌面端 Mac OS 近似) */
export const isDesktopIPad = /mac os x/i.test(ua) && 'ontouchend' in document;

/** IE 浏览器版本号，不符合该浏览器特征时返回空字符串 */
const ieVersion = /\bMSIE\s(\d+)/i.test(ua) || /\bTrident\/.*;\srv:(\d+)/.test(ua) ? RegExp.$1 : '';

/** 是否为低版本 IE */
export const isLowerIE = ieVersion && Number(ieVersion) <= 10;

/**
 * 判断是否模拟 PC 的 UA
 *
 * 通过媒体查询判断，不通过 UA 和 navigator.platform
 *  - pointer:coarse 表示当前设备的指针是不精确的。手机不支持鼠标，只支持触摸
 *  - hover: none 表示当前设备不支持 mouse hover 处理
 */
function judgeIsMockPC(): boolean {
  const matchMedia = window.matchMedia;
  if (matchMedia) {
    const isCoarsePointer = matchMedia('(pointer:coarse)').matches;
    const isNotHover = matchMedia('(hover: none)').matches;
    return isCoarsePointer && isNotHover && !isMobile; // 内部逻辑：支持触摸，不支持鼠标悬浮，UA 判断又不是移动端 => 模拟 PC
  }
  return false;
}

/** 是否模拟 UA 为 PC */
export const isMockPc = judgeIsMockPC();

/** 是否为钉钉内置浏览器 */
export const isDingTalk = /DingTalk/i.test(ua);
