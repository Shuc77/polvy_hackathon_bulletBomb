import { LangType } from './lang-enum';
import { chinaLang } from './i18ns/china';

/** 某个多语言配置 */
export type LangConfig = typeof chinaLang;

export type LangKey = keyof LangConfig;

/** 多语言匹配类型 */
export type LangI18nData = Record<LangType, LangConfig>;

export type LangLocaleFn = () => LangType;
