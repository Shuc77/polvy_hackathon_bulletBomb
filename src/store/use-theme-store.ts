/**
 * @file 皮肤主题 store
 */
import { getWatchCore } from '@/core/watch-sdk';
import {
  ChannelWatchPageSkin,
  DEFAULT_SPLASH_IMG,
  DEFAULT_CHANNEL_LOGO,
  DEFAULT_BROWSER_ICON,
  DEFAULT_SPLASH_FULL_IMG,
} from '@polyv/live-watch-sdk';
import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';

export interface ThemeStore {
  /** 观看页皮肤 */
  pageSkin: Ref<ChannelWatchPageSkin | undefined>;
  /** 浏览器标签页图标 */
  browserFavIcon: Ref<string>;
  /** 频道图标 */
  channelCoverImg: Ref<string>;
  /** 频道引导页封面图 */
  splashImg: Ref<string>;
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
  /** 观看页皮肤 */
  const pageSkin = ref<ChannelWatchPageSkin>();

  /** 浏览器标签页图标 */
  const browserFavIcon = ref(DEFAULT_BROWSER_ICON);

  /** 频道图标 */
  const channelCoverImg = ref(DEFAULT_CHANNEL_LOGO);

  /** 频道引导页封面图 */
  const splashImg = ref(DEFAULT_SPLASH_IMG);

  /** 移动端引导页大图 */
  const mobileSplashLargeImg = ref(DEFAULT_SPLASH_FULL_IMG);

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

    return ambiguityVal
      ? `${imageVal}?x-oss-process=image/blur,r_${ambiguityVal},s_${ambiguityVal}`
      : imageVal;
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

    return ambiguityVal
      ? `${imageVal}?x-oss-process=image/blur,r_${imageVal},s_${imageVal}`
      : imageVal;
  });

  function syncThemeStore() {
    const watchCore = getWatchCore();
    const themeSetting = watchCore.channel.getThemeSetting();

    pageSkin.value = themeSetting.pageSkin;
    browserFavIcon.value = themeSetting.browserFavIcon ?? DEFAULT_BROWSER_ICON;
    channelCoverImg.value = themeSetting.channelCoverImg;
    splashImg.value = themeSetting.splashImg ?? DEFAULT_SPLASH_IMG;
    mobileSplashLargeImg.value = themeSetting.mobileSplashLargeImg ?? DEFAULT_SPLASH_FULL_IMG;
    pcWatchBackgroundImage.value = themeSetting.pcWatchBackgroundImage;
    mobileChatBackgroundImage.value = themeSetting.mobileChatBackgroundImage;
    mobileChatBackgroundImageAmbiguity.value = themeSetting.mobileChatBackgroundImageAmbiguity;
    portraitBackgroundImage.value = themeSetting.portraitBackgroundImage;
    portraitBackgroundImageAmbiguity.value = themeSetting.portraitBackgroundImageAmbiguity;
  }

  return {
    pageSkin,
    browserFavIcon,
    channelCoverImg,
    splashImg,
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
