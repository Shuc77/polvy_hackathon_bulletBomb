/**
 * @file 布局 store
 */

import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref, unref } from 'vue';
import { useChannelStore } from './use-channel-store';
import { ChannelSplashLayout, MainScreenContent } from '@polyv/live-watch-sdk';
import { ScreenOrientationMode } from '@/hooks/core/use-screen-orient';

export interface LayoutStoreState {
  /** 屏幕旋转模式 */
  screenOrientationMode: Ref<ScreenOrientationMode>;
  /** 当前屏幕旋转角度是否为纵向 */
  isVerticalScreenOrientation: ComputedRef<boolean>;
  /** 当前屏幕旋转角度是否为横向 */
  isHorizontalScreenOrientation: ComputedRef<boolean>;
  /** 移动端下的引导页是否使用大图布局 */
  mobileSplashIsLarge: ComputedRef<boolean>;
  /** 主屏的内容 */
  mainScreen: Ref<MainScreenContent>;
  /** 副屏是否被收起 */
  subScreenPackUp: Ref<boolean>;
  /** 当前是否正在系统全屏 */
  isFullscreen: Ref<boolean>;
  /** PC 端下侧边菜单栏的激活 name */
  pcAsideTabCurrentName: Ref<string>;
  /** 移动端下底部菜单栏的激活 name */
  mobileMenuCurrentName: Ref<string>;
  /** 移动端下菜单栏 header 高度 */
  mobileMenuHeaderHeight: Ref<number>;
  /** 移动端布局顶部区域的高度 */
  mobileLayoutTopHeight: Ref<number>;
  /** 移动端布局底部区域的高度 */
  mobileLayoutBottomHeight: Ref<number>;
  /** 移动端布局底部区域到顶部的距离 */
  mobileLayoutBottomTop: Ref<number>;
  /** 移动端下播放器是否正在页面全屏 */
  mobilePlayerIsPageFullscreen: Ref<boolean>;
  /** 文档是否处于页面全屏 */
  mobileDocIsPageFullscreen: Ref<boolean>;
  /** 移动端聊天室背景地址 */
  mobileChatRoomBgUrl: ComputedRef<string | undefined>;
  /** 当前是页面全屏或者横屏 */
  isPageFullscreenOrHorizontalScreen: ComputedRef<boolean>;
}

export interface LayoutStoreActions {
  /** 切换文档视频区域 */
  toggleMainScreen(): void;
}

export interface LayoutStore extends LayoutStoreState, LayoutStoreActions {}

export const useLayoutStore = defineStore<'layout', LayoutStore>('layout', () => {
  const channelStore = useChannelStore();

  /** 屏幕旋转模式 */
  const screenOrientationMode = ref(ScreenOrientationMode.Vertical);

  /** 当前屏幕旋转角度是否为纵向 */
  const isVerticalScreenOrientation = computed(() => {
    return screenOrientationMode.value === ScreenOrientationMode.Vertical;
  });

  /** 当前屏幕旋转角度是否为横向 */
  const isHorizontalScreenOrientation = computed(() => {
    return screenOrientationMode.value === ScreenOrientationMode.Horizontal;
  });

  /** 移动端下的引导页是否使用大图布局 */
  const mobileSplashIsLarge = computed<boolean>(() => {
    return channelStore.channelDetail?.channelConfig.splashLayout === ChannelSplashLayout.Large;
  });

  /** 主屏的内容 */
  const mainScreen = ref(MainScreenContent.Player);

  /** 切换文档视频区域 */
  function toggleMainScreen(): void {
    if (mainScreen.value === MainScreenContent.Doc) {
      mainScreen.value = MainScreenContent.Player;
    } else {
      mainScreen.value = MainScreenContent.Doc;
    }
  }

  /** 副屏是否被收起 */
  const subScreenPackUp = ref(false);

  /** 当前是否正在系统全屏 */
  const isFullscreen = ref(false);

  /** PC 端下侧边菜单栏的激活 name */
  const pcAsideTabCurrentName = ref('');

  /** 移动端下底部菜单栏的激活 name */
  const mobileMenuCurrentName = ref('');

  /** 移动端下菜单栏 header 高度 */
  const mobileMenuHeaderHeight = ref(40);

  /** 移动端布局顶部区域的高度 */
  const mobileLayoutTopHeight = ref(0);

  /** 移动端布局底部区域的高度 */
  const mobileLayoutBottomHeight = ref(0);

  /** 移动端下是否正在页面全屏 */
  const mobilePlayerIsPageFullscreen = ref(false);

  /** 文档是否处于页面全屏 */
  const mobileDocIsPageFullscreen = ref(false);

  /** 移动端布局底部区域到顶部的距离 */
  const mobileLayoutBottomTop = ref(0);

  /** 移动端聊天室背景地址 */
  const mobileChatRoomBgUrl = computed<string | undefined>(() => {
    const channelDetail = channelStore.channelDetail;
    const chatBackgroundImage = channelDetail?.channelInfo.chatBackgroundImage;
    const chatBackgroundImageOpacity = channelDetail?.channelInfo.chatBackgroundImageOpacity;

    if (!chatBackgroundImage) {
      return;
    }

    return chatBackgroundImageOpacity
      ? `${chatBackgroundImage}?x-oss-process=image/blur,r_${chatBackgroundImageOpacity},s_${chatBackgroundImageOpacity}`
      : chatBackgroundImage;
  });

  /** 当前是页面全屏或者横屏 */
  const isPageFullscreenOrHorizontalScreen = computed(() => {
    return unref(mobilePlayerIsPageFullscreen) || unref(isHorizontalScreenOrientation);
  });

  return {
    screenOrientationMode,
    isVerticalScreenOrientation,
    isHorizontalScreenOrientation,

    mobileSplashIsLarge,
    mainScreen,
    toggleMainScreen,
    subScreenPackUp,
    isFullscreen,
    pcAsideTabCurrentName,
    mobileMenuCurrentName,
    mobileMenuHeaderHeight,
    mobileLayoutTopHeight,
    mobileLayoutBottomHeight,
    mobileLayoutBottomTop,
    mobilePlayerIsPageFullscreen,
    mobileDocIsPageFullscreen,
    mobileChatRoomBgUrl,

    isPageFullscreenOrHorizontalScreen,
  };
});
