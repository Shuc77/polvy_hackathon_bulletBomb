import { $ } from '@just4/dom';
import { watch } from 'vue';
import { ChannelWatchPageSkin } from '@polyv/live-watch-sdk';

import { isMobile } from '@/assets/utils/browser';
import { paramGetter } from '@/hooks/core/use-query-params';
import { useThemeStore } from '@/store/use-theme-store';

/**
 * 页面皮肤 hook
 */
export const usePageSkin = () => {
  const themeStore = useThemeStore();

  /**
   * 初始化观看页多皮肤
   */
  async function initPageSkin(): Promise<void> {
    let pageSkin = themeStore.pageSkin;

    const querySkin = paramGetter.skin();
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

    if (isMobile) {
      await importMobilePageSkin(pageSkin);
    } else {
      await importPcPageSkin(pageSkin);
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
      default:
        await import(
          /* webpackChunkName: "skin-black-mobile" */ '@/skins/black/_black-mobile.scss'
        );
        break;
    }
  }

  // 设置页面的 class
  watch(
    () => themeStore.pageSkin,
    (pageSkin, oldPageSkin) => {
      const skinClassPrefix = 'pws-skin-';
      const $document = $(document.documentElement);

      if (oldPageSkin) {
        const oldPageSkinClass = `${skinClassPrefix}${oldPageSkin}`;
        if ($document.hasClass(oldPageSkinClass)) {
          $document.removeClass(oldPageSkinClass);
        }
      }

      if (pageSkin) {
        const pageSkinClass = `${skinClassPrefix}${pageSkin}`;
        $document.addClass(pageSkinClass);
      }
    },
  );

  return {
    initPageSkin,
    setPageSkin,
    importPageSkin,
  };
};
