import { LangType } from '../lang-enum';
import { LangI18nData } from '../types';
import { arabicLang } from './arabic';
import { chinaLang } from './china';
import { englishLang } from './english';
import { farsiLang } from './farsi';
import { portugueseLang } from './portuguese';
import { russianLang } from './russian';
import { spanishLang } from './spanish';

export const i18nData: LangI18nData = {
  [LangType.Chinese]: chinaLang,
  [LangType.English]: englishLang,
  [LangType.Arabic]: arabicLang,
  [LangType.Farsi]: farsiLang,
  [LangType.Portuguese]: portugueseLang,
  [LangType.Russian]: russianLang,
  [LangType.Spanish]: spanishLang,
};

export default i18nData;
