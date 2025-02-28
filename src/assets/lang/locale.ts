import { LangType } from './lang-enum';
import { LangI18nData } from './types';

import { arabicLang } from './i18ns/ar';
import { zhCNLang } from './i18ns/zh-CN';
import { englishLang } from './i18ns/en';
import { farsiLang } from './i18ns/fa';
import { portugueseLang } from './i18ns/pt';
import { russianLang } from './i18ns/ru';
import { spanishLang } from './i18ns/es';

export const i18nData: LangI18nData = {
  [LangType.ZH_CN]: zhCNLang,
  [LangType.English]: englishLang,
  [LangType.Arabic]: arabicLang,
  [LangType.Farsi]: farsiLang,
  [LangType.Portuguese]: portugueseLang,
  [LangType.Russian]: russianLang,
  [LangType.Spanish]: spanishLang,
};

export default i18nData;
