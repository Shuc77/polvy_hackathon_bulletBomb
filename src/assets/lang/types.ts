import { LangType } from './lang-enum';
import { zhCNLang } from './i18ns/zh-CN';

/** 某个多语言配置 */
export type LangConfig = typeof zhCNLang;

export type LangKey = keyof LangConfig;

/** 多语言匹配类型 */
export type LangI18nData = Record<LangType, LangConfig>;
