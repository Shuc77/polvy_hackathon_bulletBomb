import { appEvents, eventBus } from '@/app/app-events';
import { LangType } from '@/assets/lang/lang-enum';
import { getWatchCore } from '@/core/watch-sdk';
import { paramGetter } from '@/hooks/core/use-query-params';
import { local } from '@just4/storage';
import { LanguageType, PlvChannelModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { usePlayerStore } from './use-player-store';

/** local 记录中的 key */
const LOCAL_STORAGE_KEY = 'language';

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

/** 获取当前页面加载后的默认多语言 */
export function getDefaultLang(): LangType {
  return getWatchSdkRecommendLang() || getCacheLang() || getBrowserLang();
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
function getCacheLang(): LangType | undefined {
  /** 判断目标是否为一个多语言 */
  const isAllowLang = (target: unknown): target is LangType => {
    return Object.values(LangType).includes(target as LangType);
  };

  // 地址上的 lang 参数
  const queryLang = paramGetter.lang();
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

/** 获取浏览器当前的语言配置 */
function getBrowserLang(): LangType {
  // 系统浏览器的多语言;
  const browserLang = (navigator.language || navigator.browserLanguage).toLowerCase();
  if (browserLang) {
    // 中文以外的语言均判定为英文（逐一枚举工作量较大）
    if (['zh', 'zh-cn'].includes(browserLang)) {
      return LangType.Chinese;
    } else {
      return LangType.English;
    }
  }
  return LangType.Chinese;
}

/**
 * 转换当前语言为成 SDK 需要的语言
 * @warn 目前 SDK 仅支持中英文
 */
export function convert2WatchSdkLang(lang?: LangType): LanguageType {
  return lang === LangType.Chinese ? 'zh_CN' : 'en';
}

/**
 * 转换 SDK 的语言为当前语言
 * @warn 目前 SDK 仅支持中英文
 */
export function convert2CurrentLang(lang: LanguageType): LangType {
  if (lang === 'zh_CN') return LangType.Chinese;
  if (lang === 'en') return LangType.English;
  return LangType.Chinese;
}

export const useLangStore = defineStore<'lang', LangStore>('lang', () => {
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
      { text: '简体中文-ZH', lang: LangType.Chinese },
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
      if (
        !unref(isShowSevenLanguage) &&
        ![LangType.Chinese, LangType.English].includes(item.lang)
      ) {
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
  const isChineseLang = computed<boolean>(() => unref(currentLang) === LangType.Chinese);

  /** 同步多语言 store */
  function syncLangStore() {
    const watchCore = getWatchCore();
    const langSetting = watchCore.channel.getLangSetting();

    englishSettingEnabled.value = langSetting.englishSettingEnabled;
    langSwitchEnabled.value = langSetting.langSwitchEnabled;
    isShowSevenLanguage.value = langSetting.isShowSevenLanguage;
    japLangEnabled.value = langSetting.japLangEnabled;

    const cacheLang = getWatchSdkRecommendLang() || getCacheLang();
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
    currentLang.value = lang;
    local.set(LOCAL_STORAGE_KEY, lang);

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

    const watchCore = getWatchCore();
    watchCore.updateAppConfig({
      language: convert2WatchSdkLang(lang),
    });

    // 兼容旧逻辑，更改语言时支持同时更改音轨
    const steamTrackItem = channelStore.streamTrackConfig?.trackList.find(
      i => i.lang === convert2WatchSdkLang(lang),
    );
    if (steamTrackItem) {
      playerStore.$patch({
        streamTrackKey: steamTrackItem.key,
      });
    }

    eventBus.$emit(appEvents.player.ResetUpPlayer);
  }

  /** 根据当前语言转换游客名称 */
  function translateNick(nick: string): string {
    let transNick = nick;
    const nickPrefix = '观众';
    const nickPattern = new RegExp(nickPrefix + '/[0-9]+$');
    if (unref(currentLang) !== LangType.Chinese && nickPattern.test(nick)) {
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
