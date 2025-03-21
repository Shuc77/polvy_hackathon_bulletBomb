import { LangType } from './lang-enum';
import { LangI18nData } from './types';

import zhCNLang from './i18ns/zh-CN.json';
import zhTWLang from './i18ns/zh-TW.json';
import englishLang from './i18ns/en.json';
import japaneseLang from './i18ns/ja.json';
import koreanLang from './i18ns/ko.json';

export const i18nData: LangI18nData = {
  [LangType.ZH_CN]: zhCNLang,
  [LangType.ZH_TW]: zhTWLang,
  [LangType.English]: englishLang,
  [LangType.Japanese]: japaneseLang,
  [LangType.Korean]: koreanLang,
};

export default i18nData;
