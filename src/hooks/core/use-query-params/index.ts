/**
 * @file 当前观看页地址上的参数
 */

import { ChannelWatchPageSkin, PlaybackOrigin, ZoneType } from '@polyv/live-watch-sdk';
import { parse, appendToURL } from '@just4/querystring';

/** 获取默认参数值 */
const getDefaultQueryParams = (): UniversalParams<string | undefined> => ({});

/** 地址上所有的参数 */
export const queryParams: {
  [key: string]: string | string[] | undefined;
} = parse(window.location.search && window.location.search.slice(1)) || {};

/**
 * 获取当前观看页地址上的所有参数的对象
 * @desc 如果从地址上获取不到，会从默认值中获取，如果默认值也获取不到，则返回 undefined
 * */
export function getQueryParam(key: string): string | undefined {
  const result = queryParams[key];

  if (typeof result !== 'undefined') {
    if (Array.isArray(result)) {
      console.warn(`${key} 的值为数组，当前仅返回数组中的第一个元素`);
      return result[0];
    }
    return result;
  }

  return getDefaultQueryParams()[key];
}

const buildGetters = <T extends string = string>(key: string) => {
  return (): T | undefined => {
    return getQueryParam(key) as T | undefined;
  };
};

/**
 * @hook 参数获取器
 * @desc 需要获取地址上的参数都必须通过该获取器获取
 */
export const paramGetter = {
  /** 频道号 */
  channelId: buildGetters('channelId'),
  /** 会议模式 */
  polyvMeeting: buildGetters<'true'>('polyvMeeting'),
  /** 是否加载 VConsole */
  console: buildGetters<'1'>('console'),
  /** 多语言 */
  lang: buildGetters('lang'),
  /** 回放 vid */
  vid: buildGetters('vid'),
  /** 回放来源 */
  playbackType: buildGetters<PlaybackOrigin>('playbackType'),
  /** 渠道 id */
  promoteId: buildGetters('promoteId'),
  /** 企业微信分享海报的企微员工 ID */
  wxInviteId: buildGetters('wxInviteId'),
  /** 邀请海报唯一ID */
  invitePosterId: buildGetters('invitePosterId'),
  /** 受邀者 ID */
  invitee: buildGetters('invitee'),
  /** 测试模式 token */
  testModeToken: buildGetters('testModeToken'),
  /** 观众 id */
  viewerid: buildGetters('viewerid'),
  /** 观看条件-验证码 */
  password: buildGetters('password'),
  /** 观众昵称 */
  name: buildGetters('name'),
  /** 观众昵称 */
  nickname: buildGetters('nickname'),
  /** 观众头像 */
  avatar: buildGetters('avatar'),
  /** 网络类型 */
  zone: buildGetters<ZoneType>('zone'),
  /** 是否被 iframe */
  hasFrame: buildGetters<'1'>('hasFrame'),
  /** 自定义授权 & 外部授权 & 独立授权中的用户 id */
  userid: buildGetters('userid'),
  /** 参与者头衔 */
  actor: buildGetters('actor'),
  /** 参与者头衔背景色 */
  actorBgColor: buildGetters('actorBgColor'),
  /** 参与者头衔字体颜色 */
  actorFColor: buildGetters('actorFColor'),
  /** 自定义授权 & 外部授权 & 独立授权中的时间戳 */
  ts: buildGetters('ts'),
  /** 自定义授权 & 外部授权 & 独立授权中的签名 */
  sign: buildGetters('sign'),
  /** 微信 openId */
  openid: buildGetters('openid'),
  /** 微信 unionId */
  unionid: buildGetters('unionid'),
  /** 微信用户 id */
  wechatUserId: buildGetters('wechatUserId'),
  /** 播放器 param4 */
  param4: buildGetters('param4'),
  /** 播放器 param5 */
  param5: buildGetters('param5'),
  /** 真实姓名 */
  realName: buildGetters('realName'),
  /** 多皮肤 */
  skin: buildGetters<ChannelWatchPageSkin>('skin'),
  /** 是否使用 ip 地址进行 CDN 拉流 */
  ipPlay: buildGetters<'1'>('ipPlay'),
};

/**
 * 移除当前观看页地址上对应的参数
 * */
export function removeQueryParam(keys: Array<keyof typeof paramGetter>) {
  for (const key of keys) {
    if (!queryParams[key]) {
      continue;
    }
    delete queryParams[key];
  }

  const newUrl = appendToURL(location.pathname, {
    ...queryParams,
  });
  if (window.history.replaceState) {
    window.history.replaceState(null, document.title, newUrl);
  } else {
    location.href = newUrl;
  }
}

// window.paramGetter = paramGetter;

export const useQueryParam = () => {
  return {
    paramGetter,
    getQueryParam,
    removeQueryParam,
  };
};
