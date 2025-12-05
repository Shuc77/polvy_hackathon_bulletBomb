/**
 * @file 皮肤主题 store
 */
import { ChannelThemeSetting, ChannelWatchPageSkin, PlvChannelModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';
import { useLayoutStore } from './use-layout-store';
import { appendToOssProcess } from '@/hooks/business/use-resize-oss-image';

/** 主题颜色模式 */
export enum SkinColorMode {
  /** 深色 */
  Dark = 'dark',
  /** 浅色 */
  Light = 'light',
}

export interface SkinConfig {
  /** 颜色深浅 */
  mode: SkinColorMode;
  /** 主题色 */
  themeColor: string;
  /** 特殊颜色 */
  specialColor: string;
}

export interface ThemeStore {
  /** 皮肤主题设置 */
  themeSetting: Ref<ChannelThemeSetting>;
  /** 观看页皮肤 */
  pageSkin: Ref<ChannelWatchPageSkin | undefined>;
  /** 当前皮肤的配置 */
  pageSkinConfig: ComputedRef<SkinConfig>;
  /** 当前皮肤的深浅 */
  pageSkinColorMode: ComputedRef<SkinColorMode>;
  /** 当前皮肤的主题色 */
  pageSkinThemeColor: ComputedRef<string>;
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
  /** 移动端聊天室背景图地址 */
  mobileChatRoomBgUrl: ComputedRef<string | undefined>;
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

  /** 观看页皮肤 */
  const pageSkin = ref<ChannelWatchPageSkin>();

  const pageSkinConfigs: Record<ChannelWatchPageSkin, SkinConfig> = {
    [ChannelWatchPageSkin.Black]: {
      mode: SkinColorMode.Dark,
      themeColor: '#202127',
      specialColor: '#3F76FC',
    },
    [ChannelWatchPageSkin.Blue]: {
      mode: SkinColorMode.Light,
      themeColor: '#D1E3F9',
      specialColor: '#3F76FC',
    },
    [ChannelWatchPageSkin.Freshblue]: {
      mode: SkinColorMode.Dark,
      themeColor: '#2275dd',
      specialColor: '#69C5FF',
    },
    [ChannelWatchPageSkin.Golden]: {
      mode: SkinColorMode.Light,
      themeColor: '#f2f2f2',
      specialColor: '#D8A83A',
    },
    [ChannelWatchPageSkin.Green]: {
      mode: SkinColorMode.Dark,
      themeColor: '#398775',
      specialColor: '#33C89E',
    },
    [ChannelWatchPageSkin.Red]: {
      mode: SkinColorMode.Dark,
      themeColor: '#a20a1f',
      specialColor: '#FF5252',
    },
    [ChannelWatchPageSkin.White]: {
      mode: SkinColorMode.Light,
      themeColor: '#f2f2f2',
      specialColor: '#3F76FC',
    },
  };

  /** 当前皮肤的配置 */
  const pageSkinConfig = computed<SkinConfig>(() => {
    const skin = unref(pageSkin);
    if (!skin) {
      return pageSkinConfigs[ChannelWatchPageSkin.Black];
    }
    return pageSkinConfigs[skin];
  });

  /** 当前皮肤的深浅 */
  const pageSkinColorMode = computed<SkinColorMode>(() => {
    const skin = unref(pageSkin);
    if (!skin) {
      return SkinColorMode.Dark;
    }
    const config = pageSkinConfigs[skin];

    let mode = config.mode;

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

  /** 当前皮肤的主题色 */
  const pageSkinThemeColor = computed<string>(() => {
    const skin = unref(pageSkin);
    if (!skin) {
      return SkinColorMode.Dark;
    }
    const config = pageSkinConfigs[skin];

    return config.themeColor;
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

    browserFavIcon.value = setting.browserFavIcon;
    channelCoverImg.value = setting.channelCoverImg;
    splashImg.value = setting.splashImg;
    splashImgBackgroundId.value = setting.splashImgBackgroundId;

    mobileSplashLargeImg.value = setting.mobileSplashLargeImg;

    pcWatchBackgroundImage.value = setting.pcWatchBackgroundImage;
  }

  return {
    themeSetting,
    pageSkin,
    pageSkinConfig,
    pageSkinColorMode,
    pageSkinThemeColor,
    browserFavIcon,
    channelCoverImg,
    splashImg,
    splashImgBackgroundId,
    hasSplash,
    mobileSplashLargeImg,
    pcWatchBackgroundImage,
    mobileChatRoomBgUrl,
    portraitPageBgUrl,
    playerBgUrl,
    syncThemeStore,
  };
});
