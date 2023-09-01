import { LangType } from '@/assets/lang/lang-enum';
import { useLangStore } from '@/store/use-lang-store';

export const useStreamTrack = () => {
  const langStore = useLangStore();

  function switchLanguage(lang: LangType) {
    langStore.switchLang(lang);
  }

  return {
    switchLanguage,
  };
};
