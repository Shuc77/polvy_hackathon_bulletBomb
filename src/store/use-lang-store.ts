import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { defineStore } from 'pinia';

import { appEvents } from '@/app/app-events';
import { useGlobalInject } from '@/app/use-global-inject';

import { LangType } from '@/assets/lang/lang-enum';
import { updateI18nLocale } from '@/assets/lang';
import {
  convert2CurrentLang,
  convert2WatchSdkLang,
  getBrowserLang,
  getCacheLang,
  getDefaultLang,
  setCacheLang,
} from '@/assets/lang/util';

import { useWatchAppStore } from './use-watch-app-store';
import { useChannelStore } from './use-channel-store';
import { usePlayerStore } from './use-player-store';

/** 多语言选择节点类型 */
export interface LangSwitchItem {
  lang: LangType;
  /** 文本 */
  text: string;
}

export interface LangStoreState {
  /** 英语设置开关 */
  englishSettingEnabled: Ref<boolean>;
  /** 多语言开关 */
  langSwitchEnabled: Ref<boolean>;
  /** 是否开启七国多语言 */
  isShowSevenLanguage: Ref<boolean>;
  /** 是否显示日文语言切换（仅将英文的 text 换成日文文案） */
  japLangEnabled: Ref<boolean>;
  /** 所有多语言选择列表 */
  allLangSwitchList: ComputedRef<LangSwitchItem[]>;
  /** 多语言选择列表 */
  langSwitchList: ComputedRef<LangSwitchItem[]>;
  /** 当前多语言 */
  currentLang: Ref<LangType>;
  /** 当前多语言文本 */
  currentLangText: ComputedRef<string>;
  /** 当前是否为中文语言 */
  isChineseLang: ComputedRef<boolean>;
}

export interface LangStoreAction {
  /** 同步多语言 store */
  syncLangStore: () => void;
  /** 切换当前多语言 */
  switchLang: (lang: LangType) => void;
  /** 根据当前语言转换游客名称 */
  translateNick: (nick: string) => string;
}

/** 多语言 store */
export interface LangStore extends LangStoreState, LangStoreAction {}

export const useLangStore = defineStore<'lang', LangStore>('lang', () => {
  const { getEmitter } = useGlobalInject();

  const watchAppStore = useWatchAppStore();

  const channelStore = useChannelStore();
  const playerStore = usePlayerStore();

  /** 英语设置开关 */
  const englishSettingEnabled = ref(false);

  /** 多语言开关 */
  const langSwitchEnabled = ref(false);

  /** 是否开启七国多语言 */
  const isShowSevenLanguage = ref(false);

  /** 是否显示日文语言切换（仅将英文的 text 换成日文文案） */
  const japLangEnabled = ref(false);

  /** 所有多语言选择列表 */
  const allLangSwitchList = computed<LangSwitchItem[]>(() => {
    let englishText = 'English-EN';
    if (unref(japLangEnabled)) {
      englishText = 'Japanese - JPN';
    }

    return [
      { text: '简体中文-ZH', lang: LangType.ZH_CN },
      { text: englishText, lang: LangType.English },
      { text: 'Русский', lang: LangType.Russian },
      { text: 'Português', lang: LangType.Portuguese },
      { text: 'Español', lang: LangType.Spanish },
      { text: 'العربية', lang: LangType.Arabic },
      { text: 'فارسی', lang: LangType.Farsi },
    ];
  });

  /** 多语言选择列表 */
  const langSwitchList = computed<LangSwitchItem[]>(() => {
    return unref(allLangSwitchList).filter(item => {
      // 没有开启七国语言，则只显示中文、英文语言
      if (!unref(isShowSevenLanguage) && ![LangType.ZH_CN, LangType.English].includes(item.lang)) {
        return false;
      }

      return true;
    });
  });

  /** 当前多语言 */
  const currentLang = ref<LangType>(getDefaultLang());

  /** 当前多语言的文本 */
  const currentLangText = computed<string>(() => {
    const list = unref(allLangSwitchList);
    const index = list.findIndex(item => item.lang === unref(currentLang));
    return index === -1 ? '' : list[index].text;
  });

  /** 当前是否为中文语言 */
  const isChineseLang = computed<boolean>(() => unref(currentLang) === LangType.ZH_CN);

  /** 同步多语言 store */
  function syncLangStore() {
    const watchCore = watchAppStore.getWatchCore();
    const langSetting = watchCore.channel.getLangSetting();

    englishSettingEnabled.value = langSetting.englishSettingEnabled;
    langSwitchEnabled.value = langSetting.langSwitchEnabled;
    isShowSevenLanguage.value = langSetting.isShowSevenLanguage;
    japLangEnabled.value = langSetting.japLangEnabled;

    const cacheLang = getCacheLang();
    // 缓存中不存在多语言时，需要响应后台配置
    if (!cacheLang) {
      currentLang.value = langSetting.isFollowBrowserLang
        ? getBrowserLang()
        : convert2CurrentLang(langSetting.defaultLangType);
      watchCore.updateAppConfig({
        language: convert2WatchSdkLang(currentLang.value),
      });
    }
  }

  /**
   * 设置当前多语言
   * @param lang 多语言
   */
  function switchLang(lang: LangType) {
    const watchCore = watchAppStore.getWatchCore();
    watchCore.updateAppConfig({
      language: convert2WatchSdkLang(lang),
    });

    setCacheLang(lang);
    updateI18nLocale(lang);
    currentLang.value = lang;

    /**
     * URL 带有 lang 参数，且参数值与保存的语言不一致时，
     * 要删除参数值，否则下次进来还是参数值指定的语言。
     * 注意：IE <= 9 无效，因为不支持 history.replaceState
     */
    if (history.replaceState) {
      const search = location.search.replace(/([?&]lang=)(\w*)/, (match, $1, $2) => {
        return $2 === lang ? match : $1;
      });
      if (search !== location.search) {
        history.replaceState(null, document.title, location.pathname + search + location.hash);
      }
    }

    // 兼容旧逻辑，更改语言时支持同时更改音轨
    const steamTrackItem = channelStore.streamTrackConfig?.trackList.find(
      i => i.lang === convert2WatchSdkLang(lang),
    );
    if (steamTrackItem) {
      playerStore.$patch({
        streamTrackKey: steamTrackItem.key,
      });
    }

    getEmitter().emit(appEvents.player.ResetUpPlayer);
  }

  /** 根据当前语言转换游客名称 */
  function translateNick(nick: string): string {
    let transNick = nick;
    const nickPrefix = '观众';
    const nickPattern = new RegExp(nickPrefix + '/[0-9]+$');
    if (unref(currentLang) !== LangType.ZH_CN && nickPattern.test(nick)) {
      transNick = `Guest/${nick.split('/')[1]}`;
    }
    return transNick;
  }

  return {
    englishSettingEnabled,
    langSwitchEnabled,
    isShowSevenLanguage,
    japLangEnabled,
    allLangSwitchList,
    langSwitchList,
    currentLang,
    currentLangText,
    isChineseLang,

    syncLangStore,
    switchLang,
    translateNick,
  };
});
