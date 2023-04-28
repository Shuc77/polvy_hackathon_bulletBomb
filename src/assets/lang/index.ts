import Vue from 'vue';
import { LangType } from './lang-enum';
import { i18nData } from './i18ns/index';
import { LangKey, LangLocaleFn } from './types';

let locale: LangType | LangLocaleFn = LangType.Chinese; // 默认中文

/** 替换多语言中的字符串模板 */
function replace(key: string, value: string, str: string): string {
  return str.replace(new RegExp('\\${' + key + '}', 'g'), value);
}

/** 格式化多语言 */
function formatLang(lang: string): LangType {
  const lowerLocale = lang && lang.toLowerCase && lang.toLowerCase();
  if (lowerLocale === 'zh_cn' || lowerLocale === 'zh-cn') {
    return LangType.Chinese;
  }
  return lang as LangType;
}

/** 转换多语言 */
export function translate(key: LangKey, options: UniversalParams<string> = {}): string {
  let lang: LangType = LangType.Chinese;

  if (typeof locale === 'function') {
    lang = formatLang(locale());
  } else if (typeof locale === 'string') {
    lang = formatLang(locale);
  }

  const textList = i18nData[lang] || i18nData[LangType.Chinese];
  let text = textList[key];

  if (options) {
    const keys = Object.keys(options);
    for (const key of keys) {
      const value = options[key];
      text = replace(key, value, text);
    }
  }

  return text;
}

export type LangInstallOptions = {
  locale: LangType | LangLocaleFn;
};

export const i18nInstall = (vue: typeof Vue, options: LangInstallOptions) => {
  Vue.prototype.$lang = translate;
  locale = options.locale || locale;
};
