import VueI18n from 'vue-i18n';
import Vue from 'vue';
import { LangKey } from './types';

import { i18nData } from './locale';
import { LangType } from './lang-enum';
import { getDefaultLang } from './util';

/**
 * i18n 实例
 * @PLV-WARN 注意：这里不将 i18n 注入到 Vue 实例中，防止和其他 SDK 的多语言逻辑冲突
 */
let i18n: InstanceType<typeof VueI18n> | undefined;

/**
 * 兼容旧的语种处理
 */
function __formatLang(lang: string): LangType {
  const lowerLocale = lang && lang.toLowerCase && lang.toLowerCase();
  if (lowerLocale === 'zh_cn' || lowerLocale === 'zh-cn') {
    return LangType.ZH_CN;
  }
  return lang as LangType;
}

/**
 * 更新语种
 */
export function updateI18nLocale(lang: LangType) {
  if (!i18n) {
    console.error('not install i18n');
    return;
  }

  i18n.locale = __formatLang(lang);
}

/**
 * 转换多语言
 */
export function translate(key: LangKey, options: UniversalParams<string | number> = {}): string {
  if (!i18n) {
    console.error('not install i18n');
    return '';
  }

  return i18n.tc(key, 1, options);
}

/**
 * 安装 i18n
 */
export function installI18n() {
  Vue.use(VueI18n);

  i18n = new VueI18n({
    locale: __formatLang(getDefaultLang()),
    messages: i18nData,
  });

  Vue.prototype.$lang = translate;
}
