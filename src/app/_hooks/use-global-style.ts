/**
 * @file 全局样式及页面元素处理
 */
import { forceMobile, isIOS, isPcMiniProgram } from '@/assets/utils/browser';
import { isBuildForFeedMainMode } from '@/assets/utils/utils';
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useThemeStore } from '@/store/use-theme-store';
import { useWatchAppStore } from '@/store/use-watch-app-store';
import { $ } from '@just4/dom';
import { watchEffect } from 'vue';

/**
 * @hook 全局样式 hook
 */
export const useGlobalStyle = () => {
  /**
   * 设置全局的 css 样式逻辑
   */
  function setupGlobalStyle(): void {
    // 针对 ios 设备添加文档的 css 标识
    const iosPageClass = 'g-page--ios';
    if (isIOS) {
      $(document.documentElement).addClass(iosPageClass);
      $(document.body).addClass(iosPageClass);
    }

    // 针对在 pc 环境强制使用移动端样式添加 css 标识
    const fakeMobileClass = 'g-page--fake-mobile-in-pc';
    if (isPcMiniProgram || forceMobile) {
      $(document.documentElement).addClass(fakeMobileClass);
    }
  }

  /**
   * 移除骨架屏节点
   */
  function removeSkeleton(): void {
    const skeleton = document.querySelector('#skeleton');
    if (skeleton) {
      skeleton.remove();
    }
  }

  return {
    setupGlobalStyle,
    removeSkeleton,
  };
};

/**
 * 浏览器标签页标题 hook
 */
export const useBrowserTitle = () => {
  const watchAppStore = useWatchAppStore();
  const channelInfoStore = useChannelInfoStore();

  /**
   * 设置浏览器标签页标题
   */
  function setBrowserTitle(): void {
    if (isBuildForFeedMainMode()) return;

    const channelTitle = channelInfoStore.channelTitle;
    if (channelTitle && watchAppStore.isPageActive) {
      window.document.title = channelTitle;
    }
  }

  const setBrowserTitleEffectStop = watchEffect(setBrowserTitle);

  return {
    setBrowserTitle,
    setBrowserTitleEffectStop,
  };
};

/**
 * 浏览器标签页图标 hook
 */
export const useBrowserIcon = () => {
  const watchAppStore = useWatchAppStore();
  const themeStore = useThemeStore();

  /**
   * 设置图标元素
   * @param href 链接
   */
  function setFavIconElem(href: string): void {
    let favIconNode = document.querySelector<HTMLLinkElement>('link[rel*=icon]');
    if (!favIconNode) {
      favIconNode = document.createElement('link');
      window.document.head.appendChild(favIconNode);
    }
    favIconNode.rel = 'shortcut icon';
    favIconNode.type = 'image/x-icon';
    favIconNode.href = href;
  }

  function setBrowserIcon(): void {
    if (isBuildForFeedMainMode()) return;

    if (watchAppStore.isPageActive) {
      setFavIconElem(themeStore.browserFavIcon);
    }
  }

  const setBrowserIconEffectStop = watchEffect(setBrowserIcon);

  return {
    setBrowserIcon,
    setBrowserIconEffectStop,
  };
};
