import { $ } from '@just4/dom';
import { watch } from 'vue';
import { ChannelWatchPageSkin, MobileWatchLayout } from '@polyv/live-watch-sdk';

import { isMobile } from '@/assets/utils/browser';
import { useThemeStore } from '@/store/use-theme-store';
import { useLayoutStore } from '@/store/use-layout-store';
import { useQueryParams } from '@/hooks/core/use-query-params';
import { useMultiPolyvWatchApp } from '@/hooks/core/use-multi-polyv-watch-app';

/**
 * 页面皮肤 hook
 */
export const usePageSkin = () => {
  const layoutStore = useLayoutStore();
  const themeStore = useThemeStore();

  const { getAppRootElement, getPolyvWatchApp } = useMultiPolyvWatchApp();
  const { paramGetter } = useQueryParams({
    getPolyvWatchAppLoader: () => () => getPolyvWatchApp(),
  });

  /**
   * 初始化观看页多皮肤
   */
  async function initPageSkin(): Promise<void> {
    let pageSkin = themeStore.pageSkin;

    const querySkin = paramGetter().skin();
    if (querySkin) {
      pageSkin = querySkin;
    }

    setPageSkin(pageSkin);
  }

  /**
   * 设置页面皮肤
   * @param pageSkin 页面皮肤
   */
  async function setPageSkin(pageSkin: ChannelWatchPageSkin | undefined): Promise<void> {
    themeStore.$patch({
      pageSkin,
    });

    importPageSkin();
  }

  /**
   * 加载观看页多皮肤
   */
  async function importPageSkin(): Promise<void> {
    const pageSkin = themeStore.pageSkin;

    if (!pageSkin) {
      return;
    }

    if (!isMobile) {
      await importPcPageSkin(pageSkin);
      return;
    }

    if (layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait) {
      await importPortraitPageSkin(pageSkin);
    } else {
      await importMobilePageSkin(pageSkin);
    }
  }

  /**
   * 加载 PC 端观看页多皮肤
   */
  async function importPcPageSkin(pageSkin: ChannelWatchPageSkin): Promise<void> {
    switch (pageSkin) {
      case ChannelWatchPageSkin.Red:
        await import(/* webpackChunkName: "skin-red-pc" */ '@/skins/red/_red-pc.scss');
        break;
      case ChannelWatchPageSkin.Blue:
        await import(/* webpackChunkName: "skin-blue-pc" */ '@/skins/blue/_blue-pc.scss');
        break;
      case ChannelWatchPageSkin.Green:
        await import(/* webpackChunkName: "skin-green-pc" */ '@/skins/green/_green-pc.scss');
        break;
      case ChannelWatchPageSkin.White:
        await import(/* webpackChunkName: "skin-white-pc" */ '@/skins/white/_white-pc.scss');
        break;
      case ChannelWatchPageSkin.Golden:
        await import(/* webpackChunkName: "skin-golden-pc" */ '@/skins/golden/_golden-pc.scss');
        break;
      case ChannelWatchPageSkin.Freshblue:
        await import(
          /* webpackChunkName: "skin-freshblue-pc" */ '@/skins/freshblue/_freshblue-pc.scss'
        );
        break;
      default:
        await import(/* webpackChunkName: "skin-black-pc" */ '@/skins/black/_black-pc.scss');
        break;
    }
  }

  /**
   * 加载 Mobile 端观看页多皮肤
   */
  async function importMobilePageSkin(pageSkin: ChannelWatchPageSkin): Promise<void> {
    switch (pageSkin) {
      case ChannelWatchPageSkin.Red:
        await import(/* webpackChunkName: "skin-red-mobile" */ '@/skins/red/_red-mobile.scss');
        break;
      case ChannelWatchPageSkin.Blue:
        await import(/* webpackChunkName: "skin-blue-mobile" */ '@/skins/blue/_blue-mobile.scss');
        break;
      case ChannelWatchPageSkin.Green:
        await import(
          /* webpackChunkName: "skin-green-mobile" */ '@/skins/green/_green-mobile.scss'
        );
        break;
      case ChannelWatchPageSkin.White:
        await import(
          /* webpackChunkName: "skin-white-mobile" */ '@/skins/white/_white-mobile.scss'
        );
        break;
      case ChannelWatchPageSkin.Golden:
        await import(
          /* webpackChunkName: "skin-golden-mobile" */ '@/skins/golden/_golden-mobile.scss'
        );
        break;
      case ChannelWatchPageSkin.Freshblue:
        await import(
          /* webpackChunkName: "skin-freshblue-mobile" */ '@/skins/freshblue/_freshblue-mobile.scss'
        );
        break;
      default: {
        await import(
          /* webpackChunkName: "skin-black-mobile" */ '@/skins/black/_black-mobile.scss'
        );
        break;
      }
    }
  }

  /**
   * 加载 Portrait 竖屏端观看页多皮肤
   * @PLV-WARN 竖屏多皮肤的处理是黑色背景 + 主题色强调，和横屏多皮肤不一样
   */
  async function importPortraitPageSkin(pageSkin: ChannelWatchPageSkin): Promise<void> {
    switch (pageSkin) {
      case ChannelWatchPageSkin.Red:
        await import(/* webpackChunkName: "skin-red-portrait" */ '@/skins/red/_red-portrait.scss');
        break;
      case ChannelWatchPageSkin.Blue:
        await import(
          /* webpackChunkName: "skin-blue-portrait" */ '@/skins/blue/_blue-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.Green:
        await import(
          /* webpackChunkName: "skin-green-portrait" */ '@/skins/green/_green-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.White:
        await import(
          /* webpackChunkName: "skin-white-portrait" */ '@/skins/white/_white-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.Golden:
        await import(
          /* webpackChunkName: "skin-golden-portrait" */ '@/skins/golden/_golden-portrait.scss'
        );
        break;
      case ChannelWatchPageSkin.Freshblue:
        await import(
          /* webpackChunkName: "skin-freshblue-portrait" */ '@/skins/freshblue/_freshblue-portrait.scss'
        );
        break;
      default: {
        await import(
          /* webpackChunkName: "skin-black-portrait" */ '@/skins/black/_black-portrait.scss'
        );
        break;
      }
    }
  }

  /**
   * 获取皮肤类名
   */
  function getSkinClassName(pageSkin?: ChannelWatchPageSkin) {
    const __pageSkin = pageSkin || themeStore.pageSkin;
    let skinClassPrefix = 'pws-skin-';
    if (
      layoutStore.mobileWatchLayout === MobileWatchLayout.Portrait &&
      __pageSkin === ChannelWatchPageSkin.Black
    ) {
      const mobileSkin = skinClassPrefix + __pageSkin;
      const nextPrefix = skinClassPrefix + 'portrait-';
      skinClassPrefix = mobileSkin + ' ' + nextPrefix;
    }

    return skinClassPrefix + __pageSkin;
  }

  // 设置页面的 class
  watch(
    () => themeStore.pageSkin,
    (pageSkin, oldPageSkin) => {
      const $document = $(getAppRootElement());

      if (oldPageSkin) {
        const oldPageSkinClass = getSkinClassName(oldPageSkin);
        if ($document.hasClass(oldPageSkinClass)) {
          $document.removeClass(oldPageSkinClass);
        }
      }

      if (pageSkin) {
        const pageSkinClass = getSkinClassName(pageSkin);
        $document.addClass(pageSkinClass);
      }
    },
  );

  return {
    getSkinClassName,

    initPageSkin,
    setPageSkin,
    importPageSkin,
  };
};
