/**
 * @file 皮肤主题 store
 */
import { ChannelWatchPageSkin, PlvChannelModule } from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useWatchAppStore } from './use-watch-app-store';
import { useLayoutStore } from './use-layout-store';

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
  /** 特殊颜色 */
  specialColor: string;
}

export interface ThemeStore {
  /** 观看页皮肤 */
  pageSkin: Ref<ChannelWatchPageSkin | undefined>;
  /** 当前皮肤的配置 */
  pageSkinConfig: ComputedRef<SkinConfig>;
  /** 当前皮肤的深浅 */
  pageSkinColorMode: ComputedRef<SkinColorMode>;
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
  /** 移动端聊天室背景图 */
  mobileChatBackgroundImage: Ref<string | undefined>;
  /** 移动端聊天室背景图模糊度 */
  mobileChatBackgroundImageAmbiguity: Ref<number | undefined>;
  /** 移动端聊天室背景图地址 */
  mobileChatRoomBgUrl: ComputedRef<string | undefined>;
  /** 竖屏背景图 */
  portraitBackgroundImage: Ref<string | undefined>;
  /** 竖屏背景图模糊度 */
  portraitBackgroundImageAmbiguity: Ref<number | undefined>;
  /** 竖屏背景图地址 */
  portraitPageBgUrl: ComputedRef<string | undefined>;
  /** 同步皮肤主题 store */
  syncThemeStore(): void;
}

/** 皮肤主题 store */
export const useThemeStore = defineStore<'theme', ThemeStore>('theme', () => {
  const watchAppStore = useWatchAppStore();
  const layoutStore = useLayoutStore();
  const __themeSetting = PlvChannelModule.generateDefaultThemeSetting();

  /** 观看页皮肤 */
  const pageSkin = ref<ChannelWatchPageSkin>();

  const pageSkinConfigs: Record<ChannelWatchPageSkin, SkinConfig> = {
    [ChannelWatchPageSkin.Black]: {
      mode: SkinColorMode.Dark,
      specialColor: '#3F76FC',
    },
    [ChannelWatchPageSkin.Blue]: {
      mode: SkinColorMode.Light,
      specialColor: '#3F76FC',
    },
    [ChannelWatchPageSkin.Freshblue]: {
      mode: SkinColorMode.Dark,
      specialColor: '#69C5FF',
    },
    [ChannelWatchPageSkin.Golden]: {
      mode: SkinColorMode.Light,
      specialColor: '#D8A83A',
    },
    [ChannelWatchPageSkin.Green]: {
      mode: SkinColorMode.Dark,
      specialColor: '#33C89E',
    },
    [ChannelWatchPageSkin.Red]: {
      mode: SkinColorMode.Dark,
      specialColor: '#FF5252',
    },
    [ChannelWatchPageSkin.White]: {
      mode: SkinColorMode.Light,
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

    // 当进入观看页时，如果是竖屏布局，且观看页已经初始化，则使用深色模式
    if (watchAppStore.watchAppInited && layoutStore.isPortraitWatchLayout) {
      mode = SkinColorMode.Dark;
    }

    return mode;
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

  /** 聊天室背景图 */
  const mobileChatBackgroundImage = ref<string>();

  /** 聊天室背景图模糊 */
  const mobileChatBackgroundImageAmbiguity = ref<number>();

  /** 移动端聊天室背景地址 */
  const mobileChatRoomBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(mobileChatBackgroundImage);
    const ambiguityVal = unref(mobileChatBackgroundImageAmbiguity);

    if (!imageVal) {
      return;
    }

    let blurParams = `?x-oss-process=image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    if (imageVal.includes('?x-oss-process=')) {
      blurParams = blurParams.replace('?x-oss-process=', ',');
    }

    return ambiguityVal ? `${imageVal}${blurParams}` : imageVal;
  });

  /** 竖屏背景图 */
  const portraitBackgroundImage = ref<string>();

  /** 竖屏背景图透明度，0 ～ 100 */
  const portraitBackgroundImageAmbiguity = ref<number>();

  /** 竖屏背景地址 */
  const portraitPageBgUrl = computed<string | undefined>(() => {
    const imageVal = unref(portraitBackgroundImage);
    const ambiguityVal = unref(portraitBackgroundImageAmbiguity);

    if (!imageVal) {
      return;
    }

    let blurParams = `?x-oss-process=image/blur,r_${ambiguityVal},s_${ambiguityVal}`;
    if (imageVal.includes('?x-oss-process=')) {
      blurParams = blurParams.replace('?x-oss-process=', ',');
    }

    return ambiguityVal ? `${imageVal}${blurParams}` : imageVal;
  });

  function syncThemeStore() {
    const watchCore = watchAppStore.getWatchCore();
    const themeSetting = watchCore.channel.getThemeSetting();

    pageSkin.value = themeSetting.pageSkin;

    browserFavIcon.value = themeSetting.browserFavIcon;
    channelCoverImg.value = themeSetting.channelCoverImg;
    splashImg.value = themeSetting.splashImg;
    splashImgBackgroundId.value = themeSetting.splashImgBackgroundId;

    mobileSplashLargeImg.value = themeSetting.mobileSplashLargeImg;

    pcWatchBackgroundImage.value = themeSetting.pcWatchBackgroundImage;
    mobileChatBackgroundImage.value = themeSetting.mobileChatBackgroundImage;
    mobileChatBackgroundImageAmbiguity.value = themeSetting.mobileChatBackgroundImageAmbiguity;
    portraitBackgroundImage.value = themeSetting.portraitBackgroundImage;
    portraitBackgroundImageAmbiguity.value = themeSetting.portraitBackgroundImageAmbiguity;
  }

  return {
    pageSkin,
    pageSkinConfig,
    pageSkinColorMode,
    browserFavIcon,
    channelCoverImg,
    splashImg,
    splashImgBackgroundId,
    hasSplash,
    mobileSplashLargeImg,
    pcWatchBackgroundImage,
    mobileChatBackgroundImage,
    mobileChatBackgroundImageAmbiguity,
    mobileChatRoomBgUrl,
    portraitBackgroundImage,
    portraitBackgroundImageAmbiguity,
    portraitPageBgUrl,
    syncThemeStore,
  };
});
