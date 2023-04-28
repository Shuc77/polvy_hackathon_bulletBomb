/**
 * @file 全局样式及页面元素处理
 */
import { useChannelInfoStore } from '@/store/use-channel-info-store';
import { useChannelStore } from '@/store/use-channel-store';
import { $ } from '@just4/dom';
import { watchEffect } from 'vue';
import { DEFAULT_BROWSER_ICON } from '@/assets/constants/defaults';
import { isIOS, isMobile } from '@/assets/utils/browser';

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
  }

  /**
   * 移除骨架屏节点
   */
  function removeSkeleton(): void {
    if (isMobile) {
      const skeleton = document.querySelector('#skeleton');
      skeleton?.parentNode?.removeChild(skeleton);
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
  const channelInfoStore = useChannelInfoStore();

  /**
   * 设置浏览器标签页标题
   */
  function setBrowserTitle(): void {
    const channelTitle = channelInfoStore.channelTitle;
    if (channelTitle) {
      window.document.title = channelTitle;
    }
  }

  watchEffect(setBrowserTitle);

  return {
    setBrowserTitle,
  };
};

/**
 * 浏览器标签页图标 hook
 */
export const useBrowserIcon = () => {
  const channelStore = useChannelStore();

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
    const channelDetail = channelStore.channelDetail;
    if (!channelDetail) {
      return;
    }

    let icon = DEFAULT_BROWSER_ICON;
    if (channelDetail.channelInfo.customIcon) {
      icon = channelDetail.channelInfo.customIcon;
    }

    setFavIconElem(icon);
  }

  watchEffect(setBrowserIcon);

  return {
    setBrowserIcon,
  };
};
