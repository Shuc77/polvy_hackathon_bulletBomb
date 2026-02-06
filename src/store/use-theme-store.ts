/**
 * @file 皮肤主题 store
 */
import {
  BackgroundType,
  ChannelThemeSetting,
  ChannelWatchPageSkin,
  ChannelWatchThemeStyleType,
  PlvChannelModule,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';
import { useLayoutStore } from './use-layout-store';
import { appendToOssProcess } from '@/hooks/business/use-resize-oss-image';
import { WatchThemeStyleConfig } from '@/skins/theme-config-type';
import { SkinColorMode } from '@/skins/enum';

export interface SkinConfig {
  /** 颜色深浅 */
  mode: SkinColorMode;
  /** 主题色 */
  themeColor: string;
  /** 主要色 */
  primaryColor: string;
}

export interface ThemeStore {
  /** 皮肤主题设置 */
  themeSetting: Ref<ChannelThemeSetting>;
  /** 样式类型 */
  styleType: Ref<ChannelWatchThemeStyleType>;
  /** 观看页主题 */
  watchTheme: Ref<string | null>;
  /** 观看页主题配置 */
  watchThemeStyleConfig: Ref<WatchThemeStyleConfig | null>;
  /** 观看页皮肤 */
  pageSkin: Ref<ChannelWatchPageSkin | null>;
  /** 当前皮肤的配置 */
  currentSkinConfig: ComputedRef<SkinConfig>;
  /** 当前皮肤的深浅 */
  currentSkinColorMode: ComputedRef<SkinColorMode>;
  /** 当前皮肤是否为深色 */
  isDarkSkinMode: ComputedRef<boolean>;
  /** 当前皮肤的主题色 */
  currentSkinThemeColor: ComputedRef<string>;
  /** 当前皮肤的主要色 */
  currentSkinPrimaryColor: ComputedRef<string>;
  /** 浏览器标签页图标 */
  browserFavIcon: Ref<string>;
  /** 频道图标 */
  channelCoverImg: Ref<string>;
  /** 频道引导页封面图 */
  splashImg: Ref<string>;
  /** 引导页封面图背景 id */
  splashImgBackgroundId: Ref<number | undefined>;
  /** 是否存在引导页封面 */
  hasSplash: ComputedRef<boolean>;
  /** 移动端引导页大图 */
  mobileSplashLargeImg: Ref<string>;
  /** PC 端观看页背景图 */
  pcWatchBackgroundImage: Ref<string | undefined>;
  /** (默认)移动端聊天室背景图地址 */
  defaultMobileChatRoomBgUrl: ComputedRef<string | undefined>;
  /** 移动端聊天室背景图地址 */
  mobileChatRoomBgUrl: ComputedRef<string | undefined>;
  /** (默认)竖屏背景图地址 */
  defaultPortraitPageBgUrl: ComputedRef<string | undefined>;
  /** 竖屏背景图地址 */
  portraitPageBgUrl: ComputedRef<string | undefined>;
  /** 播放器背景图地址 */
  playerBgUrl: ComputedRef<string | undefined>;
  /** 同步皮肤主题 store */
  syncThemeStore(): void;
}

/** 皮肤主题 store */
export const useThemeStore = defineStore<'theme', ThemeStore>('theme', () => {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const __themeSetting = PlvChannelModule.generateDefaultThemeSetting();

  const themeSetting = ref(__themeSetting);

  /**
   * 样式类型
   */
  const styleType = ref(__themeSetting.styleType);

  /**
   * 观看页主题
   */
  const watchTheme = ref<string | null>(__themeSetting.watchTheme);

  /**
   * 观看页主题配置
   */
  const watchThemeStyleConfig = ref<WatchThemeStyleConfig | null>(null);

  /** 观看页皮肤 */
  const pageSkin = ref<ChannelWatchPageSkin | null>(null);

  const pageSkinConfigs: Record<ChannelWatchPageSkin, SkinConfig> = {
    [ChannelWatchPageSkin.Black]: {
      mode: SkinColorMode.Dark,
      themeColor: '#202127',
      primaryColor: '#3F76FC',
    },
    [ChannelWatchPageSkin.Blue]: {
      mode: SkinColorMode.Light,
      themeColor: '#D1E3F9',
      primaryColor: '#3F76FC',
    },
    [ChannelWatchPageSkin.Freshblue]: {
      mode: SkinColorMode.Dark,
      themeColor: '#2275dd',
      primaryColor: '#69C5FF',
    },
    [ChannelWatchPageSkin.Golden]: {
      mode: SkinColorMode.Light,
      themeColor: '#f2f2f2',
      primaryColor: '#D8A83A',
    },
    [ChannelWatchPageSkin.Green]: {
      mode: SkinColorMode.Dark,
      themeColor: '#398775',
      primaryColor: '#33C89E',
    },
    [ChannelWatchPageSkin.Red]: {
      mode: SkinColorMode.Dark,
      themeColor: '#a20a1f',
      primaryColor: '#FF5252',
    },
    [ChannelWatchPageSkin.White]: {
      mode: SkinColorMode.Light,
      themeColor: '#f2f2f2',
      primaryColor: '#3F76FC',
    },
  };

  /**
   * 当前皮肤的配置
   * @desc 根据 styleType 来处理使用 skin 还是 watchTheme
   */
  const currentSkinConfig = computed<SkinConfig>(() => {
    const defaultSkin = themeSetting.value.pageSkin;

    if (styleType.value === ChannelWatchThemeStyleType.Skin) {
      return pageSkinConfigs[pageSkin.value || defaultSkin];
    }

    if (!watchThemeStyleConfig.value) {
      return pageSkinConfigs[defaultSkin];
    }

    return {
      mode: watchThemeStyleConfig.value.mode,
      themeColor: watchThemeStyleConfig.value.themeColor,
      primaryColor: watchThemeStyleConfig.value.primaryColor,
    };
  });

  /** 当前皮肤的深浅 */
  const currentSkinColorMode = computed<SkinColorMode>(() => {
    let mode = currentSkinConfig.value.mode;

    // 当进入观看页时，如果是竖屏布局，且观看页已经初始化，且非引导页，则使用深色模式
    if (
      watchAppStore.watchAppInited &&
      watchAppStore.watchPageInited &&
      layoutStore.isPortraitWatchLayout
    ) {
      mode = SkinColorMode.Dark;
    }

    return mode;
  });

  const isDarkSkinMode = computed(() => {
    return currentSkinColorMode.value === SkinColorMode.Dark;
  });

  /** 当前皮肤的主题色 */
  const currentSkinThemeColor = computed<string>(() => {
    return currentSkinConfig.value.themeColor;
  });

  /** 当前皮肤的主要色 */
  const currentSkinPrimaryColor = computed<string>(() => {
    return currentSkinConfig.value.primaryColor;
  });

  /** 浏览器标签页图标 */
  const browserFavIcon = ref(__themeSetting.browserFavIcon);

  /** 频道图标 */
  const channelCoverImg = ref(__themeSetting.channelCoverImg);

  /** 频道引导页封面图 */
  const splashImg = ref(__themeSetting.splashImg);

  /** 引导页封面图背景 id */
  const splashImgBackgroundId = ref(__themeSetting.splashImgBackgroundId);

  const hasSplash = computed(() => {
    return !!(splashImg.value || splashImgBackgroundId.value);
  });

  /** 移动端引导页大图 */
  const mobileSplashLargeImg = ref(__themeSetting.mobileSplashLargeImg);

  /** PC 端观看页背景图 */
  const pcWatchBackgroundImage = ref<string>();

  const defaultMobileChatRoomBgUrl = computed<string>(() => {
    if (
      themeSetting.value.mobileChatBackgroundType === BackgroundType.SystemDefault &&
      watchThemeStyleConfig.value
    ) {
      return watchThemeStyleConfig.value.mobile.chat.bgUrl;
    }

    return '';
  });

  /** 移动端聊天室背景地址 */
  const mobileChatRoomBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(themeSetting).mobileChatBackgroundImage;
    const ambiguityVal = unref(themeSetting).mobileChatBackgroundImageAmbiguity;

    if (!imageVal) {
      return;
    }

    if (!ambiguityVal) {
      return imageVal;
    }

    const blurParams = `image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    return appendToOssProcess(imageVal, blurParams);
  });

  const defaultPortraitPageBgUrl = computed<string>(() => {
    if (
      themeSetting.value.portraitBackgroundType === BackgroundType.SystemDefault &&
      watchThemeStyleConfig.value
    ) {
      return watchThemeStyleConfig.value.portrait.chat.bgUrl;
    }

    return '';
  });

  /** 竖屏背景地址 */
  const portraitPageBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(themeSetting).portraitBackgroundImage;
    const ambiguityVal = unref(themeSetting).portraitBackgroundImageAmbiguity;

    if (!imageVal) {
      return;
    }

    if (!ambiguityVal) {
      return imageVal;
    }

    const blurParams = `image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    return appendToOssProcess(imageVal, blurParams);
  });

  /** 播放器背景图地址 */
  const playerBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(themeSetting).playerBackgroundImage;
    const ambiguityVal = unref(themeSetting).playerBackgroundImageAmbiguity;

    if (!imageVal) {
      return;
    }

    if (!ambiguityVal) {
      return imageVal;
    }

    const blurParams = `image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    return appendToOssProcess(imageVal, blurParams);
  });

  function syncThemeStore() {
    const watchCore = watchAppStore.getWatchCore();
    const setting = watchCore.channel.getThemeSetting();
    themeSetting.value = setting;

    pageSkin.value = setting.pageSkin;
    watchTheme.value = setting.watchTheme;
    styleType.value = setting.styleType;

    browserFavIcon.value = setting.browserFavIcon;
    channelCoverImg.value = setting.channelCoverImg;
    splashImg.value = setting.splashImg;
    splashImgBackgroundId.value = setting.splashImgBackgroundId;

    mobileSplashLargeImg.value = setting.mobileSplashLargeImg;

    pcWatchBackgroundImage.value = setting.pcWatchBackgroundImage;
  }

  return {
    themeSetting,

    styleType,
    watchTheme,
    watchThemeStyleConfig,

    pageSkin,
    currentSkinConfig,
    currentSkinColorMode,
    isDarkSkinMode,
    currentSkinThemeColor,
    currentSkinPrimaryColor,
    browserFavIcon,
    channelCoverImg,
    splashImg,
    splashImgBackgroundId,
    hasSplash,
    mobileSplashLargeImg,
    pcWatchBackgroundImage,
    defaultMobileChatRoomBgUrl,
    mobileChatRoomBgUrl,
    defaultPortraitPageBgUrl,
    portraitPageBgUrl,
    playerBgUrl,
    syncThemeStore,
  };
});
