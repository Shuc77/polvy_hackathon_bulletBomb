import { LanguageType, PlvChannelModule, WatchSdkLangEnum } from '@polyv/live-watch-sdk';
import { LangType } from './lang-enum';
import { local } from '@just4/storage';
import { getUrlQueryParams } from '@/hooks/core/use-query-params';

/** local 记录中的 key */
const LOCAL_STORAGE_KEY = 'language';

/**
 * 转换当前语言为成 SDK 需要的语言
 * @warn 目前 SDK 仅支持中英文
 */
export function convert2WatchSdkLang(lang?: LangType): LanguageType {
  if (lang === LangType.ZH_CN) return WatchSdkLangEnum.ZH_CN;
  if (lang === LangType.ZH_TW) return WatchSdkLangEnum.ZH_TW;
  if (lang === LangType.English) return WatchSdkLangEnum.English;
  if (lang === LangType.Japanese) return WatchSdkLangEnum.Japanese;
  if (lang === LangType.Korean) return WatchSdkLangEnum.Korean;
  if (lang === LangType.Russian) return WatchSdkLangEnum.Russian;
  return WatchSdkLangEnum.English;
}

/**
 * 转换 SDK 的语言为当前语言
 * @warn 目前 SDK 仅支持中英文
 */
export function convert2CurrentLang(lang: LanguageType): LangType {
  if (lang === WatchSdkLangEnum.ZH_CN) return LangType.ZH_CN;
  if (lang === WatchSdkLangEnum.ZH_TW) return LangType.ZH_TW;
  if (lang === WatchSdkLangEnum.English) return LangType.English;
  if (lang === WatchSdkLangEnum.Japanese) return LangType.Japanese;
  if (lang === WatchSdkLangEnum.Korean) return LangType.Korean;
  if (lang === WatchSdkLangEnum.Russian) return LangType.Russian;
  return LangType.English;
}

/** 获取 sdk 推荐的多语言 */
function getWatchSdkRecommendLang(): LangType | undefined {
  const setting = PlvChannelModule.getRecommendLangSetting();
  if (!setting.preferRecommendSetting) {
    return undefined;
  }

  if (setting.isFollowBrowserLang) {
    return getBrowserLang();
  }

  return convert2CurrentLang(setting.defaultLangType);
}

/** 获取浏览器缓存中的多语言 */
export function getCacheLang(): LangType | undefined {
  const recommendLang = getWatchSdkRecommendLang();
  if (recommendLang) {
    return recommendLang;
  }

  const urlParams = getUrlQueryParams();
  /** 判断目标是否为一个多语言 */
  const isAllowLang = (target: unknown): target is LangType => {
    return Object.values(LangType).includes(target as LangType);
  };

  // 地址上的 lang 参数
  const queryLang = urlParams.lang;
  if (isAllowLang(queryLang)) {
    return queryLang;
  }

  // localStorage 中记录的
  const localLang = local.get(LOCAL_STORAGE_KEY);
  if (isAllowLang(localLang)) {
    return localLang;
  }

  return undefined;
}

/**
 * 设置缓存语种
 */
export function setCacheLang(lang: LangType) {
  local.set(LOCAL_STORAGE_KEY, lang);
}

/** 获取浏览器当前的语言配置 */
export function getBrowserLang(): LangType {
  // 系统浏览器的多语言 https://gist.github.com/msikma/8912e62ed866778ff8cd
  const browserLang = navigator.language || navigator.browserLanguage;
  if (browserLang) {
    if (/^zh-(HK|TW|MO)$/i.test(browserLang)) {
      return LangType.ZH_TW;
    } else if (/^ja(-[A-Z]+)?$/i.test(browserLang)) {
      return LangType.Japanese;
    } else if (/^ko(-[A-Z]+)?$/i.test(browserLang)) {
      return LangType.Korean;
    } else if (/^zh(-[A-Z]+)?$/i.test(browserLang)) {
      return LangType.ZH_CN;
    } else if (/^ru(-[A-Z]+)?$/i.test(browserLang)) {
      return LangType.Russian;
    }
  }
  return LangType.English;
}

/** 获取当前页面加载后的默认多语言 */
export function getDefaultLang(): LangType {
  return getCacheLang() || getBrowserLang();
}
